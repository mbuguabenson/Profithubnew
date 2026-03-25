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
        
        // Sync with unified market store
        reaction(
            () => {
                const market = this.root_store.analysis_market;
                if (!market) return { price: undefined, digit: undefined, symbol: undefined };
                return {
                    price: market.current_price,
                    digit: market.last_digit,
                    symbol: market.symbol
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
    }

    @action
    initConnection = async () => {
        // Subscribe to global socket connection
        reaction(
            () => this.root_store.common?.is_socket_opened,
            is_socket_opened => {
                runInAction(() => {
                    this.is_connected = !!is_socket_opened;
                });
                if (is_socket_opened) {
                    this.fetchMarkets();
                } else {
                    this.dispose(); // Clean up on disconnect
                }
            }
        );

        // Global ticks sync
        reaction(
            () => {
                const market = this.root_store.analysis_market;
                if (!market) return { ticks: [], price: undefined, symbol: undefined };
                return {
                    ticks: market.ticks || [],
                    price: market.current_price,
                    symbol: market.symbol
                };
            },
            ({ ticks, price, symbol }) => {
                if (ticks.length > 0 && price !== undefined) {
                    if (symbol !== this.symbol) {
                        runInAction(() => {
                            this.symbol = symbol || 'R_100';
                        });
                    }
                    
                    const num_price = Number(price);
                    
                    runInAction(() => {
                        this.ticks = [...ticks];
                        this.current_price = num_price;
                        this.last_digit = ticks[ticks.length - 1];
                        
                        // 1. Update stats engine
                        this.stats_engine.updateWithHistory(this.ticks, num_price);
                        
                        // 2. Sync observables with stats
                        this.updateFromEngine();
                        
                        // 3. Process trade logic
                        this.trade_engine.processTick(
                            this.last_digit,
                            { 
                                percentages: this.stats_engine.getPercentages(), 
                                digit_stats: this.stats_engine.digit_stats 
                            },
                            this.symbol,
                            this.root_store.client?.currency || 'USD'
                        );
                    });
                }
            }
        );
    };

    @action
    fetchMarkets = async () => {
        // Now handled by AnalysisMarketStore
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
        // Now handled by AnalysisMarketStore
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
