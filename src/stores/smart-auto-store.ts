import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { getSafeLastDigit } from '@/utils/digit-utils';
import { TDigitStat } from './analysis-store';
import RootStore from './root-store';

type TStrategyStats = {
    percentages: { even: number; odd: number; over: number; under: number; rise: number; fall: number };
    digit_stats: TDigitStat[];
    prev_streak_odd: number;
    prev_streak_even: number;
    prev_streak_over: number;
    prev_streak_under: number;
    is_new_digit: boolean;
};

export type TBotConfig = {
    stake: number;
    multiplier: number;
    ticks: number;
    max_loss: number;
    use_max_loss: boolean;
    switch_condition: boolean;
    prediction: number;
    is_running: boolean;
    is_auto: boolean;
    use_compounding?: boolean;
    compound_resets_on_loss?: boolean;
    use_martingale?: boolean;
    take_profit?: number;
    max_runs?: number;
    runs_count?: number;

    // Advanced Entry Conditions
    trigger_condition?: 'EVEN' | 'ODD' | 'EITHER';
    trigger_percentage?: number;
    entry_pattern?: 'PATTERN_1' | 'PATTERN_2';
    consecutive_ticks?: number;
    target_prediction?: 'EVEN' | 'ODD';

    // Advanced Differs Conditions
    differs_max_percentage?: number;
    differs_target_ticks?: number;
    bulk_trades_count?: number;
    differs_digit_tracker?: { digit: number; count: number; last_percentage: number };

    // Advanced Over/Under Tracking
    power_history?: number[][];
};
// ... existing types ...

export default class SmartAutoStore {
    root_store: RootStore;

    @observable accessor rise_fall_config: TBotConfig = {
        stake: 0.35,
        multiplier: 2.1,
        ticks: 1,
        max_loss: 5,
        use_max_loss: true,
        take_profit: 10,
        switch_condition: false,
        prediction: 0,
        is_running: false,
        is_auto: false,
        use_compounding: false,
        use_martingale: true,
    };

    @observable accessor even_odd_config: TBotConfig = {
        stake: 0.35,
        multiplier: 2.1,
        ticks: 1,
        max_loss: 5,
        use_max_loss: true,
        take_profit: 10,
        switch_condition: false,
        prediction: 0,
        is_running: false,
        is_auto: false,
        use_compounding: false,
        use_martingale: true,
        max_runs: 12,
        runs_count: 0,
        trigger_condition: 'EITHER',
        trigger_percentage: 55,
        entry_pattern: 'PATTERN_1',
        consecutive_ticks: 2,
        target_prediction: 'EVEN',
    };

    @observable accessor over_under_config: TBotConfig = {
        stake: 0.35,
        multiplier: 2.1,
        ticks: 1,
        max_loss: 5,
        use_max_loss: true,
        take_profit: 10,
        switch_condition: false,
        prediction: 4,
        is_running: false,
        is_auto: false,
        use_compounding: false,
        use_martingale: true,
        max_runs: 12,
        runs_count: 0,
    };

    @observable accessor differs_config: TBotConfig = {
        stake: 0.35,
        multiplier: 11,
        ticks: 1,
        max_loss: 5,
        use_max_loss: true,
        switch_condition: false,
        prediction: 0,
        is_running: false,
        is_auto: false,
        use_compounding: false,
        use_martingale: true,
        max_runs: 12,
        runs_count: 0,
    };

    @observable accessor matches_config: TBotConfig = {
        stake: 0.35,
        multiplier: 11,
        ticks: 1,
        max_loss: 5,
        use_max_loss: true,
        switch_condition: false,
        prediction: 0,
        is_running: false,
        is_auto: false,
        use_compounding: false,
        use_martingale: true,
        max_runs: 12,
        runs_count: 0,
    };

