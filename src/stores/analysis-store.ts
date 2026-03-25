import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { DigitStatsEngine } from '@/lib/digit-stats-engine';
import { DigitTradeEngine } from '@/lib/digit-trade-engine';
import RootStore from './root-store';

export type TDigitStat = {
    digit: number;
    count: number;
    percentage: number;
    rank: number;
    power: number;
    is_increasing: boolean;
};

export type TAnalysisHistory = {
    type: 'E' | 'O' | 'U' | 'O_U' | 'M' | 'D' | 'R' | 'F';
    value: string | number;
    color: string;
};

type TTick = {
    symbol: string;
    quote: number | string;
    epoch: number;
};

export default class AnalysisStore {
    root_store: RootStore;
    stats_engine: DigitStatsEngine;
    trade_engine: DigitTradeEngine;

    @observable accessor digit_stats: TDigitStat[] = [];
    @observable accessor ticks: number[] = [];
    @observable accessor symbol = 'R_100';
    @observable accessor current_price: string | number = '0.00';
    @observable accessor last_digit: number | null = null;
    @observable accessor total_ticks = 1000;
    @observable accessor pip = 2;
    private symbol_pips: Map<string, number> = new Map();

    @observable accessor is_connected = false;
    @observable accessor is_loading = false;
    @observable accessor error_message: string | null = null;
    @observable accessor is_subscribing = false;

    @observable accessor percentages = {
        even: 50,
        odd: 50,
        over: 50,
        under: 50,
        match: 10,
        differ: 90,
        rise: 50,
        fall: 50,
    };
    @observable accessor current_streaks = {
        even_odd: { count: 0, type: 'EVEN' },
        over_under: { count: 0, type: 'OVER' },
        match_diff: { count: 0, type: 'MATCH' },
        rise_fall: { count: 0, type: 'RISE' },
    };

    // History (Delegated to engine but observable here for UI)
    @observable accessor even_odd_history: TAnalysisHistory[] = [];
    @observable accessor over_under_history: TAnalysisHistory[] = [];
    @observable accessor matches_differs_history: TAnalysisHistory[] = [];
    @observable accessor rise_fall_history: TAnalysisHistory[] = [];

    // Settings
    @observable accessor over_under_threshold = 5;
    @observable accessor match_diff_digit = 6;
    @observable accessor markets: { group: string; items: { value: string; label: string }[] }[] = [];

    @observable accessor subscription_id: string | null = null;

    private unsubscribe_ticks: (() => Promise<void> | void) | null = null;

    constructor(root_store: RootStore) {
        makeObservable(this);
        this.root_store = root_store;
        this.stats_engine = new DigitStatsEngine();
        this.trade_engine = new DigitTradeEngine();

        // Sync engine configs
        this.updateEngineConfig();

        // Sync with unified market store
        reaction(
            () => {
                const market = this.root_store.analysis_market;
                if (!market) return { price: undefined, digit: undefined, symbol: undefined };
                return {
                    price: market.current_price,
                    digit: market.last_digit,
                    symbol: market.symbol,
                };
            },
            ({ price, digit, symbol }) => {
                if (symbol === this.symbol) {
                    runInAction(() => {
                        this.current_price = price;
                        this.last_digit = digit;
                    });
                }
            }
        );

        reaction(
            () => this.root_store.common?.is_socket_opened,
            is_socket_opened => {
                this.is_connected = !!is_socket_opened;
                if (is_socket_opened) {
                    this.fetchMarkets();
                    if (!this.unsubscribe_ticks) {
                        this.subscribeToTicks(); // Auto-subscribe if connected and not already
                    }
                } else {
                    this.unsubscribeFromTicks(); // Clean up on disconnect
                }
            }
        );

        if (this.root_store.common?.is_socket_opened) {
            this.is_connected = true;
        }

        // Global symbol sync
        reaction(
            () => this.root_store.analysis_market?.symbol,
            market_symbol => {
                if (!market_symbol) return;
                runInAction(() => {
                    this.symbol = market_symbol;
                });
            }
        );

        // Global ticks sync
        reaction(
            () => {
                const market = this.root_store.analysis_market;
                if (!market) return { ticks: [], price: undefined };
                return {
                    ticks: market.ticks,
                    price: market.current_price,
                };
            },
            ({ ticks, price }) => {
                if (ticks.length > 0 && price !== undefined) {
                    this.updateDigitStats([...ticks], [price]);
                }
            }
        );
    }

