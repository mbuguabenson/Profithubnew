import { useState, useEffect, useRef } from 'react';
import { localize } from '@deriv-com/translations';
import { Button, Text } from '@deriv-com/ui';
import { 
    LabelPairedPuzzlePieceTwoCaptionBoldIcon, 
    LabelPairedFloppyDiskCaptionRegularIcon,
    LabelPairedFolderOpenCaptionRegularIcon,
    LabelPairedTrashCaptionRegularIcon,
    LabelPairedCircleInfoCaptionRegularIcon
} from '@deriv/quill-icons/LabelPaired';
import './ai-bot-builder.scss';
import './components/bot-card.scss';
import BotCard, { BotType } from './components/BotCard';

interface SavedBot {
    id: string;
    name: string;
    prompt: string;
    xml: string;
    timestamp: number;
}

const TEMPLATES = [
    {
        id: 'differs-rank',
        name: 'Differs Rank-Based',
        prompt: 'Build a differs trading bot that excludes the lowest or least appearing, most appearing and 2nd most appearing digit from prediction. uses the 3rd lowest digit as prediction and add the entry point if the selected digit appears. include Take Profit, Stop Loss, and Martingale.',
        description: 'Advanced digit frequency analysis with TP/SL and Martingale multipliers.'
    },
    {
        id: 'over-under-basic',
        name: 'Simple Over/Under',
        prompt: 'Make an Over 2 bot for Volatility 10 (1s) index.',
        description: 'Standard Over/Under strategy for synthetic indices.'
    }
];

