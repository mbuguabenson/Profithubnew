import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedArrowDownCaptionRegularIcon,
    LabelPairedArrowUpCaptionRegularIcon,
    LabelPairedChartAreaCaptionRegularIcon,
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedMoneyBillCaptionRegularIcon,
    LabelPairedUserCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        return (
            <div className='glass-card p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-[#0b0f19]/90'>
                <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 font-mono border-b border-white/5 pb-2'>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className='flex items-center justify-between gap-6 py-1'>
                        <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: entry.color }}></div>
                            <p className='text-slate-300 text-[10px] font-bold uppercase tracking-wider'>
                                {entry.name}
                            </p>
                        </div>
                        <p className='text-white text-xs font-black font-mono'>
                            {typeof entry.value === 'number' ? `$${entry.value.toLocaleString()}` : entry.value}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface KPICardProps {
    title: string;
    value: string | number;
    trend: 'up' | 'down';
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    percentage: string | number;
    detail: string;
}

const KPICard = ({ title, value, trend, icon: Icon, color, percentage, detail }: KPICardProps) => (
    <div className='glass-card p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 border border-white/5 hover:border-white/10 shadow-2xl'>
        <div
            className={classNames(
                'absolute -top-24 -right-24 w-48 h-48 blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-700',
                `bg-${color}-500`
            )}
        ></div>

        <div className='flex justify-between items-start mb-6 relative z-10'>
            <div
                className={classNames(
                    'w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg',
                    `bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-500 shadow-glow-${color}/20`
                )}
            >
                <Icon className='w-7 h-7' />
            </div>
            <div
                className={classNames(
                    'px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1',
                    trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                )}
            >
                {trend === 'up' ? (
                    <LabelPairedArrowUpCaptionRegularIcon className='w-3 h-3' />
                ) : (
                    <LabelPairedArrowDownCaptionRegularIcon className='w-3 h-3' />
                )}
                {percentage}%
            </div>
        </div>

        <div className='relative z-10'>
            <p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic'>{title}</p>
            <h3 className='text-4xl font-black text-white tracking-tighter italic leading-none mb-1'>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            <p className='text-slate-400 text-[10px] font-bold opacity-60'>{detail}</p>
        </div>

        {/* Decorative mini graph placeholder */}
        <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent'></div>
    </div>
);

