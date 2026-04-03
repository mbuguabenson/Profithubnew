import { action, makeObservable, observable, runInAction } from 'mobx';
import { api_base } from '@/external/bot-skeleton';
import { TDigitStat } from '@/stores/analysis-store';

export type TProfitmaxConfig = {
    stake: number;
    duration: number; // ticks
    is_running: boolean;
    // Logic 1: Base Trigger
    trigger_prob_type: 'EVEN' | 'ODD' | 'EITHER';
    trigger_operator: 'GT' | 'GTE' | 'EQ' | 'LT' | 'LTE';
    trigger_value: number; // e.g., 60%
    trigger_action: 'BUY_EVEN' | 'BUY_ODD' | 'ALTERNATE';

    // Logic 2: Entry Timing Rule
    entry_condition: 'RULE_1' | 'RULE_2' | 'RULE_3' | 'RULE_4';
};

export type TProfitmaxLog = {
    timestamp: number;
    message: string;
    type: 'info' | 'success' | 'error' | 'trade';
};

export class ProfitmaxTradeEngine {
    @observable accessor config: TProfitmaxConfig = {
        stake: 0.35,
        duration: 1,
        is_running: false,
        trigger_prob_type: 'EVEN',
        trigger_operator: 'GT',
        trigger_value: 60,
        trigger_action: 'BUY_EVEN',
        entry_condition: 'RULE_1',
    };

    @observable accessor trade_status: string = 'IDLE';
    @observable accessor is_executing = false;
    @observable accessor logs: TProfitmaxLog[] = [];
    @observable accessor session_profit: number = 0;

    private consecutive_even = 0;
    private consecutive_odd = 0;
    private last_alternate: 'DIGITEVEN' | 'DIGITODD' | null = null;
    private previous_even_pct = 50;

    // Rule 4 Tracking State
    private rule4_tracking: { active: boolean; ticks_counted: number; target_digits: number[]; contract_type: 'DIGITEVEN' | 'DIGITODD' } = {
        active: false,
        ticks_counted: 0,
        target_digits: [],
        contract_type: 'DIGITEVEN'
    };

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
    updateConfig = <K extends keyof TProfitmaxConfig>(key: K, value: TProfitmaxConfig[K]) => {
        this.config[key] = value;
    };

    @action
    toggleStart = () => {
        if (this.config.is_running) {
            this.config.is_running = false;
            this.trade_status = 'STOPPED';
            this.rule4_tracking.active = false;
        } else {
            this.config.is_running = true;
            this.trade_status = 'RUNNING... SCANNING FOR CONDITIONS';
            this.addLog('Bot Started. Scanning market conditions...', 'info');
        }
    };

    @action
    processTick = (
        last_digit: number,
        stats: { percentages: { even: number; odd: number }; digit_stats: TDigitStat[] },
        symbol: string,
        currency: string
    ) => {
        // Core tracking updates
        if (last_digit % 2 === 0) {
            this.consecutive_even++;
            this.consecutive_odd = 0;
        } else {
            this.consecutive_odd++;
            this.consecutive_even = 0;
        }

        if (!this.config.is_running || this.is_executing) {
            this.previous_even_pct = stats.percentages.even;
            return;
        }

        // Handle Active Rule 4 Tracking Array Buffer
        if (this.rule4_tracking.active) {
            this.rule4_tracking.ticks_counted++;
            if (this.rule4_tracking.target_digits.includes(last_digit)) {
                // Rule 4 met internally during the wait period!
                this.rule4_tracking.active = false;
                this.executeTrade(this.rule4_tracking.contract_type, symbol, currency);
                return;
            } else if (this.rule4_tracking.ticks_counted >= 2) {
                // Expired
                this.rule4_tracking.active = false;
                this.trade_status = 'Rule 4 window expired. Rescanning.';
            }
            return;
        }

        // 1. Evaluate Base Condition
        let base_met = false;
        let chosen_contract: 'DIGITEVEN' | 'DIGITODD' | null = null;
        let active_prob = 0;

        if (this.config.trigger_prob_type === 'EVEN') active_prob = stats.percentages.even;
        else if (this.config.trigger_prob_type === 'ODD') active_prob = stats.percentages.odd;
        else active_prob = Math.max(stats.percentages.even, stats.percentages.odd);

        const target = this.config.trigger_value;
        switch (this.config.trigger_operator) {
            case 'GT': base_met = active_prob > target; break;
            case 'GTE': base_met = active_prob >= target; break;
            case 'EQ': base_met = active_prob === target; break;
            case 'LT': base_met = active_prob < target; break;
            case 'LTE': base_met = active_prob <= target; break;
        }

        if (base_met) {
            if (this.config.trigger_action === 'BUY_EVEN') {
                chosen_contract = 'DIGITEVEN';
            } else if (this.config.trigger_action === 'BUY_ODD') {
                chosen_contract = 'DIGITODD';
            } else if (this.config.trigger_action === 'ALTERNATE') {
                // Determine best by active prob, or just flip flop? "alternate in the best condition market"
                // Flip flop pattern
                chosen_contract = this.last_alternate === 'DIGITEVEN' ? 'DIGITODD' : 'DIGITEVEN';
            }
        }

        if (!chosen_contract) {
            this.trade_status = `SCANNING (Base Condition Not Met: ${active_prob.toFixed(1)}% ${this.config.trigger_operator} ${target}%)`;
            this.previous_even_pct = stats.percentages.even;
            return;
        }

        // 2. Evaluate Entry Conditioning Rules
        let ready_to_trade = false;

        const sorted_digits = [...stats.digit_stats].sort((a, b) => b.percentage - a.percentage);
        const most = sorted_digits[0].digit;
        const second_most = sorted_digits[1].digit;
        const least = sorted_digits[9].digit;

        const is_even = (d: number) => d % 2 === 0;

        if (this.config.entry_condition === 'RULE_1') {
            // "If the most appearing, 2nd most appearing and least are as selected market"
            const parity_match = chosen_contract === 'DIGITEVEN'
                ? is_even(most) && is_even(second_most) && is_even(least)
                : !is_even(most) && !is_even(second_most) && !is_even(least);

            if (parity_match) ready_to_trade = true;
            else this.trade_status = `Condition Met, Waiting for Rule 1 (Top/Least Parity Match)`;

        } else if (this.config.entry_condition === 'RULE_2') {
            // "if trading even the last two or more digits appear as odd consecutively and then one even"
            if (chosen_contract === 'DIGITEVEN') {
                // Currently last digit is Even, and before that we had >= 2 Odds
                if (last_digit % 2 === 0 && this.consecutive_odd >= 2) ready_to_trade = true;
                else this.trade_status = `Waiting for Rule 2 (2 Odds then 1 Even)`;
            } else {
                // Vice versa for Odd
                if (last_digit % 2 !== 0 && this.consecutive_even >= 2) ready_to_trade = true;
                else this.trade_status = `Waiting for Rule 2 (2 Evens then 1 Odd)`;
            }

        } else if (this.config.entry_condition === 'RULE_3') {
            // "3rd entry reversal if the highest market is even with above 60% decreasing wait for consecutive evens start trading"
            const highest_is_even = is_even(most);
            const is_decreasing = stats.percentages.even < this.previous_even_pct;

            if (highest_is_even && stats.percentages.even > 60 && is_decreasing) {
                // Reversal signal - wait for consecutive evens. If we GET consecutive evens, trade!
                if (this.consecutive_even >= 2) {
                    ready_to_trade = true;
                    chosen_contract = 'DIGITODD'; // Reversal action
                } else {
                    this.trade_status = `Rule 3 active: Waiting for 2 Consecutive Evens to Reverse`;
                }
            } else {
                this.trade_status = `Waiting for Rule 3 setup (>60% Even, Decreasing)`;
            }

        } else if (this.config.entry_condition === 'RULE_4') {
            // "if the most digit that appears in the next 2 ticks consucitive is least, 2nd mpst appearing od most appearing start trading"
            // Start tracking next 2 ticks
            this.rule4_tracking = {
                active: true,
                ticks_counted: 0,
                target_digits: [most, second_most, least],
                contract_type: chosen_contract
            };
            this.trade_status = `Rule 4 Triggered: Delaying entry to scan next 2 ticks for Top/Bottom digits.`;
        }

        if (ready_to_trade && chosen_contract) {
            this.executeTrade(chosen_contract, symbol, currency);
        }

        this.previous_even_pct = stats.percentages.even;
    };

