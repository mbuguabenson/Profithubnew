import React from 'react';
import InitialLoader from '@/components/loader/initial-loader';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { URLUtils } from '@deriv-com/utils';
import App from './App';

// Extend Window interface to include is_tmb_enabled property
declare global {
    interface Window {
        is_tmb_enabled?: boolean;
    }
}

import Cookies from 'js-cookie';

const setLocalStorageToken = async (loginInfo: URLUtils.LoginInfo[], paramsToDelete: string[]) => {
    if (loginInfo.length) {
        try {
            const defaultActiveAccount = URLUtils.getDefaultActiveAccount(loginInfo);
            if (!defaultActiveAccount) return;

            const accountsList: Record<string, string> = {};
            const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

            loginInfo.forEach((account: { loginid: string; token: string; currency: string }) => {
                accountsList[account.loginid] = account.token;
                clientAccounts[account.loginid] = account;
            });

            localStorage.setItem('accountsList', JSON.stringify(accountsList));
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

            // Synchronize with Cookies to prevent UI layer flickering (CoreStoreProvider expects this)
            const currentDomain = '.' + window.location.hostname.split('.').slice(-2).join('.');
            Cookies.set('logged_state', 'true', { domain: currentDomain });
            
            // Build a basic client_information cookie to satisfy initial store checks
            const client_information = {
                loginid: loginInfo[0].loginid,
                currency: loginInfo[0].currency,
                is_logged_in: true,
            };
            Cookies.set('client_information', JSON.stringify(client_information), { domain: currentDomain });

            URLUtils.filterSearchParams(paramsToDelete);
            localStorage.setItem('authToken', loginInfo[0].token);
            localStorage.setItem('active_loginid', loginInfo[0].loginid);
        } catch (error) {
            console.error('Error setting up login info:', error);
        }
    }
};

export const AuthWrapper = () => {
    const [isAuthComplete, setIsAuthComplete] = React.useState(false);
    const [min_loader_passed, setMinLoaderPassed] = React.useState(false);
    const { loginInfo, paramsToDelete } = URLUtils.getLoginInfoFromURL();
    const { isOnline } = useOfflineDetection();
    const isInitialized = React.useRef(false);

    React.useEffect(() => {
        if (isInitialized.current) return;
        
        const initializeAuth = async () => {
            try {
                // Tokens are parsed from URL and stored in localStorage
                let currentLoginInfo = loginInfo;
                let currentParamsToDelete = paramsToDelete;

                // 1. Check for legacy tokens if URLUtils didn't find any (common for app_id 36300)
                if ((!currentLoginInfo || currentLoginInfo.length === 0) && window.location.search) {
                    const params = new URLSearchParams(window.location.search);
                    const legacyTokens: Record<string, string> = {};
                    const extractedLoginInfo: URLUtils.LoginInfo[] = [];

                    for (const [key, value] of params.entries()) {
                        legacyTokens[key] = value;
                    }

                    for (const [key, value] of Object.entries(legacyTokens)) {
                        if (key.startsWith('acct')) {
                            const index = key.replace('acct', '');
                            const tokenKey = `token${index}`;
                            const curKey = `cur${index}`;
                            if (legacyTokens[tokenKey]) {
                                extractedLoginInfo.push({
                                    loginid: value,
                                    token: legacyTokens[tokenKey],
                                    currency: legacyTokens[curKey] || '',
                                });
                            }
                        }
                    }

                    if (extractedLoginInfo.length > 0) {
                        currentLoginInfo = extractedLoginInfo;
                        currentParamsToDelete = Array.from(params.keys());
                        console.log('[Auth] Detected legacy tokens:', currentLoginInfo);
                    }
                }

                // 2. If no login info in URL, we can mark auth as complete immediately
                if (!currentLoginInfo || currentLoginInfo.length === 0) {
                    setIsAuthComplete(true);
                } else {
                    await setLocalStorageToken(currentLoginInfo, currentParamsToDelete);
                    // Instead of just setting state, do a clean redirect to origin to clean the URL
                    // and ensure all stores initialize with the new localStorage tokens.
                    window.location.assign(window.location.origin);
                    return; // Stop execution as we are redirecting
                }
            } catch (error) {
                console.error('[Auth] Authentication initialization failed:', error);
                setIsAuthComplete(true);
            } finally {
                isInitialized.current = true;
            }
        };

        // If offline, set auth complete immediately
        if (!isOnline) {
            setIsAuthComplete(true);
        }

        // Enforce 300ms minimum display time
        const minTimer = setTimeout(() => {
            setMinLoaderPassed(true);
        }, 300);

        // Enforce 2s maximum display time (fail-safe)
        const maxTimer = setTimeout(() => {
            console.warn('[Auth] Maximum loading time reached, forcing app entry');
            setIsAuthComplete(true);
            setMinLoaderPassed(true);
        }, 2000);

        initializeAuth();
        return () => {
            clearTimeout(minTimer);
            clearTimeout(maxTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);

    // Add timeout for offline scenarios to prevent infinite loading
    React.useEffect(() => {
        if (!isOnline && !isAuthComplete) {
            const timeout = setTimeout(() => {
                setIsAuthComplete(true);
            }, 2000); // 2 second timeout for offline

            return () => clearTimeout(timeout);
        }
    }, [isOnline, isAuthComplete]);

    if (!isAuthComplete || !min_loader_passed) {
        return <InitialLoader />;
    }

    return <App />;
};
