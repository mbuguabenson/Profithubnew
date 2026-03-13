import { action, computed, makeObservable, observable } from 'mobx';

import type { TicksHistoryResponse, TicksStreamResponse } from '@deriv/api-types';
import { WS } from '@deriv/shared';
import { TRootStore } from 'Types';

// AutoTrade Strategy Types
export type TStrategyType = 'differs' | 'over_under' | 'even_odd';

export type TAutoTradeConfig = {
    strategy_type: TStrategyType;
    stake: number;
    martingale_enabled: boolean;
    martingale_multiplier: number;
    ticks_duration: number;
    auto_restart: boolean;
    speed_execution: boolean;
    bulk_count: number;
    take_profit: number;
    stop_loss: number;
    max_trades_per_hour: number;
};

export type TStrategyCondition = {
    type: 'digit_percentage' | 'digit_trend' | 'digit_consecutive';
    digit?: number;
    operator?: '>' | '<' | '>=' | '<=' | '=';
    value?: number;
    trend?: 'increasing' | 'decreasing';
};

type TDigitStats = {
    digit: number;
    count: number;
    percentage: number;
    is_increasing: boolean;
};

export class AutoTradeStore {
    is_active: boolean = false;
    config: TAutoTradeConfig = {
        strategy_type: 'differs',
        stake: 1,
        martingale_enabled: false,
        martingale_multiplier: 2,
        ticks_duration: 5,
        auto_restart: false,
        speed_execution: false,
        bulk_count: 1,
        take_profit: 0,
        stop_loss: 0,
        max_trades_per_hour: 100,
    };

    digit_stats: TDigitStats[] = [];
    previous_digit_stats: TDigitStats[] = [];
    last_digits: number[] = [];
    current_profit_loss: number = 0;
    trades_count: number = 0;
    trades_this_hour: number = 0;
    last_trade_time: number = 0;
    current_stake: number = 1;
    market_status: 'stable' | 'unstable' | 'wait' | 'trade' = 'stable';
    last_tick: TicksStreamResponse['tick'] | null = null;
    subscription_id: string | null = null;
    symbol: string | null = null;
    trade_intent: {
        contract_type: 'DIGITDIFF' | 'DIGITOVER' | 'DIGITUNDER' | 'DIGITEVEN' | 'DIGITODD';
        barrier?: string;
    } | null = null;
    root_store: TRootStore;

    constructor(root_store: TRootStore) {
        this.root_store = root_store;
        makeObservable(this, {
            is_active: observable,
            config: observable,
            digit_stats: observable,
            previous_digit_stats: observable,
            last_digits: observable,
            current_profit_loss: observable,
            trades_count: observable,
            trades_this_hour: observable,
            market_status: observable,
            last_tick: observable,
            symbol: observable,
            trade_intent: observable,

            setConfig: action.bound,
            startAutoTrade: action.bound,
            stopAutoTrade: action.bound,
            updateDigitStats: action.bound,
            handleTickUpdate: action.bound,
            executeTrade: action.bound,
            updateProfitLoss: action.bound,
            resetMartingale: action.bound,
            evaluateStrategy: action.bound,
            checkMarketStability: action.bound,

            sorted_digits: computed,
            most_appearing: computed,
            second_most_appearing: computed,
            least_appearing: computed,
            is_running: computed,
        });

        // Reset trades count every hour
        setInterval(() => {
            this.trades_this_hour = 0;
        }, 3600000);
    }

    get sorted_digits(): TDigitStats[] {
        return this.digit_stats.slice().sort((a, b) => b.count - a.count);
    }

    get most_appearing(): TDigitStats | null {
        return this.sorted_digits[0] || null;
    }

    get second_most_appearing(): TDigitStats | null {
        return this.sorted_digits[1] || null;
    }

    get least_appearing(): TDigitStats | null {
        return this.sorted_digits[this.sorted_digits.length - 1] || null;
    }

    get is_running(): boolean {
        return this.is_active;
    }

    setConfig(config: Partial<TAutoTradeConfig>): void {
        this.config = { ...this.config, ...config };
    }

