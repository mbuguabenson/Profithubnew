import React, { useMemo,useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import {
    LabelPairedArrowDownCaptionRegularIcon,
    LabelPairedCirclePlusCaptionRegularIcon,
    LabelPairedCircleUserSlashCaptionRegularIcon,
    LabelPairedMagnifyingGlassPlusCaptionRegularIcon,
    LabelPairedMoneyBillCaptionRegularIcon,
    LabelPairedPenCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';

const UsersManagement = observer(() => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Simulated real users data
    const users = useMemo(() => [
        { id: 'CR1001', name: 'Mbugua Benson', email: 'benson@profithub.com', type: 'Real', balance: 15420.50, status: 'Active', joined: '2024-01-15', avatar: 'https://i.pravatar.cc/150?u=benson' },
        { id: 'CR1002', name: 'Sarah Jenkins', email: 'sarah@example.com', type: 'Real', balance: 5200.00, status: 'Active', joined: '2024-02-01', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        { id: 'VR2001', name: 'Alex Kumar', email: 'alex@demo.com', type: 'Demo', balance: 10000.00, status: 'Active', joined: '2024-02-10', avatar: 'https://i.pravatar.cc/150?u=alex' },
        { id: 'CR1003', name: 'Wilson Ng', email: 'wilson@corp.com', type: 'Real', balance: 450.75, status: 'Suspended', joined: '2023-11-20', avatar: 'https://i.pravatar.cc/150?u=wilson' },
        { id: 'CR1004', name: 'Elena Petrova', email: 'elena@trading.ru', type: 'Real', balance: 8900.20, status: 'Active', joined: '2024-02-25', avatar: 'https://i.pravatar.cc/150?u=elena' },
        { id: 'VR2002', name: 'David Smith', email: 'david@test.com', type: 'Demo', balance: 9500.00, status: 'Active', joined: '2024-03-01', avatar: 'https://i.pravatar.cc/150?u=david' },
    ], []);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === 'All' || u.type === filterType || u.status === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterType, users]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-[#0b0f19] min-h-screen p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
                <div className="relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-brand-blue rounded-full shadow-glow-blue"></div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-2">
                        KERNEL <span className="text-brand-blue">REGISTRY</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-glow-cyan animate-pulse"></span>
                        Authorized Entity Management v2.1.0
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3 group">
                        <LabelPairedCirclePlusCaptionRegularIcon className="w-4 h-4 text-slate-500 group-hover:text-white" /> PROVISION NEW NODE
                    </button>
                    <button className="px-10 py-4 bg-gradient-to-r from-brand-blue to-cyan-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-glow-blue hover:scale-105 active:scale-95 transition-all">
                        EXPORT LEDGER
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center relative z-10">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                        <div className="relative flex-1 max-w-2xl group/input">
                            <input
                                type="text"
                                placeholder="IDENTIFY ENTITY VIA NAME, URN OR CLUSTER ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 group-hover/input:border-white/20 focus:border-brand-blue/50 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-[0.2em] text-white placeholder:text-slate-600 outline-none transition-all font-mono"
                            />
                            <LabelPairedMagnifyingGlassPlusCaptionRegularIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover/input:text-brand-blue transition-colors" />
                        </div>
                        
                        <div className="relative min-w-[200px] group/select">
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full appearance-none bg-white/5 border border-white/10 group-hover/select:border-white/20 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] text-white outline-none transition-all font-mono uppercase"
                            >
                                <option value="All">All Classifications</option>
                                <option value="Real">Real Entities</option>
                                <option value="Demo">Simulation Clusters</option>
                                <option value="Active">Operational: Active</option>
                                <option value="Suspended">Operational: Suspended</option>
                            </select>
                            <LabelPairedArrowDownCaptionRegularIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table Ledger */}
            <div className="glass-card rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent"></div>
                
                <div className="overflow-x-auto p-1">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Entity ID</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Authentication Profile</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Classification</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic text-right">Liquidity Vector</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic text-center">Lifecycle Status</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Temporal Stamp</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic text-center">Node Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                    <td className="px-8 py-7">
                                        <p className="text-slate-400 text-xs font-black font-mono tracking-tighter italic">{user.id}</p>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500 p-0.5 bg-gradient-to-br from-brand-blue/20 to-transparent">
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-[0.8rem]" />
                                            </div>
                                            <div>
                                                <p className="text-white text-base font-black italic tracking-tighter mb-0.5 group-hover:text-brand-blue transition-colors">{user.name}</p>
                                                <p className="text-slate-600 text-[10px] font-black font-mono tracking-widest uppercase opacity-70">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className={classNames(
                                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic shadow-lg",
                                            user.type === 'Real' ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20 shadow-glow-blue/5" : "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-glow-purple/5"
                                        )}>
                                            {user.type === 'Real' ? 'CORE ASSET' : 'SIM CLUSTER'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <p className="text-white text-lg font-black font-mono tracking-tighter italic leading-none mb-1">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">USD Equivalent</p>
                                    </td>
                                    <td className="px-8 py-7 text-center">
                                        <div className={classNames(
                                            "inline-flex items-center gap-3 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] italic border shadow-xl transition-all",
                                            user.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10 shadow-glow-emerald/5" : "bg-rose-500/10 text-rose-400 border-rose-500/10 shadow-glow-rose/5"
                                        )}>
                                            <span className={classNames("w-2 h-2 rounded-full", user.status === 'Active' ? "bg-emerald-500 shadow-glow-emerald" : "bg-rose-500 shadow-glow-rose")}></span>
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <p className="text-slate-400 text-[11px] font-black font-mono italic tracking-tight">{user.joined}</p>
                                        <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.1em]">Registered Offset</p>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center justify-center gap-3">
                                            {[
                                                { icon: LabelPairedPenCaptionRegularIcon, color: 'blue', label: 'E-CR' },
                                                { icon: LabelPairedCircleUserSlashCaptionRegularIcon, color: 'rose', label: 'S-CR' },
                                                { icon: LabelPairedMoneyBillCaptionRegularIcon, color: 'emerald', label: 'F-CR' }
                                            ].map((action, i) => (
                                                <button key={i} className={classNames(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 group/btn",
                                                    `bg-white/5 border-white/5 hover:bg-${action.color}-500/10 hover:border-${action.color}-500/20 hover:text-${action.color}-400`
                                                )}>
                                                    <action.icon className="w-5 h-5 opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all font-black" />
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Empty State Overhaul */}
                {filteredUsers.length === 0 && (
                    <div className="p-32 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-blue/2 blur-[100px] pointer-events-none"></div>
                        <div className="relative z-10">
                            <LabelPairedMagnifyingGlassPlusCaptionRegularIcon className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-30 animate-pulse" />
                            <h3 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">No Entity Matches Detected</h3>
                            <p className="text-slate-600 text-xs font-mono font-bold uppercase tracking-[0.4em]">Adjust identity filters or cluster parameters</p>
                        </div>
                    </div>
                )}

                {/* Footer Ledgers */}
                <div className="px-12 py-8 bg-white/2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-blue shadow-glow-blue"></div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">
                                {filteredUsers.length} NODES IDENTIFIED
                            </p>
                        </div>
                        <div className="h-4 w-px bg-white/5"></div>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
                            Cluster Sector: 0x88FE2
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-3 rounded-2xl bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all border border-white/5 font-mono italic">
                            &lt; PREV_NODE
                        </button>
                        <button className="px-8 py-3 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all border border-white/10 font-mono shadow-2xl italic">
                            NEXT_NODE &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default UsersManagement;
