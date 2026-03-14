import React, { useState, Suspense, lazy } from 'react';
import classNames from 'classnames';
import { Localize, localize } from '@deriv-com/translations';
import ChunkLoader from '@/components/loader/chunk-loader';
import { MOCK_USER, MOCK_ACCOUNTS } from './mock-data';
import '../../tailwind.css';

const ProfileTab = lazy(() => import('./tabs/profile-tab'));
const TransactionsTab = lazy(() => import('./tabs/transactions-tab'));
const PerformanceTab = lazy(() => import('./tabs/performance-tab'));
const StrategyTab = lazy(() => import('./tabs/strategy-tab'));

type TTab = 'profile' | 'transactions' | 'performance' | 'strategy';

const AccountDashboard = () => {
    const [activeTab, setActiveTab] = useState<TTab>('profile');
    const [accountType, setAccountType] = useState<'Real' | 'Demo'>('Real');

    const tabs: { id: TTab; label: string }[] = [
        { id: 'profile', label: localize('Profile & Accounts') },
        { id: 'transactions', label: localize('Transactions') },
        { id: 'performance', label: localize('Performance') },
        { id: 'strategy', label: localize('Strategy Analytics') },
    ];

    const activeAccount = MOCK_ACCOUNTS.find(acc => acc.type === accountType) || MOCK_ACCOUNTS[0];

    return (
        <div className='account-dashboard min-h-full bg-dark-bg p-4 md:p-8 font-sans'>
            {/* Header / Account Selector */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
                <div>
                    <h1 className='text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent'>
                        <Localize i18n_default_text='Account Dashboard' />
                    </h1>
                    <p className='text-slate-400 mt-1'>
                        <Localize i18n_default_text='Manage your profile, track performance and view analytics.' />
                    </p>
                </div>

                <div className='glass-card p-1 rounded-2xl flex gap-1'>
                    <button
                        onClick={() => setAccountType('Real')}
                        className={classNames(
                            'px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300',
                            accountType === 'Real'
                                ? 'bg-brand-blue text-white shadow-glow-blue'
                                : 'text-slate-400 hover:text-white'
                        )}
                    >
                        <Localize i18n_default_text='Real Account' />
                    </button>
                    <button
                        onClick={() => setAccountType('Demo')}
                        className={classNames(
                            'px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300',
                            accountType === 'Demo'
                                ? 'bg-brand-blue text-white shadow-glow-blue'
                                : 'text-slate-400 hover:text-white'
                        )}
                    >
                        <Localize i18n_default_text='Demo Account' />
                    </button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                <div className='glass-card p-6 rounded-2xl relative overflow-hidden group'>
                    <div className='absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 blur-3xl -mr-8 -mt-8 group-hover:bg-brand-blue/20 transition-colors'></div>
                    <p className='text-slate-400 text-xs font-medium uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Current Balance' />
                    </p>
                    <h2 className='text-2xl font-bold text-white'>
                        {activeAccount.currency}{' '}
                        {activeAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                </div>
                <div className='glass-card p-6 rounded-2xl relative overflow-hidden group'>
                    <div className='absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 blur-3xl -mr-8 -mt-8 group-hover:bg-brand-purple/20 transition-colors'></div>
                    <p className='text-slate-400 text-xs font-medium uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Equity' />
                    </p>
                    <h2 className='text-2xl font-bold text-white'>
                        {activeAccount.currency}{' '}
                        {activeAccount.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                </div>
                <div className='glass-card p-6 rounded-2xl relative overflow-hidden group'>
                    <p className='text-slate-400 text-xs font-medium uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Account ID' />
                    </p>
                    <h2 className='text-2xl font-bold text-white'>{activeAccount.number}</h2>
                </div>
                <div className='glass-card p-6 rounded-2xl relative overflow-hidden group'>
                    <p className='text-slate-400 text-xs font-medium uppercase tracking-wider mb-2'>
                        <Localize i18n_default_text='Status' />
                    </p>
                    <div className='flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'></span>
                        <h2 className='text-2xl font-bold text-white'>{activeAccount.status}</h2>
                    </div>
                </div>
            </div>

            {/* Internal Tabs Navigation */}
            <div className='mb-8 border-b border-white/5 overflow-x-auto'>
                <div className='flex gap-8 min-w-max'>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={classNames(
                                'pb-4 text-sm font-semibold transition-all duration-300 relative',
                                activeTab === tab.id ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-200'
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className='absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue shadow-glow-blue'></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className='tab-content transition-all duration-500'>
                <Suspense fallback={<ChunkLoader message={localize('Loading Dashboard Content...')} />}>
                    {activeTab === 'profile' && <ProfileTab user={MOCK_USER} accounts={MOCK_ACCOUNTS} />}
                    {activeTab === 'transactions' && <TransactionsTab accountId={activeAccount.number} />}
                    {activeTab === 'performance' && <PerformanceTab accountId={activeAccount.number} />}
                    {activeTab === 'strategy' && <StrategyTab accountId={activeAccount.number} />}
                </Suspense>
            </div>
        </div>
    );
};

export default AccountDashboard;
