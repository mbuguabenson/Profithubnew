/* eslint-disable no-promise-executor-return */
import debounce from 'lodash.debounce';
import { localize } from '@deriv-com/translations';
import { getLast } from '../../../utils/binary-utils';
import { observer as globalObserver } from '../../../utils/observer';
import { api_base } from '../../api/api-base';
import { getDirection, getLastDigit } from '../utils/helpers';
import { expectPositiveInteger } from '../utils/sanitize';
import * as constants from './state/constants';

let tickListenerKey;

export default Engine =>
    class Ticks extends Engine {
        async watchTicks(symbol) {
            if (symbol && this.symbol !== symbol) {
                this.symbol = symbol;
                const { ticksService } = this.$scope;

                await ticksService.stopMonitor({
                    symbol,
                    key: tickListenerKey,
                });
                const callback = ticks => {
                    if (this.is_proposal_subscription_required) {
                        this.checkProposalReady();
                    }
                    const lastTick = ticks.slice(-1)[0];
                    const { epoch } = lastTick;
                    this.store.dispatch({ type: constants.NEW_TICK, payload: epoch });
                };

                const key = await ticksService.monitor({ symbol, callback });
                tickListenerKey = key;
            }
        }

        checkTicksPromiseExists() {
            return this.$scope.ticksService.ticks_history_promise;
        }

        getTicks(toString = false) {
            return new Promise(resolve => {
                this.$scope.ticksService.request({ symbol: this.symbol }).then(ticks => {
                    const ticks_list = ticks.map(tick => {
                        if (toString) {
                            return tick.quote.toFixed(this.getPipSize());
                        }
                        return tick.quote;
                    });

                    resolve(ticks_list);
                });
            });
        }

        getLastTick(raw, toString = false) {
            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol })
                    .then(ticks => {
                        let last_tick = raw ? getLast(ticks) : getLast(ticks).quote;
                        if (!raw && toString) {
                            last_tick = last_tick.toFixed(this.getPipSize());
                        }
                        resolve(last_tick);
                    })
                    .catch(e => {
                        if (e.code === 'MarketIsClosed') {
                            globalObserver.emit('Error', e);
                            resolve(e.code);
                        }
                    })
            );
        }

        getLastDigit() {
            return new Promise(resolve => this.getLastTick(false, true).then(tick => resolve(getLastDigit(tick))));
        }

        getLastDigitList() {
            return new Promise(resolve => this.getTicks().then(ticks => resolve(this.getLastDigitsFromList(ticks))));
        }
        getLastDigitsFromList(ticks) {
            const digits = ticks.map(tick => {
                return getLastDigit(tick.toFixed(this.getPipSize()));
            });
            return digits;
        }

        checkDirection(dir) {
            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol })
                    .then(ticks => resolve(getDirection(ticks) === dir))
            );
        }

        getOhlc(args) {
            const { granularity = this.options.candleInterval || 60, field } = args || {};

            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol, granularity })
                    .then(ohlc => resolve(field ? ohlc.map(o => o[field]) : ohlc))
            );
        }

        getOhlcFromEnd(args) {
            const { index: i = 1 } = args || {};

            const index = expectPositiveInteger(Number(i), localize('Index must be a positive integer'));

            return new Promise(resolve => this.getOhlc(args).then(ohlc => resolve(ohlc.slice(-index)[0])));
        }

        getPipSize() {
            return this.$scope.ticksService.pipSizes[this.symbol];
        }

        async requestAccumulatorStats() {
            const subscription_id = this.subscription_id_for_accumulators;
            const is_proposal_requested = this.is_proposal_requested_for_accumulators;
            const proposal_request = {
                ...window.Blockly.accumulators_request,
                amount: this?.tradeOptions?.amount,
                basis: this?.tradeOptions?.basis,
                contract_type: 'ACCU',
                currency: this?.tradeOptions?.currency,
                growth_rate: this?.tradeOptions?.growth_rate,
                proposal: 1,
                subscribe: 1,
                symbol: this?.tradeOptions?.symbol,
            };
            if (!subscription_id && !is_proposal_requested) {
                this.is_proposal_requested_for_accumulators = true;
                if (proposal_request) {
                    await api_base?.api?.send(proposal_request);
                }
            }
        }

        async handleOnMessageForAccumulators() {
            let ticks_stayed_in_list = [];
            return new Promise(resolve => {
                const subscription = api_base.api.onMessage().subscribe(({ data }) => {
                    if (data.msg_type === 'proposal') {
                        try {
                            this.subscription_id_for_accumulators = data.subscription.id;
                            // this was done because we can multile arrays in the respone and the list comes in reverse order
                            const stat_list = (data.proposal.contract_details.ticks_stayed_in || []).flat().reverse();
                            ticks_stayed_in_list = [...stat_list, ...ticks_stayed_in_list];
                            if (ticks_stayed_in_list.length > 0) resolve(ticks_stayed_in_list);
                        } catch (error) {
                            globalObserver.emit('Unexpected message type or no proposal found:', error);
                        }
                    }
                });
                api_base.pushSubscription(subscription);
            });
        }

        async fetchStatsForAccumulators() {
            try {
                // request stats for accumulators
                const debouncedAccumulatorsRequest = debounce(() => this.requestAccumulatorStats(), 300);
                debouncedAccumulatorsRequest();
                // wait for proposal response
                const ticks_stayed_in_list = await this.handleOnMessageForAccumulators();
                return ticks_stayed_in_list;
            } catch (error) {
                globalObserver.emit('Error in subscription promise:', error);
                throw error;
            } finally {
                // forget all proposal subscriptions so we can fetch new stats data on new call
                await api_base?.api?.send({ forget_all: 'proposal' });
                this.is_proposal_requested_for_accumulators = false;
                this.subscription_id_for_accumulators = null;
            }
        }

        async getCurrentStat() {
            try {
                const ticks_stayed_in = await this.fetchStatsForAccumulators();
                return ticks_stayed_in?.[0];
            } catch (error) {
                globalObserver.emit('Error fetching current stat:', error);
            }
        }

        async getStatList() {
            try {
                const ticks_stayed_in = await this.fetchStatsForAccumulators();
                // we need to send only lastest 100 ticks
                return ticks_stayed_in?.slice(0, 100);
            } catch (error) {
                globalObserver.emit('Error fetching current stat:', error);
            }
        }

        async getDelayTickValue(tick_value) {
            return new Promise((resolve, reject) => {
                try {
                    const ticks = [];
                    const symbol = this.symbol;

                    const resolveAndExit = () => {
                        this.$scope.ticksService.stopMonitor({
                            symbol,
                            key: '',
                        });
                        resolve(ticks);
                        ticks.length = 0;
                    };

                    const watchTicks = tick_list => {
                        ticks.push(tick_list);
                        const current_tick = ticks.length;
                        if (current_tick === tick_value) {
                            resolveAndExit();
                        }
                    };

                    const delayExecution = tick_list => watchTicks(tick_list);

                    if (Number(tick_value) <= 0) resolveAndExit();
                    this.$scope.ticksService.monitor({ symbol, callback: delayExecution });
                } catch (error) {
                    reject(new Error(`Failed to start tick monitoring: ${error.message}`));
                }
            });
        }

        async getAnalysisPower(target) {
            const ticks = await this.getTicks();
            const lastDigits = this.getLastDigitsFromList(ticks.slice(-100));
            if (!lastDigits.length) return 0;
            let count = 0;
            switch (target.toUpperCase()) {
                case 'EVEN':
                    count = lastDigits.filter(d => d % 2 === 0).length;
                    break;
                case 'ODD':
                    count = lastDigits.filter(d => d % 2 !== 0).length;
                    break;
                case 'OVER':
                    count = lastDigits.filter(d => d > 4).length;
                    break;
                case 'UNDER':
                    count = lastDigits.filter(d => d <= 4).length;
                    break;
            }
            return count;
        }

        async isAnalysisIncreasing(target) {
            const ticks = await this.getTicks();
            const current = this.getLastDigitsFromList(ticks.slice(-50));
            const previous = this.getLastDigitsFromList(ticks.slice(-100, -50));
            if (!current.length || !previous.length) return false;

            const getPower = list => {
                switch (target.toUpperCase()) {
                    case 'EVEN':
                        return list.filter(d => d % 2 === 0).length;
                    case 'ODD':
                        return list.filter(d => d % 2 !== 0).length;
                    case 'OVER':
                        return list.filter(d => d > 4).length;
                    case 'UNDER':
                        return list.filter(d => d <= 4).length;
                }
                return 0;
            };
            return getPower(current) > getPower(previous);
        }

        async digitFrequency(digit, tickCount) {
            const ticks = await this.getTicks();
            const lastDigits = this.getLastDigitsFromList(ticks.slice(-tickCount));
            if (!lastDigits.length) return 0;
            const count = lastDigits.filter(d => d === Number(digit)).length;
            return (count / lastDigits.length) * 100;
        }

        async detectStreak(patternType, valueType, tickCount) {
            const ticks = await this.getTicks();
            const lastDigits = this.getLastDigitsFromList(ticks.slice(-tickCount)).reverse();
            if (!lastDigits.length) return 0;

            const matches = d => {
                if (valueType === 'even') return d % 2 === 0;
                if (valueType === 'odd') return d % 2 !== 0;
                if (valueType === 'over5') return d > 5;
                if (valueType === 'under5') return d < 5;
                return false;
            };

            let streak = 0;
            for (let i = 0; i < lastDigits.length; i++) {
                if (patternType === 'consecutive') {
                    if (matches(lastDigits[i])) streak++;
                    else break;
                } else {
                    // alternating
                    if (i % 2 === 0 ? matches(lastDigits[i]) : !matches(lastDigits[i])) streak++;
                    else break;
                }
            }
            return streak;
        }

        async countDigitsInRange(min, max, tickCount) {
            const ticks = await this.getTicks();
            const lastDigits = this.getLastDigitsFromList(ticks.slice(-tickCount));
            return lastDigits.filter(d => d >= min && d <= max).length;
        }

        async calculateVolatility(tickCount) {
            const ticks = await this.getTicks();
            const sample = ticks.slice(-tickCount);
            if (sample.length < 2) return 0;
            const returns = [];
            for (let i = 1; i < sample.length; i++) returns.push(Math.abs(sample[i] - sample[i - 1]));
            return (returns.reduce((a, b) => a + b, 0) / returns.length) * 100;
        }

        async analyzeTrend(type, tickCount) {
            const ticks = await this.getTicks();
            const sample = this.getLastDigitsFromList(ticks.slice(-tickCount));
            if (sample.length < 5) return 'neutral';

            let val = 0;
            if (type === 'sum') val = sample.reduce((a, b) => a + b, 0) / sample.length;
            else if (type === 'evenodd') val = sample.filter(d => d % 2 === 0).length / sample.length;

            return val > 5 ? 'rising' : val < 4 ? 'falling' : 'neutral';
        }

        async getDigitByRank(rank, tickCount) {
            const ticks = await this.getTicks();
            const digits = this.getLastDigitsFromList(ticks.slice(-tickCount));
            const freq = Array(10).fill(0);
            digits.forEach(d => freq[d]++);
            const sorted = freq.map((f, i) => ({ digit: i, count: f })).sort((a, b) => b.count - a.count);
            return sorted[Math.min(rank - 1, 9)].digit;
        }

        async identifyCandlePattern() {
            const candles = await this.getOhlc({ granularity: 60 });
            const last = candles.slice(-1)[0];
            if (!last) return 'none';
            const body = Math.abs(last.close - last.open);
            const total = Math.abs(last.high - last.low);
            if (body / total < 0.1) return 'doji';
            if (body / total > 0.9) return 'marubozu';
            return 'neutral';
        }

        async analyzeMomentum(tickCount) {
            const ticks = await this.getTicks();
            const current = ticks.slice(-1)[0];
            const previous = ticks.slice(-tickCount)[0];
            if (current > previous) return 'bullish';
            if (current < previous) return 'bearish';
            return 'flat';
        }

        async checkVolumeHealth(tickCount) {
            const ticks = await this.getTicks();
            const changes = [];
            for (let i = 1; i < ticks.slice(-tickCount).length; i++) {
                changes.push(Math.abs(ticks[i] - ticks[i - 1]));
            }
            const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
            return avg > 0.001 ? 'high' : 'low';
        }

        async getLastDigitsCondition(count, condition, digit) {
            const ticks = await this.getTicks();
            const digits = this.getLastDigitsFromList(ticks.slice(-count));
            const last = digits[digits.length - 1];
            switch (condition) {
                case 'eq':
                    return last === digit;
                case 'gt':
                    return last > digit;
                case 'lt':
                    return last < digit;
                case 'neq':
                    return last !== digit;
            }
            return false;
        }

        async getDigitFrequencyRanking(rankType, tickCount) {
            return this.getDigitByRank(rankType === 'most' ? 1 : 10, tickCount);
        }

        async getEvenOddPercent(type, tickCount) {
            const ticks = await this.getTicks();
            const digits = this.getLastDigitsFromList(ticks.slice(-tickCount));
            const count = digits.filter(d => (type === 'even' ? d % 2 === 0 : d % 2 !== 0)).length;
            return (count / digits.length) * 100;
        }

        async getOverUnderPercent(type, threshold, tickCount) {
            const ticks = await this.getTicks();
            const digits = this.getLastDigitsFromList(ticks.slice(-tickCount));
            const count = digits.filter(d => (type === 'over' ? d > threshold : d < threshold)).length;
            return (count / digits.length) * 100;
        }

        async getMatchDifferPercent(type, target, tickCount) {
            const ticks = await this.getTicks();
            const digits = this.getLastDigitsFromList(ticks.slice(-tickCount));
            const count = digits.filter(d => (type === 'match' ? d === target : d !== target)).length;
            return (count / digits.length) * 100;
        }

        async getRiseFallPercent(type, tickCount) {
            const ticks = await this.getTicks();
            const sample = ticks.slice(-tickCount);
            let count = 0;
            for (let i = 1; i < sample.length; i++) {
                if (type === 'rise' && sample[i] > sample[i - 1]) count++;
                if (type === 'fall' && sample[i] < sample[i - 1]) count++;
            }
            return (count / (sample.length - 1)) * 100;
        }

        async getTicksDirection(count, direction) {
            const ticks = await this.getTicks();
            const lastN = ticks.slice(-count);
            for (let i = 1; i < lastN.length; i++) {
                if (direction === 'rise' && lastN[i] <= lastN[i - 1]) return false;
                if (direction === 'fall' && lastN[i] >= lastN[i - 1]) return false;
            }
            return true;
        }

        async checkCandleColor(type) {
            const candles = await this.getOhlc({ granularity: 60 });
            const last = candles.slice(-1)[0];
            if (!last) return false;
            return type === 'green' ? last.close > last.open : last.close < last.open;
        }

        async checkCandleType(type) {
            const pattern = await this.identifyCandlePattern(1);
            return pattern === type;
        }

        async checkCandleBehavior(behavior) {
            const candles = await this.getOhlc({ granularity: 60 });
            const last = candles.slice(-1)[0];
            if (!last) return false;
            const body = Math.abs(last.close - last.open);
            const total = Math.abs(last.high - last.low);
            if (behavior === 'volatile') return total > body * 3;
            if (behavior === 'strong') return body > total * 0.8;
            return false;
        }

        async checkCandleMovement(movement, tickCount) {
            const trend = await this.analyzeMomentum(tickCount);
            return trend === movement;
        }

        async checkMarketTrend(trend, periods) {
            const momentum = await this.analyzeMomentum(periods);
            return momentum === trend;
        }
    };
