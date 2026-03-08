import React from 'react';
import { TStores } from '@deriv/stores/types';
import { AccountSwitcherWalletItem } from './account-switcher-wallet-item';
import './account-switcher-wallet-list.scss';

type TAccountSwitcherWalletListProps = {
    wallets: TStores['client']['wallet_list'];
    closeAccountsDialog: () => void;
};

export const AccountSwitcherWalletList = ({ wallets, closeAccountsDialog }: TAccountSwitcherWalletListProps) => {
    const sortedWallets = [...wallets].sort((a, b) => {
        const balanceA = Number(a.balance.toString().replace(/,/g, ''));
        const balanceB = Number(b.balance.toString().replace(/,/g, ''));
        return balanceB - balanceA;
    });
    return (
        <div className='account-switcher-wallet-list'>
            {sortedWallets?.map(account => {
                return (
                    <AccountSwitcherWalletItem
                        key={account.loginid}
                        account={account}
                        closeAccountsDialog={closeAccountsDialog}
                        show_badge={account?.is_virtual}
                    />
                );
            })}
        </div>
    );
};
