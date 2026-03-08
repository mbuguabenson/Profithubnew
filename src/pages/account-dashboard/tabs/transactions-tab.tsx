import React, { useState, useMemo } from 'react';
import { Localize } from '@deriv-com/translations';
import { MOCK_TRANSACTIONS } from '../mock-data';

interface TransactionsTabProps {
    accountId: string;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ accountId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('All');

    const filteredTransactions = useMemo(() => {
        return MOCK_TRANSACTIONS.filter(txn => {
            const matchesSearch = txn.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                txn.ref_id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterAction === 'All' || txn.action === filterAction;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterAction]);

    const totals = useMemo(() => {
        return MOCK_TRANSACTIONS.reduce((acc, txn) => {
            if (txn.action === 'Deposit') acc.deposited += txn.amount;
            if (txn.action === 'Withdrawal') acc.withdrawn += Math.abs(txn.amount);
            if (txn.action === 'Trade Profit') acc.profit += txn.amount;
            if (txn.action === 'Trade Loss') acc.loss += Math.abs(txn.amount);
            return acc;
        }, { deposited: 0, withdrawn: 0, profit: 0, loss: 0 });
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Totals Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: "Total Deposited", value: totals.deposited, color: "text-emerald-400" },
                    { label: "Total Withdrawn", value: totals.withdrawn, color: "text-red-400" },
                    { label: "Total Profits", value: totals.profit, color: "text-emerald-400" },
                    { label: "Total Losses", value: totals.loss, color: "text-red-400" },
                    { label: "Net P/L", value: totals.profit - totals.loss, color: (totals.profit - totals.loss) >= 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Current Balance", value: totals.deposited - totals.withdrawn + (totals.profit - totals.loss), color: "text-white" }
                ].map((item, idx) => (
                    <div key={idx} className="glass-card p-4 rounded-2xl">
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">{item.label}</p>
                        <p className={`text-lg font-bold ${item.color}`}>USD {item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between relative z-20">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder={localize("Search by ID or Ref...")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-glass w-full pl-10"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select 
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="input-glass bg-dark-bg min-w-[150px]"
                    >
                        <option value="All">{localize("All Actions")}</option>
                        <option value="Deposit">{localize("Deposits")}</option>
                        <option value="Withdrawal">{localize("Withdrawals")}</option>
                        <option value="Trade Profit">{localize("Profits")}</option>
                        <option value="Trade Loss">{localize("Losses")}</option>
                    </select>
                </div>
                <button className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <Localize i18n_default_text="Export CSV" />
                </button>
            </div>

            {/* Transactions Table */}
            <div className="glass-card rounded-3xl overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><Localize i18n_default_text="Date & Time" /></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><Localize i18n_default_text="Reference" /></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><Localize i18n_default_text="Action" /></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><Localize i18n_default_text="Transaction ID" /></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Amount" /></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"><Localize i18n_default_text="Balance" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTransactions.map((txn, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">{txn.date}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{txn.ref_id}</td>
                                    <td className="px-6 py-4">
                                        <span className={classNames(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                            txn.action === 'Trade Profit' || txn.action === 'Deposit' 
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {txn.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{txn.transaction_id}</td>
                                    <td className={classNames(
                                        "px-6 py-4 text-sm font-bold text-right",
                                        txn.amount >= 0 ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-white text-right">
                                        {txn.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredTransactions.length === 0 && (
                    <div className="p-20 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-bold text-white mb-1"><Localize i18n_default_text="No transactions found" /></h3>
                        <p className="text-slate-500 text-sm"><Localize i18n_default_text="Try adjusting your search or filters." /></p>
                    </div>
                )}

                {/* Pagination (Visual Placeholder) */}
                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
                        <Localize i18n_default_text="Showing {{count}} of {{total}} transactions" values={{ count: filteredTransactions.length, total: MOCK_TRANSACTIONS.length }} />
                    </p>
                    <div className="flex gap-2">
                        <button disabled className="p-2 rounded-lg bg-white/5 text-slate-600 cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsTab;