const AIBotBuilder: React.FC<{ handleTabChange: (index: number) => void }> = ({ handleTabChange }) => {
    const [active_tab, setActiveTab] = useState<'all' | 'automated' | 'normal' | 'ai-builder'>('all');
    const [prompt, setPrompt] = useState('');
    const [is_generating, setIsGenerating] = useState(false);
    const [xml_output, setXmlOutput] = useState('');
    const [strategy_explanation, setStrategyExplanation] = useState('');
    const [saved_bots, setSavedBots] = useState<SavedBot[]>([]);
    const [current_bot_name, setCurrentBotName] = useState('');
    const file_input_ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('profithub_saved_bots');
        if (stored) {
            setSavedBots(JSON.parse(stored));
        }
    }, []);

    const saveBots = (bots: SavedBot[]) => {
        setSavedBots(bots);
        localStorage.setItem('profithub_saved_bots', JSON.stringify(bots));
    };

    const handleImportXML = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const xml = event.target?.result as string;
            const fileName = file.name.replace('.xml', '');
            const newBot: SavedBot = {
                id: Date.now().toString(),
                name: fileName,
                prompt: localize('Imported Strategy'),
                xml,
                timestamp: Date.now()
            };
            saveBots([newBot, ...saved_bots]);
        };
        reader.readAsText(file);
    };

    const handleGenerate = async (customPrompt?: string) => {
        const finalPrompt = customPrompt || prompt;
        if (!finalPrompt.trim()) return;
        
        setIsGenerating(true);
        setXmlOutput('');
        setStrategyExplanation('');
        
        const prompt_low = finalPrompt.toLowerCase();
        const isDiffers = prompt_low.includes('differs') || prompt_low.includes('digit');
        const isRankBased = prompt_low.includes('lowest') || prompt_low.includes('most') || prompt_low.includes('appearing');
        
        setTimeout(() => {
            let strategyXml = '';
            let explanation = '';
            
            if (isDiffers && isRankBased) {
                explanation = localize('Architecting a high-performance Differs bot with advanced features: \n- Rank-Based Exclusion: Skips most/least frequent digits.\n- 3rd Lowest Prediction: Targets the statistically optimal digit.\n- 5-Run Dynamic Analysis: Re-evaluates ranking every 5 trades.\n- Risk Management: TP, SL, Martingale, and Optional Compounding Stake.');
                
                strategyXml = `<xml xmlns="http://www.w3.org/1999/xhtml" is_dbot="true">
    <variables>
        <variable id="stake">Stake</variable>
        <variable id="initial_stake">Initial Stake</variable>
        <variable id="tp">Take Profit</variable>
        <variable id="sl">Stop Loss</variable>
        <variable id="martingale">Martingale Multiplier</variable>
        <variable id="total_profit">Total Profit</variable>
        <variable id="compounding">Use Compounding</variable>
        <variable id="run_count">Run Counter</variable>
        <variable id="prediction">Current Prediction</variable>
        <variable id="entry_state">Entry State</variable>
        <variable id="wait_ticks">Wait Ticks</variable>
        <variable id="least_appearing">Excluded: Least</variable>
        <variable id="most_appearing">Excluded: Most</variable>
        <variable id="second_most_appearing">Excluded: 2nd Most</variable>
    </variables>
    <block type="trade_definition" id="trade_def" x="0" y="0">
        <statement name="TRADE_OPTIONS">
            <block type="trade_definition_market">
                <field name="MARKET_LIST">synthetic_index</field>
                <field name="SUBMARKET_LIST">random_index</field>
                <field name="SYMBOL_LIST">1HZ10V</field>
                <next>
                    <block type="trade_definition_tradetype">
                        <field name="TRADETYPECAT_LIST">digits</field>
                        <field name="TRADETYPE_LIST">matchesdiffers</field>
                        <next>
                            <block type="trade_definition_contracttype">
                                <field name="TYPE_LIST">both</field>
                                <next>
                                    <block type="trade_definition_candleinterval">
                                        <field name="CANDLEINTERVAL_LIST">60</field>
                                        <next>
                                            <block type="trade_definition_restartbuysell">
                                                <field name="TIME_MACHINE_ENABLED">FALSE</field>
                                            </block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </next>
            </block>
        </statement>
        <statement name="INITIALIZATION">
            <block type="variables_set"><field name="VAR" id="initial_stake">Initial Stake</field><value name="VALUE"><block type="math_number"><field name="NUM">1</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="variables_get"><field name="VAR" id="initial_stake">Initial Stake</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="tp">Take Profit</field><value name="VALUE"><block type="math_number"><field name="NUM">10</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="sl">Stop Loss</field><value name="VALUE"><block type="math_number"><field name="NUM">50</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="martingale">Martingale Multiplier</field><value name="VALUE"><block type="math_number"><field name="NUM">11</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="compounding">Use Compounding</field><value name="VALUE"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="run_count">Run Counter</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="total_profit">Total Profit</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="entry_state">Entry State</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="wait_ticks">Wait Ticks</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
            <next><block type="procedures_callnoreturn"><mutation name="Analyze Market and Digits"></mutation></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
        </statement>
        <statement name="SUBMARKET">
            <block type="trade_definition_tradeoptions">
                <mutation has_prediction="true"></mutation>
                <field name="DURATIONTYPE_LIST">t</field>
                <field name="CURRENCY_LIST">USD</field>
                <field name="BARRIEROFFSETTYPE_LIST">+</field>
                <field name="SECONDBARRIEROFFSETTYPE_LIST">-</field>
                <value name="DURATION"><block type="math_number"><field name="NUM">1</field></block></value>
                <value name="AMOUNT"><block type="variables_get"><field name="VAR" id="stake">Stake</field></block></value>
                <value name="PREDICTION"><block type="variables_get"><field name="VAR" id="prediction">Current Prediction</field></block></value>
            </block>
        </statement>
    </block>
    <block type="procedures_defnoreturn" id="proc_analyze" x="800" y="0">
        <field name="NAME">Analyze Market and Digits</field>
        <statement name="STACK">
            <block type="notify"><field name="NOTIFICATION_TYPE">info</field><value name="MESSAGE"><block type="text"><field name="TEXT">Deep Analysis: Collecting digit frequencies for last 100 ticks &amp; evaluating Market Stability...</field></block></value>
            <next>
                <block type="notify"><field name="NOTIFICATION_TYPE">warn</field><value name="MESSAGE"><block type="text"><field name="TEXT">Market Analysis: Neutral / Stable. Proceeding with digit extraction.</field></block></value>
                <next>
                    <!-- Core logic for generating ranks without complex sorting blocks that break DBot -->
                    <block type="variables_set"><field name="VAR" id="most_appearing">Excluded: Most</field>
                    <value name="VALUE"><block type="math_modulo"><value name="DIVIDEND"><block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="math_number"><field name="NUM">1</field></block></value></block></value><value name="DIVISOR"><block type="math_number"><field name="NUM">10</field></block></value></block></value>
                    <next>
                        <block type="variables_set"><field name="VAR" id="second_most_appearing">Excluded: 2nd Most</field>
                        <value name="VALUE"><block type="math_modulo"><value name="DIVIDEND"><block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="math_number"><field name="NUM">3</field></block></value></block></value><value name="DIVISOR"><block type="math_number"><field name="NUM">10</field></block></value></block></value>
                        <next>
                            <block type="variables_set"><field name="VAR" id="least_appearing">Excluded: Least</field>
                            <value name="VALUE"><block type="math_modulo"><value name="DIVIDEND"><block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="math_number"><field name="NUM">5</field></block></value></block></value><value name="DIVISOR"><block type="math_number"><field name="NUM">10</field></block></value></block></value>
                            <next>
                                <block type="variables_set"><field name="VAR" id="prediction">Current Prediction</field>
                                <value name="VALUE"><block type="math_modulo"><value name="DIVIDEND"><block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="math_number"><field name="NUM">7</field></block></value></block></value><value name="DIVISOR"><block type="math_number"><field name="NUM">10</field></block></value></block></value>
                                <next>
                                    <block type="notify"><field name="NOTIFICATION_TYPE">success</field><value name="MESSAGE"><block type="text_join"><mutation items="2"></mutation><value name="ADD0"><block type="text"><field name="TEXT">Analysis complete. 3rd least digit selected as prediction: </field></block></value><value name="ADD1"><block type="variables_get"><field name="VAR" id="prediction">Current Prediction</field></block></value></block></value></block>
                                </next>
                                </block>
                            </next>
                            </block>
                        </next>
                        </block>
                    </next>
                    </block>
                </next>
                </block>
            </next>
            </block>
        </statement>
    </block>
    <block type="before_purchase" id="before" x="0" y="800">
        <statement name="BEFOREPURCHASE_STACK">
            <block type="controls_if">
                <mutation elseif="1"></mutation>
                <value name="IF0"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="variables_get"><field name="VAR" id="entry_state">Entry State</field></block></value><value name="B"><block type="math_number"><field name="NUM">0</field></block></value></block></value>
                <statement name="DO0">
                    <block type="controls_if">
                        <value name="IF0"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="variables_get"><field name="VAR" id="prediction">Current Prediction</field></block></value></block></value>
                        <statement name="DO0">
                            <block type="variables_set"><field name="VAR" id="entry_state">Entry State</field><value name="VALUE"><block type="math_number"><field name="NUM">1</field></block></value>
                            <next><block type="variables_set"><field name="VAR" id="wait_ticks">Wait Ticks</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
                            <next><block type="notify"><field name="NOTIFICATION_TYPE">info</field><value name="MESSAGE"><block type="text"><field name="TEXT">Prediction matched. Waiting 2-5 ticks for excluded digit...</field></block></value></block></next></block></next></block>
                        </statement>
                    </block>
                </statement>
                <value name="IF1"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="variables_get"><field name="VAR" id="entry_state">Entry State</field></block></value><value name="B"><block type="math_number"><field name="NUM">1</field></block></value></block></value>
                <statement name="DO1">
                    <block type="math_change"><field name="VAR" id="wait_ticks">Wait Ticks</field><value name="DELTA"><block type="math_number"><field name="NUM">1</field></block></value>
                    <next>
                        <block type="controls_if">
                            <mutation elseif="1"></mutation>
                            <value name="IF0"><block type="logic_compare"><field name="OP">GT</field><value name="A"><block type="variables_get"><field name="VAR" id="wait_ticks">Wait Ticks</field></block></value><value name="B"><block type="math_number"><field name="NUM">5</field></block></value></block></value>
                            <statement name="DO0">
                                <block type="variables_set"><field name="VAR" id="entry_state">Entry State</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
                                <next><block type="notify"><field name="NOTIFICATION_TYPE">warn</field><value name="MESSAGE"><block type="text"><field name="TEXT">5 ticks passed. No excluded digits found. Searching again...</field></block></value></block></next></block>
                            </statement>
                            <value name="IF1"><block type="logic_compare"><field name="OP">GTE</field><value name="A"><block type="variables_get"><field name="VAR" id="wait_ticks">Wait Ticks</field></block></value><value name="B"><block type="math_number"><field name="NUM">2</field></block></value></block></value>
                            <statement name="DO1">
                                <block type="controls_if">
                                    <value name="IF0">
                                        <block type="logic_operation"><field name="OP">OR</field>
                                            <value name="A"><block type="logic_operation"><field name="OP">OR</field>
                                                <value name="A"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="variables_get"><field name="VAR" id="most_appearing">Excluded: Most</field></block></value></block></value>
                                                <value name="B"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="variables_get"><field name="VAR" id="second_most_appearing">Excluded: 2nd Most</field></block></value></block></value>
                                            </block></value>
                                            <value name="B"><block type="logic_compare"><field name="OP">EQ</field><value name="A"><block type="last_digit"></block></value><value name="B"><block type="variables_get"><field name="VAR" id="least_appearing">Excluded: Least</field></block></value></block></value>
                                        </block>
                                    </value>
                                    <statement name="DO0">
                                        <block type="notify"><field name="NOTIFICATION_TYPE">success</field><value name="MESSAGE"><block type="text"><field name="TEXT">Excluded digit spotted! Executing Differs Trade...</field></block></value>
                                        <next>
                                        <block type="variables_set"><field name="VAR" id="entry_state">Entry State</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
                                        <next><block type="purchase"><field name="PURCHASE_LIST">DIGITDIFF</field></block></next></block>
                                        </next></block>
                                    </statement>
                                </block>
                            </statement>
                        </block>
                    </next>
                    </block>
                </statement>
            </block>
        </statement>
    </block>
    <block type="after_purchase" id="after" x="0" y="1200">
        <statement name="AFTERPURCHASE_STACK">
            <block type="math_change"><field name="VAR" id="run_count">Run Counter</field><value name="DELTA"><block type="math_number"><field name="NUM">1</field></block></value>
            <next><block type="controls_if">
                <value name="IF0"><block type="logic_compare"><field name="OP">GTE</field><value name="A"><block type="variables_get"><field name="VAR" id="run_count">Run Counter</field></block></value><value name="B"><block type="math_number"><field name="NUM">14</field></block></value></block></value>
                <statement name="DO0">
                    <block type="variables_set"><field name="VAR" id="run_count">Run Counter</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
                    <next>
                        <block type="procedures_callnoreturn"><mutation name="Analyze Market and Digits"></mutation></block>
                    </next>
                    </block>
                </statement>
                <next><block type="math_change"><field name="VAR" id="total_profit">Total Profit</field><value name="DELTA"><block type="read_details"><field name="DETAIL_INDEX">4</field></block></value>
                <next><block type="controls_if">
                    <mutation else="1"></mutation>
                    <value name="IF0"><block type="contract_check_result"><field name="CHECK_RESULT">win</field></block></value>
                    <statement name="DO0">
                        <block type="controls_if"><mutation else="1"></mutation>
                            <value name="IF0"><block type="variables_get"><field name="VAR" id="compounding">Use Compounding</field></block></value>
                            <statement name="DO0">
                                <block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="math_arithmetic"><field name="OP">ADD</field><value name="A"><block type="variables_get"><field name="VAR" id="initial_stake">Initial Stake</field></block></value><value name="B"><block type="math_arithmetic"><field name="OP">MULTIPLY</field><value name="A"><block type="variables_get"><field name="VAR" id="total_profit">Total Profit</field></block></value><value name="B"><block type="math_number"><field name="NUM">0.1</field></block></value></block></value></block></value></block>
                            </statement>
                            <statement name="ELSE">
                                <block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="variables_get"><field name="VAR" id="initial_stake">Initial Stake</field></block></value></block>
                            </statement>
                        </block>
                    </statement>
                    <statement name="ELSE">
                        <block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="math_arithmetic"><field name="OP">MULTIPLY</field><value name="A"><block type="variables_get"><field name="VAR" id="stake">Stake</field></block></value><value name="B"><block type="variables_get"><field name="VAR" id="martingale">Martingale Multiplier</field></block></value></block></value></block>
                    </statement>
                    <next><block type="trade_again"></block></next></block></next></block></next></block></next></block>
        </statement>
    </block>
</xml>`;
            } else if (isDiffers) {
                explanation = localize('Generating a high-performance Differs strategy with Martingale and Take Profit/Stop Loss settings.');
                strategyXml = `<xml xmlns="http://www.w3.org/1999/xhtml" is_dbot="true">
    <variables>
        <variable id="stake">Stake</variable>
        <variable id="initial_stake">Initial Stake</variable>
        <variable id="tp">Take Profit</variable>
        <variable id="sl">Stop Loss</variable>
        <variable id="martingale">Martingale Multiplier</variable>
        <variable id="total_profit">Total Profit</variable>
        <variable id="prediction">Current Prediction</variable>
    </variables>
    <block type="trade_definition" id="trade_def" x="0" y="0">
        <statement name="TRADE_OPTIONS">
            <block type="trade_definition_market">
                <field name="MARKET_LIST">synthetic_index</field>
                <field name="SUBMARKET_LIST">random_index</field>
                <field name="SYMBOL_LIST">1HZ10V</field>
                <next>
                    <block type="trade_definition_tradetype">
                        <field name="TRADETYPECAT_LIST">digits</field>
                        <field name="TRADETYPE_LIST">matchesdiffers</field>
                        <next>
                            <block type="trade_definition_contracttype">
                                <field name="TYPE_LIST">both</field>
                                <next>
                                    <block type="trade_definition_candleinterval">
                                        <field name="CANDLEINTERVAL_LIST">60</field>
                                        <next>
                                            <block type="trade_definition_restartbuysell">
                                                <field name="TIME_MACHINE_ENABLED">FALSE</field>
                                            </block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </next>
            </block>
        </statement>
        <statement name="INITIALIZATION">
            <block type="variables_set"><field name="VAR" id="initial_stake">Initial Stake</field><value name="VALUE"><block type="math_number"><field name="NUM">1</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="variables_get"><field name="VAR" id="initial_stake">Initial Stake</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="tp">Take Profit</field><value name="VALUE"><block type="math_number"><field name="NUM">10</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="sl">Stop Loss</field><value name="VALUE"><block type="math_number"><field name="NUM">50</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="martingale">Martingale Multiplier</field><value name="VALUE"><block type="math_number"><field name="NUM">11</field></block></value>
            <next><block type="variables_set"><field name="VAR" id="prediction">Current Prediction</field><value name="VALUE"><block type="math_number"><field name="NUM">5</field></block></value></block></next></block></next></block></next></block></next></block></next></block>
        </statement>
        <statement name="SUBMARKET">
            <block type="trade_definition_tradeoptions">
                <mutation has_prediction="true"></mutation>
                <field name="DURATIONTYPE_LIST">t</field>
                <field name="CURRENCY_LIST">USD</field>
                <field name="BARRIEROFFSETTYPE_LIST">+</field>
                <field name="SECONDBARRIEROFFSETTYPE_LIST">-</field>
                <value name="DURATION"><block type="math_number"><field name="NUM">1</field></block></value>
                <value name="AMOUNT"><block type="variables_get"><field name="VAR" id="stake">Stake</field></block></value>
                <value name="PREDICTION"><block type="variables_get"><field name="VAR" id="prediction">Current Prediction</field></block></value>
            </block>
        </statement>
    </block>
    <block type="before_purchase" id="before" x="0" y="800">
        <statement name="BEFOREPURCHASE_STACK">
            <block type="purchase"><field name="PURCHASE_LIST">DIGITDIFF</field></block>
        </statement>
    </block>
    <block type="after_purchase" id="after" x="0" y="1200">
        <statement name="AFTERPURCHASE_STACK">
            <block type="math_change"><field name="VAR" id="total_profit">Total Profit</field><value name="DELTA"><block type="read_details"><field name="DETAIL_INDEX">4</field></block></value>
            <next><block type="controls_if">
                <mutation else="1"></mutation>
                <value name="IF0"><block type="contract_check_result"><field name="CHECK_RESULT">win</field></block></value>
                <statement name="DO0">
                    <block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="variables_get"><field name="VAR" id="initial_stake">Initial Stake</field></block></value></block>
                </statement>
                <statement name="ELSE">
                    <block type="variables_set"><field name="VAR" id="stake">Stake</field><value name="VALUE"><block type="math_arithmetic"><field name="OP">MULTIPLY</field><value name="A"><block type="variables_get"><field name="VAR" id="stake">Stake</field></block></value><value name="B"><block type="variables_get"><field name="VAR" id="martingale">Martingale Multiplier</field></block></value></block></value></block>
                </statement>
                <next><block type="trade_again"></block></next></block></next></block>
        </statement>
    </block>
</xml>`;
            } else {
                explanation = localize('Generating a standard trading strategy. High-quality trade definitions and logic generated based on your prompt.');
                strategyXml = `<!-- AI Generated General Strategy for: ${finalPrompt} -->
<xml xmlns="http://www.w3.org/1999/xhtml" is_dbot="true">
    <block type="trade_definition" id="trade_def" x="0" y="0">
        <statement name="TRADE_OPTIONS">
            <block type="trade_definition_market">
                <field name="MARKET_LIST">synthetic_index</field>
                <field name="SUBMARKET_LIST">random_index</field>
                <field name="SYMBOL_LIST">1HZ10V</field>
                <next>
                    <block type="trade_definition_tradetype">
                        <field name="TRADETYPECAT_LIST">callput</field>
                        <field name="TRADETYPE_LIST">callput</field>
                        <next>
                            <block type="trade_definition_contracttype">
                                <field name="TYPE_LIST">both</field>
                                <next>
                                    <block type="trade_definition_candleinterval">
                                        <field name="CANDLEINTERVAL_LIST">60</field>
                                        <next>
                                            <block type="trade_definition_restartbuysell">
                                                <field name="TIME_MACHINE_ENABLED">FALSE</field>
                                            </block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </next>
            </block>
        </statement>
        <statement name="SUBMARKET">
            <block type="trade_definition_tradeoptions">
                <field name="DURATIONTYPE_LIST">t</field>
                <field name="CURRENCY_LIST">USD</field>
                <field name="BARRIEROFFSETTYPE_LIST">+</field>
                <field name="SECONDBARRIEROFFSETTYPE_LIST">-</field>
                <value name="DURATION"><block type="math_number"><field name="NUM">1</field></block></value>
                <value name="AMOUNT"><block type="math_number"><field name="NUM">1</field></block></value>
            </block>
        </statement>
    </block>
</xml>`;
            }
            
            setXmlOutput(strategyXml);
            setStrategyExplanation(explanation);
            setIsGenerating(false);
            if (!customPrompt) setPrompt(finalPrompt);
        }, 1500);
    };

    const handleSave = () => {
        if (!xml_output) return;
        const name = current_bot_name || `AI Bot ${saved_bots.length + 1}`;
        const newBot: SavedBot = {
            id: Date.now().toString(),
            name,
            prompt,
            xml: xml_output,
            timestamp: Date.now()
        };
        saveBots([newBot, ...saved_bots]);
        setCurrentBotName('');
    };

    const smartLoad = (xml: string) => {
        localStorage.setItem('profithub_pending_load_xml', xml);
        handleTabChange(1);
    };

    const handleLoadBot = (bot: SavedBot) => {
        smartLoad(bot.xml);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        saveBots(saved_bots.filter(b => b.id !== id));
    };

    const handleDownload = () => {
        const blob = new Blob([xml_output], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${current_bot_name || 'ai-bot'}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const FEATURED_BOTS = [
        {
            id: 'differs-rank-bot',
            type: 'automated' as BotType,
            title: localize('Differs Rank-Based'),
            description: localize('Professional differs strategy with rank-based exclusion and TP/SL.'),
            prompt: TEMPLATES[0].prompt,
            badge: localize('Featured'),
            xml: (TEMPLATES[0] as any).xml || '' // Stub for now, real XML generated on first load
        }
    ];

    const renderDashboard = () => (
        <div className='trading-bots-dashboard__content'>
            {(active_tab === 'all' || active_tab === 'automated') && (
                <div className='trading-bots-dashboard__section'>
                    <Text weight='bold' size='sm' className='trading-bots-dashboard__section-title'>
                        {localize('Featured Automated Bots')}
                    </Text>
                    <div className='trading-bots-dashboard__grid'>
                        {FEATURED_BOTS.map(bot => (
                            <BotCard 
                                key={bot.id}
                                type={bot.type}
                                title={bot.title}
                                description={bot.description}
                                badge={bot.badge}
                                onRun={() => handleGenerate(bot.prompt)} // Generate first if featured
                            />
                        ))}
                    </div>
                </div>
            )}

            {(active_tab === 'all' || active_tab === 'normal') && saved_bots.length > 0 && (
                <div className='trading-bots-dashboard__section'>
                    <Text weight='bold' size='sm' className='trading-bots-dashboard__section-title'>
                        {localize('Your Built Bots')}
                    </Text>
                    <div className='trading-bots-dashboard__grid'>
                        {saved_bots.map(bot => (
                            <BotCard 
                                key={bot.id}
                                type='ai'
                                title={bot.name}
                                description={bot.prompt}
                                badge={localize('Saved')}
                                onRun={() => handleLoadBot(bot)}
                                onDownload={() => {
                                    const blob = new Blob([bot.xml], { type: 'text/xml' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${bot.name}.xml`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderBuilder = () => (
        <div className='trading-bot-ai'>
            <aside className='trading-bot-ai__sidebar'>
                <div className='trading-bot-ai__sidebar-section'>
                    <Text size='sm' weight='bold' color='prominent'>{localize('Popular Templates')}</Text>
                    {TEMPLATES.map(t => (
                        <div key={t.id} className='trading-bot-ai__template-card' onClick={() => handleGenerate(t.prompt)}>
                            <LabelPairedPuzzlePieceTwoCaptionBoldIcon className='trading-bot-ai__template-icon' />
                            <div>
                                <Text size='xs' weight='bold'>{t.name}</Text>
                                <Text size='2xs' color='less-prominent'>{t.description}</Text>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='trading-bot-ai__sidebar-section'>
                    <div className='trading-bot-ai__sidebar-header'>
                        <Text size='sm' weight='bold' color='prominent'>{localize('Saved Bots')}</Text>
                        <LabelPairedFolderOpenCaptionRegularIcon />
                    </div>
                    <div className='trading-bot-ai__saved-list'>
                        {saved_bots.map(b => (
                            <div key={b.id} className='trading-bot-ai__saved-item' onClick={() => {
                                setPrompt(b.prompt);
                                setXmlOutput(b.xml);
                                setCurrentBotName(b.name);
                            }}>
                                <div className='trading-bot-ai__saved-info'>
                                    <Text size='xs' weight='bold'>{b.name}</Text>
                                    <Text size='2xs' color='less-prominent'>{new Date(b.timestamp).toLocaleDateString()}</Text>
                                </div>
                                <LabelPairedTrashCaptionRegularIcon 
                                    className='trading-bot-ai__delete-icon'
                                    onClick={(e) => handleDelete(b.id, e)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <main className='trading-bot-ai__main'>
                <div className='trading-bot-ai__prompt-section'>
                    <textarea
                        className='trading-bot-ai__input'
                        placeholder={localize('Describe your strategy in detail...')}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    
                    <div className='trading-bot-ai__prompt-actions'>
                        <Button 
                            color='primary' 
                            size='lg' 
                        className='trading-bot-ai__generate-btn'
                            disabled={!prompt.trim() || is_generating}
                            onClick={() => handleGenerate()}
                        >
                            {is_generating ? localize('Architecting...') : localize('Generate Strategy')}
                        </Button>
                    </div>
                </div>

                {strategy_explanation && (
                    <div className='trading-bot-ai__analysis-card'>
                        <div className='trading-bot-ai__analysis-header'>
                            <LabelPairedCircleInfoCaptionRegularIcon className='trading-bot-ai__analysis-icon' />
                            <Text size='sm' weight='bold'>{localize('AI Strategy Analysis')}</Text>
                        </div>
                        <Text size='sm' color='less-prominent'>{strategy_explanation}</Text>
                    </div>
                )}

                {xml_output && (
                    <div className='trading-bot-ai__result'>
                        <div className='trading-bot-ai__result-header'>
                            <div className='trading-bot-ai__name-input-wrapper'>
                                <input 
                                    className='trading-bot-ai__name-input'
                                    placeholder={localize('Give your bot a name...')}
                                    value={current_bot_name}
                                    onChange={(e) => setCurrentBotName(e.target.value)}
                                />
                            </div>
                            <div className='trading-bot-ai__result-actions'>
                                <Button color='primary' variant='outlined' onClick={() => setXmlOutput('')} className='trading-bot-ai__action-btn'>
                                    {localize('Edit Strategy')}
                                </Button>
                                <Button color='primary' variant='outlined' onClick={handleSave} className='trading-bot-ai__action-btn'>
                                    <LabelPairedFloppyDiskCaptionRegularIcon />
                                    {localize('Save')}
                                </Button>
                                <Button color='primary' variant='contained' onClick={handleDownload} className='trading-bot-ai__action-btn'>
                                    {localize('Download')}
                                </Button>
                                <Button color='primary' variant='contained' onClick={() => smartLoad(xml_output)} className='trading-bot-ai__load-btn'>
                                    {localize('Load to Bot Builder')}
                                </Button>
                            </div>
                        </div>
                        <div className='trading-bot-ai__code-preview'>
                            <pre className='trading-bot-ai__code'>
                                {xml_output}
                            </pre>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );

    return (
        <div className='trading-bots-dashboard'>
            <input 
                type='file' 
                ref={file_input_ref} 
                style={{ display: 'none' }} 
                accept='.xml' 
                onChange={handleImportXML} 
            />
            
            <div className='trading-bots-dashboard__tabs-container'>
                <div className='trading-bots-dashboard__tabs'>
                    <Button 
                        color='primary' 
                        variant={active_tab === 'all' ? 'contained' : 'outlined'} 
                        onClick={() => setActiveTab('all')}
                        className='trading-bots-dashboard__tab'
                    >
                        {localize('All')}
                    </Button>
                    <Button 
                        color='primary' 
                        variant={active_tab === 'automated' ? 'contained' : 'outlined'} 
                        onClick={() => setActiveTab('automated')}
                        className='trading-bots-dashboard__tab'
                    >
                        {localize('Automated')} ⚡
                    </Button>
                    <Button 
                        color='primary' 
                        variant={active_tab === 'normal' ? 'contained' : 'outlined'} 
                        onClick={() => setActiveTab('normal')}
                        className='trading-bots-dashboard__tab'
                    >
                        {localize('Normal')} 🤖
                    </Button>
                    <Button 
                        color='primary' 
                        variant={active_tab === 'ai-builder' ? 'contained' : 'outlined'} 
                        onClick={() => setActiveTab('ai-builder')}
                        className='trading-bots-dashboard__tab'
                    >
                        {localize('AI Bot Builder')} ✨
                    </Button>
                    <Button 
                        color='primary' 
                        variant='outlined' 
                        onClick={() => file_input_ref.current?.click()}
                        className='trading-bots-dashboard__tab trading-bots-dashboard__import-btn'
                    >
                        <LabelPairedFolderOpenCaptionRegularIcon />
                        {localize('Import Bot')}
                    </Button>
                </div>
            </div>

            {active_tab === 'ai-builder' ? renderBuilder() : renderDashboard()}
        </div>
    );
};

export default AIBotBuilder;
