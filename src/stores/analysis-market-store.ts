import { action, makeObservable, observable, runInAction, reaction } from 'mobx';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { DigitStatsEngine } from '@/lib/digit-stats-engine';
import RootStore from './root-store';

export default class AnalysisMarketStore {
    root_store: RootStore;
    stats_engine: DigitStatsEngine;

    @observable accessor current_price: string = '0.00';
    @observable accessor last_digit: number | null = null;
    @observable accessor is_rising = false;
    @observable accessor is_falling = false;
    @observable accessor symbol = 'R_100';
    @observable accessor is_loading = false;
    @observable accessor tick_history: { price: number; time: number; direction: 'up' | 'down' }[] = [];
    @observable accessor rise_percentage: number = 50;
    @observable accessor fall_percentage: number = 50;
    @observable accessor ticks: number[] = [];
    @observable accessor markets: { group: string; items: { value: string; label: string }[] }[] = [];

    private subscription_id: string | null = null;
    private prev_price: number | null = null;

    constructor(root_store: RootStore) {
        makeObservable(this);
        this.root_store = root_store;
        this.stats_engine = new DigitStatsEngine();

        // Use symbol from main analysis store if available
        if (this.root_store.analysis?.symbol) {
            this.symbol = this.root_store.analysis.symbol;
        }

        reaction(
            () => this.root_store.common?.is_socket_opened,
            is_opened => {
                if (is_opened) {
                    this.fetchMarkets();
                    if (this.symbol) {
                        this.subscribe();
                    }
                } else {
                    this.dispose();
                }
            }
        );

        this.init();
    }

    @action
    init = async () => {
        await this.fetchMarkets();
        // Subscribe only if we have a symbol and connection
        if (this.symbol && this.root_store.common.is_socket_opened) {
            this.subscribe();
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
                    this.markets = grouped as { group: string; items: { value: string; label: string }[] }[];
                });
            }
        } catch (e) {
            console.error('[AnalysisMarketStore] Failed to fetch markets:', e);
        }
    };

    @action
    setSymbol = (symbol: string) => {
        if (this.symbol === symbol) return;
        this.symbol = symbol;
        this.prev_price = null;
        this.tick_history = [];
        this.subscribe();
    };

    @action
    subscribe = async () => {
        if (!chart_api.api) return;

        runInAction(() => {
            this.is_loading = true;
        });

        // Forget previous if any
        if (this.subscription_id) {
            try {
                chart_api.api.forget(this.subscription_id);
            } catch (e) {
                console.error('Error forgetting subscription:', e);
            }
        }

        try {
            const req = {
                ticks_history: this.symbol,
                subscribe: 1,
                end: 'latest',
                count: 1000,
                style: 'ticks',
            };

            const response = await chart_api.api.send(req);

            if (response?.history) {
                const { prices, times } = response.history;
                runInAction(() => {
                    const mapped_ticks = prices.map((price: number, index: number) => {
                        const p = Number(price);
                        const t = times[index] * 1000;
                        const direction = index > 0 && p >= Number(prices[index - 1]) ? 'up' : 'down';
                        return { price: p, time: t, direction };
                    });

                    this.tick_history = [...mapped_ticks].reverse(); // Latest first
                    this.ticks = mapped_ticks.map((m: { price: number }) =>
                        this.stats_engine.extractLastDigit(m.price)
                    );

                    if (prices.length > 0) {
                        const last_price = Number(prices[prices.length - 1]);
                        this.current_price = last_price.toFixed(2);
                        this.prev_price = last_price;
                        this.last_digit = this.stats_engine.extractLastDigit(last_price);
                    }
                });
            }

            if (response?.subscription) {
                this.subscription_id = response.subscription.id;
            }

            // Global onMessage listener for ticks
            chart_api.api.onMessage().subscribe(({ data }: any) => {
                if (data.msg_type === 'tick' && data.tick?.symbol === this.symbol) {
                    this.onTick(data.tick);
                }
            });

            runInAction(() => {
                this.is_loading = false;
            });
        } catch (error) {
            console.error('Analysis Market subscription error:', error);
            runInAction(() => {
                this.is_loading = false;
            });
        }
    };

    @action
    onTick = (tick: any) => {
        const price = Number(tick.quote);
        const time = tick.epoch * 1000;

        runInAction(() => {
            if (this.prev_price !== null) {
                this.is_rising = price > this.prev_price;
                this.is_falling = price < this.prev_price;
            }

            this.current_price = price.toFixed(tick.pip_size || 2);
            const digit = this.stats_engine.extractLastDigit(price);
            this.last_digit = digit;

            const direction = price >= (this.prev_price || 0) ? 'up' : 'down';

            this.tick_history.unshift({ price, time, direction });
            if (this.tick_history.length > 1000) this.tick_history.pop();

            this.ticks.push(digit);
            if (this.ticks.length > 1000) this.ticks.shift();

            // Calculate percentages
            if (this.tick_history.length > 1) {
                const rises = this.tick_history.filter(t => t.direction === 'up').length;
                const total = this.tick_history.length;
                this.rise_percentage = Math.round((rises / total) * 100);
                this.fall_percentage = 100 - this.rise_percentage;
            }

            this.prev_price = price;
        });
    };

    @action
    dispose = () => {
        if (this.subscription_id && chart_api.api) {
            chart_api.api.forget(this.subscription_id);
        }
    };
}
