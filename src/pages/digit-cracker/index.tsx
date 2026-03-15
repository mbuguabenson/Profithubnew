import { useEffect, useRef, useState } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { Localize } from '@deriv-com/translations';
import { TTradeConfig, TTradeLog } from '@/lib/digit-trade-engine';
import { TAnalysisHistory, TDigitStat } from '@/stores/analysis-store';
import {
    LabelPairedArrowsRotateMdRegularIcon,
    LabelPairedPlayMdFillIcon,
    LabelPairedSquareMdFillIcon,
} from '@deriv/quill-icons/LabelPaired';
import '../easy-tool/easy-tool.scss';
import './digit-cracker.scss';

const DigitCracker = observer(() => {
    const { digit_cracker, client, common, ui, smart_trading } = useStore();
    const [activeStrategy, setActiveStrategy] = useState<'even_odd' | 'differs' | 'matches' | 'over_under'>('even_odd');
    const [activeLogTab, setActiveLogTab] = useState<'summary' | 'transactions' | 'journal'>('summary');
    const logRef = useRef<HTMLDivElement>(null);

    const {
        digit_stats,
        last_digit,
        percentages,
        even_odd_history,
        over_under_history,
        trade_engine,
    } = digit_cracker;
    const { trade_status, is_executing, session_profit, total_profit, logs } = trade_engine;
    
    // Header Stats
    const { balance, currency } = client;
    const { latency, is_socket_opened } = common;
    const { is_dark_mode_on } = ui;
    const { current_price } = smart_trading;

    // Initialize/Cleanup
    useEffect(() => {
        return () => {
            digit_cracker.dispose();
        };
    }, [digit_cracker]);

    // Auto-scroll logs
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs.length]);

    // Autorun removed as AnalysisStore handles tick processing internally


    const renderDigitCircles = () => {
        // Split digits into two groups: 0-4 and 5-9
        const group1 = digit_stats.filter((s: TDigitStat) => s.digit >= 0 && s.digit <= 4);
        const group2 = digit_stats.filter((s: TDigitStat) => s.digit >= 5 && s.digit <= 9);

        const renderDigitGroup = (digits: TDigitStat[]) => {
            return digits.map((stat: TDigitStat) => {
                const isCurrent = stat.digit === last_digit;

                // Colors based on rank and current status
                let color = '#3b82f6'; // Default Blue
                if (stat.rank === 1)
                    color = '#00ff41'; // Green for top
                else if (stat.rank === 10) color = '#ff073a'; // Red for least

                if (isCurrent) color = '#ff9f00'; // Orange for NOW

                // SVG dimensions for partial arc (roughly bottom 40% of circle)
                // Using a simpler approach: full circle SVG but class-controlled styling
                // Actually, to match the image precisely, well use a specific arc

                return (
                    <div
                        key={stat.digit}
                        className={`digit-card-v2 ${isCurrent ? 'is-now' : ''}`}
                        data-rank={stat.rank}
                    >
                        {isCurrent && (
                            <div className='now-badge-wrapper'>
                                <span className='now-badge'>NOW</span>
                            </div>
                        )}
                        <div className='digit-main-circle'>
                            <svg viewBox='0 0 70 70' width='70' height='70' preserveAspectRatio='xMidYMid meet'>
                                <circle
                                    className='circle-track'
                                    cx='35'
                                    cy='35'
                                    r='30'
                                    fill='none'
                                    stroke='var(--general-hover)'
                                    strokeWidth='4'
                                />
                                <circle
                                    className='circle-progress-arc'
                                    cx='35'
                                    cy='35'
                                    r='30'
                                    fill='none'
                                    stroke={color}
                                    strokeWidth='4'
                                    strokeLinecap='round'
                                    strokeDasharray={`${(2 * Math.PI * 30) / 4} ${2 * Math.PI * 30}`}
                                    strokeDashoffset={-(2 * Math.PI * 30) * 0.375}
                                    style={{ filter: isCurrent ? `drop-shadow(0 0 6px ${color})` : 'none' }}
                                />
                            </svg>
                            <div className='digit-center-text'>
                                <span className='digit-num' style={{ color: isCurrent ? color : 'var(--text-prominent)' }}>
                                    {stat.digit}
                                </span>
                                <span className='digit-pct' style={{ color: isCurrent ? color : 'var(--text-general)' }}>
                                    {stat.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className='digit-sample-size'>n={stat.count}</div>
                    </div>
                );
            });
        };

        return (
            <div className='digit-grid-wrapper'>
                <div className='digit-row'>{renderDigitGroup(group1)}</div>
                <div className='digit-row'>{renderDigitGroup(group2)}</div>
            </div>
        );
    };

    const renderStrategyControls = () => {
        const configKey = `${activeStrategy}_config` as keyof typeof trade_engine;
        const config = trade_engine[configKey] as unknown as TTradeConfig;
        // Using intermediate cast to avoid complex intersection issues during render

        return (
            <div className='strategy-controls'>
                <div className='controls-header'>
                    <h3>Strategy Configuration</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div className='active-badge'>{activeStrategy.toUpperCase().replace('_', '/')}</div>
                        {config.runs_count !== undefined && config.max_runs && (
                            <div className='run-counter'>
                                Runs: {config.runs_count || 0}/{config.max_runs}
                            </div>
                        )}
                    </div>
                </div>

                <div className='settings-grid'>
                    <div className='input-field'>
                        <label>Stake Amount ($)</label>
                        <input
                            type='number'
                            step='0.01'
                            value={config.stake || ''}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                trade_engine.updateConfig(activeStrategy, 'stake', isNaN(val) ? 0 : val);
                            }}
                        />
                    </div>
                    <div className='input-field'>
                        <label>Take Profit ($)</label>
                        <input
                            type='number'
                            step='0.01'
                            value={config.take_profit || ''}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                trade_engine.updateConfig(activeStrategy, 'take_profit', isNaN(val) ? 0 : val);
                            }}
                        />
                    </div>
                    <div className='input-field'>
                        <label>Stop Loss ($)</label>
                        <input
                            type='number'
                            step='0.01'
                            value={config.max_loss || ''}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                trade_engine.updateConfig(activeStrategy, 'max_loss', isNaN(val) ? 0 : val);
                            }}
                        />
                    </div>
                    <div className='input-field'>
                        <label>Martingale Multiplier</label>
                        <input
                            type='number'
                            step='0.1'
                            value={config.multiplier || ''}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                trade_engine.updateConfig(activeStrategy, 'multiplier', isNaN(val) ? 0 : val);
                            }}
                        />
                    </div>
                    <div className='input-field'>
                        <label>Maximum Runs</label>
                        <input
                            type='number'
                            value={config.max_runs || ''}
                            onChange={e => {
                                const val = parseInt(e.target.value);
                                trade_engine.updateConfig(activeStrategy, 'max_runs', isNaN(val) ? 0 : val);
                            }}
                        />
                    </div>
                    <div className='input-field'>
                        <label>Tick Duration</label>
                        <input
                            type='number'
                            value={config.ticks || ''}
                            onChange={e => {
                                const val = parseInt(e.target.value);
                                trade_engine.updateConfig(activeStrategy, 'ticks', isNaN(val) ? 1 : val);
                            }}
                        />
                    </div>
                    {['over_under', 'matches', 'differs'].includes(activeStrategy) && (
                        <div className='input-field'>
                            <label>Prediction</label>
                            <input
                                type='number'
                                min='0'
                                max='9'
                                value={config.prediction ?? 0}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    trade_engine.updateConfig(activeStrategy, 'prediction', isNaN(val) ? 0 : val);
                                }}
                            />
                        </div>
                    )}
                    {activeStrategy === 'even_odd' && (
                        <>
                            <div className='input-field'>
                                <label>Trigger Condition</label>
                                <div className='select-wrapper'>
                                    <select
                                        value={config.trigger_condition || 'EITHER'}
                                        onChange={e =>
                                            trade_engine.updateConfig(
                                                activeStrategy,
                                                'trigger_condition' as keyof TTradeConfig,
                                                e.target.value as any
                                            )
                                        }
                                    >
                                        <option value='EITHER'>Either (Even/Odd)</option>
                                        <option value='EVEN'>Even Only</option>
                                        <option value='ODD'>Odd Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className='input-field'>
                                <label>Target Prediction</label>
                                <div className='select-wrapper'>
                                    <select
                                        value={config.target_prediction || 'EVEN'}
                                        onChange={e =>
                                            trade_engine.updateConfig(
                                                activeStrategy,
                                                'target_prediction' as keyof TTradeConfig,
                                                e.target.value as any
                                            )
                                        }
                                    >
                                        <option value='EVEN'>Trade Even</option>
                                        <option value='ODD'>Trade Odd</option>
                                    </select>
                                </div>
                            </div>
                            <div className='input-field'>
                                <label>Entry Pattern</label>
                                <div className='select-wrapper'>
                                    <select
                                        value={config.entry_pattern || 'PATTERN_1'}
                                        onChange={e =>
                                            trade_engine.updateConfig(
                                                activeStrategy,
                                                'entry_pattern' as keyof TTradeConfig,
                                                e.target.value as any
                                            )
                                        }
                                    >
                                        <option value='PATTERN_1'>Threshold + Consec.</option>
                                        <option value='PATTERN_2'>High/2nd/Least Rankings</option>
                                    </select>
                                </div>
                            </div>
                            {config.entry_pattern !== 'PATTERN_2' && (
                                <>
                                    <div className='input-field'>
                                        <label>Trigger %</label>
                                        <input
                                            type='number'
                                            value={config.trigger_percentage || ''}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value);
                                                trade_engine.updateConfig(
                                                    activeStrategy,
                                                    'trigger_percentage' as keyof TTradeConfig,
                                                    isNaN(val) ? 0 : val as any
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className='input-field'>
                                        <label>Consecutive Ticks</label>
                                        <input
                                            type='number'
                                            value={config.consecutive_ticks || ''}
                                            onChange={e => {
                                                const val = parseInt(e.target.value);
                                                trade_engine.updateConfig(
                                                    activeStrategy,
                                                    'consecutive_ticks' as keyof TTradeConfig,
                                                    isNaN(val) ? 0 : val as any
                                                );
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    {activeStrategy === 'differs' && (
                        <>
                            <div className='input-field'>
                                <label>Max Allowed %</label>
                                <input
                                    type='number'
                                    step='1'
                                    value={config.differs_max_percentage ?? ''}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        trade_engine.updateConfig(
                                            activeStrategy,
                                            'differs_max_percentage' as keyof TTradeConfig,
                                            isNaN(val) ? 0 : val as any
                                        );
                                    }}
                                />
                            </div>
                            <div className='input-field'>
                                <label>Target Appearances</label>
                                <input
                                    type='number'
                                    step='1'
                                    min='1'
                                    value={config.differs_target_ticks ?? ''}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        trade_engine.updateConfig(
                                            activeStrategy,
                                            'differs_target_ticks' as keyof TTradeConfig,
                                            isNaN(val) ? 1 : val as any
                                        );
                                    }}
                                />
                            </div>
                            <div className='input-field'>
                                <label>Bulk Trades</label>
                                <input
                                    type='number'
                                    step='1'
                                    min='1'
                                    max='10'
                                    value={config.bulk_trades_count ?? ''}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        trade_engine.updateConfig(
                                            activeStrategy,
                                            'bulk_trades_count' as keyof TTradeConfig,
                                            isNaN(val) ? 1 : val as any
                                        );
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className='toggles-row'>
                    <button
                        className={`toggle-switch ${config.use_martingale ? 'active' : ''}`}
                        onClick={() =>
                            trade_engine.updateConfig(activeStrategy, 'use_martingale', !config.use_martingale)
                        }
                    >
                        <span className='toggle-label'>Martingale</span>
                        <span className='toggle-status'>{config.use_martingale ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                        className={`toggle-switch ${config.use_max_loss ? 'active' : ''}`}
                        onClick={() => trade_engine.updateConfig(activeStrategy, 'use_max_loss', !config.use_max_loss)}
                    >
                        <span className='toggle-label'>Stop Loss</span>
                        <span className='toggle-status'>{config.use_max_loss ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                        className={`toggle-switch ${config.use_compounding ? 'active' : ''}`}
                        onClick={() =>
                            trade_engine.updateConfig(activeStrategy, 'use_compounding', !config.use_compounding)
                        }
                    >
                        <span className='toggle-label'>Compounding</span>
                        <span className='toggle-status'>{config.use_compounding ? 'ON' : 'OFF'}</span>
                    </button>
                </div>

                <div className='action-row'>
                    <button
                        className='btn-trade-once'
                        onClick={() => trade_engine.toggleStrategy(activeStrategy, false)}
                        disabled={config.is_running}
                    >
                        <LabelPairedPlayMdFillIcon />
                        Trade Once
                    </button>
                    <button
                        className={`btn-auto-trade ${config.is_running && config.is_auto ? 'active glowing' : ''}`}
                        onClick={() => trade_engine.toggleStrategy(activeStrategy, true)}
                    >
                        {config.is_running && config.is_auto ? (
                            <LabelPairedSquareMdFillIcon />
                        ) : (
                            <LabelPairedArrowsRotateMdRegularIcon />
                        )}
                        {config.is_running && config.is_auto ? 'Stop Auto Trading' : 'Start Auto Trading'}
                    </button>
                </div>
            </div>
        );
    };

    const renderLogContent = () => {
        switch (activeLogTab) {
            case 'summary': {
                const totalTrades = logs.filter(
                    (l: TTradeLog) => l.type === 'trade' || l.type === 'success' || l.type === 'error'
                ).length;
                const wins = logs.filter((l: TTradeLog) => l.type === 'success').length;
                const losses = logs.filter((l: TTradeLog) => l.type === 'error').length;
                const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';

                return (
                    <div className='summary-content'>
                        <div className='summary-grid'>
                            <div className='summary-card'>
                                <div className='label'>Total Trades</div>
                                <div className='value'>{totalTrades}</div>
                            </div>
                            <div className='summary-card'>
                                <div className='label'>Wins</div>
                                <div className='value success'>{wins}</div>
                            </div>
                            <div className='summary-card'>
                                <div className='label'>Losses</div>
                                <div className='value error'>{losses}</div>
                            </div>
                            <div className='summary-card'>
                                <div className='label'>Win Rate</div>
                                <div className='value'>{winRate}%</div>
                            </div>
                            <div className='summary-card'>
                                <div className='label'>Session Profit</div>
                                <div className={`value ${session_profit >= 0 ? 'success' : 'error'}`}>
                                    ${session_profit.toFixed(2)}
                                </div>
                            </div>
                            <div className='summary-card'>
                                <div className='label'>Total Profit</div>
                                <div className={`value ${total_profit >= 0 ? 'success' : 'error'}`}>
                                    ${total_profit.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'transactions': {
                const tradeLogs = logs.filter(
                    (l: TTradeLog) => l.type === 'trade' || l.type === 'success' || l.type === 'error'
                );
                return (
                    <div className='transactions-content'>
                        {tradeLogs.length === 0 ? (
                            <div className='empty-log'>No transactions yet...</div>
                        ) : (
                            <div className='transaction-list'>
                                {tradeLogs.map((log: TTradeLog, i: number) => (
                                    <div key={i} className={`log-row transaction-item ${log.type}`}>
                                        <div className='log-time'>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className='log-message'>{log.message}</div>
                                        <div className='log-status-icon'>
                                            {log.type === 'success' ? '✅' : log.type === 'error' ? '❌' : '⚡'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }

            case 'journal':
                return (
                    <div className='journal-content'>
                        {logs.length === 0 ? (
                            <div className='empty-log'>No journal entries...</div>
                        ) : (
                            <div className='journal-list'>
                                {logs.map((log: TTradeLog, i: number) => (
                                    <div key={i} className={`log-row log-entry ${log.type}`}>
                                        <div className='log-time'>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className='log-message'>{log.message}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className={`easy-tool digit-cracker-page ${is_dark_mode_on ? 'easy-tool--dark' : 'easy-tool--light'}`}>
            <div className='easy-tool__header'>
                <div className='easy-tool__title-group'>
                    <div className='easy-tool__title'>
                        <Localize i18n_default_text='Digit Cracker' />
                    </div>
                </div>

                <div className='easy-tool__vitals-row'>
                    <div className='v-item'>
                        <span className='l'>PRICE</span>
                        <span className='v'>{current_price}</span>
                    </div>
                    <div className='v-item'>
                        <span className='l'>DIGIT</span>
                        <span className='v digit'>{last_digit ?? '-'}</span>
                    </div>
                    <div className='v-item'>
                        <span className='l'>BALANCE</span>
                        <span className='v balance'>
                            {balance} {currency}
                        </span>
                    </div>
                    <div className='v-item'>
                        <span className='l'>PING</span>
                        <span className='v'>{latency}ms</span>
                    </div>
                    <div className='v-item'>
                        <span className='l'>STATUS</span>
                        <span className={`v-status ${is_socket_opened ? 'online' : 'offline'}`}>
                            {is_socket_opened ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            <div className='easy-tool__content'>
                {/* 1. Analytics Section */}
                <div className='easy-tool__section analytics-section'>
                    <div className='section-card'>
                        <div className='section-card__header'>
                            <Localize i18n_default_text='Digits Distribution Analytics' />
                            <span style={{ fontSize: '10px', opacity: 0.5, textTransform: 'none', marginLeft: 'auto' }}>
                                Last 60 Ticks • Real-Time Analysis
                            </span>
                        </div>
                        {renderDigitCircles()}
                    </div>
                </div>

                {/* 2. Strategy Section */}
                <div className='easy-tool__section strategy-section'>
                    <div className='section-card'>
                        <div className='strategy-tabs'>
                            <button
                                className={activeStrategy === 'even_odd' ? 'active' : ''}
                                onClick={() => setActiveStrategy('even_odd')}
                            >
                                EVEN/ODD
                            </button>
                            <button
                                className={activeStrategy === 'differs' ? 'active' : ''}
                                onClick={() => setActiveStrategy('differs')}
                            >
                                DIFFERS
                            </button>
                            <button
                                className={activeStrategy === 'matches' ? 'active' : ''}
                                onClick={() => setActiveStrategy('matches')}
                            >
                                MATCHES
                            </button>
                            <button
                                className={activeStrategy === 'over_under' ? 'active' : ''}
                                onClick={() => setActiveStrategy('over_under')}
                            >
                                OVER/UNDER
                            </button>
                        </div>

                        <div className='strategy-content'>
                            <div className='content-left'>
                                {activeStrategy === 'even_odd' && (
                                    <div className='strategy-info'>
                                        <h3>Even vs Odd Strategy</h3>
                                        <div className='strategy-description'>
                                            <p>
                                                <strong>Logic:</strong> Follows the configured trigger conditions, target, and
                                                entry pattern.
                                            </p>
                                        </div>
                                        <div className='power-display'>
                                            <div className='power-item'>
                                                <span className='label'>EVEN Power:</span>
                                                <span className='value green'>{percentages.even.toFixed(1)}%</span>
                                            </div>
                                            <div className='power-item'>
                                                <span className='label'>ODD Power:</span>
                                                <span className='value red'>{percentages.odd.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className='history-section'>
                                            <span className='history-label'>Recent Pattern:</span>
                                            <div className='history-boxes'>
                                                {even_odd_history.slice(0, 20).map((h: TAnalysisHistory, i: number) => (
                                                    <div key={i} className={`history-box ${h.type.toLowerCase()}`}>
                                                        {h.type === 'E' ? 'E' : 'O'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeStrategy === 'over_under' && (
                                    <div className='strategy-info'>
                                        <h3>Over/Under Strategy</h3>
                                        <div className='strategy-description'>
                                            <p><strong>Logic:</strong> UNDER (0-4) vs OVER (5-9).</p>
                                        </div>
                                        <div className='power-display'>
                                            <div className='power-item'>
                                                <span className='label'>OVER (5-9):</span>
                                                <span className='value blue'>{percentages.over.toFixed(1)}%</span>
                                            </div>
                                            <div className='power-item'>
                                                <span className='label'>UNDER (0-4):</span>
                                                <span className='value orange'>{percentages.under.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className='history-section'>
                                            <span className='history-label'>Recent Pattern:</span>
                                            <div className='history-boxes'>
                                                {over_under_history.slice(0, 20).map((h: TAnalysisHistory, i: number) => (
                                                    <div key={i} className={`history-box ${h.type.toLowerCase()}`}>
                                                        {h.type === 'O' ? 'O' : 'U'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeStrategy === 'differs' && (
                                    <div className='strategy-info'>
                                        <h3>Differs Strategy</h3>
                                        <div className='strategy-description'>
                                            <p><strong>Logic:</strong> Choose stable digits below 10%.</p>
                                        </div>
                                        <div className='digit-rankings'>
                                            {digit_stats.slice(0, 5).map((s: TDigitStat) => (
                                                <div key={s.digit} className='rank-row'>
                                                    <span className='rank'>#{s.rank}</span>
                                                    <span className='digit'>Digit {s.digit}</span>
                                                    <span className='power'>{s.percentage.toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeStrategy === 'matches' && (
                                    <div className='strategy-info'>
                                        <h3>Matches Strategy</h3>
                                        <div className='strategy-description'>
                                            <p><strong>Logic:</strong> Choose dominant digits showing upwards trend.</p>
                                        </div>
                                        <div className='digit-rankings'>
                                            {digit_stats.slice(0, 5).map((s: TDigitStat) => (
                                                <div key={s.digit} className='rank-row'>
                                                    <span className='rank'>#{s.rank}</span>
                                                    <span className='digit'>Digit {s.digit}</span>
                                                    <span className='power'>{s.percentage.toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='content-right'>{renderStrategyControls()}</div>
                        </div>
                    </div>
                </div>

                {/* 3. Trading Ledger Section */}
                <div className='easy-tool__section trading-log-section'>
                    <div className='section-card'>
                        <div className='section-card__header'>
                            <Localize i18n_default_text='Trading Ledger' />
                            <div className='log-tabs' style={{ marginLeft: '20px' }}>
                                <button className={activeLogTab === 'summary' ? 'active' : ''} onClick={() => setActiveLogTab('summary')}>Summary</button>
                                <button className={activeLogTab === 'transactions' ? 'active' : ''} onClick={() => setActiveLogTab('transactions')}>Transactions</button>
                                <button className={activeLogTab === 'journal' ? 'active' : ''} onClick={() => setActiveLogTab('journal')}>Journal</button>
                            </div>
                            <button className='clear-log-btn' style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '10px' }} onClick={() => trade_engine.clearLogs()}>Clear Logs</button>
                        </div>

                        <div className='trading-log-header' style={{ borderBottom: '1px solid var(--border-subtle)', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className='status-left' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className={`status-indicator ${is_executing ? 'active' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: is_executing ? '#00ff41' : '#ff073a' }} />
                                <span className='status-text'>{trade_status}</span>
                            </div>
                            <div className='profit-display'>
                                <div className='profit-item'>
                                    <span className='label' style={{ fontSize: '10px', marginRight: '5px' }}>SESSION:</span>
                                    <span className={`value ${session_profit >= 0 ? 'success' : 'error'}`} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                        {session_profit >= 0 ? '+' : ''}${session_profit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='trading-log-content' ref={logRef} style={{ height: '300px', overflowY: 'auto' }}>
                            {renderLogContent()}
                        </div>

                        <div className='section-card__footer' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderTop: '1px solid var(--border-subtle)' }}>
                            <div className='profit-display'>
                                <div className='profit-item'>
                                    <span className='label' style={{ fontSize: '10px', marginRight: '5px' }}>TOTAL PROFIT:</span>
                                    <span className={`value ${total_profit >= 0 ? 'success' : 'error'}`} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                        {total_profit >= 0 ? '+' : ''}${total_profit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <button className='reset-btn' style={{ padding: '6px 15px', fontSize: '11px' }} onClick={() => runInAction(() => { trade_engine.session_profit = 0; trade_engine.total_profit = 0; trade_engine.clearLogs(); })}>
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default DigitCracker;