    @observable accessor smart_auto_24_config = {
        stake: 0.35,
        multiplier: 2.1,
        ticks: 1,
        max_loss: 5,
        use_max_loss: true,
        switch_condition: false,
        is_running: false,
        is_auto: false,
        max_runs: 24,
        runs_count: 0,
        last_trade_time: 0,
        use_compounding: false,
        use_martingale: true,
    };

    @observable accessor active_bot:
        | 'even_odd'
        | 'over_under'
        | 'differs'
        | 'matches'
        | 'smart_auto_24'
        | 'rise_fall'
        | null = null;
    @observable accessor bot_status: string = 'IDLE';
    @observable accessor session_profit: number = 0;
    @observable accessor total_profit: number = 0;
    @observable accessor is_executing = false;

    // Martingale State
    @observable accessor last_result: 'WIN' | 'LOSS' | null = null;
    @observable accessor current_streak: number = 0;
    @observable accessor logs: Array<{
        timestamp: number;
        message: string;
        type: 'info' | 'success' | 'error' | 'trade';
    }> = [];

    // Strategy Specific State
    @observable accessor consecutive_even = 0;
    @observable accessor consecutive_odd = 0;
    @observable accessor consecutive_over = 0;
    @observable accessor consecutive_under = 0;
    @observable accessor last_digit_analyzed = -1;

    @action
    addLog = (message: string, type: 'info' | 'success' | 'error' | 'trade' = 'info') => {
        this.logs.push({
            timestamp: Date.now(),
            message,
            type,
        });
        if (this.logs.length > 50) this.logs.shift();
    };

    @action
    clearLogs = () => {
        this.logs = [];
    };
    constructor(root_store: RootStore) {
        makeObservable(this);
        this.root_store = root_store;

        // Auto-process ticks when analysis updates
        reaction(
            () => this.root_store.analysis.last_digit,
            digit => {
                if (digit !== null) {
                    this.processTick();
                }
            }
        );
    }

    @action
    toggleBot = (
        bot_type: 'even_odd' | 'over_under' | 'differs' | 'matches' | 'smart_auto_24' | 'rise_fall',
        mode: 'manual' | 'auto'
    ) => {
        const configKey = `${bot_type}_config` as keyof SmartAutoStore;
        const config = this[configKey] as unknown as TBotConfig;
        if (config.is_running) {
            runInAction(() => {
                config.is_running = false;
                this.active_bot = null;
                this.bot_status = 'STOPPED';
                this.is_executing = false;
            });
        } else {
            // Stop other bots
            (['even_odd', 'over_under', 'differs', 'matches', 'smart_auto_24', 'rise_fall'] as const).forEach(b => {
                const c = this[`${b}_config` as keyof SmartAutoStore] as unknown as TBotConfig;
                if (c)
                    runInAction(() => {
                        c.is_running = false;
                    });
            });
            runInAction(() => {
                config.is_running = true;
                config.is_auto = mode === 'auto';
                this.active_bot = bot_type;
                this.bot_status = 'RUNNING';
            });
            this.addLog(`Bot started [${bot_type.toUpperCase()}] in ${mode} mode`, 'success');

            if (mode === 'manual') {
                this.executeManualTrade(bot_type);
            }
        }
    };

    @action
    updateConfig = <K extends keyof TBotConfig>(bot_type: string, key: K, value: TBotConfig[K]) => {
        const configKey = `${bot_type}_config` as keyof SmartAutoStore;
        const config = this[configKey] as unknown as TBotConfig;
        if (config) {
            config[key] = value;
        }
    };

