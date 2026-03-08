import React, { useMemo } from 'react';
import { Localize } from '@deriv-com/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { STRATEGY_STATS } from '../mock-data';
import classNames from 'classnames';

interface StrategyTabProps {
    accountId: string;
}

const StrategyTab: React.FC<StrategyTabProps> = ({ accountId }) => {
    // Data for Strategy Mix (Pie Chart)
    const mixData = useMemo(() => {
        return STRATEGY_STATS.map(s => ({
            name: s.strategy,
            value: s.trades,
            color: s.net_profit >= 0 ? '#3b82f6' : '#a855f7' // Blue if profit, Purple if loss
        })).sort((a, b) => b.value - a.value);
    }, []);

    // Data for Net Profit vs Strategy (Bar Chart)
    const profitData = useMemo(() => {
        return STRATEGY_STATS.map(s => ({
            name: s.strategy,
            profit: s.net_profit,
            color: s.net_profit >= 0 ? '#10b981' : '#ef4444'
        }));
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strategy Mix Card */}
                <div className="glass-card p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-2"><Localize i18n_default_text="Strategy Mix" /></h3>
                    <p className="text-slate-500 text-sm mb-8"><Localize i18n_default_text="Trade volume distribution by contract type." /></p>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mixData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {mixData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#a855f7' : index === 2 ? '#06b6d4' : '#6366f1'} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        {mixData.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: idx === 0 ? '#3b82f6' : idx === 1 ? '#a855f7' : idx === 2 ? '#06b6d4' : '#6366f1' }}></div>
                                <span className="text-xs font-medium text-slate-300">{entry.name}</span>
                                <span className="text-xs font-bold text-white ml-auto">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profit/Loss Comparison Card */}
                <div className="glass-card p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-2"><Localize i18n_default_text="Profit/Loss Comparison" /></h3>
                    <p className="text-slate-500 text-sm mb-8"><Localize i18n_default_text="Net profitability per contract strategy." /></p>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                    {profitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Strategy Table */}
            <div className="glass-card rounded-3xl overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white"><Localize i18n_default_text="Strategy Performance Breakdown" /></h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><Localize i18n_default_text="Strategy Name" /></th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Total Trades" /></th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Wins" /></th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Losses" /></th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Win Rate" /></th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Net Profit" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {STRATEGY_STATS.map((stat, idx) => {
                                const winRate = (stat.wins / stat.trades) * 100;
                                return (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-4 font-bold text-white">{stat.strategy}</td>
                                        <td className="px-8 py-4 text-right text-slate-300 font-mono">{stat.trades}</td>
                                        <td className="px-8 py-4 text-right text-emerald-400 font-mono">{stat.wins}</td>
                                        <td className="px-8 py-4 text-right text-red-400 font-mono">{stat.losses}</td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-white mb-1">{Math.round(winRate)}%</span>
                                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-brand-blue" style={{ width: `${winRate}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={classNames(
                                            "px-8 py-4 text-right font-bold",
                                            stat.net_profit >= 0 ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {stat.net_profit >= 0 ? '+' : ''}${Math.abs(stat.net_profit).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StrategyTab;
