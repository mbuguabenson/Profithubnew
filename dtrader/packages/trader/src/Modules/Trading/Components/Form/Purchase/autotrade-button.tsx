import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Icon, Text } from '@deriv/components';
import { localize } from '@deriv/translations';

import { useTraderStore } from 'Stores/useTraderStores';

import AutoTradeModal from './autotrade-modal';

const AutoTradeButton = observer(() => {
    const { autotrade_store } = useTraderStore();
    const [is_modal_open, setIsModalOpen] = React.useState(false);

    if (!autotrade_store) return null;

    const toggleModal = () => setIsModalOpen(!is_modal_open);

    return (
        <>
            <Button className='autotrade-button' onClick={toggleModal} has_effect>
                <div className='autotrade-button__content'>
                    <Icon
                        icon={autotrade_store.is_running ? 'IcPause' : 'IcPlay'}
                        className='autotrade-button__icon'
                        color={autotrade_store.is_running ? 'red' : 'green'}
                    />
                    <Text size='s' weight='bold' color='colored-background'>
                        {autotrade_store.is_running ? localize('Stop AI Trade') : localize('Smart AutoTrade')}
                    </Text>
                </div>
            </Button>
            <AutoTradeModal is_open={is_modal_open} toggleModal={toggleModal} />
        </>
    );
});

export default AutoTradeButton;
