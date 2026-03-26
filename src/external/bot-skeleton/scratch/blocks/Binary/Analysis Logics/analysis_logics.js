import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

const getBlockDefinition = (message, args, output, category = window.Blockly.Categories.Tick_Analysis) => ({
    message0: message,
    args0: args,
    output,
    outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
    colour: window.Blockly.Colours.Base.colour,
    colourSecondary: window.Blockly.Colours.Base.colourSecondary,
    colourTertiary: window.Blockly.Colours.Base.colourTertiary,
    category,
});

const registerBlock = (name, message, args, output, generator) => {
    window.Blockly.Blocks[name] = {
        init() {
            this.jsonInit(getBlockDefinition(message, args, output));
        },
        meta() {
            return {
                display_name: localize(name.replace(/_/g, ' ')),
                description: localize(`${name} logic block`),
            };
        },
        customContextMenu(menu) {
            modifyContextMenu(menu);
        },
    };
    window.Blockly.JavaScript.javascriptGenerator.forBlock[name] = generator;
};

// 1. Analysis Power
registerBlock(
    'analysis_get_power',
    localize('Analysis Power %1'),
    [
        {
            type: 'field_dropdown',
            name: 'TARGET',
            options: [
                [localize('Even'), 'EVEN'],
                [localize('Odd'), 'ODD'],
                [localize('Over'), 'OVER'],
                [localize('Under'), 'UNDER'],
            ],
        },
    ],
    'Number',
    block => {
        const target = block.getFieldValue('TARGET');
        return [`Bot.getAnalysisPower('${target}')`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 2. Analysis Increasing
registerBlock(
    'analysis_increasing',
    localize('Analysis Increasing %1'),
    [
        {
            type: 'field_dropdown',
            name: 'TARGET',
            options: [
                [localize('Even'), 'EVEN'],
                [localize('Odd'), 'ODD'],
                [localize('Over'), 'OVER'],
                [localize('Under'), 'UNDER'],
            ],
        },
    ],
    'Boolean',
    block => {
        const target = block.getFieldValue('TARGET');
        return [`Bot.isAnalysisIncreasing('${target}')`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 3. Digit Frequency
registerBlock(
    'analysis_digit_frequency',
    localize('Digit %1 Frequency in last %2 ticks (%%)'),
    [
        { type: 'input_value', name: 'DIGIT', check: 'Number' },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const digit =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'DIGIT',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '0';
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [`Bot.digitFrequency(${digit}, ${ticks})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 4. Streak Detect
registerBlock(
    'analysis_streak_detect',
    localize('Detect %1 streak of %2 in last %3 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'PATTERN',
            options: [
                [localize('Consecutive'), 'consecutive'],
                [localize('Alternating'), 'alternating'],
            ],
        },
        {
            type: 'field_dropdown',
            name: 'VALUE',
            options: [
                [localize('Even'), 'even'],
                [localize('Odd'), 'odd'],
                [localize('Over 5'), 'over5'],
                [localize('Under 5'), 'under5'],
            ],
        },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const pattern = block.getFieldValue('PATTERN');
        const value = block.getFieldValue('VALUE');
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.detectStreak('${pattern}', '${value}', ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 5. Range Count
registerBlock(
    'analysis_range_count',
    localize('Count digits from %1 to %2 in last %3 ticks'),
    [
        { type: 'input_value', name: 'MIN', check: 'Number' },
        { type: 'input_value', name: 'MAX', check: 'Number' },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const min =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'MIN',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '0';
        const max =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'MAX',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '9';
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.countDigitsInRange(${min}, ${max}, ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 6. Volatility
registerBlock(
    'analysis_volatility',
    localize('Market Volatility in last %1 ticks'),
    [{ type: 'input_value', name: 'TICKS', check: 'Number' }],
    'Number',
    block => {
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [`Bot.calculateVolatility(${ticks})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 7. Trend
registerBlock(
    'analysis_trend',
    localize('Market Trend (by %1) in last %2 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
                [localize('Digit Sum'), 'sum'],
                [localize('Even/Odd Ratio'), 'evenodd'],
            ],
        },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'String',
    block => {
        const type = block.getFieldValue('TYPE');
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [`Bot.analyzeTrend('${type}', ${ticks})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 8. Digit Rank
registerBlock(
    'analysis_digit_rank',
    localize('Rank %1 digit in last %2 ticks'),
    [
        { type: 'input_value', name: 'RANK', check: 'Number' },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const rank =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'RANK',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '1';
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [`Bot.getDigitByRank(${rank}, ${ticks})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 9. Candle Pattern
registerBlock(
    'analysis_candle_pattern',
    localize('Identify Candle Pattern (last %1 candles)'),
    [{ type: 'input_value', name: 'COUNT', check: 'Number' }],
    'String',
    block => {
        const count =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'COUNT',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '1';
        return [`Bot.identifyCandlePattern(${count})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 10. Momentum
registerBlock(
    'analysis_momentum',
    localize('Market Momentum (last %1 ticks)'),
    [{ type: 'input_value', name: 'TICKS', check: 'Number' }],
    'String',
    block => {
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [`Bot.analyzeMomentum(${ticks})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 11. Volume Health
registerBlock(
    'analysis_volume_health',
    localize('Market Volume Health (last %1 ticks)'),
    [{ type: 'input_value', name: 'TICKS', check: 'Number' }],
    'String',
    block => {
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [`Bot.checkVolumeHealth(${ticks})`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 12. Last Digits Cond
registerBlock(
    'analysis_last_digits_cond',
    localize('Last %1 Digits: %2 %3'),
    [
        { type: 'input_value', name: 'COUNT', check: 'Number' },
        {
            type: 'field_dropdown',
            name: 'CONDITION',
            options: [
                [localize('equals'), 'eq'],
                [localize('greater than'), 'gt'],
                [localize('less than'), 'lt'],
                [localize('not equal to'), 'neq'],
            ],
        },
        { type: 'input_value', name: 'DIGIT', check: 'Number' },
    ],
    'Boolean',
    block => {
        const count =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'COUNT',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '1';
        const condition = block.getFieldValue('CONDITION');
        const digit =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'DIGIT',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '0';
        return [
            `Bot.getLastDigitsCondition(${count}, '${condition}', ${digit})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 13. Digit Ranking
registerBlock(
    'analysis_digit_ranking',
    localize('Get %1 frequent digit in last %2 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'RANK',
            options: [
                [localize('Most'), 'most'],
                [localize('Least'), 'least'],
            ],
        },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const rank = block.getFieldValue('RANK');
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.getDigitFrequencyRanking('${rank}', ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 14. Even/Odd Percent
registerBlock(
    'analysis_even_odd_percent',
    localize('%1 percentage in last %2 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
                [localize('Even'), 'even'],
                [localize('Odd'), 'odd'],
            ],
        },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const type = block.getFieldValue('TYPE');
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.getEvenOddPercent('${type}', ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 15. Over/Under Percent
registerBlock(
    'analysis_over_under_percent',
    localize('%1 %2 percentage in last %3 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
                [localize('Over'), 'over'],
                [localize('Under'), 'under'],
            ],
        },
        { type: 'input_value', name: 'THRESHOLD', check: 'Number' },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const type = block.getFieldValue('TYPE');
        const threshold =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'THRESHOLD',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '4';
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.getOverUnderPercent('${type}', ${threshold}, ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 16. Match/Differ Percent
registerBlock(
    'analysis_match_differ_percent',
    localize('%1 %2 percentage in last %3 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
                [localize('Match'), 'match'],
                [localize('Differ'), 'differ'],
            ],
        },
        { type: 'input_value', name: 'TARGET', check: 'Number' },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const type = block.getFieldValue('TYPE');
        const target =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TARGET',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '0';
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.getMatchDifferPercent('${type}', ${target}, ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 17. Rise/Fall Percent
registerBlock(
    'analysis_rise_fall_percent',
    localize('%1 percentage in last %2 ticks'),
    [
        {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
                [localize('Rise'), 'rise'],
                [localize('Fall'), 'fall'],
            ],
        },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Number',
    block => {
        const type = block.getFieldValue('TYPE');
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.getRiseFallPercent('${type}', ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 18. Ticks Direction
registerBlock(
    'analysis_ticks_direction',
    localize('Last %1 ticks are %2'),
    [
        { type: 'input_value', name: 'COUNT', check: 'Number' },
        {
            type: 'field_dropdown',
            name: 'DIRECTION',
            options: [
                [localize('Rising'), 'rise'],
                [localize('Falling'), 'fall'],
            ],
        },
    ],
    'Boolean',
    block => {
        const count =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'COUNT',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '3';
        const direction = block.getFieldValue('DIRECTION');
        return [
            `Bot.getTicksDirection(${count}, '${direction}')`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 19. Candle Color
registerBlock(
    'analysis_candle_color',
    localize('Last Candle is %1'),
    [
        {
            type: 'field_dropdown',
            name: 'COLOR',
            options: [
                [localize('Green (Bullish)'), 'green'],
                [localize('Red (Bearish)'), 'red'],
            ],
        },
    ],
    'Boolean',
    block => {
        const color = block.getFieldValue('COLOR');
        return [`Bot.checkCandleColor('${color}')`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 20. Candle Type
registerBlock(
    'analysis_candle_type',
    localize('Last Candle is %1'),
    [
        {
            type: 'field_dropdown',
            name: 'TYPE',
            options: [
                [localize('Doji'), 'doji'],
                [localize('Marubozu'), 'marubozu'],
                [localize('Neutral'), 'neutral'],
            ],
        },
    ],
    'Boolean',
    block => {
        const type = block.getFieldValue('TYPE');
        return [`Bot.checkCandleType('${type}')`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 21. Candle Behavior
registerBlock(
    'analysis_candle_behavior',
    localize('Last Candle is %1'),
    [
        {
            type: 'field_dropdown',
            name: 'BEHAVIOR',
            options: [
                [localize('Volatile'), 'volatile'],
                [localize('Strong'), 'strong'],
            ],
        },
    ],
    'Boolean',
    block => {
        const behavior = block.getFieldValue('BEHAVIOR');
        return [`Bot.checkCandleBehavior('${behavior}')`, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
    }
);

// 22. Candle Movement
registerBlock(
    'analysis_candle_movement',
    localize('Last Candle Movement is %1 (based on %2 ticks)'),
    [
        {
            type: 'field_dropdown',
            name: 'MOVEMENT',
            options: [
                [localize('Bullish'), 'bullish'],
                [localize('Bearish'), 'bearish'],
                [localize('Flat'), 'flat'],
            ],
        },
        { type: 'input_value', name: 'TICKS', check: 'Number' },
    ],
    'Boolean',
    block => {
        const movement = block.getFieldValue('MOVEMENT');
        const ticks =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'TICKS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '10';
        return [
            `Bot.checkCandleMovement('${movement}', ${ticks})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);

// 23. Market Trend
registerBlock(
    'analysis_market_trend',
    localize('Market Trend is %1 (last %2 periods)'),
    [
        {
            type: 'field_dropdown',
            name: 'TREND',
            options: [
                [localize('Bullish'), 'bullish'],
                [localize('Bearish'), 'bearish'],
                [localize('Flat'), 'flat'],
            ],
        },
        { type: 'input_value', name: 'PERIODS', check: 'Number' },
    ],
    'Boolean',
    block => {
        const trend = block.getFieldValue('TREND');
        const periods =
            window.Blockly.JavaScript.javascriptGenerator.valueToCode(
                block,
                'PERIODS',
                window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
            ) || '100';
        return [
            `Bot.checkMarketTrend('${trend}', ${periods})`,
            window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC,
        ];
    }
);
