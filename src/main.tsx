import ReactDOM from 'react-dom/client';
import { AuthWrapper } from './app/AuthWrapper';
import DerivAPIv2Provider from './app/DerivAPIv2Provider';
import { AnalyticsInitializer } from './utils/analytics';
import { registerPWA } from './utils/pwa-utils';
import './styles/index.scss';

AnalyticsInitializer();

// Clear stale/invalid config.server_url that may have been set in a previous session.
// These hosts do not support the v3 WebSocket protocol used by this app.
const INVALID_WS_HOSTS = ['staging-api.deriv.com', 'staging-api-core.deriv.com'];
const currentServerUrl = localStorage.getItem('config.server_url');
if (currentServerUrl && INVALID_WS_HOSTS.some(h => currentServerUrl.includes(h))) {
    console.warn('[main] Clearing stale config.server_url:', currentServerUrl);
    localStorage.removeItem('config.server_url');
}

// Ensure @deriv/api-v2 APIProvider uses the same App ID as the OAuth Flow
import { getAppId, isLocal } from './components/shared/utils/config/config';

// On localhost, clear any stale config.app_id that might have been set from
// a previous session or different environment (e.g. 1069 from webtrader)
if (isLocal()) {
    const staleAppId = localStorage.getItem('config.app_id');
    if (staleAppId && staleAppId !== String(getAppId())) {
        console.warn(`[main] Clearing stale config.app_id (${staleAppId}) on localhost`);
        localStorage.removeItem('config.app_id');
    }
}

const currentConfigAppId = localStorage.getItem('config.app_id');
const activeAppId = getAppId();
if (!currentConfigAppId || currentConfigAppId !== activeAppId.toString()) {
    console.warn(`[main] Syncing APIProvider app_id to ${activeAppId}`);
    localStorage.setItem('config.app_id', activeAppId.toString());
}

registerPWA()
    .then(registration => {
        if (registration) {
            console.log('PWA service worker registered successfully for Chrome');
        } else {
            console.log('PWA service worker disabled for non-Chrome browser');
        }
    })
    .catch(error => {
        console.error('PWA service worker registration failed:', error);
    });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <DerivAPIv2Provider>
        <AuthWrapper />
    </DerivAPIv2Provider>
);
