import { useEffect, useState } from 'react';
import { HUB_ENABLED_COUNTRY_LIST } from '@/components/layout/header/utils';

const REMOTE_CONFIG_URL_STAGING =
    'https://app-config-staging.firebaseio.com/remote_config/deriv-app/hub_enabled_country_list.json';
const REMOTE_CONFIG_URL_PRODUCTION =
    'https://app-config-prod.firebaseio.com/remote_config/deriv-app/hub_enabled_country_list.json';

let staticCountriesConfig: Record<string, any> | null = null;
let staticIsLoading = false;

export const useFirebaseCountriesConfig = () => {
    const [countriesConfig, setCountriesConfig] = useState<Record<string, any>>(
        staticCountriesConfig || {
            hub_enabled_country_list: HUB_ENABLED_COUNTRY_LIST(),
        }
    );
    const [isLoading, setIsLoading] = useState(!staticCountriesConfig);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (staticCountriesConfig || staticIsLoading) return;

        const fetchCountriesConfig = async () => {
            staticIsLoading = true;
            setIsLoading(true);

            try {
                const STAGING_URL = process.env.REMOTE_CONFIG_URL_STAGING || REMOTE_CONFIG_URL_STAGING;
                const PRODUCTION_URL = process.env.REMOTE_CONFIG_URL_PROD || REMOTE_CONFIG_URL_PRODUCTION;

                const REMOTE_CONFIG_URL = process.env.APP_ENV === 'production' ? PRODUCTION_URL : STAGING_URL;

                const response = await fetch(REMOTE_CONFIG_URL);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                staticCountriesConfig = {
                    hub_enabled_country_list: data,
                };
                setCountriesConfig(staticCountriesConfig);

                setError(null);
            } catch (error) {
                console.error('Failed to fetch countries config:', error);
                setError(error instanceof Error ? error : new Error('Unknown error occurred'));

                // Use fallback data if fetch fails
                staticCountriesConfig = {
                    hub_enabled_country_list: HUB_ENABLED_COUNTRY_LIST(),
                };
                setCountriesConfig(staticCountriesConfig);
            } finally {
                setIsLoading(false);
                staticIsLoading = false;
            }
        };

        fetchCountriesConfig();
    }, []);

    return {
        countriesConfig,
        isLoading,
        error,
        hubEnabledCountryList: countriesConfig?.hub_enabled_country_list || [],
    };
};
