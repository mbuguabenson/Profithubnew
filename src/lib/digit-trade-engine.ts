import { action, makeObservable, observable, runInAction } from 'mobx';
import { api_base } from '@/external/bot-skeleton';
import { TDigitStat } from '@/stores/analysis-store';

export type TTradeConfig = {
    stake: number;
    multiplier: number;
    ticks: number;
    max_loss: number;
    use_max_loss: boolean;
    switch_condition: boolean;
    prediction: number;
    is_running: boolean;
    is_auto: boolean;
    take_profit?: number;
    max_runs?: number;
    runs_count?: number;
    use_compounding?: boolean;
    use_martingale?: boolean;
    trigger_condition?: 'EVEN' | 'ODD' | 'EITHER';
    trigger_percentage?: number;
    entry_pattern?: 'PATTERN_1' | 'PATTERN_2';
    consecutive_ticks?: number;
    target_prediction?: 'EVEN' | 'ODD';
    // Custom Differs triggers
    differs_max_percentage?: number;
    differs_target_ticks?: number;
    bulk_trades_count?: number;
    differs_digit_tracker?: { digit: number; count: number; last_percentage: number } | null;
};

export type TTradeLog = {
    timestamp: number;
    message: string;
    type: 'info' | 'success' | 'error' | 'trade';
};

