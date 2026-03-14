import React, { lazy, Suspense, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import PageContentWrapper from '@/components/page-content-wrapper';
import { generateOAuthURL } from '@/components/shared';
import { getSsoUrl } from '@/utils/sso-utils';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import useTMB from '@/hooks/useTMB';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedCopyCaptionRegularIcon,
    LabelPairedGearCaptionRegularIcon,
    LabelPairedGraduationCapCaptionRegularIcon,
    LabelPairedLightbulbCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
    LabelPairedSlidersCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
// Rebuild triggered - verifying chart-modal resolution
import RunStrategy from '../dashboard/run-strategy';
import './main.scss';

const ChartWrapper = lazy(() => import('@/pages/chart/chart-wrapper'));

const CopyTrading = lazy(() => import('@/pages/copy-trader'));
const AnalysisTool = lazy(() => import('@/pages/analysis-tool/index'));
const Tutorials = lazy(() => import('@/pages/tutorials/tutorials'));
const SmartAuto24 = lazy(() => import('@/pages/circles-analysis/index'));
const DigitCracker = lazy(() => import('@/pages/digit-cracker/index'));
const Settings = lazy(() => import('@/pages/settings/index'));
const Strategies = lazy(() => import('@/pages/strategies/index'));
const FreeBotsTab = lazy(() => import('@/pages/free-bots/free-bots-tab'));

const Portal = observer(({ type }: { type: 'dtrader' | 'dtooltrades' }) => {
    const { client } = useStore();
    const targetBaseUrl =
        type === 'dtrader'
            ? atob('aHR0cHM6Ly9kdHJhZGVyLnByb2ZpdGh1YnRvb2wudmVyY2VsLmFwcA==')
            : atob('aHR0cHM6Ly9kdG9vbC5wcm9maXRodWJ0b29sLnZlcmNlbC5hcHA=');
    // Fallback to localhost if we are on localhost
    const finalBaseUrl =
        window.location.hostname === 'localhost'
            ? type === 'dtrader'
                ? 'https://localhost:8443'
                : 'http://localhost:3000'
            : targetBaseUrl;

    const ssoUrl = getSsoUrl(finalBaseUrl, client.accounts);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'var(--general-section-1)',
                overflow: 'hidden',
            }}
        >
            <iframe
                src={ssoUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={type}
                allow='camera; microphone; clipboard-read; clipboard-write; geolocation'
            />
        </div>
    );
});

