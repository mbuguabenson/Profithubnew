import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import useStoreWalletAccountsList from '@/hooks/useStoreWalletAccountsList';
import { useTranslations } from '@deriv-com/translations';
import { MenuItem, Text, useDevice } from '@deriv-com/ui';
import { MenuItems as items } from '../header-config';
import './menu-items.scss';

export const MenuItems = observer(() => {
    const { localize } = useTranslations();
    const { isDesktop } = useDevice();
    const store = useStore();
    const { has_wallet = false } = useStoreWalletAccountsList() || {};

    if (!store) return null;

    const client = store.client ?? {};
    const is_logged_in = client.is_logged_in ?? false;
    const getCurrency = client.getCurrency;
    const currency = getCurrency?.();

    // Check if the account is a demo account
    // Use the URL parameter to determine if it's a demo account, as this will update when the account changes
    const urlParams = new URLSearchParams(window.location.search);
    const account_param = urlParams.get('account');
    const is_virtual = client.is_virtual || account_param === 'demo' || false;

    // Use handleTraderHubRedirect for all links
    const getModifiedHref = (originalHref: string) => {
        // Fix: Provide base URL to prevent crash on relative paths
        const redirect_url = new URL(originalHref, window.location.origin);

        if (is_virtual) {
            // For demo accounts, set the account parameter to 'demo'
            redirect_url.searchParams.set('account', 'demo');
        } else if (currency) {
            // For real accounts, set the account parameter to the currency
            redirect_url.searchParams.set('account', currency);
        }

        return redirect_url.toString();
    };

    // Filter out the Cashier link when the account is a wallet account
    const filtered_items = items.filter((_, index) => {
        // Index 0 is the Cashier link
        if (index === 0 && has_wallet) {
            return false;
        }
        return true;
    });

    // TODO : need to add the skeleton loader when growthbook is not loaded
    return (
        <>
            {is_logged_in &&
                (isDesktop
                    ? filtered_items.map(({ as, href, icon, label }) => (
                          <MenuItem
                              as={as}
                              className='app-header__menu'
                              href={getModifiedHref(href)}
                              key={label}
                              leftComponent={icon}
                          >
                              <Text>{localize(label)}</Text>
                          </MenuItem>
                      ))
                    : // For mobile, show the first available item after filtering
                      filtered_items.length > 0 && (
                          <MenuItem
                              as={filtered_items[0].as}
                              className='flex gap-2 p-5'
                              href={getModifiedHref(filtered_items[0].href)}
                              key={filtered_items[0].label}
                              leftComponent={filtered_items[0].icon}
                          >
                              <Text>{localize(filtered_items[0].label)}</Text>
                          </MenuItem>
                      ))}
        </>
    );
});

export default MenuItems;
