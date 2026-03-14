import { useEffect, useRef, useState } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
    LabelPairedArrowsRotateMdRegularIcon,
    LabelPairedChartLineMdRegularIcon,
    LabelPairedCircleInfoMdRegularIcon,
    LabelPairedPlayMdFillIcon,
    LabelPairedSquareMdFillIcon,
} from '@deriv/quill-icons';
import { useStore } from '../../../hooks/useStore';
import './trading-engine.scss';

interface DigitStat {
    digit: number;
    power: number;
    count: number;
    percentage: number;
}

interface EvenOddHistoryItem {
    type: 'E' | 'O';
}

interface LogEntry {
    type: string;
    timestamp: number;
    message: string;
}

const TradingEngine = observer(() => {
    const { smart_auto, analysis } = useStore();
    const [activeTab, setActiveTab] = useState<
        'even_odd' | 'over_under' | 'differs' | 'matches' | 'smart_auto_24' | 'rise_fall'
    >('even_odd');
    const [activeLogTab, setActiveLogTab] = useState<'summary' | 'transactions' | 'journal'>('summary');

    // Auto-scroll logs
    const { even_odd_history, percentages, digit_stats } = analysis;
    const { bot_status, is_executing, session_profit, total_profit, logs } = smart_auto;
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs.length]);

    const renderBotControls = (
        botType: 'even_odd' | 'over_under' | 'differs' | 'matches' | 'smart_auto_24' | 'rise_fall'
    ) => {
        const config = (smart_auto as Record<string, any>)[`${botType}_config` || 'over_under_config'];

        return (
            <div className='strategy-layout'>
                <div className='strategy-info-panel'>
                    <div className='info-header'>
                        <h3>Strategy Analysis</h3>
                        <div className='active-badge'>{botType.toUpperCase().replace('_', ' ')}</div>
                    </div>

                    {botType === 'over_under' && (
                        <div className='analysis-content'>
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

                            <div className='suggestion-box'>
                                <span className='label'>
                                    💡{' '}
                                    {percentages.over > percentages.under
                                        ? 'Suggested (Trade OVER)'
                                        : 'Suggested (Trade UNDER)'}
                                    :
                                </span>
                                <div className='prediction-buttons'>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => (
                                        <button
                                            key={p}
                                            className={`pred-btn ${config.prediction === p ? 'active' : ''} ${(percentages.over > percentages.under ? [0, 1, 2, 3] : [6, 7, 8, 9]).includes(p) ? 'suggested' : ''}`}
                                            onClick={() => smart_auto.updateConfig(botType, 'prediction', p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className='signal-status'>
                                <span className='label'>🎯 Status:</span>
                                <span className='value'>
                                    {percentages.under > 55
                                        ? 'UNDER dominant - Waiting for Signal'
                                        : percentages.over > 55
                                          ? 'OVER dominant - Waiting for Signal'
                                          : 'Market Neutral'}
                                </span>
                            </div>
                        </div>
                    )}

                    {botType === 'matches' && (
                        <div className='analysis-content'>
                            <div className='digit-rankings'>
                                {digit_stats
                                    .slice()
                                    .sort((a: DigitStat, b: DigitStat) => b.power - a.power)
                                    .slice(0, 3)
                                    .map((s: DigitStat) => (
                                        <div key={s.digit} className='rank-row'>
                                            <span className='digit'>Digit {s.digit}</span>
                                            <div className='power-track'>
                                                <div className='fill' style={{ width: `${s.power}%` }}></div>
                                            </div>
                                            <span className='value'>{s.power}%</span>
                                        </div>
                                    ))}
                            </div>
                            <div className='suggestion-box'>
                                <span className='label'>💡 Best Targets:</span>
                                <div className='prediction-buttons'>
                                    {(() => {
                                        const sorted = [...digit_stats].sort(
                                            (a: DigitStat, b: DigitStat) => b.count - a.count
                                        );
                                        return [sorted[0], sorted[1], sorted[9]].map((s: DigitStat) => (
                                            <button
                                                key={s.digit}
                                                className={`pred-btn ${config.prediction === s.digit ? 'active' : ''}`}
                                                onClick={() => smart_auto.updateConfig(botType, 'prediction', s.digit)}
                                            >
                                                {s.digit}
                                            </button>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {botType === 'differs' && (
                        <div className='analysis-content'>
                            <div className='digit-rankings'>
                                {digit_stats
                                    .slice()
                                    .sort((a: DigitStat, b: DigitStat) => a.percentage - b.percentage)
                                    .slice(0, 5)
                                    .map((s: DigitStat) => (
                                        <div
                                            key={s.digit}
                                            className={`rank-row ${s.digit >= 2 && s.digit <= 7 ? 'eligible' : ''}`}
                                        >
                                            <span className='digit'>Digit {s.digit}</span>
                                            <div className='power-track'>
                                                <div className='fill' style={{ width: `${s.percentage * 10}%` }}></div>
                                            </div>
                                            <span className='value'>{s.percentage.toFixed(1)}%</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {botType === 'even_odd' && (
                        <div className='analysis-content'>
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
                                <span className='label'>Recent Pattern:</span>
                                <div className='history-boxes'>
                                    {even_odd_history.slice(0, 15).map((h: EvenOddHistoryItem, i: number) => (
                                        <div key={i} className={`history-box ${h.type}`}>
                                            {h.type === 'E' ? 'E' : 'O'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className='bot-settings-panel'>
                    <div className='controls-grid'>
                        <div className='input-group'>
                            <label>Stake ($)</label>
                            <input
                                type='number'
                                value={config.stake}
                                onChange={e => smart_auto.updateConfig(botType, 'stake', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className='input-group'>
                            <label>Take Profit ($)</label>
                            <input
                                type='number'
                                value={config.take_profit || 10}
                                onChange={e =>
                                    smart_auto.updateConfig(botType, 'take_profit', parseFloat(e.target.value))
                                }
                            />
                        </div>
                        <div className='input-group'>
                            <label>Stop Loss ($)</label>
                            <input
                                type='number'
                                value={config.max_loss}
                                onChange={e => smart_auto.updateConfig(botType, 'max_loss', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className='input-group'>
                            <label>Multiplier</label>
                            <input
                                type='number'
                                value={config.multiplier}
                                onChange={e =>
                                    smart_auto.updateConfig(botType, 'multiplier', parseFloat(e.target.value))
                                }
                            />
                        </div>

                        {(botType === 'differs' || botType === 'matches' || botType === 'over_under') && (
                            <div className='input-group'>
                                <label>Prediction</label>
                                <input
                                    type='number'
                                    value={config.prediction}
                                    onChange={e =>
                                        smart_auto.updateConfig(botType, 'prediction', parseInt(e.target.value))
                                    }
                                />
                            </div>
                        )}
                        <div className='input-group'>
                            <label>Ticks</label>
                            <input
                                type='number'
                                value={config.ticks}
                                onChange={e => smart_auto.updateConfig(botType, 'ticks', parseInt(e.target.value))}
                            />
                        </div>
                        <div className='input-group'>
                            <label>Bulk Trades</label>
                            <input
                                type='number'
                                min='1'
                                max='10'
                                value={config.bulk_trades_count || 1}
                                onChange={e =>
                                    smart_auto.updateConfig(botType, 'bulk_trades_count', parseInt(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div className='toggles-grid'>
                        <button
                            className={`toggle-btn ${config.use_martingale ? 'active' : ''}`}
                            onClick={() => smart_auto.updateConfig(botType, 'use_martingale', !config.use_martingale)}
                        >
                            Martingale: {config.use_martingale ? 'ON' : 'OFF'}
                        </button>
                        <button
                            className={`toggle-btn ${config.use_max_loss ? 'active' : ''}`}
                            onClick={() => smart_auto.updateConfig(botType, 'use_max_loss', !config.use_max_loss)}
                        >
                            Stop Loss: {config.use_max_loss ? 'ON' : 'OFF'}
                        </button>
                        <button
                            className={`toggle-btn ${config.use_compounding ? 'active' : ''}`}
                            onClick={() => smart_auto.updateConfig(botType, 'use_compounding', !config.use_compounding)}
                        >
                            Compound: {config.use_compounding ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className='action-buttons'>
                        <button
                            className='action-btn run-once'
                            onClick={() => smart_auto.toggleBot(botType, 'manual')}
                            disabled={config.is_running && config.is_auto}
                        >
                            <LabelPairedPlayMdFillIcon /> TRADE ONCE
                        </button>
                        <button
                            className={`action-btn auto-run ${config.is_running && config.is_auto ? 'active' : ''}`}
                            onClick={() => smart_auto.toggleBot(botType, 'auto')}
                        >
                            {config.is_running && config.is_auto ? (
                                <LabelPairedSquareMdFillIcon />
                            ) : (
                                <LabelPairedArrowsRotateMdRegularIcon />
                            )}
                            {config.is_running && config.is_auto ? 'STOP AUTO' : 'START AUTO'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderLogContent = () => {
        switch (activeLogTab) {
            case 'summary': {
                const totalTrades = logs.length;
                const wins = logs.filter((l: LogEntry) => l.type === 'success').length;
                const losses = logs.filter((l: LogEntry) => l.type === 'error').length;
                const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';

                return (
                    <div className='summary-grid'>
                        <div className='summary-card'>
                            <span className='label'>Total Trades</span>
                            <span className='value'>{totalTrades}</span>
                        </div>
                        <div className='summary-card'>
                            <span className='label'>Wins</span>
                            <span className='value success'>{wins}</span>
                        </div>
                        <div className='summary-card'>
                            <span className='label'>Losses</span>
                            <span className='value error'>{losses}</span>
                        </div>
                        <div className='summary-card'>
                            <span className='label'>Win Rate</span>
                            <span className='value'>{winRate}%</span>
                        </div>
                        <div className='summary-card'>
                            <span className='label'>Session</span>
                            <span className={`value ${session_profit >= 0 ? 'success' : 'error'}`}>
                                ${session_profit.toFixed(2)}
                            </span>
                        </div>
                        <div className='summary-card'>
                            <span className='label'>Total</span>
                            <span className={`value ${total_profit >= 0 ? 'success' : 'error'}`}>
                                ${total_profit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                );
            }
            case 'transactions':
                return (
                    <div className='transaction-list'>
                        {logs.filter((l: LogEntry) => l.type === 'trade' || l.type === 'success' || l.type === 'error')
                            .length === 0 ? (
                            <div className='empty'>No transactions yet...</div>
                        ) : (
                            logs
                                .filter(
                                    (l: LogEntry) => l.type === 'trade' || l.type === 'success' || l.type === 'error'
                                )
                                .map((log: LogEntry, i: number) => (
                                    <div key={i} className={`transaction-item ${log.type}`}>
                                        <span className='time'>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <span className='message'>{log.message}</span>
                                    </div>
                                ))
                        )}
                    </div>
                );
            case 'journal':
                return (
                    <div className='journal-content'>
                        {logs.length === 0 ? (
                            <div className='empty'>No journal entries...</div>
                        ) : (
                            logs.map((log: LogEntry, i: number) => (
                                <div key={i} className={`log-entry ${log.type}`}>
                                    <span className='time'>
                                        [
                                        {new Date(log.timestamp).toLocaleTimeString([], {
                                            hour12: false,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                        ]
                                    </span>
                                    <span className='message'>{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                );
        }
    };

    return (
        <div className='trading-engine-container'>
            <div className='engine-tabs'>
                <button className={activeTab === 'even_odd' ? 'active' : ''} onClick={() => setActiveTab('even_odd')}>
                    EVEN/ODD
                </button>
                <button className={activeTab === 'differs' ? 'active' : ''} onClick={() => setActiveTab('differs')}>
                    DIFFERS
                </button>
                <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>
                    MATCHES
                </button>
                <button
                    className={activeTab === 'over_under' ? 'active' : ''}
                    onClick={() => setActiveTab('over_under')}
                >
                    OVER/UNDER
                </button>
                <button className={activeTab === 'rise_fall' ? 'active' : ''} onClick={() => setActiveTab('rise_fall')}>
                    RISE/FALL
                </button>
                <button
                    className={activeTab === 'smart_auto_24' ? 'active' : ''}
                    onClick={() => setActiveTab('smart_auto_24')}
                >
                    SMART 24H
                </button>
            </div>

            <div className='engine-content'>
                {renderBotControls(activeTab)}

                <div className='trading-log-section'>
                    <div className='log-header'>
                        <h3>📑 Trading Activity</h3>
                        <div className='log-tabs'>
                            <button
                                className={activeLogTab === 'summary' ? 'active' : ''}
                                onClick={() => setActiveLogTab('summary')}
                            >
                                <LabelPairedChartLineMdRegularIcon /> Summary
                            </button>
                            <button
                                className={activeLogTab === 'transactions' ? 'active' : ''}
                                onClick={() => setActiveLogTab('transactions')}
                            >
                                <LabelPairedArrowsRotateMdRegularIcon /> Transactions
                            </button>
                            <button
                                className={activeLogTab === 'journal' ? 'active' : ''}
                                onClick={() => setActiveLogTab('journal')}
                            >
                                <LabelPairedCircleInfoMdRegularIcon /> Journal
                            </button>
                        </div>
                        <button className='clear-log' onClick={() => smart_auto.clearLogs()}>
                            Clear
                        </button>
                    </div>
                    <div className='log-content' ref={logRef}>
                        {renderLogContent()}
                    </div>
                </div>
            </div>

            <div className='engine-footer'>
                <div className='status-badge'>
                    <span className={`indicator ${is_executing ? 'executing' : ''}`} />
                    STATUS: {bot_status} {is_executing ? '(EXECUTING)' : ''}
                </div>
                <div className='profit-stats'>
                    <div className='stat'>
                        SESSION:{' '}
                        <span className={session_profit >= 0 ? 'won' : 'lost'}>
                            {session_profit >= 0 ? '+' : '-'}${Math.abs(session_profit).toFixed(2)}
                        </span>
                    </div>
                    <div className='stat'>
                        TOTAL:{' '}
                        <span className={total_profit >= 0 ? 'won' : 'lost'}>
                            {total_profit >= 0 ? '+' : '-'}${Math.abs(total_profit).toFixed(2)}
                        </span>
                    </div>
                </div>
                <button
                    className='reset-btn'
                    onClick={() => {
                        runInAction(() => {
                            smart_auto.session_profit = 0;
                            smart_auto.total_profit = 0;
                            smart_auto.last_result = null;
                            smart_auto.current_streak = 0;
                            smart_auto.clearLogs();
                        });
                    }}
                >
                    <LabelPairedArrowsRotateMdRegularIcon />
                    RESET
                </button>
            </div>
        </div>
    );
});

export default TradingEngine;
