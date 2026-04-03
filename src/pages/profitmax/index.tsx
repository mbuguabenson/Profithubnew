import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { Localize } from '@deriv-com/translations';
import MarketSelector from '@/components/market-selector/market-selector';
import { TAnalysisHistory, TDigitStat } from '@/stores/analysis-store';
import { TProfitmaxLog } from '@/lib/profitmax-trade-engine';
import './profitmax.scss';

const Profitmax = observer(() => {
    const { profitmax, client, common, ui } = useStore();
    const {
        digit_stats,
        last_digit,
        percentages,
        even_odd_history,
        current_price,
        highest_digit,
        lowest_digit,
        second_highest_digit,
        recommended_market,
        trade_engine,
        total_ticks,
        setSampleTicks,
    } = profitmax;

    const { balance, currency } = client;
    const { latency, is_socket_opened } = common;
    const { is_dark_mode_on } = ui;

    const { config, is_executing, session_profit, logs, trade_status } = trade_engine;

    const wins = logs.filter((l: TProfitmaxLog) => l.type === 'success').length;
    const losses = logs.filter((l: TProfitmaxLog) => l.type === 'error').length;
    const total_trades = wins + losses;

    return (
        <div className={`profitmax ${is_dark_mode_on ? 'profitmax--dark' : 'profitmax--light'}`}>
            {/* Market Selector */}
            <div className='profitmax__market-bar'>
                <MarketSelector />
            </div>

            {/* Header Vitals */}
            <div className='profitmax__header'>
                <div className='profitmax__title'>
                    <span className='profitmax__logo'>🚀</span>
                    <Localize i18n_default_text='Profitmax Engine' />
                </div>
                <div className='profitmax__vitals'>
                    <div className='vital'>
                        <span className='vital__label'>PRICE</span>
                        <span className='vital__value'>{current_price}</span>
                    </div>
                    <div className='vital'>
                        <span className='vital__label'>DIGIT</span>
                        <span className='vital__value vital__value--digit'>{last_digit ?? '-'}</span>
                    </div>
                    <div className='vital'>
                        <span className='vital__label'>BALANCE</span>
                        <span className='vital__value vital__value--balance'>
                            {balance} {currency}
                        </span>
                    </div>
                    <div className='vital'>
                        <span className='vital__label'>PING</span>
                        <span className='vital__value'>{latency}ms</span>
                    </div>
                    <div className='vital'>
                        <span className='vital__label'>STATUS</span>
                        <span className={`vital__status ${is_socket_opened ? 'online' : 'offline'}`}>
                            {is_socket_opened ? 'Connected' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            <div className='profitmax__content'>
                {/* Diagnostics Panel */}
                <div className='profitmax__panel diagnostics-panel'>
                    <div className='panel__header'>
                        <Localize i18n_default_text='Live Diagnostics' />
                        <div className='sample-selector'>
                            {[50, 100, 200].map(n => (
                                <button
                                    key={n}
                                    className={total_ticks === n ? 'active' : ''}
                                    onClick={() => setSampleTicks(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='diagnostics-grid'>
                        <div className='diag-card'>
                            <span className='diag-label'>Highest Digit</span>
                            <span className='diag-value green'>{highest_digit ?? '-'}</span>
                        </div>
                        <div className='diag-card'>
                            <span className='diag-label'>2nd Highest</span>
                            <span className='diag-value blue'>{second_highest_digit ?? '-'}</span>
                        </div>
                        <div className='diag-card'>
                            <span className='diag-label'>Lowest Digit</span>
                            <span className='diag-value red'>{lowest_digit ?? '-'}</span>
                        </div>
                        <div className='diag-card'>
                            <span className='diag-label'>Recommendation</span>
                            <span className='diag-value gold'>
                                {recommended_market.label} ({recommended_market.pct.toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Power Bars */}
                <div className='profitmax__panel power-panel'>
                    <div className='panel__header'>
                        <Localize i18n_default_text='Even/Odd Power' />
                    </div>
                    <div className='power-bars'>
                        <div className='power-bar'>
                            <span className='power-label'>EVEN</span>
                            <div className='bar-track'>
                                <div className='bar-fill green' style={{ width: `${percentages.even}%` }} />
                            </div>
                            <span className='power-pct'>{percentages.even.toFixed(1)}%</span>
                        </div>
                        <div className='power-bar'>
                            <span className='power-label'>ODD</span>
                            <div className='bar-track'>
                                <div className='bar-fill red' style={{ width: `${percentages.odd}%` }} />
                            </div>
                            <span className='power-pct'>{percentages.odd.toFixed(1)}%</span>
                        </div>
                        <div className='power-bar'>
                            <span className='power-label'>OVER</span>
                            <div className='bar-track'>
                                <div className='bar-fill blue' style={{ width: `${percentages.over}%` }} />
                            </div>
                            <span className='power-pct'>{percentages.over.toFixed(1)}%</span>
                        </div>
                        <div className='power-bar'>
                            <span className='power-label'>UNDER</span>
                            <div className='bar-track'>
                                <div className='bar-fill orange' style={{ width: `${percentages.under}%` }} />
                            </div>
                            <span className='power-pct'>{percentages.under.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                {/* Digit Ribbon */}
                <div className='profitmax__panel ribbon-panel'>
                    <div className='panel__header'>
                        <Localize i18n_default_text='Digit Pattern Ribbon' />
                    </div>
                    <div className='digit-ribbon'>
                        {digit_stats.map((stat: TDigitStat) => {
                            const isCurrent = stat.digit === last_digit;
                            return (
                                <div
                                    key={stat.digit}
                                    className={`ribbon-digit ${isCurrent ? 'is-current' : ''}`}
                                    data-rank={stat.rank}
                                >
                                    <div className='ribbon-digit__number'>{stat.digit}</div>
                                    <div className='ribbon-digit__pct'>{stat.percentage.toFixed(1)}%</div>
                                    <div className='ribbon-digit__count'>n={stat.count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Even/Odd History */}
                <div className='profitmax__panel history-panel'>
                    <div className='panel__header'>
                        <Localize i18n_default_text='Recent Pattern' />
                    </div>
                    <div className='pattern-history'>
                        {even_odd_history.slice(0, 30).map((h: TAnalysisHistory, i: number) => (
                            <div key={i} className={`pattern-dot ${h.type === 'E' ? 'even' : 'odd'}`}>
                                {h.type}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trade Engine Status */}
                <div className='profitmax__panel engine-panel'>
                    <div className='panel__header'>
                        <Localize i18n_default_text='Engine Status' />
                        <div className={`engine-indicator ${config.is_running ? 'active' : ''}`}>
                            {config.is_running ? '● RUNNING' : '○ IDLE'}
                        </div>
                    </div>
                    <div className='engine-stats'>
                        <div className='engine-stat'>
                            <span className='label'>Session P/L</span>
                            <span className={`value ${session_profit >= 0 ? 'green' : 'red'}`}>
                                {session_profit >= 0 ? '+' : ''}${session_profit.toFixed(2)}
                            </span>
                        </div>
                        <div className='engine-stat'>
                            <span className='label'>Total Trades</span>
                            <span className='value'>{total_trades}</span>
                        </div>
                        <div className='engine-stat'>
                            <span className='label'>Wins</span>
                            <span className='value green'>{wins}</span>
                        </div>
                        <div className='engine-stat'>
                            <span className='label'>Losses</span>
                            <span className='value red'>{losses}</span>
                        </div>
                    </div>
                    <div className='engine-status-bar'>
                        <span className={`status-dot ${is_executing ? 'active' : ''}`} />
                        <span className='status-text'>{trade_status}</span>
                    </div>

                    {/* Start/Stop Button */}
                    <button
                        className={`engine-toggle-btn ${config.is_running ? 'running' : ''}`}
                        onClick={() => trade_engine.toggleStart()}
                    >
                        {config.is_running ? '⏹ Stop Engine' : '▶ Start Engine'}
                    </button>

                    {/* Journal */}
                    <div className='engine-journal'>
                        {logs.length === 0 ? (
                            <div className='journal-empty'>No activity yet...</div>
                        ) : (
                            logs.slice(0, 20).map((log: TProfitmaxLog, i: number) => (
                                <div key={i} className={`journal-entry ${log.type}`}>
                                    <span className='journal-time'>
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className='journal-msg'>{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Profitmax;
