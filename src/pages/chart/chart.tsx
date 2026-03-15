import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import {
    ActiveSymbolsRequest,
    ServerTimeRequest,
    TicksHistoryResponse,
    TicksStreamRequest,
    TradingTimesRequest,
} from '@deriv/api-types';
import { ChartTitle, SmartChart } from '@deriv/deriv-charts';
import { useDevice } from '@deriv-com/ui';
import ToolbarWidgets from './toolbar-widgets';
import MarketSelector from '@/components/market-selector/market-selector';
import '@deriv/deriv-charts/dist/smartcharts.css';

type TSubscription = {
    [key: string]: null | {
        unsubscribe?: () => void;
    };
};

type TError = null | {
    error?: {
        code?: string;
        message?: string;
    };
};

const subscriptions: TSubscription = {};

const Chart = observer(({ show_digits_stats }: { show_digits_stats: boolean }) => {
    const barriers: [] = [];
    const { common, ui } = useStore();
    const { chart_store, run_panel, dashboard } = useStore();
    const [isSafari, setIsSafari] = useState(false);
    // Boolean state to control whether to refresh active symbols
    const [activeSymbols, setActiveSymbols] = useState<any[]>([]);
    const { activeLoginid } = useApiBase();

    const {
        chart_type,
        getMarketsOrder,
        granularity,
        onSymbolChange,
        setChartStatus,
        symbol,
        updateChartType,
        updateGranularity,
        updateSymbol,
        setChartSubscriptionId,
        chart_subscription_id,
    } = chart_store;
    const chartSubscriptionIdRef = useRef(chart_subscription_id);
    const { isDesktop, isMobile } = useDevice();
    const { is_drawer_open } = run_panel;
    const { is_chart_modal_visible } = dashboard;
    const settings = {
        assetInformation: false, // ui.is_chart_asset_info_visible,
        countdown: true,
        isHighestLowestMarkerEnabled: false, // TODO: Pending UI,
        language: common.current_language.toLowerCase(),
        position: ui.is_chart_layout_default ? 'bottom' : 'left',
        theme: ui.is_dark_mode_on ? 'dark' : 'light',
    };

    useEffect(() => {
        // Safari browser detection
        const isSafariBrowser = () => {
            const ua = navigator.userAgent.toLowerCase();
            return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('android') === -1;
        };

        setIsSafari(isSafariBrowser());

        return () => {
            chart_api.api.forgetAll('ticks');
        };
    }, []);

    useEffect(() => {
        chartSubscriptionIdRef.current = chart_subscription_id;
    }, [chart_subscription_id]);

    useEffect(() => {
        if (!symbol) {
            // Retry symbol resolution until active_symbols are available
            const retryInterval = setInterval(() => {
                updateSymbol();
                if (symbol) clearInterval(retryInterval);
            }, 500);
            return () => clearInterval(retryInterval);
        }
    }, [symbol, updateSymbol]);

    // Function to fetch active symbols using chart_api
    const fetchActiveSymbols = async () => {
        try {
            // Then fetch active symbols
            const response = await chart_api.api.send({ active_symbols: 'brief' });
            if (response && response.active_symbols) {
                setActiveSymbols(response.active_symbols);
            }
        } catch (error) {
            console.error('Failed to fetch active symbols:', error);
        }
    };

    // Initialize previousLoginIdRef when component mounts and detect account changes
    useEffect(() => {
        // First time initialization
        if (activeLoginid && chart_api.is_authorized) {
            fetchActiveSymbols();
        }
    }, [activeLoginid, chart_api.is_authorized]);

    const requestAPI = (req: ServerTimeRequest | ActiveSymbolsRequest | TradingTimesRequest) => {
        return chart_api.api.send(req);
    };
    const requestForgetStream = (subscription_id: string) => {
        subscription_id && chart_api.api.forget(subscription_id);
    };

    const requestSubscribe = async (req: TicksStreamRequest, callback: (data: any) => void) => {
        try {
            requestForgetStream(chartSubscriptionIdRef.current);
            const history = await chart_api.api.send(req);
            setChartSubscriptionId(history?.subscription.id);
            if (history) callback(history);
            if (req.subscribe === 1) {
                subscriptions[history?.subscription.id] = chart_api.api
                    .onMessage()
                    ?.subscribe(({ data }: { data: TicksHistoryResponse }) => {
                        callback(data);
                    });
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            (e as TError)?.error?.code === 'MarketIsClosed' && callback([]); //if market is closed sending a empty array  to resolve
            console.log((e as TError)?.error?.message);
        }
    };

    if (!symbol) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '1rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    letterSpacing: '0.05rem',
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '2px solid rgba(6,182,212,0.3)',
                        borderTopColor: '#06b6d4',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span>Loading market data...</span>
            </div>
        );
    }
    const is_connection_opened = !!chart_api?.api;
    return (
        <div
            className={classNames('dashboard__chart-wrapper', {
                'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                'dashboard__chart-wrapper--safari': isSafari,
            })}
            dir='ltr'
        >
            <MarketSelector />
            <SmartChart
                id='dbot'
                barriers={barriers}
                showLastDigitStats={show_digits_stats}
                chartControlsWidgets={null}
                enabledChartFooter={false}
                chartStatusListener={(v: boolean) => setChartStatus(!v)}
                toolbarWidget={() => (
                    <ToolbarWidgets
                        updateChartType={updateChartType}
                        updateGranularity={updateGranularity}
                        position={!isDesktop ? 'bottom' : 'top'}
                        isDesktop={isDesktop}
                    />
                )}
                chartType={chart_type}
                isMobile={isMobile}
                enabledNavigationWidget={isDesktop}
                granularity={granularity}
                requestAPI={requestAPI}
                requestForget={() => {}}
                requestForgetStream={() => {}}
                requestSubscribe={requestSubscribe}
                settings={settings}
                symbol={symbol}
                topWidgets={() => <ChartTitle onChange={onSymbolChange} />}
                isConnectionOpened={is_connection_opened}
                getMarketsOrder={getMarketsOrder}
                chartData={{
                    activeSymbols: JSON.parse(JSON.stringify(activeSymbols)),
                }}
                isLive
                leftMargin={80}
            />
        </div>
    );
});

export default Chart;
