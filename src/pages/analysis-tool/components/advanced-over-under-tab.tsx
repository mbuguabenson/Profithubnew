import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './advanced-over-under-tab.scss';

// Threshold Configurations
interface ThresholdConfig {
    under: number[];
    over: number[];
    current: number[];
    name: string;
    multiplier: number;
}

const THRESHOLDS: Record<string, ThresholdConfig> = {
    '3-6': {
        under: [0, 1, 2, 3],
        over: [6, 7, 8, 9],
        current: [4, 5],
        name: 'Over 3 / Under 6',
        multiplier: 2.6,
    },
    '2-7': {
        under: [0, 1, 2],
        over: [7, 8, 9],
        current: [3, 4, 5, 6],
        name: 'Over 2 / Under 7',
        multiplier: 3.5,
    },
    '1-8': {
        under: [0, 1],
        over: [8, 9],
        current: [2, 3, 4, 5, 6, 7],
        name: 'Over 1 / Under 8',
        multiplier: 5.0,
    },
};

// Analysis Interfaces
interface ThresholdAnalysis {
    threshold: string;
    underPercent: number;
    overPercent: number;
    currentPercent: number;
    underCount: number;
    overCount: number;
    currentCount: number;
    strength: 'VERY STRONG' | 'STRONG' | 'MODERATE' | 'WEAK';
    confidence: number;
    expectedPayout: number;
}

interface RiskAssessment {
    volatility: number;
    trendStrength: number;
    confidence: number;
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: string;
}


// Analysis Functions
const analyzeThreshold = (digits: number[], config: ThresholdConfig): ThresholdAnalysis => {
    const underCount = digits.filter(d => config.under.includes(d)).length;
    const overCount = digits.filter(d => config.over.includes(d)).length;
    const currentCount = digits.filter(d => config.current.includes(d)).length;
    const total = digits.length || 1;

    const underPercent = (underCount / total) * 100;
    const overPercent = (overCount / total) * 100;
    const currentPercent = (currentCount / total) * 100;

    // Calculate strength based on deviation from expected
    const expectedPercent = (config.under.length / 10) * 100;
    const maxPercent = Math.max(underPercent, overPercent);
    const deviation = Math.abs(maxPercent - expectedPercent);

    const strength: ThresholdAnalysis['strength'] =
        deviation >= 15 ? 'VERY STRONG' : deviation >= 10 ? 'STRONG' : deviation >= 5 ? 'MODERATE' : 'WEAK';

    // Calculate confidence
    const sampleSizeConfidence = Math.min(total / 200, 1) * 100;
    const strengthConfidence = deviation * 5;
    const confidence = sampleSizeConfidence * 0.4 + strengthConfidence * 0.6;

    // Expected payout
    const winProbability = maxPercent / 100;
    const expectedPayout = winProbability * config.multiplier - (1 - winProbability) * 1;

    return {
        threshold: config.name,
        underPercent,
        overPercent,
        currentPercent,
        underCount,
        overCount,
        currentCount,
        strength,
        confidence: Math.min(confidence, 100),
        expectedPayout,
    };
};

const buildCorrelationMatrix = (digits: number[]): number[][] => {
    const matrix: number[][] = Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));
    const counts: number[][] = Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));

    // Count transitions
    for (let i = 0; i < digits.length - 1; i++) {
        const current = digits[i];
        const next = digits[i + 1];
        counts[current][next]++;
    }

    // Calculate percentages
    for (let i = 0; i < 10; i++) {
        const totalTransitions = counts[i].reduce((sum, count) => sum + count, 0);

        for (let j = 0; j < 10; j++) {
            if (totalTransitions > 0) {
                matrix[i][j] = (counts[i][j] / totalTransitions) * 100;
            }
        }
    }

    return matrix;
};

