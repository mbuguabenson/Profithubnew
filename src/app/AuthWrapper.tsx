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

    React.useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Tokens are parsed from URL and stored in localStorage
                await setLocalStorageToken(loginInfo, paramsToDelete);
                URLUtils.filterSearchParams(['lang']);
                setIsAuthComplete(true);
            } catch (error) {
                console.error('[Auth] Authentication initialization failed:', error);
                // Don't block the app if auth fails, especially when offline
                setIsAuthComplete(true);
            }
        };

        // If offline, set auth complete immediately but still run initializeAuth
        // to save login info to localStorage for offline use
        if (!isOnline) {
            setIsAuthComplete(true);
        }

        // Enforce 5s minimum display time
        const minTimer = setTimeout(() => {
            setMinLoaderPassed(true);
        }, 3000);

        initializeAuth();
        return () => clearTimeout(minTimer);
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
