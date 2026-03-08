import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { DigitStatsEngine } from '@/lib/digit-stats-engine';
import { DigitTradeEngine } from '@/lib/digit-trade-engine';
import subscriptionManager from '@/lib/subscription-manager';
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

export default class DigitCrackerStore {
    root_store: RootStore;
    stats_engine: DigitStatsEngine;
    trade_engine: DigitTradeEngine;
    api: unknown = null;

    @observable accessor digit_stats: TDigitStat[] = [];
    @observable accessor ticks: number[] = [];
    @observable accessor total_ticks = 1000;
    @observable accessor symbol = 'R_100';
    @observable accessor current_price: string | number = '0.00';
    @observable accessor last_digit: number | null = null;
    @observable accessor is_connected = false;
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

    @observable accessor even_odd_history: TAnalysisHistory[] = [];
    @observable accessor over_under_history: TAnalysisHistory[] = [];

    @observable accessor markets: { group: string; items: { value: string; label: string }[] }[] = [];
    @observable accessor unsubscribe_ticks: (() => void) | null = null;
    @observable accessor pip = 2;
    @observable accessor over_under_threshold = 5;
    @observable accessor match_diff_digit = 6;
    private symbol_pips: Map<string, number> = new Map();

    constructor(root_store: RootStore) {
        makeObservable(this);
        this.root_store = root_store;
        this.stats_engine = new DigitStatsEngine();
        this.trade_engine = new DigitTradeEngine();
        this.updateFromEngine();

        this.initConnection();
    }

    @action
    initConnection = async () => {
        // Subscribe to global socket connection
        reaction(
            () => this.root_store.common?.is_socket_opened,
            is_socket_opened => {
                this.is_connected = !!is_socket_opened;
                if (is_socket_opened) {
                    this.fetchMarkets();
                    if (!this.unsubscribe_ticks) {
                        this.subscribeToTicks(); // Auto-subscribe if connected
                    }
                } else {
                    this.dispose(); // Clean up on disconnect
                }
            }
        );

        // Init immediately if already opened
        if (this.root_store.common?.is_socket_opened) {
            this.is_connected = true;
            this.fetchMarkets();
            this.subscribeToTicks();
        }
    };

    @action
    fetchMarkets = async () => {
        try {
            const { api_base } = await import('@/external/bot-skeleton');
            if (!api_base.api) return;
            const response = (await api_base.api.send({ active_symbols: 'brief' })) as {
                active_symbols?: Record<string, unknown>[];
            };
            if (response.active_symbols) {
                const grouped = Object.values(
                    response.active_symbols.reduce((acc: any, s: any) => {
                        const market = s.market_display_name || s.market;
                        if (!acc[market]) acc[market] = { group: market, items: [] };
                        acc[market].items.push({ value: s.symbol, label: s.display_name });
                        return acc;
                    }, {})
                );
                runInAction(() => {
                    this.markets = grouped;
                });
            }
        } catch (e) {
            console.error('[DigitCrackerStore] Failed to fetch markets:', e);
        }
    };

    @action
    updateEngineConfig = () => {
        this.stats_engine.setConfig({
            pip: this.pip,
            total_samples: this.total_ticks,
            over_under_threshold: this.over_under_threshold,
            match_diff_digit: this.match_diff_digit,
        });
        this.updateFromEngine();
    };

    @action
    setSymbol = (symbol: string) => {
        this.symbol = symbol;
        this.pip = this.symbol_pips.get(symbol) || 2;
        this.updateEngineConfig();
        this.subscribeToTicks();
    };

    @action
    handleTick = (tick: Record<string, unknown>) => {
        if (tick.symbol !== this.symbol) return;

        const price = Number(tick.quote);
        const new_digit = this.stats_engine.extractLastDigit(price);

        runInAction(() => {
            if (this.is_subscribing) this.is_subscribing = false;
        });

        if (!isNaN(new_digit)) {
            const current_ticks = [...this.ticks, new_digit];
            if (current_ticks.length > this.total_ticks) current_ticks.shift();

            this.ticks = current_ticks;
            this.last_digit = new_digit;
            this.current_price = price;

            this.stats_engine.updateWithHistory(this.ticks, price);
            this.updateFromEngine();

            // Push to trade engine
            this.trade_engine.processTick(
                new_digit,
                { percentages: this.stats_engine.getPercentages(), digit_stats: this.stats_engine.digit_stats },
                this.symbol,
                this.root_store.client?.currency || 'USD'
            );
        }
    };

    @action
    subscribeToTicks = async () => {
        if (!this.is_connected) return;

        if (this.unsubscribe_ticks) {
            this.unsubscribe_ticks();
        }

        this.is_subscribing = true;

        try {
            this.unsubscribe_ticks = await subscriptionManager.subscribeToTicks(this.symbol, (data: unknown) => {
                const typed_data = data as Record<string, unknown>;
                if (typed_data.msg_type === 'tick' && typed_data.tick) {
                    const tick_data = typed_data.tick as Record<string, unknown>;
                    if (tick_data.symbol === this.symbol) {
                        this.handleTick(tick_data);
                    }
                } else if (typed_data.msg_type === 'history' && (typed_data.history || typed_data.ticks_history)) {
                    console.log(`[DigitCrackerStore] Processing history for ${this.symbol}`);
                    const history_data = (typed_data.history || typed_data.ticks_history) as Record<string, unknown>;
                    if (history_data && history_data.prices && Array.isArray(history_data.prices)) {
                        const prices = history_data.prices;
                        runInAction(() => {
                            const price_numbers = prices.map((p: string | number) => Number(p));
                            const last_digits = prices.map((p: number | string) => {
                                return this.stats_engine.extractLastDigit(p);
                            });

                            const last_price = price_numbers[price_numbers.length - 1];
                            this.current_price = last_price;
                            this.ticks = last_digits;
                            this.last_digit = this.stats_engine.extractLastDigit(last_price);

                            this.stats_engine.update(last_digits, price_numbers);
                            this.updateFromEngine();
                            this.is_subscribing = false; // Mark as done after history
                        });
                    }
                }
            });

            runInAction(() => {
                this.is_connected = true;
            });
        } catch (e) {
            console.error('[DigitCrackerStore] Subscription failed:', e);
            runInAction(() => {
                this.is_subscribing = false;
            });
        }
    };

    @action
    updateFromEngine = () => {
        this.digit_stats = this.stats_engine.digit_stats;
        this.percentages = this.stats_engine.getPercentages();
        this.even_odd_history = this.stats_engine.even_odd_history;
        this.over_under_history = this.stats_engine.over_under_history;
    };

    @action
    dispose = () => {
        if (this.unsubscribe_ticks) {
            this.unsubscribe_ticks();
        }
        const api_obj = this.api as Record<string, unknown>;
        if (api_obj && typeof api_obj.disconnect === 'function') {
            api_obj.disconnect();
        }
    };
}