    @action
    updateEngineConfig = () => {
        this.stats_engine.setConfig({
            over_under_threshold: this.over_under_threshold,
            match_diff_digit: this.match_diff_digit,
            total_samples: this.total_ticks,
            pip: this.pip,
        });
        this.refreshStats(); // Update observables from engine
    };

    @action
    init = async () => {
        if (this.is_connected) {
            this.subscribeToTicks();
        }
    };

    @action
    handleTick = (tick: TTick) => {
        console.log(`[AnalysisStore] Received tick for ${tick.symbol}: ${tick.quote}`);
        if (tick.symbol !== this.symbol) {
            console.warn(`[AnalysisStore] Symbol mismatch: ${tick.symbol} !== ${this.symbol}`);
            return;
        }

        const price = Number(tick.quote);
        const new_digit = this.stats_engine.extractLastDigit(price);
        console.log(`[AnalysisStore] Extracted digit: ${new_digit} (pip: ${this.stats_engine.pip})`);

        runInAction(() => {
            if (this.is_subscribing) this.is_subscribing = false;
            if (this.is_loading) this.is_loading = false;
        });

        if (!isNaN(new_digit)) {
            const current_ticks = [...this.ticks, new_digit];
            if (current_ticks.length > this.total_ticks) current_ticks.shift();

            this.ticks = current_ticks;
            this.last_digit = this.stats_engine.extractLastDigit(price);
            this.current_price = price;

            // Push to engine
            this.stats_engine.updateWithHistory(this.ticks, price);
            this.refreshStats();

            // Push to trade engine
            this.trade_engine.processTick(
                new_digit,
                { percentages: this.stats_engine.getPercentages(), digit_stats: this.stats_engine.digit_stats },
                this.symbol,
                this.root_store.client.currency || 'USD'
            );
        }
    };

    @action
    updateDigitStats = (digits: number[], quotes: (string | number)[]) => {
        this.ticks = digits;
        const prices = (quotes || []).map(q => Number(q));
        const last_price = prices[prices.length - 1] || 0;
        this.current_price = last_price;
        const last_digit = digits[digits.length - 1];
        if (last_digit !== undefined) this.last_digit = last_digit;

        this.stats_engine.update(digits, prices);
        this.refreshStats();
    };

    @action
    subscribeToTicks = async () => {
        // Now handled by AnalysisMarketStore
    };

    @action
    unsubscribeFromTicks = () => {
        if (this.unsubscribe_ticks) {
            this.unsubscribe_ticks();
            this.unsubscribe_ticks = null;
        }

        runInAction(() => {
            this.subscription_id = null;
            this.is_loading = false;
            this.error_message = null;
            this.stats_engine.reset();
            this.refreshStats();
            this.ticks = [];
        });
    };

    @action
    refreshStats = () => {
        // Sync observables from engine state
        this.digit_stats = this.stats_engine.digit_stats;
        this.even_odd_history = this.stats_engine.even_odd_history;
        this.over_under_history = this.stats_engine.over_under_history;
        this.matches_differs_history = this.stats_engine.matches_differs_history;
        this.rise_fall_history = this.stats_engine.rise_fall_history;

        this.percentages = this.stats_engine.getPercentages();

        const getStreak = (history: TAnalysisHistory[]): { count: number; type: string } => {
            if (history.length === 0) return { count: 0, type: '' };
            const type = history[0].type as string; // Assert as string
            let count = 0;
            for (const h of history) {
                if (h.type === type) count++;
                else break;
            }
            return { count, type };
        };

        this.current_streaks = {
            even_odd: getStreak(this.even_odd_history),
            over_under: getStreak(this.over_under_history),
            match_diff: getStreak(this.matches_differs_history),
            rise_fall: getStreak(this.rise_fall_history),
        };
    };

    @action
    setSymbol = (symbol: string) => {
        if (this.symbol === symbol) return;

        this.unsubscribeFromTicks();
        this.symbol = symbol;
        this.pip = this.symbol_pips.get(symbol) || 2;
        this.updateEngineConfig();
        this.subscribeToTicks();
    };

    @action
    fetchMarkets = async () => {
        // Now handled by AnalysisMarketStore
    };

    @action
    setTotalTicks = (count: number) => {
        this.total_ticks = count;
        this.updateEngineConfig();
    };

    @action
    setMatchDiffDigit = (digit: number) => {
        this.match_diff_digit = digit;
        this.updateEngineConfig();
    };

    @action
    setOverUnderThreshold = (threshold: number) => {
        this.over_under_threshold = threshold;
        this.updateEngineConfig();
    };
}
