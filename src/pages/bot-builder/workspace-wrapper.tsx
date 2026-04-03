import React from 'react';
import { observer } from 'mobx-react-lite';
import Flyout from '@/components/flyout';
import { useStore } from '@/hooks/useStore';
import { repopulateMarketDropdowns } from '@/external/bot-skeleton/scratch/utils';
import StopBotModal from '../dashboard/stop-bot-modal';
import Toolbar from './toolbar';
import Toolbox from './toolbox';
import './workspace.scss';

const WorkspaceWrapper = observer(() => {
    const { blockly_store } = useStore();
    const { onMount, onUnmount, is_loading } = blockly_store;

    React.useEffect(() => {
        onMount();
        return () => {
            onUnmount();
        };
    }, []);

    const handlePendingLoad = React.useCallback(async () => {
        const pending_xml = localStorage.getItem('profithub_pending_load_xml');
        if (pending_xml && window.Blockly?.derivWorkspace) {
            requestAnimationFrame(async () => {
                try {
                    const xml_dom = window.Blockly.utils.xml.textToDom(pending_xml);
                    window.Blockly.Events.disable();
                    window.Blockly.derivWorkspace.clear();
                    window.Blockly.Xml.domToWorkspace(xml_dom, window.Blockly.derivWorkspace);
                    window.Blockly.Events.enable();
                    
                    // Populate market dropdowns after load
                    await repopulateMarketDropdowns(window.Blockly.derivWorkspace);
                    
                    const should_auto_run = localStorage.getItem('profithub_auto_run') === 'true';
                    localStorage.removeItem('profithub_pending_load_xml');
                    localStorage.removeItem('profithub_auto_run');

                    if (should_auto_run) {
                        const checkAndRun = (retries = 0) => {
                            const root_store = (window as any).root_store;
                            const workspace = window.Blockly?.derivWorkspace;
                            const market_block = workspace?.getAllBlocks().find((b: any) => b.type === 'trade_definition_market');
                            const symbol = market_block?.getFieldValue('SYMBOL_LIST');

                            // Wait for both the store and the symbol list to be ready
                            if (root_store?.run_panel && !root_store.run_panel.is_running && symbol && symbol !== '') {
                                console.log('Profithub AI: Auto-triggering bot run with symbol:', symbol);
                                root_store.run_panel.onRunButtonClick();
                            } else if (retries < 15) {
                                // Retry up to 15 times (7.5s total) if not ready
                                setTimeout(() => checkAndRun(retries + 1), 500);
                            }
                        };
                        setTimeout(() => checkAndRun(), 1500); // Initial 1.5s delay
                    }

                    window.dispatchEvent(new Event('resize'));
                } catch (e) {
                    console.error('Profithub AI: Error loading pending XML', (e as any).message);
                    window.Blockly.Events.enable();
                }
            });
        }
    }, []);

    // Load on mount/is_loading change
    React.useEffect(() => {
        if (!is_loading) {
            handlePendingLoad();
        }
    }, [is_loading, handlePendingLoad]);

    // Fast Load: Listen for immediate load signals from the AI Bot List
    React.useEffect(() => {
        window.addEventListener('profithub_bot_load', handlePendingLoad);
        return () => window.removeEventListener('profithub_bot_load', handlePendingLoad);
    }, [handlePendingLoad]);

    if (is_loading) return null;

    if (window.Blockly?.derivWorkspace)
        return (
            <React.Fragment>
                <Toolbox />
                <Toolbar />
                <Flyout />
                <StopBotModal />
            </React.Fragment>
        );

    return null;
});

export default WorkspaceWrapper;
