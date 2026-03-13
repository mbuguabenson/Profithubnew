import { action, makeObservable, observable } from 'mobx';

export class TickHistoryStore {
    tick_count: number = 1000;
    tick_options: number[] = [100, 500, 1000, 2000, 5000, 10000];

    constructor() {
        makeObservable(this, {
            tick_count: observable,
            tick_options: observable,
            setTickCount: action.bound,
        });

        // Load from localStorage if available
        const saved_tick_count = localStorage.getItem('autotrade_tick_count');
        if (saved_tick_count) {
            this.tick_count = parseInt(saved_tick_count, 10);
        }
    }

    setTickCount(count: number): void {
        this.tick_count = count;
        localStorage.setItem('autotrade_tick_count', count.toString());
    }

    get current_tick_count(): number {
        return this.tick_count;
    }
}

export default TickHistoryStore;
