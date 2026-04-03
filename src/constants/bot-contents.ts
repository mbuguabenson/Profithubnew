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
    AI_BOT_BUILDER: 3,
    ANALYSIS_TOOL: 4,
    TRADING_TOOLS: 5,
    COPY_TRADING: 6,
    STRATEGIES: 7,
    TUTORIAL: 8,
    DTOOLTRADES: 9,
    PROFITMAX: 10,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-ai-bot-builder',
    'id-analysis-tool',
    'id-trading-tools',
    'id-copy-trading',
    'id-strategies',
    'id-tutorials',
    'id-dtooltrades',
    'id-profitmax',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