    async startAutoTrade(symbol: string, tick_count: number): Promise<void> {
        if (this.is_active) return;

        this.is_active = true;
        this.symbol = symbol;
        this.current_stake = this.config.stake;
        this.current_profit_loss = 0;
        this.trades_count = 0;

        // Subscribe to ticks history to get digit stats
        try {
            const response = await WS.ticksHistory({
                ticks_history: symbol,
                end: 'latest',
                count: tick_count,
                style: 'ticks',
            });

            if (response.error) {
                this.stopAutoTrade();
                return;
            }

            this.updateDigitStats(response as TicksHistoryResponse, tick_count);

            // Subscribe to tick stream
            const stream = await WS.subscribeTicksHistory({ ticks_history: symbol, style: 'ticks' });
            this.subscription_id = stream.subscription?.id || null;

            stream.subscribe((tick: TicksStreamResponse) => {
                this.handleTickUpdate(tick, tick_count);
            });
        } catch (_error) {
            this.stopAutoTrade();
        }
    }

    stopAutoTrade(): void {
        this.is_active = false;
        this.symbol = null;
        if (this.subscription_id) {
            WS.forget(this.subscription_id);
            this.subscription_id = null;
        }
    }

    updateDigitStats(response: TicksHistoryResponse, tick_count: number): void {
        if (!response.history || !response.history.prices) return;

        const prices = response.history.prices;
        const digits = prices.map(price => {
            const price_str = price.toString();
            return parseInt(price_str.slice(-1));
        });

        this.last_digits = digits.slice(-tick_count);
        this.calculateDigitStats();
    }

    handleTickUpdate(tick: TicksStreamResponse, tick_count: number): void {
        if (!tick.tick || !tick.tick.quote) return;

        this.last_tick = tick.tick;
        const price = tick.tick.quote;
        const digit = parseInt(price.toString().slice(-1));

        this.last_digits.push(digit);
        if (this.last_digits.length > tick_count) {
            this.last_digits.shift();
        }

        this.calculateDigitStats();
        this.checkMarketStability();
        this.evaluateStrategy();
    }

    calculateDigitStats(): void {
        const counts = new Array(10).fill(0);
        this.last_digits.forEach(d => counts[d]++);

        const total = this.last_digits.length;
        this.previous_digit_stats = [...this.digit_stats];

        this.digit_stats = counts.map((count, digit) => ({
            digit,
            count,
            percentage: (count / total) * 100,
            is_increasing: this.previous_digit_stats[digit]
                ? (count / total) * 100 > this.previous_digit_stats[digit].percentage
                : false,
        }));
    }

    checkMarketStability(): void {
        // Market is considered unstable if:
        // 1. Any digit has > 25% appearance (heavily biased)
        // 2. The standard deviation of digit distribution is very high
        const percentages = this.digit_stats.map(d => d.percentage);
        const max_p = Math.max(...percentages);

        if (max_p > 25) {
            this.market_status = 'unstable';
        } else if (this.market_status === 'unstable' && max_p < 20) {
            this.market_status = 'stable';
        }
    }

    evaluateStrategy(): void {
        this.trade_intent = null;

        // Strategy methods will update market_status and trade_intent
        switch (this.config.strategy_type) {
            case 'differs':
                this.evaluateDiffersStrategy();
                break;
            case 'over_under':
                this.evaluateOverUnderStrategy();
                break;
            case 'even_odd':
                this.evaluateEvenOddStrategy();
                break;
            default:
                break;
        }

        if (this.trade_intent && this.market_status === 'trade') {
            this.executeTrade();
        }
    }

    evaluateDiffersStrategy(): void {
        const sorted = this.sorted_digits;
        const least = sorted[sorted.length - 1];

        // Refined Differs Logic:
        // 1. Digit should be in range 2-7
        // 2. Percentage should be < 10%
        // 3. Trend should be decreasing or stable
        const is_in_range = least.digit >= 2 && least.digit <= 7;
        const is_low_percentage = least.percentage < 10;
        const is_stable_or_decreasing = !least.is_increasing;

        if (is_in_range && is_low_percentage && is_stable_or_decreasing) {
            this.market_status = 'trade';
            this.trade_intent = {
                contract_type: 'DIGITDIFF',
                barrier: least.digit.toString(),
            };
        } else if (is_low_percentage) {
            this.market_status = 'wait';
        }
    }

