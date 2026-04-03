import React, { useState, useMemo } from 'react';
import { localize } from '@deriv-com/translations';
import { Text } from '@deriv-com/ui';
import './ai-bot-builder.scss';
import './components/bot-card.scss';
import BotCard, { BotType } from './components/BotCard';
import classNames from 'classnames';
import botManifest from '@/constants/bot-manifest.json';

type ActiveBotTab = 'Automatic' | 'Hybrid' | 'Official' | 'AI';

const getTradeType = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('even') || lower.includes('odd')) return 'even-odd';
    if (lower.includes('over') || lower.includes('under') || lower.includes('0123') || lower.match(/\b(0|1|2|3|4|5|6|7|8|9)\b/)) return 'over-under';
    if (lower.includes('rise') || lower.includes('fall')) return 'rise-fall';
    if (lower.includes('differ')) return 'differs';
    return 'general';
};

const PARSED_MANIFEST = botManifest.map(bot => ({
    ...bot,
    parsedTradeType: getTradeType(bot.name)
}));


const AIBotBuilder: React.FC<{ handleTabChange: (index: number, is_instant?: boolean) => void }> = ({ handleTabChange }) => {
    const smartLoad = (xml: string) => {
        localStorage.setItem('profithub_pending_load_xml', xml);
        window.dispatchEvent(new Event('profithub_bot_load'));
        handleTabChange(1, true); // True for instant jump
    };

    const loadLocalBot = async (path: string) => {
        try {
            const response = await fetch(path);
            const xml = await response.text();
            smartLoad(xml);
        } catch (error) {
            console.error('Failed to load bot XML', error);
        }
    };

    const [activeTab, setActiveTab] = useState<ActiveBotTab>('Automatic');

    const automaticBots = useMemo(() => PARSED_MANIFEST.filter(b => b.category === 'Automatic'), []);
    const hybridBots = useMemo(() => PARSED_MANIFEST.filter(b => b.category === 'Hybrids'), []);
    const officialBots = useMemo(() => PARSED_MANIFEST.filter(b => b.category === 'Official'), []);
    const aiBots = useMemo(() => PARSED_MANIFEST.filter(b => b.category === 'AI Bots'), []);

    const renderGrid = () => {
        let botsToRender: typeof PARSED_MANIFEST = [];
        let cardType: BotType = 'normal';
        if (activeTab === 'Automatic') {
            botsToRender = automaticBots;
            cardType = 'automated';
        } else if (activeTab === 'Hybrid') {
            botsToRender = hybridBots;
            cardType = 'automated';
        } else if (activeTab === 'Official') {
            botsToRender = officialBots;
            cardType = 'normal';
        } else if (activeTab === 'AI') {
            botsToRender = aiBots;
            cardType = 'ai';
        }

        return (
            <div className='trading-bots-dashboard__grid'>
                {botsToRender.map(bot => (
                    <BotCard 
                        key={bot.id}
                        type={cardType}
                        title={bot.name}
                        description={bot.description}
                        tradeType={bot.parsedTradeType}
                        is_builder_entry={cardType === 'ai'}
                        onRun={() => loadLocalBot(bot.path)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className='trading-bots-dashboard'>
            <div className='trading-bots-dashboard__content'>
                {/* Sub-Tabs Menu */}
                <div className='trading-bots-dashboard__subtabs-container'>
                    {(['Automatic', 'Hybrid', 'Official', 'AI'] as ActiveBotTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={classNames('trading-bots-dashboard__subtab', {
                                'trading-bots-dashboard__subtab--active': activeTab === tab
                            })}
                        >
                            {tab === 'AI' ? 'AI Bots' : `${tab} Bots`}
                        </button>
                    ))}
                </div>

                <div className='trading-bots-dashboard__section'>
                    <Text weight='bold' size='sm' className='trading-bots-dashboard__section-title' style={{ marginBottom: '16px', display: 'block', textAlign: 'center' }}>
                        {activeTab === 'AI' ? localize('Featured AI Strategies') : localize(`${activeTab} Trading Bots`)}
                    </Text>
                    {renderGrid()}
                </div>
            </div>
        </div>
    );
};

export default AIBotBuilder;