const calculateRiskScore = (analyses: ThresholdAnalysis[], recentDigits: number[]): RiskAssessment => {
    if (recentDigits.length < 50) {
        return {
            volatility: 0,
            trendStrength: 0,
            confidence: 0,
            overallRisk: 'HIGH',
            recommendation: 'Insufficient data - collect more ticks',
        };
    }

    // Volatility
    const percentages = analyses.flatMap(a => [a.underPercent, a.overPercent]);
    const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
    const volatility = Math.min(Math.sqrt(variance) * 2, 100);

    // Trend strength
    const config = THRESHOLDS['3-6'];
    const short = analyzeThreshold(recentDigits.slice(-50), config);
    const medium = recentDigits.length >= 100 ? analyzeThreshold(recentDigits.slice(-100), config) : short;
    const long = recentDigits.length >= 200 ? analyzeThreshold(recentDigits.slice(-200), config) : medium;

    const trendConsistency =
        100 - Math.abs(short.underPercent - medium.underPercent) - Math.abs(medium.underPercent - long.underPercent);
    const trendStrength = Math.max(0, trendConsistency);

    // Overall confidence
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

    // Risk classification
    const riskScore = volatility * 0.4 + (100 - trendStrength) * 0.3 + (100 - avgConfidence) * 0.3;

    const overallRisk: RiskAssessment['overallRisk'] = riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH';

    const recommendation =
        overallRisk === 'LOW'
            ? 'Safe to trade with recommended stakes'
            : overallRisk === 'MEDIUM'
              ? 'Trade with caution, reduce stakes'
              : 'High risk - avoid trading or use minimum stakes';

    return {
        volatility: Math.min(volatility, 100),
        trendStrength,
        confidence: avgConfidence,
        overallRisk,
        recommendation,
    };
};


