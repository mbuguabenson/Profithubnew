import { useCallback, useState } from 'react';
import { botNotification } from '@/components/bot-notification/bot-notification';
import { FREE_BOTS_DATA } from '../pages/free-bots/free-bots-data';
import { useStore } from './useStore';

export const useFreeBots = () => {
    const { load_modal, dashboard } = useStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('Automatic');
    const [isLoading, setIsLoading] = useState(false);

    const categories = ['Automatic', 'Hybrid'];

    const filteredBots = FREE_BOTS_DATA.filter(bot => bot.category === selectedCategory);

    const loadBotToBuilder = useCallback(
        async (bot: (typeof FREE_BOTS_DATA)[0]) => {
            setIsLoading(true);
            try {
                // Fetch the XML from the server or local path
                const response = await fetch(encodeURI(bot.xmlPath));
                if (!response.ok) {
                    throw new Error(`Failed to fetch bot XML: ${response.status} ${response.statusText}`);
                }

                const xmlString = await response.text();

                // Validate that we actually got XML content
                if (!xmlString || !xmlString.trim().startsWith('<')) {
                    throw new Error('Invalid XML content received');
                }

                // Parse XML to ensure it's valid before loading
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
                const parseError = xmlDoc.querySelector('parsererror');

                if (parseError) {
                    throw new Error('XML parsing failed: Invalid XML structure');
                }

                const strategy = {
                    id: bot.id,
                    name: bot.name,
                    xml: xmlString,
                    save_type: 'unsaved' as const,
                    timestamp: Date.now(),
                };

                // Navigate to Bot Builder tab first to ensure workspace is mounted
                dashboard.setActiveTab(1);

                // Wait for Blockly workspace to be ready (up to 2 seconds)
                let retries = 0;
                while (!window.Blockly?.derivWorkspace && retries < 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retries++;
                }

                if (!window.Blockly?.derivWorkspace) {
                    throw new Error('Blockly workspace failed to initialize. Please try again.');
                }

                // Load into Blockly workspace via load_modal
                await load_modal.loadStrategyToBuilder(strategy);

                botNotification(`Successfully loaded bot: ${bot.name}`);
                console.log(`Successfully loaded bot: ${bot.name}`);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error loading bot:', error);

                // Show user-friendly notification instead of alert
                botNotification(`Failed to load bot "${bot.name}": ${errorMessage}`, undefined, {
                    type: 'error' as any,
                });
            } finally {
                setIsLoading(false);
            }
        },
        [load_modal, dashboard]
    );

    return {
        selectedCategory,
        setSelectedCategory,
        categories,
        filteredBots,
        loadBotToBuilder,
        isLoading,
    };
};
