import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedChartAreaCaptionRegularIcon,
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedCircleInfoCaptionRegularIcon,
    LabelPairedComputerCaptionRegularIcon,
    LabelPairedCopyCaptionRegularIcon,
    LabelPairedGearCaptionRegularIcon,
    LabelPairedGridCaptionRegularIcon,
    LabelPairedLightbulbCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';

const TabsControl = observer(() => {
    const { admin } = useStore();

    const tabsToControl = [
        { key: 'dashboard', label: 'Dashboard Main', group: 'Core', icon: LabelPairedChartAreaCaptionRegularIcon },
        { key: 'bot_builder', label: 'Bot Builder', group: 'Core', icon: LabelPairedGridCaptionRegularIcon },
        { key: 'charts', label: 'Trading Charts', group: 'Trading', icon: LabelPairedChartLineCaptionRegularIcon },
        { key: 'analysis_tool', label: 'Analysis Tool', group: 'Analysis', icon: LabelPairedLightbulbCaptionRegularIcon },
        { key: 'trading_tools', label: 'Trading Tools', group: 'Trading', icon: LabelPairedComputerCaptionRegularIcon },
        { key: 'copy_trading', label: 'Copy Trading', group: 'Social', icon: LabelPairedCopyCaptionRegularIcon },
        { key: 'strategies', label: 'Strategy Hub', group: 'Content', icon: LabelPairedGridCaptionRegularIcon },
        { key: 'settings', label: 'User Settings', group: 'System', icon: LabelPairedGearCaptionRegularIcon },
        { key: 'tutorials', label: 'Video Tutorials', group: 'System', icon: LabelPairedCircleInfoCaptionRegularIcon },
    ] as const;

    const handleToggle = (key: keyof typeof admin.visible_tabs) => {
        admin.toggleTabVisibility(key);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-[#0b0f19] min-h-screen p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-6">
                <div className="relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-brand-blue rounded-full shadow-glow-blue"></div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-2">
                        MODULE <span className="text-brand-blue">POLICIES</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald animate-pulse"></span>
                        Active Component Permission Matrix
                    </p>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-[2rem] p-6 flex items-center gap-5 shadow-2xl backdrop-blur-xl group hover:border-emerald-500/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-glow-emerald/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Grid Sync Status</p>
                        <p className="text-emerald-400 font-mono text-xs font-black uppercase tracking-widest italic group-hover:text-white transition-colors">INSTANT E-SYNC ACTIVE</p>
                    </div>
                </div>
            </div>

            {/* Grid of Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {tabsToControl.map((tab) => (
                    <div key={tab.key} className="glass-card p-10 rounded-[3rem] group hover:scale-[1.02] hover:border-white/10 transition-all duration-500 relative overflow-hidden border border-white/5 shadow-2xl flex flex-col justify-between min-h-[300px]">
                        <div className={classNames(
                            "absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700",
                            admin.visible_tabs[tab.key] ? "bg-brand-blue" : "bg-rose-500"
                        )}></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className={classNames(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                        admin.visible_tabs[tab.key] ? "bg-brand-blue/10 border-brand-blue/20 text-brand-blue shadow-glow-blue/10" : "bg-white/5 border-white/10 text-slate-600"
                                    )}>
                                        <tab.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic">
                                        {tab.group}_CLUSTER
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={() => handleToggle(tab.key)}
                                    className={classNames(
                                        "w-14 h-7 rounded-full relative cursor-pointer transition-all duration-500 border p-1",
                                        admin.visible_tabs[tab.key] ? "bg-brand-blue border-brand-blue/50 shadow-glow-blue" : "bg-[#161b22] border-white/5"
                                    )}
                                >
                                    <div className={classNames(
                                        "w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500 ease-out",
                                        admin.visible_tabs[tab.key] ? "translate-x-7" : "translate-x-0"
                                    )}></div>
                                </button>
                            </div>

                            <h4 className="text-2xl font-black text-white mb-2 italic tracking-tighter leading-none">{tab.label.toUpperCase()}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60 italic mb-8">Propagation: User Navigation Layer</p>
                        </div>
                        
                        <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={classNames(
                                    "w-2 h-2 rounded-full",
                                    admin.visible_tabs[tab.key] ? "bg-emerald-500 shadow-glow-emerald animate-pulse" : "bg-rose-500 shadow-glow-rose"
                                )}></span>
                                <span className={classNames(
                                    "text-[10px] font-black uppercase tracking-[0.3em] font-mono italic",
                                    admin.visible_tabs[tab.key] ? "text-emerald-400" : "text-rose-400"
                                )}>
                                    {admin.visible_tabs[tab.key] ? 'OPERATIONAL' : 'DECOMMISSIONED'}
                                </span>
                            </div>
                            <button className="text-[9px] font-black text-slate-600 hover:text-white transition-all underline underline-offset-8 uppercase tracking-[0.2em] italic font-mono decoration-slate-800">
                                PERMISSION_HEX
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Warning Section Overhaul */}
            <div className="glass-card p-12 rounded-[4rem] border border-rose-500/10 bg-rose-500/[0.02] relative overflow-hidden group mt-16 shadow-2xl">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-500/5 blur-[120px] pointer-events-none opacity-40"></div>
                
                <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-4xl shadow-glow-rose/10 group-hover:scale-110 transition-transform duration-700">
                        <span className="drop-shadow-glow-rose">⚡</span>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center gap-4 mb-4 justify-center lg:justify-start">
                            <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Security Directive</h4>
                            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-black tracking-widest border border-rose-500/20 uppercase font-mono italic">Critical Advisory</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-bold uppercase tracking-wide italic opacity-70 max-w-3xl">
                            Alteration of core kernel modules like <strong className="text-white">DASHBOARD_MAIN</strong> or <strong className="text-white">BOT_ENGINE</strong> may result in immediate termination of active user pipelines. 
                            Entities presently bound to decommissioned modules will undergo emergency vector redirection to the nearest operational cluster.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black transition-all border border-white/5 uppercase tracking-[0.4em] font-mono italic">
                                RESET_GLOBAL_MATRIX
                            </button>
                            <button className="px-10 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black transition-all border border-rose-500/20 uppercase tracking-[0.4em] font-mono shadow-glow-rose/5 italic">
                                VIEW_OVERRIDE_LOGS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TabsControl;
