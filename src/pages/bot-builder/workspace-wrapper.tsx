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
                    
                    localStorage.removeItem('profithub_pending_load_xml');
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
