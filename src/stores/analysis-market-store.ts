import { action, makeObservable, observable, runInAction, reaction } from 'mobx';
import { getSafeLastDigit, getSymbolPips } from '@/utils/digit-utils';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { DigitStatsEngine } from '@/lib/digit-stats-engine';
import { 
    calculateCCI, 
    calculateMACD, 
    calculateDonchian, 
    convertToCandles, 
    detectPattern,
    TOHLC
} from '@/utils/analysis-indicators';
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
    @observable accessor stats_sample_size = 100;

    @action setStatsSampleSize = (size: number) => {
        this.stats_sample_size = size;
    };
    
    get effective_pip() {
        return this.symbol.startsWith('1HZ') ? 3 : (this.pip || 2);
    }
    @observable accessor tick_history: { price: number; time: number; direction: 'up' | 'down' }[] = [];
    @observable accessor rise_percentage: number = 50;
    @observable accessor fall_percentage: number = 50;
    @observable accessor ticks: number[] = [];
    @observable accessor markets: { group: string; items: { value: string; label: string }[] }[] = [];
    @observable accessor pip = 2;
    
    // Technical Indicators
    @observable accessor raw_prices: number[] = [];
    @observable accessor cci = 0;
    @observable accessor macd = { macd: 0, signal: 0, histogram: 0 };
    @observable accessor donchian = { upper: 0, lower: 0, middle: 0 };
    @observable accessor candles: TOHLC[] = [];
    @observable accessor detected_pattern: string | null = null;

    get candleColor() {
        if (this.candles.length === 0) return 'neutral';
        const last = this.candles[this.candles.length - 1];
        return last.close >= last.open ? 'rise' : 'fall';
    }

    get candleMomentum() {
        if (this.candles.length === 0) return 0;
        const last = this.candles[this.candles.length - 1];
        const range = Math.abs(last.high - last.low);
        if (range === 0) return 0;
        const body = Math.abs(last.close - last.open);
        return (body / range) * 100;
    }

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
        
        // Fix pip for 1-second markets (1HZ symbols have 3 decimal places)
        this.pip = symbol.startsWith('1HZ') ? 3 : 2;
        this.stats_engine.setConfig({ pip: this.pip });
        
        // No longer sync with smart_trading, as it has been decommissioned
        
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
                    this.ticks = mapped_ticks.map((m: { price: number }) => this.stats_engine.extractLastDigit(m.price));
                    
                    if (prices.length > 0) {
                        const last_price = Number(prices[prices.length - 1]);
                        // HARD FORCE: 1HZ markets MUST have 3 pips for correct analysis
                        const pip = this.symbol.startsWith('1HZ') ? 3 : (response.history.pip_size || 2);
                        this.pip = pip;
                        this.current_price = last_price.toFixed(pip);
                        this.prev_price = last_price;
                        this.last_digit = this.stats_engine.extractLastDigit(last_price, this.symbol);
                        
                        // Initial Indicator Calculation
                        this.raw_prices = prices.map((p: any) => Number(p));
                        this.updateIndicators();
                    }
                });
            }

            if (response?.subscription) {
                this.subscription_id = response.subscription.id;
            }

            // Global message listener handled by a single long-lived subscription if possible, 
            // but here we just ensure we don't stack them.
            if (!(chart_api.api as any)._has_analysis_listener) {
                (chart_api.api as any)._has_analysis_listener = true;
                chart_api.api.onMessage().subscribe(({ data }: any) => {
                    if (data.msg_type === 'tick') {
                        // Dynamically find the right store to update or use a global dispatcher
                        // For now, satisfy the current architecture by checking the active symbol
                        if (data.tick?.symbol === this.symbol) {
                            this.onTick(data.tick);
                        }
                    }
                });
            }

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
            // HARD FORCE: 1HZ markets MUST have 3 pips for correct analysis
            const symbol = tick.symbol || this.symbol;
            const pip_size = symbol.startsWith('1HZ') ? 3 : (tick.pip_size || 2);
            this.pip = pip_size;
            this.current_price = price.toFixed(pip_size);

            if (this.prev_price !== null) {
                this.is_rising = price > this.prev_price;
                this.is_falling = price < this.prev_price;
            }
            
            // Ensure stats engine uses correct pip before extracting digit
            this.stats_engine.setConfig({ pip: pip_size });
            const digit = this.stats_engine.extractLastDigit(price, this.symbol);
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
            
            // Technical Indicators Update
            this.raw_prices.push(price);
            if (this.raw_prices.length > 200) this.raw_prices.shift();
            
            this.updateIndicators();
        });
    };

    @action
    updateIndicators = () => {
        if (this.raw_prices.length < 2) return;
        
        this.cci = calculateCCI(this.raw_prices, 20);
        this.macd = calculateMACD(this.raw_prices);
        this.donchian = calculateDonchian(this.raw_prices, 20);
        
        // Candles (5 ticks per unit)
        this.candles = convertToCandles(this.raw_prices, 5);
        this.detected_pattern = detectPattern(this.candles);
    };

    @action
    dispose = () => {
        if (this.subscription_id && chart_api.api) {
            chart_api.api.forget(this.subscription_id);
        }
    };
}
