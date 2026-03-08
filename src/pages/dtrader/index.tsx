import React, { useEffect, useState } from 'react';
import { api_base } from '@/external/bot-skeleton';
import './sass/app.scss';

/**
 * DTrader native integration.
 * Reads auth data from localStorage (populated by the main app's api_base)
 * instead of relying on @deriv/api-v2's own WebSocket connection.
 */

interface AuthInfo {
    loginid: string | null;
    balance: number | null;
    currency: string | null;
    name: string | null;
}

const getAuthFromStorage = (): AuthInfo => {
    try {
        const loginid = localStorage.getItem('active_loginid');
        const clientAccounts = JSON.parse(localStorage.getItem('clientAccounts') || '{}');
        const accountData = loginid ? clientAccounts[loginid] : null;

        return {
            loginid: loginid || null,
            balance: accountData?.balance ?? null,
            currency: accountData?.currency ?? null,
            name: null,
        };
    } catch {
        return { loginid: null, balance: null, currency: null, name: null };
    }
};

const DTraderNative = () => {
    const [auth, setAuth] = useState<AuthInfo>(getAuthFromStorage());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Immediately check what we already have in localStorage
        const stored = getAuthFromStorage();
        setAuth(stored);

        // If api_base is already authorized, we're done
        if (api_base.is_authorized || stored.loginid) {
            setIsLoading(false);
            return;
        }

        // Otherwise poll for up to 10 seconds for api_base to authorize
        const interval = setInterval(() => {
            const fresh = getAuthFromStorage();
            if (api_base.is_authorized || fresh.loginid) {
                setAuth(fresh);
                setIsLoading(false);
                clearInterval(interval);
            }
        }, 500);

        // Safety timeout
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setAuth(getAuthFromStorage());
            setIsLoading(false);
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    if (isLoading) {
        return (
            <div className='dtrader-loading'>
                <div className='dtrader-loading__spinner' />
                <p>Connecting...</p>
            </div>
        );
    }

    if (!auth.loginid) {
        return (
            <div className='dtrader-unauthorized'>
                <h2>Please log in to use DTrader</h2>
                <p>
                    <a href='/'>← Go to main app</a>
                </p>
            </div>
        );
    }

    return (
        <div className='dtrader-native-container'>
            <header className='dtrader-header'>
                <div className='dtrader-header-left'>
                    <h2>DTrader</h2>
                </div>
                <div className='dtrader-header-right'>
                    <div className='account-info'>
                        <span className='account-id'>{auth.loginid}</span>
                        <div className='balance'>
                            {auth.balance !== null ? auth.balance.toFixed(2) : '—'}
                            <span className='currency'>{auth.currency || 'USD'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className='dtrader-main'>
                <div className='dtrader-sidebar left-sidebar'>
                    <div className='market-placeholder'>
                        <h3>Market Selection</h3>
                        <p>Volatility 100 (1s) Index</p>
                    </div>
                </div>

                <div className='dtrader-chart-area'>
                    <div className='chart-placeholder'>
                        <h3>Chart Interface</h3>
                        <p>Chart component loading...</p>
                    </div>
                </div>

                <div className='dtrader-sidebar right-sidebar'>
                    <div className='trade-params-placeholder'>
                        <h3>Trade Parameters</h3>
                        <div className='param-row'>
                            <label>Duration</label>
                            <input type='number' defaultValue='5' />
                            <select defaultValue='t'>
                                <option value='t'>Ticks</option>
                                <option value='m'>Minutes</option>
                            </select>
                        </div>
                        <div className='param-row'>
                            <label>Stake</label>
                            <input type='number' defaultValue='10' />
                            <span>{auth.currency || 'USD'}</span>
                        </div>
                        <div className='buy-buttons'>
                            <button className='btn-buy up'>Rise</button>
                            <button className='btn-buy down'>Fall</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DTraderNative;
