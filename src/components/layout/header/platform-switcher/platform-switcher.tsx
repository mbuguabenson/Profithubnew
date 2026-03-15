import { observer } from 'mobx-react-lite';
import { standalone_routes } from '@/components/shared';
import { useFirebaseCountriesConfig } from '@/hooks/firebase/useFirebaseCountriesConfig';
import { useStore } from '@/hooks/useStore';
import useStoreWalletAccountsList from '@/hooks/useStoreWalletAccountsList';
import { handleTraderHubRedirect } from '@/utils/traders-hub-redirect';
import { useTranslations } from '@deriv-com/translations';
import { PlatformSwitcher as UIPlatformSwitcher, PlatformSwitcherItem } from '@deriv-com/ui';
import { platformsConfig } from '../header-config';
import './platform-switcher.scss';

const PlatformSwitcher = observer(() => {
    const { localize } = useTranslations();
    const { has_wallet = false } = useStoreWalletAccountsList() || {};
    const { hubEnabledCountryList } = useFirebaseCountriesConfig();
    const store = useStore();

    // Get the URL parameters to check if it's a demo account
    const urlParams = new URLSearchParams(window.location.search);
    const account_param = urlParams.get('account');

    // Check if the account is a demo account from both client store and URL parameter
    const client = store?.client ?? {};
    const is_virtual = client.is_virtual || account_param === 'demo' || false;

    // Get the redirect URL from handleTraderHubRedirect
    const redirectParams = {
        product_type: 'cfds' as const,
        has_wallet,
        is_virtual,
        residence: client.residence,
        hubEnabledCountryList,
    };
    const redirect_url_str = handleTraderHubRedirect(redirectParams) || standalone_routes.traders_hub;

    return (
        <UIPlatformSwitcher
            buttonProps={{
                icon: platformsConfig[0].buttonIcon,
            }}
        >
            {platformsConfig.map(({ active, description, href, icon }) => (
                <PlatformSwitcherItem
                    active={active}
                    className='platform-switcher'
                    description={localize('{{description}}', { description })}
                    href={window.location.search ? `${href}/${window.location.search}` : href}
                    icon={icon}
                    key={description}
                />
            ))}
        </UIPlatformSwitcher>
    );
});

export default PlatformSwitcher;
