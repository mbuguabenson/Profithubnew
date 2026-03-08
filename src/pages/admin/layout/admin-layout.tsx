import React, { Suspense, lazy } from 'react';
import { observer } from 'mobx-react-lite';
import Sidebar from './sidebar';
import ChunkLoader from '@/components/loader/chunk-loader';
import { useStore } from '@/hooks/useStore';
import '../../../tailwind.css';

const AdminDashboard = lazy(() => import('../dashboard'));
const UsersManagement = lazy(() => import('../users'));
const TabsControl = lazy(() => import('../tabs-control'));
// Other tabs will be lazy loaded as implemented

const AdminLayout = observer(() => {
    const { admin } = useStore();
    const { active_section } = admin;

    return (
        <div className="flex min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-brand-blue/30">
            <Sidebar />
            
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0b0f19]/50 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold capitalize">{active_section.replace('-', ' ')}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            Live System
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white">Admin User</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Super Administrator</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple p-0.5">
                            <div className="w-full h-full rounded-full bg-[#0b0f19] flex items-center justify-center text-xs font-bold">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <Suspense fallback={<ChunkLoader message="Initializing Module..." />}>
                        {active_section === 'dashboard' && <AdminDashboard />}
                        {active_section === 'users' && <UsersManagement />}
                        {active_section === 'tabs' && <TabsControl />}
                        {/* Fallback for sections not yet implemented */}
                        {!['dashboard', 'users', 'tabs'].includes(active_section) && (
                            <div className="glass-card p-12 rounded-3xl text-center">
                                <span className="text-6xl mb-6 block">🚧</span>
                                <h3 className="text-2xl font-bold text-white mb-2">Expansion in Progress</h3>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    The <strong>{active_section}</strong> module is currently being configured with real-time data streams.
                                </p>
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
});

export default AdminLayout;