    @action
    processTick = () => {
        const { analysis } = this.root_store;
        const last_digit = analysis.last_digit;

        if (last_digit === null) return;

        let prev_streak_odd = 0;
        let prev_streak_even = 0;
        let prev_streak_over = 0;
        let prev_streak_under = 0;

        // Update Even/Odd Counters
        if (last_digit % 2 === 0) {
            // Current is EVEN
            if (this.consecutive_odd > 0) {
                prev_streak_odd = this.consecutive_odd;
            }
            this.consecutive_even++;
            this.consecutive_odd = 0;
        } else {
            // Current is ODD
            if (this.consecutive_even > 0) {
                prev_streak_even = this.consecutive_even;
            }
            this.consecutive_odd++;
            this.consecutive_even = 0;
        }

        // Update Over/Under Counters
        if (last_digit >= 5) {
            // Over
            if (this.consecutive_under > 0) {
                prev_streak_under = this.consecutive_under;
            }
            this.consecutive_over++;
            this.consecutive_under = 0;
        } else {
            // Under
            if (this.consecutive_over > 0) {
                prev_streak_over = this.consecutive_over;
            }
            this.consecutive_under++;
            this.consecutive_over = 0;
        }

        this.last_digit_analyzed = last_digit as number;

        if (!this.active_bot || this.is_executing) return;

        const configKey = `${this.active_bot}_config` as keyof SmartAutoStore;
        const config = this[configKey] as unknown as TBotConfig;
        if (!config || !config.is_running || !config.is_auto) return;

        // Check Max Runs
        if ((config.runs_count || 0) >= (config.max_runs || 12)) {
            this.stopAllBots('MAX RUNS REACHED');
            return;
        }

        const stats = {
            percentages: analysis.percentages,
            digit_stats: analysis.digit_stats,
            prev_streak_odd,
            prev_streak_even,
            prev_streak_over,
            prev_streak_under,
            is_new_digit: true,
        };

        switch (this.active_bot) {
            case 'even_odd':
                this.runEvenOddLogic(stats);
                break;
            case 'over_under':
                this.runOverUnderLogic(stats);
                break;
            case 'differs':
                this.runDiffersLogic(stats.digit_stats);
                break;
            case 'matches':
                this.runMatchesLogic(
                    stats.digit_stats,
                    stats.percentages as { rise: number; fall: number; [key: string]: number }
                );
                break;
            case 'smart_auto_24':
                this.runSmartAuto24Logic(stats.percentages as { over: number; under: number });
                break;
            case 'rise_fall':
                this.runRiseFallLogic(stats.percentages as { rise: number; fall: number });
                break;
        }
    };

