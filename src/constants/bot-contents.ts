type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    FREE_BOTS: 3,
    ANALYSIS_TOOL: 4,
    TRADING_TOOLS: 5,
    COPY_TRADING: 6,
    STRATEGIES: 7,
    SETTINGS: 8,
    TUTORIAL: 9,
    DTOOLTRADES: 10,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-free-bots',
    'id-analysis-tool',
    'id-trading-tools',
    'id-copy-trading',
    'id-strategies',
    'id-settings',
    'id-tutorials',
    'id-dtooltrades',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
