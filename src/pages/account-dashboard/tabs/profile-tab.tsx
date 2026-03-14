import React, { useState } from 'react';
import { Localize } from '@deriv-com/translations';
import { MOCK_USER, MOCK_ACCOUNTS } from '../mock-data';

interface ProfileTabProps {
    user: typeof MOCK_USER;
    accounts: typeof MOCK_ACCOUNTS;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, accounts }) => {
    const [name, setName] = useState(user.name);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {/* User Profile Section */}
            <div className='glass-card p-8 rounded-3xl relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-3xl rounded-full -mr-32 -mt-32'></div>

                <div className='flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10'>
                    {/* Profile Picture */}
                    <div className='relative group'>
                        <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-300'>
                            <img src={user.profile_picture} alt={user.name} className='w-full h-full object-cover' />
                        </div>
                        <button className='absolute bottom-0 right-0 bg-brand-blue p-2 rounded-full shadow-lg hover:bg-brand-blue/80 transition-colors'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-5 w-5 text-white'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                            >
                                <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                            </svg>
                        </button>
                    </div>

                    {/* Details */}
                    <div className='flex-1 space-y-4 text-center md:text-left'>
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                            <div>
                                {isEditing ? (
                                    <input
                                        type='text'
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className='input-glass text-2xl font-bold text-white w-full md:w-auto'
                                    />
                                ) : (
                                    <h2 className='text-3xl font-bold text-white'>{name}</h2>
                                )}
                                <p className='text-slate-400'>{user.email}</p>
                            </div>
                            <div className='flex gap-3 justify-center'>
                                {isEditing ? (
                                    <button onClick={() => setIsEditing(false)} className='btn-gradient text-sm'>
                                        <Localize i18n_default_text='Save Changes' />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className='px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white'
                                    >
                                        <Localize i18n_default_text='Edit Profile' />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/5'>
                            <div>
                                <p className='text-slate-400 text-xs mb-1 uppercase tracking-wider'>
                                    <Localize i18n_default_text='Account ID' />
                                </p>
                                <p className='text-white font-mono font-bold tracking-tight'>{user.id}</p>
                            </div>
                            <div>
                                <p className='text-slate-400 text-xs mb-1 uppercase tracking-wider'>
                                    <Localize i18n_default_text='KYC Status' />
                                </p>
                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
                                    {user.kyc_status}
                                </span>
                            </div>
                            <div>
                                <p className='text-slate-400 text-xs mb-1 uppercase tracking-wider'>
                                    <Localize i18n_default_text='Member Since' />
                                </p>
                                <p className='text-white font-medium'>{user.created_at}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trading Accounts Section */}
            <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-white'>
                        <Localize i18n_default_text='Linked Trading Accounts' />
                    </h3>
                    <button className='text-brand-blue hover:text-brand-blue/80 text-sm font-semibold transition-colors'>
                        <Localize i18n_default_text='+ Link New Account' />
                    </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {accounts.map((acc, index) => (
                        <div
                            key={acc.number}
                            className='glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300'
                        >
                            {/* Account Card Background Gradient */}
                            <div
                                className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity -mr-16 -mt-16 ${acc.type === 'Real' ? 'bg-brand-blue' : 'bg-brand-purple'}`}
                            ></div>

                            <div className='flex justify-between items-start mb-6 relative z-10'>
                                <div>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <span
                                            className={`w-2 h-2 rounded-full ${acc.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        ></span>
                                        <p className='text-white font-bold'>{acc.type} Account</p>
                                    </div>
                                    <p className='text-slate-400 text-xs font-mono'>{acc.number}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${acc.type === 'Real' ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' : 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'}`}
                                >
                                    {acc.currency}
                                </span>
                            </div>

                            <div className='grid grid-cols-2 gap-y-4 relative z-10'>
                                <div>
                                    <p className='text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1'>
                                        <Localize i18n_default_text='Balance' />
                                    </p>
                                    <p className='text-xl font-bold text-white'>
                                        {acc.currency} {acc.balance.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1'>
                                        <Localize i18n_default_text='Equity' />
                                    </p>
                                    <p className='text-xl font-bold text-white'>
                                        {acc.currency} {acc.equity.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1'>
                                        <Localize i18n_default_text='Margin' />
                                    </p>
                                    <p className='text-white font-semibold'>
                                        {acc.currency} {acc.margin.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1'>
                                        <Localize i18n_default_text='Free Margin' />
                                    </p>
                                    <p className='text-white font-semibold'>
                                        {acc.currency} {acc.free_margin.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className='mt-6 pt-6 border-t border-white/5 flex gap-3 relative z-10'>
                                <button className='flex-1 py-2 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors'>
                                    <Localize i18n_default_text='History' />
                                </button>
                                <button className='flex-1 py-2 text-xs font-bold rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors'>
                                    <Localize i18n_default_text='Manage' />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