    private runEvenOddLogic = (stats: TStrategyStats) => {
        const config = this.even_odd_config;
        const { percentages, prev_streak_odd, prev_streak_even, digit_stats } = stats;

        const conditionType = config.trigger_condition || 'EITHER';
        const percentThreshold = config.trigger_percentage || 55;
        const reqConsecutive = config.consecutive_ticks || 2;
        const targetPrediction = config.target_prediction || 'EVEN';
        let triggerMatched = false;

        if (config.entry_pattern === 'PATTERN_2') {
            // Pattern 2: Highest, 2nd Highest, and Least are all Even (or Odd)
            const sorted = [...digit_stats].sort((a, b) => b.count - a.count);
            if (sorted.length >= 10) {
                const h1 = sorted[0].digit;
                const h2 = sorted[1].digit;
                const least = sorted[9].digit;

                if (conditionType === 'EVEN' || conditionType === 'EITHER') {
                    if (h1 % 2 === 0 && h2 % 2 === 0 && least % 2 === 0) {
                        this.addLog(`Trigger Pattern 2: Highest, 2nd, and Least are EVEN.`, 'info');
                        triggerMatched = true;
                    }
                }
                if (!triggerMatched && (conditionType === 'ODD' || conditionType === 'EITHER')) {
                    if (h1 % 2 !== 0 && h2 % 2 !== 0 && least % 2 !== 0) {
                        this.addLog(`Trigger Pattern 2: Highest, 2nd, and Least are ODD.`, 'info');
                        triggerMatched = true;
                    }
                }
            }
        } else {
            // Pattern 1: Wait for % threshold -> wait for N consecutive opposite -> trade target
            if (conditionType === 'EVEN' || conditionType === 'EITHER') {
                if (percentages.even >= percentThreshold) {
                    // We want to trade the target prediction. The "opposite" is what we wait to finish.
                    // e.g. If target is EVEN, opposite is ODD. We wait for `reqConsecutive` ODDs, then EVEN appears.
                    if (targetPrediction === 'EVEN') {
                        if (this.consecutive_even >= 1 && prev_streak_odd >= reqConsecutive) {
                            this.addLog(
                                `Trigger: EVEN at ${percentages.even.toFixed(1)}% & ${prev_streak_odd} consecutive ODDs ended.`,
                                'info'
                            );
                            triggerMatched = true;
                        }
                    } else {
                        // targetPrediction === 'ODD'
                        if (this.consecutive_odd >= 1 && prev_streak_even >= reqConsecutive) {
                            this.addLog(
                                `Trigger: EVEN at ${percentages.even.toFixed(1)}% & ${prev_streak_even} consecutive EVENs ended.`,
                                'info'
                            );
                            triggerMatched = true;
                        }
                    }
                }
            }

            if (!triggerMatched && (conditionType === 'ODD' || conditionType === 'EITHER')) {
                if (percentages.odd >= percentThreshold) {
                    if (targetPrediction === 'EVEN') {
                        if (this.consecutive_even >= 1 && prev_streak_odd >= reqConsecutive) {
                            this.addLog(
                                `Trigger: ODD at ${percentages.odd.toFixed(1)}% & ${prev_streak_odd} consecutive ODDs ended.`,
                                'info'
                            );
                            triggerMatched = true;
                        }
                    } else {
                        if (this.consecutive_odd >= 1 && prev_streak_even >= reqConsecutive) {
                            this.addLog(
                                `Trigger: ODD at ${percentages.odd.toFixed(1)}% & ${prev_streak_even} consecutive EVENs ended.`,
                                'info'
                            );
                            triggerMatched = true;
                        }
                    }
                }
            }
        }

        if (triggerMatched) {
            this.executeContract(targetPrediction === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD', 0, config);
        }
    };

    private runOverUnderLogic = (stats: TStrategyStats) => {
        const config = this.over_under_config;
        const { percentages, prev_streak_over, prev_streak_under, digit_stats } = stats;

        // Rule: Identify overall bias
        const is_over = percentages.over >= percentages.under;
        const best_bias_pct = Math.max(percentages.over, percentages.under);

        // Track aggregate power trend
        const current_power_array = digit_stats
            .slice()
            .sort((a, b) => a.digit - b.digit)
            .map(d => d.percentage);
        const history = config.power_history || [];
        history.push(current_power_array);
        if (history.length > 5) history.shift();
        config.power_history = history;

        const prev_pct =
            history.length >= 2
                ? is_over
                    ? history[history.length - 2].slice(5).reduce((a, b) => a + b, 0)
                    : history[history.length - 2].slice(0, 5).reduce((a, b) => a + b, 0)
                : best_bias_pct;

        const power_increasing = best_bias_pct > prev_pct;
        const power_decreasing = best_bias_pct < prev_pct;

        if (power_decreasing) {
            this.addLog('UNSTABLE MARKET - Power Decreasing, searching for trend...', 'info');
            return;
        }

        if (best_bias_pct > 55 && power_increasing) {
            // Determine safest OVER/UNDER prediction dynamically
            let prediction = config.prediction;
            if (is_over) {
                const over_digits = digit_stats
                    .slice()
                    .filter(s => s.digit > 4)
                    .sort((a, b) => b.percentage - a.percentage);
                if (over_digits.length > 0) prediction = Math.min(over_digits[0].digit, over_digits[1].digit);
            } else {
                const under_digits = digit_stats
                    .slice()
                    .filter(s => s.digit <= 4)
                    .sort((a, b) => b.percentage - a.percentage);
                if (under_digits.length > 0) prediction = Math.max(under_digits[0].digit, under_digits[1].digit);
            }

            // Suggestive update to UI
            if (config.prediction !== prediction) {
                runInAction(() => {
                    config.prediction = prediction;
                });
            }

            // Wait for entry signal pattern
            if (is_over && this.consecutive_over >= 1 && prev_streak_under >= 2) {
                this.addLog(
                    `Trigger: OVER Strong (${best_bias_pct.toFixed(1)}%). Suggesting/Trading OVER ${prediction}.`,
                    'success'
                );
                this.executeContract('DIGITOVER', prediction, config);
            } else if (!is_over && this.consecutive_under >= 1 && prev_streak_over >= 2) {
                this.addLog(
                    `Trigger: UNDER Strong (${best_bias_pct.toFixed(1)}%). Suggesting/Trading UNDER ${prediction}.`,
                    'success'
                );
                this.executeContract('DIGITUNDER', prediction, config);
            }
        }
    };

    private runDiffersLogic = (digit_stats: TDigitStat[]) => {
        const config = this.differs_config;
        const maxPct = config.differs_max_percentage || 9;
        const targetTicks = config.differs_target_ticks || 2;

        // Rule: Target digit 2-7. Exclude Top 1, 2, and Least (10th).
        const sortedStats = [...digit_stats].sort((a, b) => b.count - a.count);
        if (sortedStats.length < 10) return;

        const highest = sortedStats[0].digit;
        const second = sortedStats[1].digit;
        const least = sortedStats[9].digit;

        const eligible = digit_stats.filter(s => {
            return (
                s.digit >= 2 &&
                s.digit <= 7 &&
                s.digit !== highest &&
                s.digit !== second &&
                s.digit !== least &&
                s.percentage < maxPct &&
                !s.is_increasing
            ); // Decreasing trend
        });

        if (eligible.length > 0) {
            // Select best: The one with lowest percentage
            const target = eligible.sort((a, b) => a.percentage - b.percentage)[0];

            let tracker = config.differs_digit_tracker;

            // If we have a new target or no tracker, initialize it
            if (!tracker || tracker.digit !== target.digit) {
                tracker = { digit: target.digit, count: 0, last_percentage: target.percentage };
                config.differs_digit_tracker = tracker;

                // If it's a new tracking, we count this current appearance if it's the last digit
                if (this.last_digit_analyzed === target.digit) {
                    tracker.count = 1;
                }
            } else {
                // If percentage drops or stays same, we count occurrences
                if (target.percentage <= tracker.last_percentage) {
                    tracker.last_percentage = target.percentage;

                    if (this.last_digit_analyzed === target.digit) {
                        tracker.count++;
                    }
                } else {
                    // Reset if percentage increases (breaks trend)
                    tracker.count = 0;
                    tracker.last_percentage = target.percentage;
                }
            }

            this.addLog(
                `Tracking Differ ${target.digit}: ${tracker.count}/${targetTicks} appearances (<${maxPct}%)`,
                'info'
            );

            if (tracker.count >= targetTicks) {
                // Auto Update Prediction
                if (config.prediction !== target.digit) {
                    this.updateConfig('differs', 'prediction', target.digit);
                }

                this.addLog(
                    `Differ Trigger Hit: Digit ${target.digit} appeared ${targetTicks} times, prob < ${maxPct}% & decreasing.`,
                    'success'
                );
                this.executeContract('DIGITDIFF', target.digit, config);

                // Reset tracker after trade fires
                config.differs_digit_tracker = undefined;
            }
        } else {
            // Reset tracker if no eligible digits
            config.differs_digit_tracker = undefined;
        }
    };

    private runMatchesLogic = (
        digit_stats: TDigitStat[],
        percentages: { rise: number; fall: number; [key: string]: number }
    ) => {
        const config = this.matches_config;

        // Rule: Select Highest, 2nd, or Least. Increasing.
        const sortedStats = [...digit_stats].sort((a, b) => b.count - a.count);
        if (sortedStats.length < 10) return;

        const candidates = [sortedStats[0], sortedStats[1], sortedStats[9]];

        const validCandidates = candidates.filter(s => s.is_increasing);
        const isMarketRising = (percentages.rise || 0) > (percentages.fall || 0);

        if (validCandidates.length > 0 && isMarketRising) {
            // Pick strongest (highest count)
            const target = validCandidates.sort((a, b) => b.count - a.count)[0];

            // Auto Update Prediction
            if (config.prediction !== target.digit) {
                runInAction(() => {
                    config.prediction = target.digit;
                });
            }

            this.addLog(`Match Trigger: Digit ${target.digit} prob increasing & Market Rising.`, 'success');
            this.executeContract('DIGITMATCH', target.digit, config);
        } else if (validCandidates.length > 0 && !isMarketRising) {
            const target = validCandidates.sort((a, b) => b.count - a.count)[0];
            if (config.prediction !== target.digit) {
                runInAction(() => {
                    config.prediction = target.digit;
                });
            }
            this.addLog(`Match Trigger: Target rising, waiting for Market Rise...`, 'info');
        }
    };

    private runRiseFallLogic = (percentages: { rise: number; fall: number }) => {
        const config = this.rise_fall_config;
        const isRise = percentages.rise > 55;
        const isFall = percentages.fall > 55;

        if (isRise || isFall) {
            this.addLog(
                `Trend Detected: ${isRise ? 'RISE' : 'FALL'} (${Math.max(percentages.rise, percentages.fall).toFixed(1)}%)`,
                'info'
            );
            this.executeContract(isRise ? 'CALL' : 'PUT', 0, config);
        }
    };

    private runSmartAuto24Logic = (percentages: { over: number; under: number }) => {
        // Logic same as previously defined or simplified for brevity as user focused on others
        const config = this.smart_auto_24_config;
        if (config.runs_count && config.max_runs && config.runs_count >= config.max_runs) {
            this.stopAllBots('MAX RUNS REACHED');
            return;
        }
        const now = Date.now();
        if (now - config.last_trade_time < 3600000) return;

        if (percentages.over > 60) {
            config.last_trade_time = now;
            config.runs_count++;
            this.executeContract('DIGITOVER', 1, config as unknown as TBotConfig);
        } else if (percentages.under > 60) {
            config.last_trade_time = now;
            config.runs_count++;
            this.executeContract('DIGITUNDER', 8, config as unknown as TBotConfig);
        }
    };

    private executeManualTrade = (
        bot_type: 'even_odd' | 'over_under' | 'differs' | 'matches' | 'smart_auto_24' | 'rise_fall'
    ) => {
        const configKey = `${bot_type}_config` as keyof SmartAutoStore;
        const config = this[configKey] as unknown as TBotConfig;
        let contract_type = '';
        const prediction = config.prediction ?? 4;

        switch (bot_type) {
            case 'even_odd':
                contract_type = 'DIGITEVEN';
                break;
            case 'over_under':
                contract_type = prediction >= 5 ? 'DIGITUNDER' : 'DIGITOVER';
                break;
            case 'smart_auto_24':
                contract_type = 'DIGITOVER';
                break;
            case 'differs':
                contract_type = 'DIGITDIFF';
                break;
            case 'matches':
                contract_type = 'DIGITMATCH';
                break;
            case 'rise_fall':
                contract_type = 'CALL';
                break;
        }

        this.executeContract(contract_type, prediction, config);
        setTimeout(
            () =>
                runInAction(() => {
                    config.is_running = false;
                    this.active_bot = null;
                }),
            1000
        );
    };

    private executeContract = async (contract_type: string, prediction: number, config: TBotConfig) => {
        if (this.is_executing) return;

        runInAction(() => {
            this.is_executing = true;
            this.bot_status = 'EXECUTING';
        });

        const numTrades = config.bulk_trades_count || 1;

        if (numTrades > 1) {
            this.addLog(
                `Executing Bulk Trades (${numTrades} contracts) for ${contract_type} on digit ${prediction}...`,
                'trade'
            );
        }

        for (let i = 0; i < numTrades; i++) {
            if (!this.active_bot || !config.is_running) break;

            await this.executeSingleContract(contract_type, prediction, config);

            // Short delay between bulk trades
            if (i < numTrades - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    };

    private executeSingleContract = async (contract_type: string, prediction: number, config: TBotConfig) => {
        try {
            const { api_base: apiBaseInstance } = await import('@/external/bot-skeleton');
            if (!apiBaseInstance.api) throw new Error('API not initialized');

            const stake = this.calculateStake(config);
            this.addLog(`Buying ${contract_type} for $${stake.toFixed(2)}`, 'trade');

            const symbol = config.symbol || this.root_store.common.symbol || 'R_100';
            const proposal = (await apiBaseInstance.api.send({
                proposal: 1,
                amount: stake,
                basis: 'stake',
                contract_type,
                currency: this.root_store.client.currency || 'USD',
                duration: config.ticks,
                duration_unit: 't',
                symbol: symbol,
                ...(contract_type.includes('DIGIT')
                    ? contract_type.includes('EVEN') || contract_type.includes('ODD')
                        ? {}
                        : { barrier: prediction.toString() }
                    : {}),
            })) as { error?: { message: string }; proposal?: { id: string } };

            if (proposal.error) throw new Error(proposal.error.message);
            if (!proposal.proposal) throw new Error('Proposal failed');

            this.addLog(`Buying ${contract_type} contract...`, 'trade');
            const res = (await apiBaseInstance.api.send({
                buy: proposal.proposal.id,
                price: stake,
            })) as { error?: { message: string }; buy?: { contract_id: string } };

            if (res.error) throw new Error(res.error.message);
            if (!res.buy) throw new Error('Buy failed');

            this.bot_status = `TRADING: ${contract_type}`;

            // Wait for result
            setTimeout(
                async () => {
                    const poc = (await apiBaseInstance.api?.send({
                        proposal_open_contract: 1,
                        contract_id: (res.buy as { contract_id: string }).contract_id,
                    })) as { proposal_open_contract?: Record<string, unknown> };
                    if (poc.proposal_open_contract) {
                        this.handleResult(poc.proposal_open_contract, config);
                    }
                    runInAction(() => {
                        this.is_executing = false;
                    });
                },
                config.ticks * 1000 + 2000
            );
        } catch (error: unknown) {
            console.error('SmartAuto Error:', JSON.stringify(error, null, 2));
            runInAction(() => {
                const err = error as { error?: { message?: string }; message?: string };
                const errorMessage = err?.error?.message || err?.message || 'Unknown error';
                this.bot_status = `ERROR: ${errorMessage}`;
                this.addLog(`Error: ${errorMessage}`, 'error');
                this.is_executing = false;
            });
        }
    };

    private handleResult = (contract: Record<string, unknown>, config: TBotConfig) => {
        const profit = parseFloat((contract.profit as string) || '0');
        const result = profit > 0 ? 'WIN' : 'LOSS';

        runInAction(() => {
            this.last_result = result;
            this.is_executing = false;

            // Increment runs count for all strategies on every trade
            if (config.runs_count !== undefined) {
                config.runs_count = (config.runs_count || 0) + 1;
            }

            if (result === 'WIN') {
                this.session_profit += profit;
                this.total_profit += profit;
                this.current_streak = 0;
                const exit_tick = contract.exit_tick;
                const exit_price = String(exit_tick);
                const exit_digit = exit_price[exit_price.length - 1];
                const prediction_val = config.prediction;
                const contract_type = contract.contract_type;

                let log_detail = '';
                if (contract_type === 'DIGITEVEN') log_detail = `Predicted EVEN, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITODD') log_detail = `Predicted ODD, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITOVER')
                    log_detail = `Predicted OVER ${prediction_val}, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITUNDER')
                    log_detail = `Predicted UNDER ${prediction_val}, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITMATCH')
                    log_detail = `Predicted MATCH ${prediction_val}, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITDIFF')
                    log_detail = `Predicted DIFF ${prediction_val}, Exit Digit: ${exit_digit}`;

                this.addLog(
                    `Trade WON: +$${profit.toFixed(2)} | ${log_detail} [Session: ${this.session_profit.toFixed(2)}]`,
                    'success'
                );

                if (config.take_profit && this.session_profit >= config.take_profit) {
                    this.addLog(`Take Profit Reached ($${config.take_profit}). Stopping bot.`, 'success');
                    this.stopAllBots('TAKE PROFIT HIT');
                }
            } else {
                this.session_profit += profit; // profit is negative on loss
                this.total_profit += profit;
                this.current_streak++;
                const exit_tick = contract.exit_tick;
                const exit_price = String(exit_tick);
                const exit_digit = exit_price[exit_price.length - 1];
                const prediction_val = config.prediction;
                const contract_type = contract.contract_type;

                let log_detail = '';
                if (contract_type === 'DIGITEVEN') log_detail = `Predicted EVEN, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITODD') log_detail = `Predicted ODD, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITOVER')
                    log_detail = `Predicted OVER ${prediction_val}, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITUNDER')
                    log_detail = `Predicted UNDER ${prediction_val}, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITMATCH')
                    log_detail = `Predicted MATCH ${prediction_val}, Exit Digit: ${exit_digit}`;
                else if (contract_type === 'DIGITDIFF')
                    log_detail = `Predicted DIFF ${prediction_val}, Exit Digit: ${exit_digit}`;

                this.addLog(
                    `Trade LOST: -$${Math.abs(profit).toFixed(2)} | ${log_detail} [Streak: ${this.current_streak}]`,
                    'error'
                );

                if (config.use_max_loss && Math.abs(this.session_profit) >= config.max_loss) {
                    this.addLog(`Max Loss Limit Reached ($${config.max_loss}). Stopping bot.`, 'error');
                    this.stopAllBots('MAX LOSS HIT');
                    if (config.switch_condition) {
                        this.switchMarket(config === (this.smart_auto_24_config as unknown as TBotConfig));
                    }
                }
            }
        });
    };

    private stopAllBots = (reason: string) => {
        const bot_types = ['even_odd', 'over_under', 'differs', 'matches', 'smart_auto_24', 'rise_fall'] as const;
        bot_types.forEach(b => {
            const configKey = `${b}_config` as keyof SmartAutoStore;
            const config = this[configKey] as unknown as TBotConfig | undefined;
            if (config) config.is_running = false;
        });
        this.active_bot = null;
        this.bot_status = reason;
    };

    private switchMarket = (isSmart24 = false) => {
        if (isSmart24) {
            // User requested: switch to even odd market
            this.toggleBot('even_odd', 'auto');
            this.bot_status = 'SWITCHED TO EVEN/ODD';
            return;
        }
        // Switch logic: Even/Odd -> Over/Under -> Differs -> Matches
        if (this.active_bot === 'even_odd') this.toggleBot('over_under', 'auto');
        else if (this.active_bot === 'over_under') this.toggleBot('even_odd', 'auto');
    };

    private calculateStake = (config: TBotConfig) => {
        let base_stake = config.stake;

        // Handle Compounding (Compound Win)
        if (config.use_compounding && this.session_profit > 0 && this.last_result === 'WIN') {
            base_stake = config.stake + this.session_profit;
        }

        // Handle Martingale (Compound Loss)
        if (this.last_result === 'LOSS' && config.use_martingale) {
            base_stake = base_stake * Math.pow(config.multiplier, this.current_streak);
        }

        // Ensure max 2 decimal places to prevent API errors
        return parseFloat(base_stake.toFixed(2));
    };
}
