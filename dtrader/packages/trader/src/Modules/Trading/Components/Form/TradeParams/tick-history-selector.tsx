import React from 'react';
import { observer } from 'mobx-react-lite';

import { Dropdown } from '@deriv/components';
import { localize } from '@deriv/translations';

import { useTraderStore } from 'Stores/useTraderStores';

type TTickHistorySelector = {
    className?: string;
};

const TickHistorySelector = observer(({ className }: TTickHistorySelector) => {
    const { tick_history_store } = useTraderStore();

    if (!tick_history_store) return null;

    if (!tick_history_store) return null;

    const dropdown_list = tick_history_store.tick_options.map((count: number) => ({
        text: `${count} ${localize('ticks')}`,
        value: count.toString(),
    }));

    return (
        <div className={className}>
            <Dropdown
                classNameDisplay='tick-history-selector__dropdown'
                classNameLabel='tick-history-selector__label'
                label={localize('Stats Period')}
                list={dropdown_list}
                name='tick_history'
                value={tick_history_store.tick_count.toString()}
                onChange={e => {
                    tick_history_store.setTickCount(Number(e.target.value));
                }}
            />
        </div>
    );
});

export default TickHistorySelector;
