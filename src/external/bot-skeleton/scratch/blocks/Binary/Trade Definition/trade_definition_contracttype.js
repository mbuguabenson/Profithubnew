import { localize } from '@deriv-com/translations';
import { config } from '../../../../constants/config';
import { getContractTypeOptions } from '../../../shared';
import { excludeOptionFromContextMenu, modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.trade_definition_contracttype = {
    init() {
        this.jsonInit({
            message0: localize('Contract Type: {{ contract_type }}', { contract_type: '%1' }),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'TYPE_LIST',
                    options: [['', '']],
                },
            ],
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            tooltip: localize(
                'If the contract type is “Both”, then the Purchase Conditions should include both Rise and Fall using the “Conditional Block"'
            ),
            previousStatement: null,
            nextStatement: null,
        });
        this.setMovable(false);
        this.setDeletable(false);
    },
    onchange(event) {
        if (!this.workspace || window.Blockly.derivWorkspace.isFlyoutVisible || this.workspace.isDragging()) {
            return;
        }

        this.enforceLimitations();

        const is_load_event = /^dbot-load/.test(event.group);
        const is_create_event = event.type === window.Blockly.Events.BLOCK_CREATE && event.ids?.includes(this.id);
        const is_drag_event = event.type === window.Blockly.Events.BLOCK_DRAG && !event.isStart;
        const is_trade_type_change =
            event.type === window.Blockly.Events.BLOCK_CHANGE && event.name === 'TRADETYPE_LIST';

        const shouldRefreshContractTypes = is_create_event || is_drag_event || is_trade_type_change;

        if (shouldRefreshContractTypes) {
            // Get the current trade type from the sibling tradetype block
            const trade_definition_block = this.workspace
                .getAllBlocks(true)
                .find(block => block.type === 'trade_definition');

            let trade_type = event.name === 'TRADETYPE_LIST' ? event.newValue : null;

            if (!trade_type && trade_definition_block) {
                const trade_type_block = trade_definition_block.getChildByType('trade_definition_tradetype');
                if (trade_type_block) {
                    trade_type = trade_type_block.getFieldValue('TRADETYPE_LIST');
                }
            }

            if (!trade_type) return;

            const contract_type_list = this.getField('TYPE_LIST');
            const contract_type_options = [];

            const trade_types = getContractTypeOptions('both', trade_type);

            if (trade_types.length > 1) {
                contract_type_options.push([localize('Both'), 'both']);
            }

            contract_type_options.push(...trade_types);

            if (contract_type_options.length === 0) {
                contract_type_options.push(...config().NOT_AVAILABLE_DROPDOWN_OPTIONS);
            }

            contract_type_list.updateOptions(contract_type_options, {
                event_group: event.group,
                default_value: is_load_event ? contract_type_list.getValue() : undefined,
            });
        }
    },
    customContextMenu(menu) {
        const menu_items = [localize('Enable Block'), localize('Disable Block')];
        excludeOptionFromContextMenu(menu, menu_items);
        modifyContextMenu(menu);
    },
    enforceLimitations: window.Blockly.Blocks.trade_definition_market.enforceLimitations,
};
window.Blockly.JavaScript.javascriptGenerator.forBlock.trade_definition_contracttype = () => '';
