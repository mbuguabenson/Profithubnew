export const MOCK_USER = {
    name: 'Mbugua Benson',
    email: 'benson@profithub.com',
    id: 'CR1234567',
    kyc_status: 'Verified',
    created_at: '2024-01-15',
    profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=benson',
};

export const MOCK_ACCOUNTS = [
    {
        type: 'Real',
        number: 'CR987654',
        currency: 'USD',
        balance: 15420.5,
        equity: 15420.5,
        margin: 0.0,
        free_margin: 15420.5,
        status: 'Active',
    },
    {
        type: 'Demo',
        number: 'VR123456',
        currency: 'USD',
        balance: 10000.0,
        equity: 9850.0,
        margin: 150.0,
        free_margin: 9700.0,
        status: 'Active',
    },
];

export const MOCK_TRANSACTIONS = [
    {
        date: '2024-03-01 10:30',
        ref_id: 'REF001',
        action: 'Deposit',
        transaction_id: 'TXN1001',
        amount: 5000.0,
        balance: 5000.0,
    },
    {
        date: '2024-03-01 11:15',
        ref_id: 'REF002',
        action: 'Trade Profit',
        transaction_id: 'TXN1002',
        amount: 150.25,
        balance: 5150.25,
    },
    {
        date: '2024-03-02 09:45',
        ref_id: 'REF003',
        action: 'Trade Loss',
        transaction_id: 'TXN1003',
        amount: -45.0,
        balance: 5105.25,
    },
    {
        date: '2024-03-02 14:20',
        ref_id: 'REF004',
        action: 'Withdrawal',
        transaction_id: 'TXN1004',
        amount: -1000.0,
        balance: 4105.25,
    },
    {
        date: '2024-03-03 08:30',
        ref_id: 'REF005',
        action: 'Trade Profit',
        transaction_id: 'TXN1005',
        amount: 890.6,
        balance: 4995.85,
    },
];

export const MOCK_TRADES = [
    { date: '2024-03-02 10:00', type: 'Rise/Fall', entry: 1.08542, exit: 1.0856, profit: 15.2, result: 'Win' },
    { date: '2024-03-02 10:15', type: 'Even/Odd', entry: 1.08565, exit: 1.08563, profit: -10.0, result: 'Loss' },
    { date: '2024-03-02 10:30', type: 'Matches/Differs', entry: 1.0857, exit: 1.0857, profit: 45.0, result: 'Win' },
    { date: '2024-03-02 10:45', type: 'Over/Under', entry: 1.08575, exit: 1.0856, profit: -15.0, result: 'Loss' },
    { date: '2024-03-02 11:00', type: 'Rise/Fall', entry: 1.0858, exit: 1.08595, profit: 25.4, result: 'Win' },
];

export const STRATEGY_STATS = [
    { strategy: 'Matches/Differs', trades: 45, wins: 32, losses: 13, net_profit: 450.2 },
    { strategy: 'Rise/Fall', trades: 38, wins: 22, losses: 16, net_profit: 120.5 },
    { strategy: 'Even/Odd', trades: 30, wins: 18, losses: 12, net_profit: 85.0 },
    { strategy: 'Over/Under', trades: 25, wins: 12, losses: 13, net_profit: -40.3 },
];