const AdvancedOverUnderTab = observer(() => {
    const { analysis_market } = useStore();
    const { ticks, current_price, last_digit, symbol, setSymbol, markets } =
        analysis_market;

    const [selectedThreshold, setSelectedThreshold] = useState<'3-6' | '2-7' | '1-8'>('3-6');
    const [showHeatmap, setShowHeatmap] = useState(false);


    // Analysis calculations
    const allAnalyses = useMemo(() => {
        return Object.values(THRESHOLDS).map(config => analyzeThreshold(ticks, config));
    }, [ticks]);

    const currentAnalysis = useMemo(() => {
        return analyzeThreshold(ticks, THRESHOLDS[selectedThreshold]);
    }, [ticks, selectedThreshold]);

    const correlationMatrix = useMemo(() => buildCorrelationMatrix(ticks), [ticks]);

    const riskAssessment = useMemo(() => calculateRiskScore(allAnalyses, ticks), [allAnalyses, ticks]);

    // Determine signal based on current analysis
    const signal = useMemo(() => {
        const dominant = currentAnalysis.underPercent > currentAnalysis.overPercent ? 'UNDER' : 'OVER';
        const dominanceMargin = Math.abs(currentAnalysis.underPercent - currentAnalysis.overPercent);
        return dominanceMargin >= 10 ? dominant : 'WAIT';
    }, [currentAnalysis]);

    const signalClass = signal === 'WAIT' ? 'neutral' : signal.toLowerCase();

    // Get strongest digit for each side
    const strongestUnder = useMemo(() => {
        const config = THRESHOLDS[selectedThreshold];
        const counts = config.under.map(d => ({
            digit: d,
            count: ticks.filter(t => t === d).length,
        }));
        return counts.sort((a, b) => b.count - a.count)[0]?.digit ?? 0;
    }, [ticks, selectedThreshold]);

    const strongestOver = useMemo(() => {
        const config = THRESHOLDS[selectedThreshold];
        const counts = config.over.map(d => ({
            digit: d,
            count: ticks.filter(t => t === d).length,
        }));
        return counts.sort((a, b) => b.count - a.count)[0]?.digit ?? 0;
    }, [ticks, selectedThreshold]);

    // Predicted contracts
    const predictedContracts = useMemo(() => {
        const config = THRESHOLDS[selectedThreshold];
        if (currentAnalysis.underPercent > currentAnalysis.overPercent) {
            return config.under.slice(0, 3);
        } else {
            return config.over.slice(0, 3);
        }
    }, [currentAnalysis, selectedThreshold]);

    return (
        <div className='advanced-over-under-tab'>
            {/* Header */}
            <div className='premium-market-header'>
                <div className='market-select-glass'>
                    <label>MARKET</label>
                    <select value={symbol} onChange={e => setSymbol(e.target.value)}>
                        {markets.map(group => (
                            <optgroup key={group.group} label={group.group}>
                                {group.items.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className='price-display-glass'>
                    <span className='lbl'>LIVE PRICE</span>
                    <span className='val'>{current_price}</span>
                </div>

                <div className='digit-display-glass'>
                    <span className='lbl'>LAST DIGIT</span>
                    <div className='digit-box'>{last_digit !== null ? last_digit : '-'}</div>
                </div>
            </div>

            {/* Title and Signal Badge */}
            <div className='tab-header'>
                <h1 className='tab-title'>
                    <span className='icon'>💰</span>
                    Advanced Over/Under
                </h1>
                <div className={classNames('signal-badge', signalClass)}>{signal}</div>
            </div>

            {/* Last 20 Digits */}
            <div className='last-digits-section'>
                <div className='section-label'>Last 20 Digits</div>
                <div className='digits-row'>
                    {ticks.slice(-20).map((digit, idx) => (
                        <div key={idx} className={classNames('digit-chip', `d-${digit}`)}>
                            {digit}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Analysis Display */}
            <div className='main-analysis-display'>
                <div className='analysis-card under-card'>
                    <div className='percentage-display'>{currentAnalysis.underPercent.toFixed(1)}%</div>
                    <div className='card-label'>
                        Under (0-{THRESHOLDS[selectedThreshold].under[THRESHOLDS[selectedThreshold].under.length - 1]})
                        <span className='trend-icon'>📉</span>
                    </div>
                    <div className='progress-bar'>
                        <div
                            className='progress-fill under-fill'
                            style={{ width: `${currentAnalysis.underPercent}%` }}
                        />
                    </div>
                    <div className='strongest-label'>Strongest Digit: {strongestUnder}</div>
                </div>

                <div className='analysis-card over-card'>
                    <div className='percentage-display'>{currentAnalysis.overPercent.toFixed(1)}%</div>
                    <div className='card-label'>
                        Over ({THRESHOLDS[selectedThreshold].over[0]}-9) <span className='trend-icon'>📈</span>
                    </div>
                    <div className='progress-bar'>
                        <div className='progress-fill over-fill' style={{ width: `${currentAnalysis.overPercent}%` }} />
                    </div>
                    <div className='strongest-label'>Strongest Digit: {strongestOver}</div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className='metrics-row'>
                <div className='metric-box'>
                    <div className='metric-label'>Market Power</div>
                    <div className='metric-value'>
                        {Math.max(currentAnalysis.underPercent, currentAnalysis.overPercent).toFixed(1)}%
                    </div>
                </div>
                <div className='metric-box'>
                    <div className='metric-label'>Volatility</div>
                    <div className='metric-value'>{riskAssessment.volatility.toFixed(1)}%</div>
                </div>
                <div className='metric-box'>
                    <div className='metric-label'>Confirmed Ticks</div>
                    <div className='metric-value'>{ticks.length}</div>
                </div>
            </div>

            {/* Predicted Contracts */}
            <div className='predicted-section'>
                <div className='section-label'>
                    Predicted {currentAnalysis.underPercent > currentAnalysis.overPercent ? 'Under' : 'Over'} Contracts:
                </div>
                <div className='contracts-row'>
                    {predictedContracts.map(digit => (
                        <div
                            key={digit}
                            className={classNames(
                                'contract-chip',
                                currentAnalysis.underPercent > currentAnalysis.overPercent ? 'under' : 'over'
                            )}
                        >
                            {currentAnalysis.underPercent > currentAnalysis.overPercent ? 'Under' : 'Over'} {digit}
                        </div>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div className='how-it-works'>
                <div className='how-title'>How Advanced Over/Under Works:</div>
                <div className='how-text'>
                    Phase 1 analyzes initial market conditions. If conditions are met, Phase 2 confirms with 15
                    additional ticks. When confidence reaches 56% or higher with increasing trend, a RUN NOW signal
                    appears (orange with glow). You have maximum 20 ticks to trade. Exit signal appears if market
                    changes or time expires.
                </div>
            </div>

            {/* Threshold Selector */}
            <div className='threshold-selector'>
                <div className='selector-label'>Select Threshold:</div>
                <div className='threshold-tabs'>
                    {Object.entries(THRESHOLDS).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedThreshold(key as '3-6' | '2-7' | '1-8')}
                            className={classNames('threshold-tab', {
                                active: selectedThreshold === key,
                            })}
                        >
                            <div className='tab-name'>{config.name}</div>
                            <div className='tab-multiplier'>x{config.multiplier}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Multi-Threshold Comparison */}
            <div className='comparison-grid'>
                {allAnalyses.map(analysis => (
                    <div key={analysis.threshold} className='comparison-card'>
                        <div className='card-title'>{analysis.threshold}</div>

                        <div className='comparison-bars'>
                            <div className='bar-item'>
                                <div className='bar-header'>
                                    <span className='bar-label'>UNDER</span>
                                    <span className='bar-percent'>{analysis.underPercent.toFixed(1)}%</span>
                                </div>
                                <div className='bar-track'>
                                    <div
                                        className='bar-fill under-fill'
                                        style={{ width: `${analysis.underPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className='bar-item'>
                                <div className='bar-header'>
                                    <span className='bar-label'>OVER</span>
                                    <span className='bar-percent'>{analysis.overPercent.toFixed(1)}%</span>
                                </div>
                                <div className='bar-track'>
                                    <div className='bar-fill over-fill' style={{ width: `${analysis.overPercent}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className='card-metrics'>
                            <div className='metric-item'>
                                <span className='metric-label'>Strength</span>
                                <span className='metric-value'>{analysis.strength}</span>
                            </div>
                            <div className='metric-item'>
                                <span className='metric-label'>Confidence</span>
                                <span className='metric-value'>{analysis.confidence.toFixed(0)}%</span>
                            </div>
                            <div className='metric-item full-width'>
                                <span className='metric-label'>Expected Value</span>
                                <span
                                    className={classNames('metric-value', 'ev-value', {
                                        positive: analysis.expectedPayout > 0,
                                        negative: analysis.expectedPayout <= 0,
                                    })}
                                >
                                    {analysis.expectedPayout > 0 ? '+' : ''}
                                    {analysis.expectedPayout.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Risk Assessment */}
            <div className='risk-assessment-card'>
                <div className='card-title'>Risk Assessment</div>

                <div className='risk-metrics-grid'>
                    <div className='risk-metric'>
                        <div className='risk-label'>Market Volatility</div>
                        <div className='risk-value'>{riskAssessment.volatility.toFixed(0)}%</div>
                        <div className='risk-bar'>
                            <div
                                className={classNames('risk-fill', {
                                    low: riskAssessment.volatility < 30,
                                    medium: riskAssessment.volatility >= 30 && riskAssessment.volatility < 60,
                                    high: riskAssessment.volatility >= 60,
                                })}
                                style={{ width: `${riskAssessment.volatility}%` }}
                            />
                        </div>
                    </div>

                    <div className='risk-metric'>
                        <div className='risk-label'>Trend Strength</div>
                        <div className='risk-value'>{riskAssessment.trendStrength.toFixed(0)}%</div>
                        <div className='risk-bar'>
                            <div className='risk-fill' style={{ width: `${riskAssessment.trendStrength}%` }} />
                        </div>
                    </div>

                    <div className='risk-metric'>
                        <div className='risk-label'>Overall Confidence</div>
                        <div className='risk-value'>{riskAssessment.confidence.toFixed(0)}%</div>
                        <div className='risk-bar'>
                            <div className='risk-fill' style={{ width: `${riskAssessment.confidence}%` }} />
                        </div>
                    </div>
                </div>

                <div
                    className={classNames('overall-risk-badge', {
                        low: riskAssessment.overallRisk === 'LOW',
                        medium: riskAssessment.overallRisk === 'MEDIUM',
                        high: riskAssessment.overallRisk === 'HIGH',
                    })}
                >
                    <div className='risk-badge-label'>{riskAssessment.overallRisk} RISK</div>
                    <div className='risk-recommendation'>{riskAssessment.recommendation}</div>
                </div>
            </div>

            {/* Correlation Heatmap (Optional) */}
            {showHeatmap && (
                <div className='heatmap-card'>
                    <div className='heatmap-header'>
                        <div className='card-title'>Correlation Matrix</div>
                        <button onClick={() => setShowHeatmap(false)} className='hide-btn'>
                            Hide
                        </button>
                    </div>

                    <div className='heatmap-grid'>
                        <div className='heatmap-cell header-cell'></div>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                            <div key={i} className='heatmap-cell header-cell'>
                                {i}
                            </div>
                        ))}

                        {correlationMatrix.map((row, i) => (
                            <div key={i} className='heatmap-row'>
                                <div className='heatmap-cell header-cell'>{i}</div>
                                {row.map((value, j) => {
                                    const intensity = value / 20;
                                    return (
                                        <div
                                            key={j}
                                            className='heatmap-cell data-cell'
                                            style={{
                                                backgroundColor: `rgba(168, 85, 247, ${intensity})`,
                                                color: intensity > 0.5 ? 'white' : 'inherit',
                                            }}
                                            title={`${i} → ${j}: ${(value as number).toFixed(1)}%`}
                                        >
                                            {value >= 15 && (value as number).toFixed(0)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!showHeatmap && (
                <button onClick={() => setShowHeatmap(true)} className='show-heatmap-btn'>
                    Show Correlation Heatmap
                </button>
            )}
        </div>
    );
});

export default AdvancedOverUnderTab;
