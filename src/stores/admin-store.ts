import { makeAutoObservable } from 'mobx';

export default class AdminStore {
    // Platform Stats
    public total_users = 1245;
    public active_users = 84;
    public total_deposits = 542000.5;
    public total_withdrawals = 120500.0;
    public platform_net_profit = 32000.75;
    public total_volume = 12450000.0;

    // System Health
    public latency = 24;
    public cpu_load = 18.4;
    public memory_usage = 4.2;
    public sync_status = 100;

    // UI State
    public is_sidebar_open = true;
    public active_section = 'dashboard';

    // Tabs Control (Dynamic from Admin)
    public visible_tabs = {
        dashboard: true,
        bot_builder: true,
        charts: true,
        analysis_tool: true,
        trading_tools: true,
        copy_trading: true,
        strategies: true,
        settings: true,
        tutorials: true,
    };

    // Mock Data for Table & Radial Chart
    public recent_transactions = [
        {
            id: '1',
            user: 'Marvin McKinney',
            email: '@codyfisher',
            amount: 10250,
            date: 'Dec 12, 2024',
            status: 'Success',
            type: 'Deposit',
            avatar: 'https://i.pravatar.cc/150?u=marvin',
        },
        {
            id: '2',
            user: 'Kathryn Murphy',
            email: '@kathryn',
            amount: 3500,
            date: 'Dec 12, 2024',
            status: 'Pending',
            type: 'Withdrawal',
            avatar: 'https://i.pravatar.cc/150?u=kathryn',
        },
        {
            id: '3',
            user: 'Floyd Miles',
            email: '@floyd',
            amount: 4200,
            date: 'Dec 11, 2024',
            status: 'Success',
            type: 'Deposit',
            avatar: 'https://i.pravatar.cc/150?u=floyd',
        },
        {
            id: '4',
            user: 'Albert Flores',
            email: '@albert',
            amount: 1500,
            date: 'Dec 11, 2024',
            status: 'Failed',
            type: 'Transfer',
            avatar: 'https://i.pravatar.cc/150?u=albert',
        },
        {
            id: '5',
            user: 'Jane Cooper',
            email: '@jane',
            amount: 8900,
            date: 'Dec 10, 2024',
            status: 'Success',
            type: 'Deposit',
            avatar: 'https://i.pravatar.cc/150?u=jane',
        },
    ];

    public market_distribution = [
        { name: 'Active Bots', value: 65, color: '#3b82f6' },
        { name: 'Idle Bots', value: 25, color: '#06b6d4' },
        { name: 'Maintenance', value: 10, color: '#f59e0b' },
    ];

    constructor() {
        makeAutoObservable(this);

        // Simulate real-time data updates
        setInterval(() => {
            this.total_volume += Math.random() * 500;
            this.platform_net_profit += (Math.random() - 0.4) * 10;
            const userChange = Math.random() > 0.5 ? 1 : -1;
            this.active_users = Math.max(10, this.active_users + userChange);

            // Randomize system health
            this.latency = Math.max(15, Math.min(150, this.latency + (Math.random() - 0.5) * 5));
            this.cpu_load = Math.max(5, Math.min(95, this.cpu_load + (Math.random() - 0.5) * 2));
            this.memory_usage = Math.max(2, Math.min(15.5, this.memory_usage + (Math.random() - 0.5) * 0.1));
        }, 3000);
    }

    public setSection(section: string) {
        this.active_section = section;
    }

    public toggleSidebar() {
        this.is_sidebar_open = !this.is_sidebar_open;
    }

    public toggleTabVisibility(tabKey: keyof typeof this.visible_tabs) {
        this.visible_tabs[tabKey] = !this.visible_tabs[tabKey];
    }
}
