/**
 * Generates a URL with authentication tokens appended as query parameters.
 * This is used for "URL-based SSO" between different apps on different ports.
 * Deriv's standard parameters are acct1, token1, acct2, token2, etc.
 * @param baseUrl The target URL (e.g., http://localhost:8080/dtrader)
 * @param accounts The accounts object from the store (client.accounts)
 * @returns A URL string with tokens appended
 */
export const getSsoUrl = (baseUrl: string, accounts: Record<string, any> = {}): string => {
    try {
        const url = new URL(baseUrl);
        const accountKeys = Object.keys(accounts);

        if (accountKeys.length === 0) return baseUrl;

        accountKeys.forEach((loginid, index) => {
            const accountIndex = index + 1;
            const account = accounts[loginid];
            if (account && account.token) {
                url.searchParams.set(`acct${accountIndex}`, loginid);
                url.searchParams.set(`token${accountIndex}`, account.token);
            }
        });

        // Also set cur_loginid if possible to ensure the same account is active
        const activeLoginid = localStorage.getItem('active_loginid');
        if (activeLoginid) {
            url.searchParams.set('cur_loginid', activeLoginid);
        }

        return url.toString();
    } catch (error) {
        console.error('[SSO] Error generating SSO URL:', error);
        return baseUrl;
    }
};
