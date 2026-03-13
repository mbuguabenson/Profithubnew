import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Checkbox, Dropdown, Icon, InputField, Modal, Tabs, Text } from '@deriv/components';
import { localize } from '@deriv/translations';

import type { TStrategyType } from 'Stores/Modules/Trading/autotrade-store';
import { useTraderStore } from 'Stores/useTraderStores';

type TAutoTradeModal = {
    is_open: boolean;
    toggleModal: () => void;
};

const AutoTradeModal = observer(({ is_open, toggleModal }: TAutoTradeModal) => {
    const { autotrade_store, tick_history_store, symbol } = useTraderStore();
    const [active_tab_index, setActiveTabIndex] = React.useState(0);

    const strategy_list = [
        { text: localize('Differs'), value: 'differs' as TStrategyType },
        { text: localize('Over/Under'), value: 'over_under' as TStrategyType },
        { text: localize('Even/Odd'), value: 'even_odd' as TStrategyType },
    ];

    const renderBasicSettings = () => (
        <div className='autotrade-modal__tab-content'>
            <Dropdown
                label={localize('Strategy')}
                list={strategy_list}
                value={autotrade_store.config.strategy_type}
                onChange={(e: { target: { name: string; value: string } }) => {
                    autotrade_store.setConfig({ strategy_type: e.target.value as TStrategyType });
                }}
            />

            <InputField
                type='number'
                label={localize('Stake')}
                value={`${autotrade_store.config.stake}`}
                onChange={e => {
                    autotrade_store.setConfig({ stake: parseFloat(e.target.value as unknown as string) || 0 });
                }}
            />

            <InputField
                type='number'
                label={localize('Ticks Duration')}
                value={`${autotrade_store.config.ticks_duration}`}
                onChange={e => {
                    autotrade_store.setConfig({ ticks_duration: parseInt(e.target.value as unknown as string) || 1 });
                }}
            />

            <InputField
                type='number'
                label={localize('Bulk Trading Count')}
                value={`${autotrade_store.config.bulk_count}`}
                onChange={e => {
                    autotrade_store.setConfig({ bulk_count: parseInt(e.target.value as unknown as string) || 1 });
                }}
            />
        </div>
    );

    const renderRiskManagement = () => (
        <div className='autotrade-modal__tab-content'>
            <Checkbox
                label={localize('Enable Martingale')}
                value={autotrade_store.config.martingale_enabled}
                onChange={() => {
                    autotrade_store.setConfig({ martingale_enabled: !autotrade_store.config.martingale_enabled });
                }}
            />

            {autotrade_store.config.martingale_enabled && (
                <InputField
                    type='number'
                    label={localize('Martingale Multiplier')}
                    value={`${autotrade_store.config.martingale_multiplier}`}
                    onChange={e => {
                        autotrade_store.setConfig({
                            martingale_multiplier: parseFloat(e.target.value as unknown as string) || 2,
                        });
                    }}
                />
            )}

            <InputField
                type='number'
                label={localize('Take Profit')}
                value={`${autotrade_store.config.take_profit}`}
                onChange={e => {
                    autotrade_store.setConfig({ take_profit: parseFloat(e.target.value as unknown as string) || 0 });
                }}
            />

            <InputField
                type='number'
                label={localize('Stop Loss')}
                value={`${autotrade_store.config.stop_loss}`}
                onChange={e => {
                    autotrade_store.setConfig({ stop_loss: parseFloat(e.target.value as unknown as string) || 0 });
                }}
            />

            <Checkbox
                label={localize('Auto Restart')}
                value={autotrade_store.config.auto_restart}
                onChange={() => {
                    autotrade_store.setConfig({ auto_restart: !autotrade_store.config.auto_restart });
                }}
            />
        </div>
    );

    const renderStrategyInfo = () => {
        let strategy_description = '';

        switch (autotrade_store.config.strategy_type) {
            case 'differs':
                strategy_description = localize(
                    'Auto Differs Strategy: Selects digits 2-7 with <10% appearance. Trades when selected digit trend is stable/decreasing and entry point is reached.'
                );
                break;
            case 'over_under':
                strategy_description = localize(
                    'Over/Under Strategy: Analyzes Under (0-4) vs Over (5-9) ranges. Trades at 55%+ concentration with trend confirmation.'
                );
                break;
            case 'even_odd':
                strategy_description = localize(
                    'Even/Odd Strategy: Requires 55%+ parity concentration. Enters on signal confirmation of trend.'
                );
                break;
            default:
                break;
        }

        const getStatusClass = () => {
            if (autotrade_store.market_status === 'trade') return 'autotrade-modal__market-status--trade';
            if (autotrade_store.market_status === 'wait') return 'autotrade-modal__market-status--wait';
            if (autotrade_store.market_status === 'unstable') return 'autotrade-modal__market-status--unstable';
            return '';
        };

        const getStatusText = () => {
            if (autotrade_store.market_status === 'trade') return localize('TRADE SIGNAL ACTIVE');
            if (autotrade_store.market_status === 'wait') return localize('WAITING FOR SIGNAL...');
            if (autotrade_store.market_status === 'unstable') return localize('UNSTABLE MARKET');
            return localize('MONITORING...');
        };

        return (
            <div className='autotrade-modal__tab-content'>
                <div className='autotrade-modal__strategy-desc'>
                    <Text as='p' size='xs'>
                        {strategy_description}
                    </Text>
                </div>

                <div className={`autotrade-modal__market-status ${getStatusClass()}`}>
                    <Text as='p' weight='bold' size='s'>
                        {localize('Market Intelligence:')}
                    </Text>
                    <Text as='p' size='s' className='autotrade-modal__status-text'>
                        {getStatusText()}
                    </Text>
                </div>
            </div>
        );
    };

    const renderAdvanced = () => (
        <div className='autotrade-modal__tab-content'>
            <Checkbox
                label={localize('Speed Execution (High Frequency)')}
                value={autotrade_store.config.speed_execution}
                onChange={() => {
                    autotrade_store.setConfig({ speed_execution: !autotrade_store.config.speed_execution });
                }}
            />

            <InputField
                type='number'
                label={localize('Max Trades Per Hour')}
                value={`${autotrade_store.config.max_trades_per_hour}`}
                onChange={e => {
                    autotrade_store.setConfig({
                        max_trades_per_hour: parseInt(e.target.value as unknown as string) || 100,
                    });
                }}
            />

            <div className='autotrade-modal__warning'>
                <Icon icon='IcAlertDanger' />
                <Text as='p' size='xxs'>
                    {localize('AutoTrade executes real trades. High risk of loss if strategies fail. Monitor closely.')}
                </Text>
            </div>
        </div>
    );

    const handleStart = () => {
        autotrade_store.startAutoTrade(symbol, tick_history_store.tick_count);
        toggleModal();
    };

    return (
        <Modal
            is_open={is_open}
            title={localize('AutoTrade Dashboard')}
            toggleModal={toggleModal}
            has_close_icon
            width='550px'
            className='autotrade-modal-container'
        >
            <div className='autotrade-modal'>
                <Tabs active_index={active_tab_index} onTabItemClick={setActiveTabIndex} top>
                    <div label={localize('Strategy')}>{renderBasicSettings()}</div>
                    <div label={localize('Risk')}>{renderRiskManagement()}</div>
                    <div label={localize('Intelligence')}>{renderStrategyInfo()}</div>
                    <div label={localize('Performance')}>{renderAdvanced()}</div>
                </Tabs>

                <div className='autotrade-modal__footer'>
                    <Button text={localize('Cancel')} onClick={toggleModal} secondary large />
                    <Button
                        text={localize('Initialize AutoTrade')}
                        onClick={handleStart}
                        primary
                        large
                        className='autotrade-modal__start-btn'
                    />
                </div>
            </div>
        </Modal>
    );
});

export default AutoTradeModal;
