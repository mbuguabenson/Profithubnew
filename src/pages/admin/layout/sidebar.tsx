import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedBellCaptionRegularIcon,
    LabelPairedChartAreaCaptionRegularIcon,
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedCircleDotCaptionRegularIcon,
    LabelPairedCircleExclamationCaptionRegularIcon,
    LabelPairedEnvelopeCaptionRegularIcon,
    LabelPairedGearCaptionRegularIcon,
    LabelPairedGridCaptionRegularIcon,
    LabelPairedHouseBlankCaptionRegularIcon,
    LabelPairedMoneyBillCaptionRegularIcon,
    LabelPairedSlidersCaptionRegularIcon,
    LabelPairedUserCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';

const Sidebar = observer(() => {
    const { admin } = useStore();
    const { active_section, is_sidebar_open, setSection } = admin;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LabelPairedHouseBlankCaptionRegularIcon },
        { id: 'users', label: 'Users', icon: LabelPairedUserCaptionRegularIcon },
        { id: 'bots', label: 'Bots Manager', icon: LabelPairedGridCaptionRegularIcon },
        { id: 'strategies', label: 'Strategies', icon: LabelPairedSlidersCaptionRegularIcon },
        { id: 'analytics', label: 'Analytics', icon: LabelPairedChartLineCaptionRegularIcon },
        { id: 'transactions', label: 'Transactions', icon: LabelPairedMoneyCaptionRegularIcon },
        { id: 'messages', label: 'Messages', icon: LabelPairedEnvelopeCaptionRegularIcon },
        { id: 'notifications', label: 'Notifications', icon: LabelPairedBellCaptionRegularIcon },
        { id: 'site', label: 'Site Management', icon: LabelPairedSquareExclamationCaptionRegularIcon },
        { id: 'tabs', label: 'Tabs Control', icon: LabelPairedBoxCaptionRegularIcon },
        { id: 'live', label: 'Live Activity', icon: LabelPairedActivityCaptionRegularIcon },
        { id: 'logs', label: 'System Logs', icon: LabelPairedCircleDotCaptionRegularIcon },
        { id: 'settings', label: 'Settings', icon: LabelPairedGearCaptionRegularIcon },
    ];

    return (
        <aside
            className={classNames(
                'bg-[#0b0f19] border-r border-white/5 h-screen sticky top-0 transition-all duration-500 z-50 flex flex-col',
                is_sidebar_open ? 'w-[280px]' : 'w-20'
            )}
        >
            {/* Logo Section */}
            <div className='p-8 flex items-center gap-4'>
                <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-cyan-500 shadow-glow-blue flex items-center justify-center text-white font-black text-xl italic rotate-3'>
                    P
                </div>
                {is_sidebar_open && (
                    <div className='flex flex-col'>
                        <span className='font-black text-2xl bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent italic tracking-tighter leading-none'>
                            PROFIT
                        </span>
                        <span className='text-[10px] text-brand-blue font-black uppercase tracking-[0.3em] ml-0.5'>
                            HUB CORE
                        </span>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className='flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-2'>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        className={classNames(
                            'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative',
                            active_section === item.id
                                ? 'bg-gradient-to-r from-brand-blue/20 to-transparent text-white shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] border border-white/5'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        )}
                    >
                        <item.icon
                            className={classNames(
                                'w-6 h-6 transition-all duration-300',
                                active_section === item.id
                                    ? 'text-brand-blue drop-shadow-glow-blue scale-110'
                                    : 'group-hover:text-white'
                            )}
                        />

                        {is_sidebar_open && (
                            <span
                                className={classNames(
                                    'font-bold text-sm tracking-tight',
                                    active_section === item.id ? 'text-white' : ''
                                )}
                            >
                                {item.label}
                            </span>
                        )}

                        {active_section === item.id && (
                            <span className='absolute left-0 w-1.5 h-8 bg-brand-blue rounded-r-full shadow-glow-blue'></span>
                        )}

                        {/* Status Dots (Simulated) */}
                        {item.id === 'notifications' && (
                            <span className='absolute right-4 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-glow-orange animate-pulse'></span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {!is_sidebar_open && (
                            <div className='absolute left-full ml-4 px-4 py-2 bg-[#0b0f19] border border-white/10 text-white text-[10px] uppercase font-black tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[60] shadow-2xl translate-x-4 group-hover:translate-x-0'>
                                {item.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section - Rocket Badge (Inspiration from Paycent/Jobie) */}
            <div className='p-6'>
                {is_sidebar_open ? (
                    <div className='bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group mb-4'>
                        <div className='absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/10 blur-[40px] group-hover:bg-brand-blue/20 transition-all duration-700'></div>
                        <div className='w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-white/5 group-hover:rotate-12 transition-transform duration-500'>
                            🚀
                        </div>
                        <p className='text-white font-black text-sm mb-1 italic'>CORE UPDATE 4.0</p>
                        <p className='text-slate-500 text-[10px] font-bold mb-4 leading-relaxed'>
                            Enhanced encryption nodes and real-time execution kernels.
                        </p>
                        <button className='w-full py-3 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] transition-all'>
                            UPDATE SYSTEM
                        </button>
                    </div>
                ) : (
                    <button className='w-full aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-xl hover:bg-white/10 transition-colors border border-white/5 mb-4 group relative'>
                        🚀
                        <div className='absolute left-full ml-4 px-4 py-2 bg-[#0b0f19] border border-white/10 text-white text-[10px] uppercase font-black tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[60] shadow-2xl translate-x-4 group-hover:translate-x-0'>
                            Update Ready
                        </div>
                    </button>
                )}

                <button
                    onClick={() => admin.toggleSidebar()}
                    className='w-full h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 group'
                >
                    <span
                        className={classNames(
                            'transition-transform duration-500 font-black',
                            is_sidebar_open ? '-rotate-180' : ''
                        )}
                    >
                        ❯
                    </span>
                </button>
            </div>
        </aside>
    );
});

export default Sidebar;
