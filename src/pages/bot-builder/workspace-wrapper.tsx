import React from 'react';
import { observer } from 'mobx-react-lite';
import Flyout from '@/components/flyout';
import { useStore } from '@/hooks/useStore';
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

    // Profithub AI Strategy Loader
    React.useEffect(() => {
        if (!is_loading && window.Blockly?.derivWorkspace) {
            const pending_xml = localStorage.getItem('profithub_pending_load_xml');
            if (pending_xml) {
                try {
                    const xml_dom = window.Blockly.utils.xml.textToDom(pending_xml);
                    window.Blockly.derivWorkspace.clear();
                    window.Blockly.Xml.domToWorkspace(xml_dom, window.Blockly.derivWorkspace);
                    localStorage.removeItem('profithub_pending_load_xml');
                    
                    // Trigger a resize to ensure blockly layout is correct
                    window.dispatchEvent(new Event('resize'));
                } catch (e) {
                    console.error('Profithub AI: Error loading pending XML', e);
                }
            }
        }
    }, [is_loading]);

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