const AdminDashboard = observer(() => {
    const { admin } = useStore();

    const chartData = [
        { name: 'Jan', profit: 45000, loss: 24000, volume: 120000 },
        { name: 'Feb', profit: 52000, loss: 13980, volume: 150000 },
        { name: 'Mar', profit: 48000, loss: 19800, volume: 135000 },
        { name: 'Apr', profit: 61000, loss: 30908, volume: 180000 },
        { name: 'May', profit: 55000, loss: 24800, volume: 165000 },
        { name: 'Jun', profit: 67000, volume: 210000 },
    ];

    return (
        <div className='p-10 space-y-10 bg-[#0b0f19] min-h-screen text-slate-300 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4'>
                <div className='relative'>
                    <div className='absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-brand-blue rounded-full shadow-glow-blue'></div>
                    <div className='flex items-baseline gap-4'>
                        <h1 className='text-6xl font-black text-white tracking-tighter italic leading-none mb-2'>
                            CORE <span className='text-brand-blue'>ANALYTICS</span>
                        </h1>
                        <span className='text-slate-700 font-mono text-xl font-black italic tracking-tighter opacity-50 select-none'>
                            v4.0.2
                        </span>
                    </div>
                    <p className='text-slate-500 text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald animate-pulse'></span>
                        Commercial Node 04 • Real-time Data Propagation Active
                    </p>
                </div>
                <div className='flex items-center gap-4'>
                    <button className='px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3 group'>
                        <LabelPairedChartAreaCaptionRegularIcon className='w-4 h-4 text-slate-500 group-hover:text-white' />{' '}
                        EXPORT SYSTEM LEDGER
                    </button>
                    <button className='px-10 py-4 bg-gradient-to-r from-brand-blue to-cyan-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-glow-blue hover:scale-105 active:scale-95 transition-all'>
                        SYNC NODES
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                <KPICard
                    title='Total Liquidity'
                    value={admin.total_deposits}
                    trend='up'
                    percentage='12.5'
                    icon={LabelPairedMoneyBillCaptionRegularIcon}
                    color='blue'
                    detail='+2.1% Higher than last month'
                />
                <KPICard
                    title='Active Kernels'
                    value={admin.active_users}
                    trend='up'
                    percentage='8.2'
                    icon={LabelPairedUserCaptionRegularIcon}
                    color='cyan'
                    detail='5 new nodes authorized today'
                />
                <KPICard
                    title='Net Yield'
                    value={admin.platform_net_profit.toFixed(2)}
                    trend='down'
                    percentage='3.4'
                    icon={LabelPairedChartLineCaptionRegularIcon}
                    color='emerald'
                    detail='Yield delta normalization active'
                />
                <KPICard
                    title='Gross Volume'
                    value={(admin.total_volume / 1000000).toFixed(2) + 'M'}
                    trend='up'
                    percentage='24.1'
                    icon={LabelPairedActivityCaptionRegularIcon}
                    color='purple'
                    detail='Processing 1.2k req/sec'
                />
            </div>

            {/* Main Content Area */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Net Performance Chart */}
                <div className='lg:col-span-2 glass-card p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden flex flex-col min-h-[550px]'>
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] -mr-64 -mt-64 pointer-events-none'></div>

                    <div className='flex justify-between items-start mb-12 relative z-10'>
                        <div>
                            <h3 className='text-4xl font-black text-white italic tracking-tighter leading-none mb-3'>
                                SYSTEM PERFORMANCE
                            </h3>
                            <p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic'>
                                Profit-Loss Velocity & Scaling Vectors
                            </p>
                        </div>
                        <div className='flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5'>
                            {['Daily', 'Weekly', 'Monthly'].map(period => (
                                <button
                                    key={period}
                                    className={classNames(
                                        'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                        period === 'Monthly'
                                            ? 'bg-brand-blue text-white shadow-glow-blue'
                                            : 'bg-transparent text-slate-500 hover:text-white'
                                    )}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='flex-1 w-full relative z-10'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.4} />
                                        <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray='12 12'
                                    stroke='rgba(255,255,255,0.02)'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='name'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    dy={20}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={value => `$${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type='monotone'
                                    dataKey='profit'
                                    stroke='#3b82f6'
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill='url(#colorProfit)'
                                    animationDuration={2500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Distribution - Paycent Style Radial */}
                <div className='glass-card p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-between group'>
                    <div className='absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/5 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity'></div>

                    <div>
                        <h3 className='text-3xl font-black text-white italic tracking-tighter leading-none mb-3 uppercase'>
                            Node Distribution
                        </h3>
                        <p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic mb-10'>
                            Recursive segmental node allocation
                        </p>
                    </div>

                    <div className='h-72 mb-10 relative'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={admin.market_distribution}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={10}
                                    dataKey='value'
                                    stroke='none'
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {admin.market_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                            <span className='text-4xl font-black text-white italic leading-none'>100%</span>
                            <span className='text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1'>
                                Total Nodes
                            </span>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        {admin.market_distribution.map((item, idx) => (
                            <div
                                key={idx}
                                className='flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group border-l-4'
                                style={{ borderLeftColor: item.color }}
                            >
                                <div className='flex items-center gap-4'>
                                    <div
                                        className='w-2.5 h-2.5 rounded-full shadow-lg'
                                        style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}80` }}
                                    ></div>
                                    <span className='text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors'>
                                        {item.name}
                                    </span>
                                </div>
                                <span className='text-white text-lg font-black italic'>{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Transactions & Status */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10'>
                {/* Recent Transactions Table */}
                <div className='lg:col-span-2 glass-card p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden'>
                    <div className='flex justify-between items-center mb-12'>
                        <div>
                            <h3 className='text-4xl font-black text-white italic tracking-tighter leading-none mb-3 uppercase'>
                                Recent Ledger
                            </h3>
                            <p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic'>
                                Historical sequence of core cluster actions
                            </p>
                        </div>
                        <button className='px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue hover:text-cyan-400 transition-all italic underline underline-offset-8'>
                            Open Archive
                        </button>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead>
                                <tr className='border-b border-white/5'>
                                    <th className='pb-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic'>
                                        Core Entity
                                    </th>
                                    <th className='pb-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic'>
                                        Volume Pulse
                                    </th>
                                    <th className='pb-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic'>
                                        Temporal Stamp
                                    </th>
                                    <th className='pb-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic'>
                                        Status Node
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {admin.recent_transactions.map(tx => (
                                    <tr key={tx.id} className='group hover:bg-white/[0.03] transition-all'>
                                        <td className='py-7'>
                                            <div className='flex items-center gap-5'>
                                                <div className='w-12 h-12 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500 p-0.5 bg-gradient-to-br from-brand-blue/20 to-transparent'>
                                                    <img
                                                        src={tx.avatar}
                                                        alt=''
                                                        className='w-full h-full object-cover rounded-[0.8rem]'
                                                    />
                                                </div>
                                                <div>
                                                    <p className='text-white text-base font-black italic tracking-tighter mb-0.5'>
                                                        {tx.user}
                                                    </p>
                                                    <p className='text-slate-600 text-[10px] font-bold font-mono tracking-wider'>
                                                        {tx.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-7'>
                                            <p className='text-white text-base font-black font-mono tracking-tighter mb-0.5'>
                                                ${tx.amount.toLocaleString()}
                                            </p>
                                            <p className='text-slate-600 text-[9px] font-black uppercase tracking-[0.2em]'>
                                                {tx.type}
                                            </p>
                                        </td>
                                        <td className='py-7'>
                                            <p className='text-slate-400 text-[11px] font-black font-mono italic tracking-tight'>
                                                {tx.date}
                                            </p>
                                            <p className='text-slate-700 text-[8px] font-black uppercase tracking-[0.1em]'>
                                                Ledger UID: {tx.id.padStart(6, 'X')}
                                            </p>
                                        </td>
                                        <td className='py-7'>
                                            <div
                                                className={classNames(
                                                    'px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center w-fit gap-3 shadow-2xl border transition-all duration-300',
                                                    tx.status === 'Success'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10 shadow-glow-emerald/5'
                                                        : tx.status === 'Pending'
                                                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/10 shadow-glow-orange/5'
                                                          : 'bg-rose-500/10 text-rose-400 border-rose-500/10 shadow-glow-rose/5'
                                                )}
                                            >
                                                <span
                                                    className={classNames(
                                                        'w-2 h-2 rounded-full',
                                                        tx.status === 'Success'
                                                            ? 'bg-emerald-500 shadow-glow-emerald'
                                                            : tx.status === 'Pending'
                                                              ? 'bg-orange-500 shadow-glow-orange'
                                                              : 'bg-rose-500 shadow-glow-rose'
                                                    )}
                                                ></span>
                                                {tx.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity / Operational Status Overhaul */}
                <div className='glass-card p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden flex flex-col min-h-[550px] group'>
                    <div className='absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -mr-32 -mt-32 opacity-20 group-hover:opacity-40 transition-opacity'></div>

                    <h3 className='text-3xl font-black text-white italic tracking-tighter leading-none mb-3 uppercase'>
                        Telemetary Node
                    </h3>
                    <p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic mb-12'>
                        Global kernel health matrix analytics
                    </p>

                    <div className='space-y-8 flex-1'>
                        {[
                            {
                                label: 'Latency',
                                value: `${admin.latency.toFixed(0)}ms`,
                                status: admin.latency < 50 ? 'Optimal' : 'Active',
                                color: admin.latency < 50 ? 'emerald' : 'blue',
                            },
                            {
                                label: 'CPU Load',
                                value: `${admin.cpu_load.toFixed(1)}%`,
                                status: admin.cpu_load < 70 ? 'Stable' : 'High',
                                color: admin.cpu_load < 70 ? 'emerald' : 'orange',
                            },
                            {
                                label: 'Memory',
                                value: `${admin.memory_usage.toFixed(1)}GB`,
                                status: 'Healthy',
                                color: 'blue',
                            },
                            {
                                label: 'Sync Status',
                                value: `${admin.sync_status}%`,
                                status: 'Active',
                                color: 'emerald',
                            },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className='bg-white/2 border border-white/5 rounded-[2.5rem] p-7 group/stat hover:scale-[1.03] transition-all duration-500 hover:border-white/10 shadow-xl'
                            >
                                <div className='flex justify-between items-center mb-6'>
                                    <p className='text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none'>
                                        {stat.label}
                                    </p>
                                    <span
                                        className={classNames(
                                            'text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border',
                                            `bg-${stat.color}-500/10 text-${stat.color}-400 border-${stat.color}-500/10 shadow-glow-${stat.color}/5`
                                        )}
                                    >
                                        {stat.status}
                                    </span>
                                </div>
                                <div className='flex items-end justify-between font-mono'>
                                    <p className='text-4xl font-black text-white italic tracking-tighter leading-none'>
                                        {stat.value}
                                    </p>
                                    <div className='w-28 h-10 flex items-end gap-1.5 opacity-30 group-hover/stat:opacity-60 transition-opacity'>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <div
                                                key={i}
                                                className={`flex-1 bg-${stat.color}-500 group-hover/stat:animate-pulse`}
                                                style={{ height: `${20 + Math.random() * 80}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className='mt-12 w-full py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 hover:text-white transition-all shadow-2xl group border-l-4 border-l-rose-500/30 overflow-hidden relative'>
                        <div className='absolute inset-0 bg-rose-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700'></div>
                        <span className='relative z-10'>
                            EMERGENCY{' '}
                            <span className='text-rose-500 group-hover:drop-shadow-glow-rose transition-all'>CORE</span>{' '}
                            REBOOT
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default AdminDashboard;