/** Combined Trading Tools tab: SmartAuto24 + DigitCracker side-by-side sub-tabs */
const TradingTools = () => {
    const [activeTab, setActiveTab] = React.useState<'smartauto' | 'digitcracker'>('smartauto');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '12px 16px',
                    background: 'var(--general-section-1)',
                    borderBottom: '1px solid var(--general-section-2)',
                }}
            >
                <button
                    onClick={() => setActiveTab('smartauto')}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        background: activeTab === 'smartauto' ? 'var(--brand-red-coral)' : 'var(--general-section-2)',
                        color: activeTab === 'smartauto' ? '#fff' : 'var(--text-general)',
                        transition: 'all 0.2s',
                    }}
                >
                    Smart Auto 24
                </button>
                <button
                    onClick={() => setActiveTab('digitcracker')}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        background:
                            activeTab === 'digitcracker' ? 'var(--brand-red-coral)' : 'var(--general-section-2)',
                        color: activeTab === 'digitcracker' ? '#fff' : 'var(--text-general)',
                        transition: 'all 0.2s',
                    }}
                >
                    Digit Cracker
                </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <Suspense fallback={<ChunkLoader message={localize('Loading...')} />}>
                    {activeTab === 'smartauto' ? <SmartAuto24 /> : <DigitCracker />}
                </Suspense>
            </div>
        </div>
    );
};

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { admin, dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const {
        active_tab,
        active_tour,
        is_chart_modal_visible,
        is_trading_view_modal_visible,
        setActiveTab,
        setWebSocketState,
        setActiveTour,
        setTourDialogVisibility,
    } = dashboard;
    const { dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message, dismissable, is_closed_on_cancel } = dialog_options as {
        [key: string]: string;
    };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const hash = [
        'dashboard',
        'bot_builder',
        'chart',
        'free_bots',
        'analysis_tool',
        'trading_tools',
        'copy_trading',
        'strategies',
        'settings',
        'tutorials',
        'dtooltrades',
    ];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const [left_tab_shadow, setLeftTabShadow] = useState<boolean>(false);
    const [right_tab_shadow, setRightTabShadow] = useState<boolean>(false);

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    const { onRenderTMBCheck, isTmbEnabled } = useTMB();

    const historyShim = {
        replace: (path: string) => navigate(path, { replace: true }),
        location,
    };

    React.useEffect(() => {
        const el_dashboard = document.getElementById('id-dbot-dashboard');
        const el_tutorial = document.getElementById('id-tutorials');

        const observer_dashboard = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLeftTabShadow(false);
                    return;
                }
                setLeftTabShadow(true);
            },
            {
                root: null,
                threshold: 0.5, // set offset 0.1 means trigger if atleast 10% of element in viewport
            }
        );

        const observer_tutorial = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRightTabShadow(false);
                    return;
                }
                setRightTabShadow(true);
            },
            {
                root: null,
                threshold: 0.5, // set offset 0.1 means trigger if atleast 10% of element in viewport
            }
        );
        if (el_dashboard) observer_dashboard.observe(el_dashboard);
        if (el_tutorial) observer_tutorial.observe(el_tutorial);

        return () => {
            observer_dashboard.disconnect();
            observer_tutorial.disconnect();
        };
    }, [setLeftTabShadow, setRightTabShadow]);

    React.useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    // Update tab shadows height to match bot builder height
    const updateTabShadowsHeight = () => {
        const botBuilderEl = document.getElementById('id-bot-builder');
        const leftShadow = document.querySelector('.tabs-shadow--left') as HTMLElement;
        const rightShadow = document.querySelector('.tabs-shadow--right') as HTMLElement;

        if (botBuilderEl && leftShadow && rightShadow) {
            const height = botBuilderEl.offsetHeight;
            leftShadow.style.height = `${height}px`;
            rightShadow.style.height = `${height}px`;
        }
    };

    React.useEffect(() => {
        // Run on mount and when active tab changes
        updateTabShadowsHeight();
    }, [active_tab]);

    React.useEffect(() => {
        if (active_tab !== undefined) {
            if (init_render.current) {
                init_render.current = false;
                // Check both hash and search for initial tab
                const tab_value = location.hash?.split('#')[1] || location.search?.split('?')[1];
                const tab_index = hash.indexOf(String(tab_value));
                if (tab_index !== -1 && tab_index !== active_tab) {
                    setActiveTab(tab_index);
                }
            }
        }
    }, [active_tab, location.hash, location.search, setActiveTab]);

    React.useEffect(() => {
        if (is_open) {
            setTourDialogVisibility(false);
        }

        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            navigate(`#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }

        // Prevent scrolling when tutorial tab is active (only on mobile)
        const mainElement = document.querySelector('.main__container');
        if (active_tab === DBOT_TABS.TUTORIAL && !isDesktop) {
            document.body.style.overflow = 'hidden';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.add('no-scroll');
            }
        } else {
            document.body.style.overflow = '';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.remove('no-scroll');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    React.useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (
                active_tab === BOT_BUILDER &&
                (
                    Blockly as typeof Blockly & {
                        derivWorkspace?: { trashcan?: { setTrashcanPosition: (x: number, y: number) => void } };
                    }
                )?.derivWorkspace?.trashcan
            ) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                (
                    Blockly as typeof Blockly & {
                        derivWorkspace?: { trashcan?: { setTrashcanPosition: (x: number, y: number) => void } };
                    }
                )?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id); // Clear the timeout on unmount
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            // Needed to pass this to the Callback Queue as on tab changes
            // document title getting override by 'Bot | Deriv' only
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 10);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active_tab]
    );

    const handleLoginGeneration = async () => {
        try {
            // Check TMB status first
            const tmbEnabled = await isTmbEnabled();
            if (tmbEnabled) {
                await onRenderTMBCheck();
            } else {
                window.location.assign(generateOAuthURL());
            }
        } catch (error) {
            console.error('Login generation error:', error);
        }
    };
    return (
        <React.Fragment>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                        'main__container--bot-builder': active_tab === BOT_BUILDER,
                    })}
                >
                    <div style={{ height: '100%' }}>
                        {!isDesktop && left_tab_shadow && <span className='tabs-shadow tabs-shadow--left' />}{' '}
                        <Tabs
                            active_index={active_tab}
                            className='main__tabs'
                            onTabItemClick={handleTabChange}
                            top
                            history={historyShim as unknown as React.ComponentProps<typeof Tabs>['history']}
                            is_scrollable
                        >
                            {/* Tab 0: Dashboard */}
                            {admin.visible_tabs.dashboard ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedObjectsColumnCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Dashboard' />
                                        </div>
                                    }
                                    id='id-dbot-dashboard'
                                >
                                    <Dashboard handleTabChange={handleTabChange} />
                                </div>
                            ) : null}

                            {/* Tab 1: Bot Builder */}
                            {admin.visible_tabs.bot_builder ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Bot Builder' />
                                        </div>
                                    }
                                    id='id-bot-builder'
                                />
                            ) : null}

                            {/* Tab 2: Charts */}
                            {admin.visible_tabs.charts ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedChartLineCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Charts' />
                                        </div>
                                    }
                                    id={
                                        is_chart_modal_visible || is_trading_view_modal_visible
                                            ? 'id-charts--disabled'
                                            : 'id-charts'
                                    }
                                >
                                    <Suspense
                                        fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}
                                    >
                                        <ChartWrapper show_digits_stats={false} />
                                    </Suspense>
                                </div>
                            ) : null}

                            {/* Tab 3: Free Bots */}
                            {admin.visible_tabs.free_bots ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <span style={{ fontSize: '20px', marginRight: '8px' }}>🤖</span>
                                            <Localize i18n_default_text='Free Bots' />
                                        </div>
                                    }
                                    id='id-free-bots'
                                >
                                    <PageContentWrapper>
                                        <Suspense fallback={<ChunkLoader message={localize('Loading Free Bots...')} />}>
                                            <FreeBotsTab />
                                        </Suspense>
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 4: Analysis Tool */}
                            {admin.visible_tabs.analysis_tool ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedSlidersCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Analysis Tool' />
                                        </div>
                                    }
                                    id='id-analysis-tool'
                                >
                                    <PageContentWrapper>
                                        <Suspense fallback={<ChunkLoader message={localize('Loading...')} />}>
                                            <AnalysisTool />
                                        </Suspense>
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 5: Trading Tools */}
                            {admin.visible_tabs.trading_tools ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedSlidersCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Trading Tools' />
                                        </div>
                                    }
                                    id='id-trading-tools'
                                >
                                    <PageContentWrapper>
                                        <TradingTools />
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 6: Copy Trading */}
                            {admin.visible_tabs.copy_trading ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedCopyCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Copy Trading' />
                                        </div>
                                    }
                                    id='id-copy-trading'
                                >
                                    <PageContentWrapper>
                                        <Suspense fallback={<ChunkLoader message={localize('Loading...')} />}>
                                            <CopyTrading />
                                        </Suspense>
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 7: Strategies */}
                            {admin.visible_tabs.strategies ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedLightbulbCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Strategies' />
                                        </div>
                                    }
                                    id='id-strategies'
                                >
                                    <PageContentWrapper>
                                        <Suspense
                                            fallback={<ChunkLoader message={localize('Loading Strategies...')} />}
                                        >
                                            <Strategies />
                                        </Suspense>
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 8: Settings */}
                            {admin.visible_tabs.settings ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedGearCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Settings' />
                                        </div>
                                    }
                                    id='id-settings'
                                >
                                    <PageContentWrapper>
                                        <Suspense fallback={<ChunkLoader message={localize('Loading Settings...')} />}>
                                            <Settings />
                                        </Suspense>
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 9: Tutorials */}
                            {admin.visible_tabs.tutorials ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <LabelPairedGraduationCapCaptionRegularIcon
                                                height='20px'
                                                width='20px'
                                                fill='var(--text-general)'
                                            />
                                            <Localize i18n_default_text='Tutorials' />
                                        </div>
                                    }
                                    id='id-tutorials'
                                >
                                    <PageContentWrapper>
                                        <Suspense fallback={<ChunkLoader message={localize('Loading...')} />}>
                                            <Tutorials handleTabChange={handleTabChange} />
                                        </Suspense>
                                    </PageContentWrapper>
                                </div>
                            ) : null}

                            {/* Tab 10: DTool */}
                            {admin.visible_tabs.dtooltrades ? (
                                <div
                                    label={
                                        <div className='main__tabs-label'>
                                            <span style={{ fontSize: '20px', marginRight: '8px' }}>🛠️</span>
                                            <Localize i18n_default_text='DTool' />
                                        </div>
                                    }
                                    id='id-dtooltrades'
                                >
                                    <Portal type='dtooltrades' />
                                </div>
                            ) : null}
                        </Tabs>
                        {!isDesktop && right_tab_shadow && <span className='tabs-shadow tabs-shadow--right' />}
                    </div>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick || undefined}
                onClose={onCloseDialog || undefined}
                onConfirm={onOkButtonClick || onCloseDialog || (() => {})}
                portal_element_id='modal_root'
                title={title}
                login={handleLoginGeneration}
                dismissable={!!dismissable} // Prevents closing on outside clicks
                is_closed_on_cancel={!!is_closed_on_cancel}
            >
                {message}
            </Dialog>
        </React.Fragment>
    );
});

export default AppWrapper;