export class DigitTradeEngine {
    @observable accessor even_odd_config: TTradeConfig = {
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
    @observable accessor over_under_config: TTradeConfig = {
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
    @observable accessor differs_config: TTradeConfig = {
        stake: 0.35,
        multiplier: 11,
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
        differs_max_percentage: 9,
        differs_target_ticks: 2,
        bulk_trades_count: 1,
        differs_digit_tracker: null,
    };
    @observable accessor matches_config: TTradeConfig = {
        stake: 0.35,
        multiplier: 11,
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
    };

    @observable accessor active_strategy: 'even_odd' | 'over_under' | 'differs' | 'matches' | null = null;
    @observable accessor trade_status: string = 'IDLE';
    @observable accessor session_profit: number = 0;
    @observable accessor total_profit: number = 0;
    @observable accessor is_executing = false;
    @observable accessor logs: TTradeLog[] = [];

    // Martingale State
    @observable accessor last_result: 'WIN' | 'LOSS' | null = null;
    @observable accessor current_streak: number = 0;

    // Strategy State
    private consecutive_even = 0;
    private consecutive_odd = 0;
    private consecutive_over = 0;
    private consecutive_under = 0;

    constructor() {
        makeObservable(this);
    }

    @action
    addLog = (message: string, type: 'info' | 'success' | 'error' | 'trade' = 'info') => {
        this.logs.unshift({ timestamp: Date.now(), message, type });
        if (this.logs.length > 50) this.logs.pop();
    };

    @action
    clearLogs = () => {
        this.logs = [];
    };

    @action
    updateConfig = <K extends keyof TTradeConfig>(strategy: string, key: K, value: TTradeConfig[K]) => {
        const config = (this as Record<string, unknown>)[`${strategy}_config`] as TTradeConfig;
        if (config) config[key] = value;
    };

    @action
    toggleStrategy = (strategy: 'even_odd' | 'over_under' | 'differs' | 'matches') => {
        const config = (this as Record<string, unknown>)[`${strategy}_config`] as TTradeConfig;

        if (config.is_running) {
            // Stop
            config.is_running = false;
            this.active_strategy = null;
            this.trade_status = 'STOPPED';
            this.is_executing = false;
        } else {
            // Start
            // Ensure others are stopped
            ['even_odd', 'over_under', 'differs', 'matches'].forEach(s => {
                const c = (this as Record<string, unknown>)[`${s}_config`] as TTradeConfig;
                if (c) c.is_running = false;
            });

            config.is_running = true;
            this.active_strategy = strategy;
            this.trade_status = 'RUNNING';
            this.addLog(`Strategy started: ${strategy.toUpperCase()}`, 'success');
        }
    };

    @action
    processTick = (
        last_digit: number,
        stats: {
            percentages: { even: number; odd: number; over: number; under: number; rise: number; fall: number };
            digit_stats: TDigitStat[];
        },
        symbol: string,
        currency: string
    ) => {
        // Update local counters
        if (last_digit % 2 === 0) {
            this.consecutive_even++;
            this.consecutive_odd = 0;
        } else {
            this.consecutive_odd++;
            this.consecutive_even = 0;
        }

        if (last_digit >= 5) {
            this.consecutive_over++;
            this.consecutive_under = 0;
        } else {
            this.consecutive_under++;
            this.consecutive_over = 0;
        }

        if (!this.active_strategy) return;

        const config = (this as Record<string, unknown>)[`${this.active_strategy}_config`] as TTradeConfig;
        if (!config || !config.is_running) return;

        if (this.is_executing) return;

        // Check Max Runs
        if ((config.runs_count || 0) >= (config.max_runs || 100)) {
            this.stopAll('MAX RUNS REACHED');
            return;
        }

        switch (this.active_strategy) {
            case 'even_odd':
                this.checkEvenOdd(stats, config, symbol, currency);
                break;
            case 'over_under':
                this.checkOverUnder(stats.percentages, config, symbol, currency);
                break;
            case 'differs':
                this.checkDiffers(last_digit, stats.digit_stats, config, symbol, currency);
                break;
            case 'matches':
                this.checkMatches(stats.percentages, stats.digit_stats, config, symbol, currency);
                break;
        }
    };

    private checkEvenOdd = (
        stats: { percentages: { even: number; odd: number }; digit_stats: TDigitStat[] },
        config: TTradeConfig,
        symbol: string,
        currency: string
    ) => {
        const trigger_cond = config.trigger_condition || 'EITHER';
        const trigger_pct = config.trigger_percentage || 55;
        const entry_pattern = config.entry_pattern || 'PATTERN_1';
        const consecutive = config.consecutive_ticks || 2;
        const target = config.target_prediction || 'EVEN';

        let tradeType: 'DIGITEVEN' | 'DIGITODD' | null = null;

        if (entry_pattern === 'PATTERN_1') {
            const even_triggered =
                (trigger_cond === 'EVEN' || trigger_cond === 'EITHER') &&
                stats.percentages.even >= trigger_pct &&
                this.consecutive_odd >= consecutive;
            const odd_triggered =
                (trigger_cond === 'ODD' || trigger_cond === 'EITHER') &&
                stats.percentages.odd >= trigger_pct &&
                this.consecutive_even >= consecutive;

            if (even_triggered || odd_triggered) {
                tradeType = target === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD';
            }
        } else if (entry_pattern === 'PATTERN_2') {
            if (stats.digit_stats && stats.digit_stats.length > 0) {
                const sorted = [...stats.digit_stats].sort((a, b) => b.percentage - a.percentage);
                const highest = sorted[0].digit;
                const second = sorted[1].digit;
                const least = sorted[9].digit;

                const isEven = (d: number) => d % 2 === 0;
                const isOdd = (d: number) => d % 2 !== 0;

                const allEven = isEven(highest) && isEven(second) && isEven(least);
                const allOdd = isOdd(highest) && isOdd(second) && isOdd(least);

                if ((trigger_cond === 'EVEN' || trigger_cond === 'EITHER') && allEven) {
                    tradeType = target === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD';
                } else if ((trigger_cond === 'ODD' || trigger_cond === 'EITHER') && allOdd) {
                    tradeType = target === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD';
                }
            }
        }

        if (tradeType) {
            this.executeTrade(tradeType, 0, config, symbol, currency);
        }
    };

    private checkOverUnder = (
        percentages: { over: number; under: number },
        config: TTradeConfig,
        symbol: string,
        currency: string
    ) => {
        let prediction = config.prediction;
        if (percentages.under > 55 && this.consecutive_under >= 1) {
            this.executeTrade('DIGITUNDER', prediction, config, symbol, currency);
        } else if (percentages.over > 55 && this.consecutive_over >= 1) {
            this.executeTrade('DIGITOVER', prediction, config, symbol, currency);
        }
    };

    private checkDiffers = (
        last_digit: number,
        digit_stats: TDigitStat[],
        config: TTradeConfig,
        symbol: string,
        currency: string
    ) => {
        if (!digit_stats || digit_stats.length === 0) return;

        // Ensure array is sorted by count ascending (least frequent first)
        const sorted = [...digit_stats].sort((a, b) => a.count - b.count);

        // Find most, 2nd most, and least
        const most_appearing = [...digit_stats].sort((a, b) => b.count - a.count)[0].digit;
        const second_most = [...digit_stats].sort((a, b) => b.count - a.count)[1].digit;
        const least_appearing = sorted[0].digit;

        // Valid digits: 2-7, excluding most, 2nd most, least.
        const valid_digits = [2, 3, 4, 5, 6, 7].filter(
            d => d !== most_appearing && d !== second_most && d !== least_appearing
        );

        const max_pct = config.differs_max_percentage || 9;
        const target_ticks = config.differs_target_ticks || 2;

        // Need to calculate "powerTrend" equivalent from DigitStats if available.
        // In digit_stats, we might not track trend explicitly inside the engine unless we have history.
        // We will approximate decreasing trend by comparing with last tracking or rely strictly on % drops.
        const stats_2_7 = digit_stats.filter(s => valid_digits.includes(s.digit));

        // As decreasing trend requires a history array that we don't persist per digit in engine,
        // we lock onto a valid candidate under the max_pct and check if it drops further or stays.
        const candidates = stats_2_7.filter(s => s.percentage <= max_pct);
        const target = candidates.length > 0 ? candidates.sort((a, b) => a.percentage - b.percentage)[0] : null;

        if (target) {
            if (!config.differs_digit_tracker || config.differs_digit_tracker.digit !== target.digit) {
                // New target locked
                config.differs_digit_tracker = { digit: target.digit, count: 0, last_percentage: target.percentage };
                this.trade_status = `Signal Lock: Digit ${target.digit} (Tracking...)`;
            } else {
                // Track occurrences
                const tracker = config.differs_digit_tracker;

                // If the percentage goes above the max allowed, we break the lock
                if (target.percentage > max_pct) {
                    config.differs_digit_tracker = null;
                    this.trade_status = `Tracking failed: Digit ${target.digit} power rose above ${max_pct}%. Scanning...`;
                    return;
                }

                // If percentage drops or stays same, we count occurrences
                if (target.percentage <= tracker.last_percentage) {
                    tracker.last_percentage = target.percentage;

                    if (last_digit === target.digit) {
                        tracker.count++;
                    }

                    if (tracker.count >= target_ticks) {
                        this.trade_status = `TRADING DIFFERS ${target.digit} (Appeared ${tracker.count}x)...`;
                        if (target.digit !== config.prediction) {
                            runInAction(() => (config.prediction = target.digit));
                        }
                        // Reset tracker after ready to trade
                        config.differs_digit_tracker = null;
                        this.executeTrade('DIGITDIFF', target.digit, config, symbol, currency);
                    } else {
                        this.trade_status = `Signal Lock: Digit ${target.digit} - Appeared ${tracker.count}/${target_ticks} times`;
                    }
                } else {
                    // Power increased slightly (though still under max), invalidate entry
                    config.differs_digit_tracker = null;
                    this.trade_status = `Tracking failed: Digit ${target.digit} power increased. Scanning...`;
                }
            }
        } else {
            config.differs_digit_tracker = null;
            this.trade_status = `Scanning (Digits 2-7, <${max_pct}% & Decreasing)...`;
        }
    };

    private checkMatches = (
        percentages: { rise: number; fall: number; [key: string]: number },
        digit_stats: TDigitStat[],
        config: TTradeConfig,
        symbol: string,
        currency: string
    ) => {
        const sorted = [...digit_stats].sort((a, b) => b.count - a.count);
        if (sorted.length < 10) return;

        const candidates = [sorted[0], sorted[1], sorted[9]];
        const target = candidates.find(s => s.is_increasing);

        const isMarketRising = (percentages.rise || 0) > (percentages.fall || 0);

        if (target && isMarketRising) {
            if (target.digit !== config.prediction) {
                runInAction(() => (config.prediction = target.digit));
            }
            this.trade_status = `TRADING MATCHES ${target.digit} (Power Increasing & Market Rising)...`;
            this.executeTrade('DIGITMATCH', target.digit, config, symbol, currency);
        } else if (target && !isMarketRising) {
            this.trade_status = `Target ${target.digit} rising, waiting for Market Rise...`;
        } else {
            this.trade_status = 'Scanning (Waiting for high/low digit & market rise)...';
        }
    };

    @action
    executeTrade = async (
        contract_type: string,
        prediction: number,
        config: TTradeConfig,
        symbol: string,
        currency: string
    ) => {
        if (this.is_executing) return;
        this.is_executing = true;

        const trade_count = contract_type === 'DIGITDIFF' ? config.bulk_trades_count || 1 : 1;

        try {
            if (!api_base.api) throw new Error('API not connected');

            for (let i = 0; i < trade_count; i++) {
                if (!config.is_running && i > 0) break; // Break if stopped mid-bulk

                const stake = this.calculateStake(config);
                this.addLog(`Buying ${contract_type} ($${stake})`, 'trade');

                const proposal = (await api_base.api.send({
                    proposal: 1,
                    amount: stake,
                    basis: 'stake',
                    contract_type,
                    currency: currency || 'USD',
                    duration: config.ticks,
                    duration_unit: 't',
                    underlying_symbol: symbol,
                    ...(contract_type.includes('DIGIT') && !['DIGITEVEN', 'DIGITODD'].includes(contract_type)
                        ? { barrier: String(prediction) }
                        : {}),
                })) as { error?: { message: string }; proposal?: { id: string } };

                if (proposal.error) throw new Error(proposal.error.message);

                const buy = (await api_base.api.send({
                    buy: proposal.proposal!.id,
                    price: stake,
                })) as { error?: { message: string }; buy?: { contract_id: string } };

                if (buy.error) throw new Error(buy.error.message);

                this.trade_status = `TRADING ${contract_type}`;

                // Monitor result
                this.monitorTrade(buy.buy!.contract_id, config, i === trade_count - 1);

                if (i < trade_count - 1) {
                    await new Promise(r => setTimeout(r, 100)); // Sleep 100ms
                }
            }
        } catch (e: unknown) {
            console.error(e);
            runInAction(() => {
                const message = (e as Error).message || 'Unknown Error';
                this.addLog(`Error: ${message}`, 'error');
                this.is_executing = false;
                this.trade_status = 'ERROR';
            });
        }
    };

    private monitorTrade = (contract_id: string, config: TTradeConfig, isLastBulkTrade: boolean) => {
        const check = setInterval(async () => {
            try {
                const data = (await api_base.api?.send({ proposal_open_contract: 1, contract_id })) as {
                    proposal_open_contract?: { is_sold: number; profit: number };
                };
                if (data.proposal_open_contract && data.proposal_open_contract.is_sold) {
                    clearInterval(check);
                    this.handleResult(data.proposal_open_contract, config, isLastBulkTrade);
                }
            } catch (e) {
                clearInterval(check);
                runInAction(() => {
                    if (isLastBulkTrade) this.is_executing = false;
                });
            }
        }, 1000);
    };

    @action
    handleResult = (contract: { profit: number }, config: TTradeConfig, isLastBulkTrade: boolean = true) => {
        const profit = Number(contract.profit);
        const result = profit > 0 ? 'WIN' : 'LOSS';

        this.last_result = result;
        this.session_profit += profit;
        this.total_profit += profit;

        if (isLastBulkTrade) {
            this.is_executing = false;
        }

        if (result === 'WIN') {
            this.current_streak = 0;
            this.addLog(`WIN: +${profit.toFixed(2)}`, 'success');
            if (config.take_profit && this.session_profit >= config.take_profit) {
                this.stopAll('TAKE PROFIT HIT');
            }
        } else {
            this.current_streak++;
            this.addLog(`LOSS: ${profit.toFixed(2)}`, 'error');
            if (config.use_max_loss && Math.abs(this.session_profit) >= config.max_loss) {
                this.stopAll('MAX LOSS HIT');
            }
        }

        if (config.runs_count !== undefined) config.runs_count++;

        if (isLastBulkTrade && config.is_running) {
            this.trade_status = 'RUNNING';
        }
    };

    @action
    stopAll = (reason: string) => {
        ['even_odd', 'over_under', 'differs', 'matches'].forEach(s => {
            const c = (this as Record<string, unknown>)[`${s}_config`] as TTradeConfig;
            if (c) c.is_running = false;
        });
        this.active_strategy = null;
        this.trade_status = reason;
        this.addLog(reason, 'info');
    };

    private calculateStake = (config: TTradeConfig) => {
        let stake = config.stake;
        if (this.last_result === 'LOSS' && config.use_martingale) {
            stake = stake * Math.pow(config.multiplier, this.current_streak);
        }
        return Number(stake.toFixed(2));
    };
}
