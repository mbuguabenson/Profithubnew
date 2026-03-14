/**
 * DerivAPIv2Provider
 *
 * Wraps the application with the official @deriv/api-v2 APIProvider and AuthProvider.
 * This makes all @deriv/api-v2 hooks (useAuthorize, useBalance, useSubscription, etc.)
 * available anywhere in the component tree below this provider.
 *
 * Usage: place this in main.tsx or App.tsx above your other providers.
 *
 * The AuthProvider automatically reads the token from localStorage ('authToken') and
 * calls the Deriv WebSocket authorize endpoint.
 */

import React from 'react';
import { APIProvider, AuthProvider } from '@deriv/api-v2';

type TDerivAPIv2ProviderProps = {
    children: React.ReactNode;
};

const DerivAPIv2Provider: React.FC<TDerivAPIv2ProviderProps> = ({ children }) => {
    return (
        <APIProvider>
            <AuthProvider>{children}</AuthProvider>
        </APIProvider>
    );
};

export default DerivAPIv2Provider;
