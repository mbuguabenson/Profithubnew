import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { DigitStatsEngine } from '@/lib/digit-stats-engine';
import { ProfitmaxTradeEngine } from '@/lib/profitmax-trade-engine';
import { TDigitStat, TAnalysisHistory } from '@/stores/analysis-store';
import RootStore from './root-store';

export default class ProfitmaxStore {
    root_store: RootStore;
    stats_engine: DigitStatsEngine;
    trade_engine: ProfitmaxTradeEngine;

    @observable accessor digit_stats: TDigitStat[] = [];
    @observable accessor ticks: number[] = [];
    @observable accessor total_ticks = 100; // Ticks selector
    @observable accessor symbol = 'R_100';
    @observable accessor current_price: string | number = '0.00';
    @observable accessor last_digit: number | null = null;
    @observable accessor is_connected = false;

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

    // Diagnostics specific observables
    @observable accessor highest_digit: number | null = null;
    @observable accessor lowest_digit: number | null = null;
    @observable accessor second_highest_digit: number | null = null;
    @observable accessor recommended_market: { label: string; value: string; pct: number } = { label: 'Waiting...', value: '', pct: 0 };

    constructor(root_store: RootStore) {
        makeObservable(this);
        this.root_store = root_store;
        this.stats_engine = new DigitStatsEngine();
        this.stats_engine.setConfig({ total_samples: this.total_ticks });
        this.trade_engine = new ProfitmaxTradeEngine();

        this.initConnection();

        // Sync Symbol and Connection Status with common base
        reaction(
            () => this.root_store.common?.is_socket_opened,
            is_socket_opened => {
                runInAction(() => {
                    this.is_connected = !!is_socket_opened;
                });
            }
        );

        // Globally sync to live ticks specifically when on the correct symbol
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
                        runInAction(() => { this.symbol = symbol || 'R_100'; });
                    }
                    
                    const num_price = Number(price);
                    
                    runInAction(() => {
                        this.ticks = [...ticks];
                        this.current_price = num_price;
                        this.last_digit = ticks[ticks.length - 1];
                        
                        // 1. Update internal stats engine
                        this.stats_engine.updateWithHistory(this.ticks, num_price);
                        
                        // 2. Sync Observables explicitly
                        this.updateFromEngine();
                        
                        // 3. Dispatch to Algorithmic Execution Engine
                        if (this.last_digit !== undefined && this.last_digit !== null) {
                            this.trade_engine.processTick(
                                this.last_digit,
                                { 
                                    percentages: this.percentages, 
                                    digit_stats: this.digit_stats 
                                },
                                this.symbol,
                                this.root_store.client?.currency || 'USD'
                            );
                        }
                    });
                }
            }
        );
    }

    @action
    initConnection = () => {
        // Boilerplate, socket is handled dynamically via analysis_market root link
    };

    @action
    setSampleTicks = (ticks: number) => {
        this.total_ticks = ticks;
        this.root_store.analysis_market.setStatsSampleSize(ticks);
        this.stats_engine.setConfig({ total_samples: ticks });
        this.updateFromEngine();
    };

    @action
    updateFromEngine = () => {
        this.digit_stats = this.stats_engine.digit_stats;
        this.percentages = this.stats_engine.getPercentages();
        this.even_odd_history = this.stats_engine.even_odd_history;

        // Calculate diagnostics dynamically
        if (this.digit_stats.length > 0) {
            const sorted = [...this.digit_stats].sort((a, b) => b.percentage - a.percentage);
            this.highest_digit = sorted[0].digit;
            this.second_highest_digit = sorted[1].digit;
            this.lowest_digit = sorted[9].digit;

            // Simple recommendation: pick highest Even/Odd probability
            if (this.percentages.even > this.percentages.odd) {
                this.recommended_market = { label: 'Even', value: 'DIGITEVEN', pct: this.percentages.even };
            } else if (this.percentages.odd > this.percentages.even) {
                this.recommended_market = { label: 'Odd', value: 'DIGITODD', pct: this.percentages.odd };
            } else {
                this.recommended_market = { label: 'Neutral', value: '', pct: 50 };
            }
        }
    };
}
