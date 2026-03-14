import React, { useMemo } from 'react';
import { Localize, localize } from '@deriv-com/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_TRADES } from '../mock-data';
import classNames from 'classnames';

interface PerformanceTabProps {
    accountId: string;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ accountId }) => {
    const stats = useMemo(() => {
        const total = MOCK_TRADES.length;
        const wins = MOCK_TRADES.filter(t => t.result === 'Win').length;
        const losses = total - wins;
        const winRate = total > 0 ? (wins / total) * 100 : 0;
        const totalProfit = MOCK_TRADES.reduce((sum, t) => sum + (t.profit > 0 ? t.profit : 0), 0);
        const totalLoss = MOCK_TRADES.reduce((sum, t) => sum + (t.profit < 0 ? Math.abs(t.profit) : 0), 0);

        return { total, wins, losses, winRate, totalProfit, totalLoss };
    }, []);

    const chartData = [
        { name: localize('Wins'), value: stats.wins, color: '#10b981' },
        { name: localize('Losses'), value: stats.losses, color: '#ef4444' },
    ];

    return (
        <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {/* Top Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='glass-card p-6 rounded-3xl group relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-8 -mt-8'></div>
                    <p className='text-slate-500 text-xs font-bold uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Total Wins' />
                    </p>
                    <h3 className='text-3xl font-bold text-emerald-400'>{stats.wins}</h3>
                </div>
                <div className='glass-card p-6 rounded-3xl group relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -mr-8 -mt-8'></div>
                    <p className='text-slate-500 text-xs font-bold uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Total Losses' />
                    </p>
                    <h3 className='text-3xl font-bold text-red-400'>{stats.losses}</h3>
                </div>
                <div className='glass-card p-6 rounded-3xl group relative overflow-hidden'>
                    <p className='text-slate-500 text-xs font-bold uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Net P/L' />
                    </p>
                    <h3
                        className={classNames(
                            'text-3xl font-bold',
                            stats.totalProfit - stats.totalLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}
                    >
                        USD{' '}
                        {(stats.totalProfit - stats.totalLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className='glass-card p-6 rounded-3xl group relative overflow-hidden'>
                    <p className='text-slate-500 text-xs font-bold uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Total Trades' />
                    </p>
                    <h3 className='text-3xl font-bold text-white'>{stats.total}</h3>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Win Rate Visualization */}
                <div className='lg:col-span-1 glass-card p-8 rounded-3xl flex flex-col items-center justify-center min-h-[400px]'>
                    <h3 className='text-lg font-bold text-white mb-8'>
                        <Localize i18n_default_text='Win Rate Breakdown' />
                    </h3>
                    <div className='relative w-full aspect-square'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey='value'
                                    stroke='none'
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                            <span className='text-4xl font-black text-white'>{Math.round(stats.winRate)}%</span>
                            <span className='text-slate-500 text-xs uppercase tracking-widest font-bold'>
                                <Localize i18n_default_text='Accuracy' />
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar Alternative View */}
                    <div className='w-full mt-8 space-y-4'>
                        <div className='flex justify-between items-end'>
                            <span className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                                <Localize i18n_default_text='Success Ratio' />
                            </span>
                            <span className='text-sm font-bold text-emerald-400'>{Math.round(stats.winRate)}%</span>
                        </div>
                        <div className='h-2 w-full bg-white/5 rounded-full overflow-hidden'>
                            <div
                                className='h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-glow-emerald transition-all duration-1000 ease-out'
                                style={{ width: `${stats.winRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Trading Journal */}
                <div className='lg:col-span-2 glass-card p-8 rounded-3xl'>
                    <div className='flex items-center justify-between mb-8'>
                        <h3 className='text-xl font-bold text-white'>
                            <Localize i18n_default_text='Trading Journal Feed' />
                        </h3>
                        <button className='text-brand-blue hover:text-brand-blue/80 text-sm font-semibold transition-colors'>
                            <Localize i18n_default_text='View All Logs' />
                        </button>
                    </div>

                    <div className='space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar'>
                        {MOCK_TRADES.map((trade, idx) => (
                            <div
                                key={idx}
                                className='glass-card-hover bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'
                            >
                                <div className='flex items-center gap-4'>
                                    <div
                                        className={classNames(
                                            'w-10 h-10 rounded-xl flex items-center justify-center',
                                            trade.result === 'Win'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/20 text-red-400'
                                        )}
                                    >
                                        {trade.result === 'Win' ? (
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-6 w-6'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-6 w-6'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className='text-sm font-bold text-white'>{trade.type}</p>
                                        <p className='text-xs text-slate-500'>{trade.date}</p>
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-x-8 gap-y-2'>
                                    <div>
                                        <p className='text-[10px] uppercase text-slate-500 font-bold tracking-widest'>
                                            <Localize i18n_default_text='Entry → Exit' />
                                        </p>
                                        <p className='text-xs font-mono text-slate-300'>
                                            {trade.entry} → {trade.exit}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-[10px] uppercase text-slate-500 font-bold tracking-widest'>
                                            <Localize i18n_default_text='Profit/Loss' />
                                        </p>
                                        <p
                                            className={classNames(
                                                'text-sm font-bold',
                                                trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                            )}
                                        >
                                            {trade.profit >= 0 ? '+' : ''}${Math.abs(trade.profit).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceTab;
