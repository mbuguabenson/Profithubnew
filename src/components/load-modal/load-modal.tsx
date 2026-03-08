import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { tabs_title } from '@/constants/load-modal';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { rudderStackSendSwitchLoadStrategyTabEvent } from '../../analytics/rudderstack-bot-builder';
import { rudderStackSendCloseEvent } from '../../analytics/rudderstack-common-events';
import { LOAD_MODAL_TABS } from '../../analytics/utils';
import MobileFullPageModal from '../shared_ui/mobile-full-page-modal';
import Modal from '../shared_ui/modal';
import Tabs from '../shared_ui/tabs';
import GoogleDrive from './google-drive';
import Local from './local';
import LocalFooter from './local-footer';
import Recent from './recent';
import RecentFooter from './recent-footer';

const LoadModal: React.FC = observer(() => {
    const { load_modal, dashboard } = useStore();
    const {
        active_index,
        is_load_modal_open,
        loaded_local_file,
        onEntered,
        recent_strategies,
        setActiveTabIndex,
        toggleLoadModal,
        tab_name,
    } = load_modal;
    const { setPreviewOnPopup } = dashboard;
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const header_text = localize('Load strategy');

    const historyShim = {
        replace: (path: string) => navigate(path, { replace: true }),
        location,
    };

    const handleTabItemClick = (idx: number) => {
        setActiveTabIndex(idx);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rudderStackSendSwitchLoadStrategyTabEvent({
            load_strategy_tab: LOAD_MODAL_TABS[idx + (!isDesktop ? 1 : 0)],
        } as any);
    };

    if (!isDesktop) {
        const is_file_loaded_mobile = !!loaded_local_file && tab_name === tabs_title.TAB_LOCAL;

        return (
            <MobileFullPageModal
                is_modal_open={is_load_modal_open}
                className='load-strategy__wrapper'
                header={header_text}
                onClickClose={() => {
                    setPreviewOnPopup(false);
                    toggleLoadModal();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    rudderStackSendCloseEvent({
                        subform_name: 'load_strategy',
                        load_strategy_tab: LOAD_MODAL_TABS[active_index + 1],
                    } as any);
                }}
                height_offset='80px'
                renderPageFooterChildren={is_file_loaded_mobile ? () => <LocalFooter /> : undefined}
            >
                <Tabs
                    active_index={active_index}
                    onTabItemClick={handleTabItemClick}
                    top
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    history={historyShim as any}
                >
                    <div label={localize('Local')}>
                        <Local />
                    </div>
                    <div label='Google Drive'>
                        <GoogleDrive />
                    </div>
                </Tabs>
            </MobileFullPageModal>
        );
    }

    const is_file_loaded = !!loaded_local_file && tab_name === tabs_title.TAB_LOCAL;
    const has_recent_strategies = recent_strategies.length > 0 && tab_name === tabs_title.TAB_RECENT;

    return (
        <Modal
            title={header_text}
            className='load-strategy'
            width='1000px'
            height='80vh'
            is_open={is_load_modal_open}
            toggleModal={() => {
                toggleLoadModal();
                if (LOAD_MODAL_TABS[active_index]) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    rudderStackSendCloseEvent({
                        subform_name: 'load_strategy',
                        load_strategy_tab: LOAD_MODAL_TABS[active_index],
                    } as any);
                }
            }}
            onEntered={onEntered}
            elements_to_ignore={[document.activeElement].filter(Boolean) as HTMLElement[]}
        >
            <Modal.Body>
                <Tabs
                    active_index={active_index}
                    onTabItemClick={handleTabItemClick}
                    top
                    header_fit_content
                    history={historyShim as any}
                >
                    <div label={localize('Recent')}>
                        <Recent />
                    </div>
                    <div label={localize('Local')}>
                        <Local />
                    </div>
                    <div label='Google Drive'>
                        <GoogleDrive />
                    </div>
                </Tabs>
            </Modal.Body>
            {has_recent_strategies && (
                <Modal.Footer has_separator>
                    <RecentFooter />
                </Modal.Footer>
            )}
            {is_file_loaded && (
                <Modal.Footer has_separator>
                    <LocalFooter />
                </Modal.Footer>
            )}
        </Modal>
    );
});

export default LoadModal;
