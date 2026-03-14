import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useFreeBots } from '@/hooks/use-free-bots';
import { useStore } from '@/hooks/useStore';
import { TDigitStat } from '@/stores/analysis-store';
import './free-bots-tab.scss';

const LiveMarketAnalysis = observer(() => {
    const { analysis } = useStore();
    const { digit_stats, last_digit, current_price, symbol, markets, is_subscribing } = analysis;

    useEffect(() => {
        analysis.fetchMarkets();
        analysis.subscribeToTicks();
        return () => {
            analysis.unsubscribeFromTicks();
        };
    }, [analysis]);

    const handleMarketChange = (newSymbol: string) => {
        analysis.setSymbol(newSymbol);
    };

    const availableMarkets = markets.flatMap(group => group.items);

    return (
        <div className='live-analysis-card'>
            <div className='analysis-header'>
                <div className='title-area'>
                    <h3>Neural Market Feed</h3>
                    <div className='live-pulse'>
                        <span className='pulse-dot' />
                        LIVE
                    </div>
                </div>
                <div className='market-selector-wrapper'>
                    <select
                        value={symbol}
                        onChange={e => handleMarketChange(e.target.value)}
                        className='nexus-select'
                        disabled={is_subscribing}
                    >
                        {availableMarkets.map(m => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='analysis-stats'>
                <div className='stat-item price'>
                    <span className='label'>SPOT PRICE</span>
                    <span className='value'>{is_subscribing ? 'SYNCHRONIZING...' : current_price}</span>
                </div>
                <div className='stat-item digit'>
                    <span className='label'>LAST DIGIT</span>
                    <span className={`value digit-val ${last_digit !== null && last_digit % 2 === 0 ? 'even' : 'odd'}`}>
                        {is_subscribing ? '--' : last_digit}
                    </span>
                </div>
            </div>

            <div className='digit-distribution'>
                <span className='dist-label'>Digit Frequency (Last 1000 Ticks)</span>
                <div className='dist-grid'>
                    {digit_stats.map((stat: TDigitStat) => (
                        <div
                            key={stat.digit}
                            className={`dist-bar-wrapper ${stat.digit === last_digit ? 'active' : ''}`}
                        >
                            <div className='dist-bar-meta'>
                                <span className='digit-num'>{stat.digit}</span>
                                <span className='digit-pct'>{stat.percentage.toFixed(1)}%</span>
                            </div>
                            <div className='dist-bar-outer'>
                                <div
                                    className='dist-bar-inner'
                                    style={
                                        {
                                            '--bar-height': `${Math.min(stat.percentage * 5, 100)}%`,
                                            background:
                                                stat.digit === last_digit
                                                    ? '#fff'
                                                    : stat.digit % 2 === 0
                                                      ? '#3b82f6'
                                                      : '#ec4899',
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const BotCard = ({ bot, onLoad }: { bot: any; onLoad: (bot: any) => void }) => {
    // Convert hex to rgb for CSS variable
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '124, 58, 237';
    };

    const rgbColor = hexToRgb(bot.color);

    return (
        <div
            className='bot-card'
            style={
                {
                    '--bot-color': bot.color,
                    '--bot-color-rgb': rgbColor,
                } as React.CSSProperties
            }
        >
            <div className='bot-card__top'>
                <div className='bot-card__icon'>
                    {bot.category === 'Automatic' ? '🤖' : bot.category === 'Hybrid' ? '⚡' : '🛡️'}
                </div>
                {bot.isPremium && <span className='bot-card__badge'>Premium</span>}
            </div>

            <div className='bot-card__body'>
                <h3 className='bot-card__title'>{bot.name}</h3>
                <p className='bot-card__tagline'>{bot.category} Algotrade • High Accuracy</p>
                <p className='bot-card__description'>{bot.description}</p>

                <div className='bot-card__stats'>
                    <div className='stat'>
                        <span className='stat__label'>Win Rate</span>
                        <span className='stat__value'>~85%</span>
                    </div>
                    <div className='stat'>
                        <span className='stat__label'>Risk Level</span>
                        <span className='stat__value'>Moderate</span>
                    </div>
                </div>
            </div>

            <div className='bot-card__footer'>
                <button className='bot-card__btn' onClick={() => onLoad(bot)}>
                    Deploy Strategy
                </button>
            </div>
        </div>
    );
};

const FreeBotsTab = observer(() => {
    const { selectedCategory, setSelectedCategory, categories, filteredBots, loadBotToBuilder, isLoading } =
        useFreeBots();

    const { ui } = useStore();
    const { is_dark_mode_on } = ui;

    return (
        <div className={`free-bots-tab ${is_dark_mode_on ? 'free-bots-tab--dark' : 'free-bots-tab--light'}`}>
            <LiveMarketAnalysis />

            <div className='free-bots-tab__categories'>
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-btn category-btn--${category} ${selectedCategory === category ? 'category-btn--active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className='free-bots-tab__grid'>
                {filteredBots.map(bot => (
                    <BotCard key={bot.id} bot={bot} onLoad={loadBotToBuilder} />
                ))}
            </div>

            {isLoading && (
                <div className='loading-overlay'>
                    <div className='spinner-box'>
                        <div className='circle' />
                        <div className='circle-inner' />
                        <span className='logo-center'>🧠</span>
                    </div>
                    <p>Syncing Neural Link...</p>
                </div>
            )}
        </div>
    );
});

export default FreeBotsTab;