    @action
    executeTrade = async (contract_type: 'DIGITEVEN' | 'DIGITODD', symbol: string, currency: string) => {
        if (this.is_executing) return;
        this.is_executing = true;

        if (this.config.trigger_action === 'ALTERNATE') {
            this.last_alternate = contract_type;
        }

        const stake = this.config.stake;

        try {
            if (!api_base.api) throw new Error('API not connected');

            this.addLog(`Executing Entry: ${contract_type} ($${stake})`, 'trade');
            this.trade_status = `TRADING ${contract_type}...`;

            const proposal = (await api_base.api.send({
                proposal: 1,
                amount: stake,
                basis: 'stake',
                contract_type,
                currency: currency || 'USD',
                duration: this.config.duration,
                duration_unit: 't',
                underlying_symbol: symbol,
            })) as { error?: { message: string; code: string }; proposal?: { id: string } };

            if (proposal.error) throw new Error(proposal.error.message);

            const buy = (await api_base.api.send({
                buy: proposal.proposal!.id,
                price: stake,
            })) as { error?: { message: string }; buy?: { contract_id: string } };

            if (buy.error) throw new Error(buy.error.message);

            this.monitorTrade(buy.buy!.contract_id);

        } catch (e: any) {
            console.error('[ProfitmaxTradeEngine] Trade Error:', e);
            runInAction(() => {
                const message = e.error?.message || e.message || 'Unknown Error';
                this.addLog(`Error: ${message}`, 'error');
                this.is_executing = false;
                this.trade_status = 'ERROR - Check Logs';
                this.config.is_running = false;
            });
        }
    };

    private monitorTrade = (contract_id: string) => {
        const subscription = api_base.api?.onMessage().subscribe((response: any) => {
            if (response.proposal_open_contract?.contract_id === contract_id && response.proposal_open_contract?.is_sold) {
                this.handleResult(response.proposal_open_contract);
                if (subscription && typeof subscription.unsubscribe === 'function') {
                    subscription.unsubscribe();
                }
            }
        });

        api_base.api?.send({ proposal_open_contract: 1, contract_id, subscribe: 1 }).catch(() => {
            runInAction(() => { this.is_executing = false; });
        });
    };

    @action
    handleResult = (contract: { profit: number }) => {
        const profit = Number(contract.profit);
        this.session_profit += profit;
        this.is_executing = false;

        if (profit > 0) {
            this.addLog(`WIN: +${profit.toFixed(2)}`, 'success');
        } else {
            this.addLog(`LOSS: ${profit.toFixed(2)}`, 'error');
        }

        if (this.config.is_running) {
            this.trade_status = 'RUNNING... SCANNING FOR CONDITIONS';
        } else {
            this.trade_status = 'STOPPED';
        }
    };
}