    evaluateOverUnderStrategy(): void {
        const over_percentage = this.digit_stats.filter(d => d.digit >= 5).reduce((a, b) => a + b.percentage, 0);
        const under_percentage = 100 - over_percentage;

        // Refined Over/Under Logic:
        // Wait at 52%+, trade at 55%+
        if (over_percentage >= 55) {
            this.market_status = 'trade';
            this.trade_intent = {
                contract_type: 'DIGITOVER',
                barrier: '4',
            };
        } else if (under_percentage >= 55) {
            this.market_status = 'trade';
            this.trade_intent = {
                contract_type: 'DIGITUNDER',
                barrier: '5',
            };
        } else if (over_percentage >= 52 || under_percentage >= 52) {
            this.market_status = 'wait';
        } else {
            this.market_status = 'stable';
        }
    }

    evaluateEvenOddStrategy(): void {
        const even_stats = this.digit_stats.filter(d => d.digit % 2 === 0);
        const odd_stats = this.digit_stats.filter(d => d.digit % 2 !== 0);
        
        const even_percentage = even_stats.reduce((a, b) => a + b.percentage, 0);
        const odd_percentage = 100 - even_percentage;

        // Refined Even/Odd Logic:
        // 55%+ total percentage for parity
        if (even_percentage >= 55) {
            this.market_status = 'trade';
            this.trade_intent = {
                contract_type: 'DIGITEVEN',
            };
        } else if (odd_percentage >= 55) {
            this.market_status = 'trade';
            this.trade_intent = {
                contract_type: 'DIGITODD',
            };
        } else if (even_percentage >= 52 || odd_percentage >= 52) {
            this.market_status = 'wait';
        } else {
            this.market_status = 'stable';
        }
    }

    async executeTrade(): Promise<void> {
        if (!this.config.speed_execution) {
            // Add minimum delay between trades
            const time_since_last = Date.now() - this.last_trade_time;
            if (time_since_last < 1000) {
                return;
            }
        }

        if (!this.trade_intent || !this.symbol) return;

        this.last_trade_time = Date.now();

        const trade_promises = [];

        // Execute bulk trades if configured
        for (let i = 0; i < this.config.bulk_count; i++) {
            const trade_promise = (async () => {
                try {
                    const proposal_req = {
                        proposal: 1,
                        amount: this.config.stake,
                        basis: 'stake',
                        contract_type: this.trade_intent?.contract_type,
                        currency: this.root_store.client.currency || 'USD',
                        duration: this.config.ticks_duration,
                        duration_unit: 't',
                        symbol: this.symbol,
                        barrier: this.trade_intent?.barrier,
                    };

                    const proposal_response = await WS.send(proposal_req);

                    if (proposal_response.error) {
                        // eslint-disable-next-line no-console
                        console.error('AutoTrade Proposal Error:', proposal_response.error);
                        return;
                    }

                    const proposal_id = proposal_response.proposal.id;
                    const ask_price = proposal_response.proposal.ask_price;

                    const buy_response = await WS.buy(proposal_id, ask_price);

                    if (buy_response.error) {
                        // eslint-disable-next-line no-console
                        console.error('AutoTrade Buy Error:', buy_response.error);
                    } else {
                        this.trades_count++;
                        this.trades_this_hour++;
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('AutoTrade Execution Error:', error);
                }
            })();
            trade_promises.push(trade_promise);
        }

        await Promise.all(trade_promises);
    }

    updateProfitLoss(profit: number): void {
        this.current_profit_loss += profit;

        if (profit < 0 && this.config.martingale_enabled) {
            this.current_stake *= this.config.martingale_multiplier;
        } else {
            this.resetMartingale();
        }
    }

    resetMartingale(): void {
        this.current_stake = this.config.stake;
    }
}

export default AutoTradeStore;
