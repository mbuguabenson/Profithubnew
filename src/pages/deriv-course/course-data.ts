export const COURSE_OVERVIEW = {
    welcome: 'Welcome to Your Trading Journey',
    description:
        'This comprehensive course covers everything from basic concepts to advanced trading strategies. Start with the fundamentals or jump directly to topics that interest you most.',
    stats: [
        { label: 'Chapters', value: '30' },
        { label: 'Topics Covered', value: '100+' },
        { label: 'Trading Plans', value: '4' },
        { label: 'Access', value: '∞ Lifetime' },
    ],
    curriculum: [
        {
            icon: '📘',
            category: 'Getting Started',
            count: '3 chapters',
            items: ['What is Deriv?', 'Basic Financial Markets', 'Types of Accounts'],
        },
        {
            icon: '🏗️',
            category: 'Platforms',
            count: '1 chapter',
            items: ['Platform Overview'],
        },
        {
            icon: '📊',
            category: 'Contract Types',
            count: '6 chapters',
            items: [
                'Contract Types Overview',
                'Higher & Lower',
                'Even & Odd',
                'Over & Under',
                'Matches & Differs',
                'Accumulators',
            ],
        },
        {
            icon: '📈',
            category: 'Analysis',
            count: '4 chapters',
            items: ['Tick Data', 'Probability & Statistics', 'Indicators', 'Market Filters'],
        },
        {
            icon: '🛡️',
            category: 'Risk Management',
            count: '2 chapters',
            items: ['Risk Fundamentals', 'Martingale Explained'],
        },
        {
            icon: '🤖',
            category: 'Automation',
            count: '3 chapters',
            items: ['Deriv Bot Introduction', 'Strategy Automation', 'API & Custom Bots'],
        },
        {
            icon: '🧠',
            category: 'Psychology',
            count: '2 chapters',
            items: ['Trade Discipline', 'Trader Psychology'],
        },
        {
            icon: '📅',
            category: 'Practice',
            count: '4 chapters',
            items: ['Building a Routine', 'Common Scams', 'Realistic Expectations', 'Growth Path'],
        },
    ],
    quickStart: [
        {
            step: 1,
            title: 'Learn the Basics',
            desc: 'Start with Chapters 1-3 to understand Deriv and financial markets',
        },
        { step: 2, title: 'Understand Contracts', desc: 'Master the contract types in Chapters 7-12 before trading' },
        { step: 3, title: 'Practice Risk Management', desc: 'Learn to protect your capital with Chapters 17-18' },
        { step: 4, title: 'Build Your Plan', create: 'Create your strategy using Chapter 24 and sample plans' },
    ],
    keyTopics: [
        { icon: '🎯', title: 'Probability', desc: 'Understand the math behind trading decisions' },
        { icon: '📉', title: 'Drawdowns', desc: 'How to handle and recover from losses' },
        { icon: '⚠️', title: 'Avoid Scams', desc: 'Recognize and avoid fraudulent schemes' },
        { icon: '📋', title: 'Trading Plans', desc: 'Ready-to-use templates for all levels' },
    ],
};

export const COURSE_CHAPTERS = [
    {
        id: 1,
        title: 'What is Deriv?',
        content: `
            <p>This chapter introduces the reader to Deriv as a trading platform and financial service provider.</p>
            <h3>What is Deriv?</h3>
            <p>Deriv is an online trading platform that allows individuals to participate in financial markets through simple, clearly defined trading contracts.</p>
            <p>Unlike traditional brokers that focus mainly on leveraged trading, Deriv emphasizes accessibility, transparency, and defined risk, making it suitable for both beginners and experienced traders.</p>
            <p>Deriv enables traders to speculate on market movements without owning the underlying asset. Instead, traders focus on price behavior, such as whether the market will rise or fall, whether a digit will be even or odd, or whether price will cross a specific level.</p>
            <h3>The Origin Story: Binary.com to Deriv</h3>
            <p>Before understanding Deriv today, it is important to understand where it came from.</p>
            <p>Deriv's roots trace back to Binary.com, founded in 1999, at a time when online trading was still inaccessible to most retail traders. Binary.com pioneered fixed-risk trading products known as binary options, where traders knew their maximum loss and potential profit before entering a trade.</p>
            <ul>
                <li>✓ Transparent pricing with no hidden margin calls</li>
                <li>✓ Low minimum stake requirements</li>
                <li>✓ Early adoption of synthetic indices, allowing 24/7 trading</li>
            </ul>
            <p>In 2020, Binary.com evolved into Deriv, reflecting a broader, more modern trading ecosystem while maintaining its original principles.</p>
            <h3>Mission & Vision</h3>
            <p>Deriv operates with a clear mission: To make online trading accessible to anyone, anywhere, while maintaining transparency and fairness.</p>
            <h3>🛡️ Global Regulation & Safety</h3>
            <p>Deriv operates under multiple regulatory frameworks across different jurisdictions. Regulation helps ensure fair trade execution, protection of client funds, and responsible marketing practices.</p>
            <h3>⚖️ Deriv vs Traditional Forex Brokers</h3>
            <table>
                <thead>
                    <tr><th>Feature</th><th>Deriv</th><th>Traditional Forex</th></tr>
                </thead>
                <tbody>
                    <tr><td>Risk per trade</td><td>Fixed and known upfront</td><td>Often variable</td></tr>
                    <tr><td>Trading hours</td><td>24/7 (synthetics)</td><td>Limited by market hours</td></tr>
                    <tr><td>Entry capital</td><td>Very low</td><td>Often higher</td></tr>
                    <tr><td>Complexity</td><td>Beginner-friendly</td><td>Often complex</td></tr>
                </tbody>
            </table>
        `,
    },
    {
        id: 2,
        title: 'Basic Financial Market Concepts',
        content: `
            <h3>🏪 What Is a Financial Market?</h3>
            <p>A financial market is a place where buyers and sellers exchange financial instruments. These markets exist to facilitate price discovery—finding a fair value through competition between participants.</p>
            <h3>⚖️ Buyers vs Sellers: Market Dynamics</h3>
            <p>Every trade has two opposing participants: Buyers (believe price will rise) and Sellers (believe price will fall). Price moves when one side becomes stronger than the other.</p>
            <h3>📊 Supply and Demand Fundamentals</h3>
            <p>High demand + low supply → price rises. High supply + low demand → price falls. Even in synthetic indices, this concept is simulated mathematically.</p>
            <h3>🎯 What Is a Tick?</h3>
            <p>A tick is the smallest unit of price movement. On Deriv, many contracts are tick-based, meaning time is less important than price changes.</p>
        `,
    },
    {
        id: 3,
        title: 'Types of Accounts on Deriv',
        content: `
            <h3>🎮 Demo Account: Your Practice Playground</h3>
            <p>A demo account uses virtual funds to simulate real trading conditions. Prices, payouts, and contract behavior mirror real markets.</p>
            <h3>💵 The Real Account: Entering Live Markets</h3>
            <p>A real account involves actual money and requires account verification, real emotional control, and strict risk management.</p>
            <h3>📊 Understanding Balance, Equity, and Margin</h3>
            <ul>
                <li><strong>Balance</strong>: Total funds in the account</li>
                <li><strong>Equity</strong>: Balance plus or minus active trades</li>
                <li><strong>Margin</strong>: Funds locked in trades (for CFDs)</li>
            </ul>
        `,
    },
    {
        id: 4,
        title: 'Overview of Deriv Platforms',
        content: `
            <h3>🌐 Deriv Platform Ecosystem</h3>
            <p>Deriv offers multiple trading platforms: Deriv Trader, Deriv Bot, SmartTrader, MT5, and Deriv X. Each is designed for a specific trading style.</p>
            <h3>🖥️ Deriv Trader: Web-Based Manual Trading</h3>
            <p>Primary platform for manual trading. Runs in any browser. Real-time pricing, technical indicators, and customizable layouts.</p>
            <h3>🤖 Deriv Bot: Automation and Strategy Building</h3>
            <p>Visual automation platform using block-based logic. Build strategies without writing code.</p>
            <h3>⚡ SmartTrader: Simplified Interface</h3>
            <p>Minimalist interface focused on speed and simplicity. Ideal for beginners.</p>
        `,
    },
    // Adding more chapters based on user input...
    {
        id: 5,
        title: 'Deriv Account Types and Currencies',
        content: `
            <h3>🏦 Account Structure Overview</h3>
            <p>Deriv separates accounts primarily by risk environment and purpose: Demo vs Real.</p>
            <h3>💳 Account Wallets and Currencies</h3>
            <p>Supports USD, EUR, GBP, and various cryptocurrencies. Base currency choice is important as it cannot be changed easily.</p>
        `,
    },
    {
        id: 6,
        title: 'Deriv Markets Explained',
        content: `
            <h3>🏦 Two Major Market Categories</h3>
            <p><strong>Financial Markets</strong>: Forex, Commodities, Stocks. Influenced by real-world events.</p>
            <p><strong>Synthetic Indices</strong>: Exclusive to Deriv, available 24/7, no news impact, consistent volatility.</p>
        `,
    },
    {
        id: 7,
        title: 'Deriv Contract Types',
        content: `
            <h3>📋 Understanding Contracts</h3>
            <p>On Deriv, you buy contracts that define conditions, duration, and payout. Types include Rise/Fall, Higher/Lower, Even/Odd, Matches/Differs, and Multipliers.</p>
        `,
    },
    {
        id: 8,
        title: 'Higher and Lower Contracts',
        content: `
            <h3>Introduction to Barrier Contracts</h3>
            <p>Higher and Lower contracts introduce price barriers. Payout depends on barrier distance. Requires predicting both direction and magnitude.</p>
        `,
    },
    {
        id: 9,
        title: 'Even and Odd Contracts',
        content: `
            <h3>Understanding Digit Contracts</h3>
            <p>Focuses on the last digit of the exit price. Even (0,2,4,6,8) vs Odd (1,3,5,7,9). Purely statistical, 50/50 theoretical probability.</p>
        `,
    },
    {
        id: 10,
        title: 'Over and Under Contracts',
        content: `
            <h3>Understanding Threshold Logic</h3>
            <p>Predict whether the last digit will fall above or below a chosen threshold (0-9). Different thresholds offer different probability-payout balances.</p>
        `,
    },
    {
        id: 11,
        title: 'Matches and Differs',
        content: `
            <h3>Understanding Matches and Differs</h3>
            <p>Matches: Exact digit hit (10% prob). Differs: Digit does NOT appear (90% prob). Payouts reflect difficulty.</p>
        `,
    },
    {
        id: 12,
        title: 'Accumulators',
        content: `
            <h3>How Accumulators Work</h3>
            <p>Compounding positions where each tick multiplies the stake. One wrong move resets progress. Requires high discipline.</p>
        `,
    },
    {
        id: 13,
        title: 'Tick Data',
        content: `
            <h3>What is Tick Data?</h3>
            <p>Smallest unit of price movement. Essential for short-duration trades and digit analysis. Captures micro-structure of price action.</p>
        `,
    },
    {
        id: 14,
        title: 'Probability & Statistics in Deriv',
        content: `
            <h3>Mathematical Foundation</h3>
            <p>Law of Large Numbers: Outcomes converge over time. Expected Value (EV) measures long-term profitability.</p>
        `,
    },
    {
        id: 15,
        title: 'Indicators on Deriv',
        content: `
            <h3>Technical Analysis</h3>
            <p>RSI, Moving Averages (SMA/EMA), and Bollinger Bands. Lagging indicators that provide structure but not certainty.</p>
        `,
    },
    {
        id: 16,
        title: 'Market Filters & Conditions',
        content: `
            <h3>When to Trade</h3>
            <p>Identify trending vs flat markets. Avoid trading during excessive volatility or emotional distress.</p>
        `,
    },
    {
        id: 17,
        title: 'Risk Management Fundamentals',
        content: `
            <h3>Protecting Your Capital</h3>
            <p>1-2% risk per trade. Drawdown limits (5-10% daily). Capital preservation is key to longevity.</p>
        `,
    },
    {
        id: 18,
        title: 'Martingale Explained Honestly',
        content: `
            <h3>The Double-Up Strategy</h3>
            <p>Doubling stakes after losses. Catastrophically risky due to exponential growth. Eventually leads to account wipe-out.</p>
        `,
    },
    {
        id: 19,
        title: 'Trade Discipline',
        content: `
            <h3>Psychological Framework</h3>
            <p>One-trade-at-a-time rule. Daily trade limits. Importance of journal reviews and checklists.</p>
        `,
    },
    {
        id: 20,
        title: 'Introduction to Deriv Bot',
        content: `
            <h3>Automation Basics</h3>
            <p>Visual programming using logic blocks. Define market conditions, execution rules, and money management.</p>
        `,
    },
    {
        id: 21,
        title: 'Strategy Automation',
        content: `
            <h3>Advanced Bot Building</h3>
            <p>Rule-based systems. Implementing trade locks and cooldowns to remove human emotion from trading.</p>
        `,
    },
    {
        id: 22,
        title: 'API & Custom Bots',
        content: `
            <h3>Advanced Programming</h3>
            <p>WebSocket communication for real-time data. Building custom solutions beyond the standard bot builder.</p>
        `,
    },
    {
        id: 23,
        title: 'Trader Psychology',
        content: `
            <h3>Mindset Mastery</h3>
            <p>Overcoming greed, fear, and revenge trading. Building mental resilience through preparation.</p>
        `,
    },
    {
        id: 24,
        title: 'Building a Trading Routine',
        content: `
            <h3>Daily Practices</h3>
            <p>Pre-trade checklists, detailed journaling, and regular performance reviews to track progress.</p>
        `,
    },
    {
        id: 25,
        title: 'Common Deriv Scams',
        content: `
            <h3>Stay Safe</h3>
            <p>Identifying signal sellers, fake bots, and "guaranteed profit" schemes. Protect your API tokens.</p>
        `,
    },
    {
        id: 26,
        title: 'Realistic Expectations',
        content: `
            <h3>The Truth About Trading</h3>
            <p>Consistency takes years to achieve. Understanding drawdowns and growth timelines is essential.</p>
        `,
    },
    {
        id: 27,
        title: 'Trader Growth Path',
        content: `
            <h3>Your Journey</h3>
            <p>Process: Beginner → Intermediate → Advanced. Knowing when to scale and when to reassess.</p>
        `,
    },
    {
        id: 28,
        title: 'Glossary of Terms',
        content: `
            <h3>Reference Guide</h3>
            <p>Definitions: Accumulators, Barrier, Drawdown, EV, Payout, Stake, Tick, and more.</p>
        `,
    },
    {
        id: 29,
        title: 'FAQs',
        content: `
            <h3>Common Questions Answered</h3>
            <p>Addressing deposits, capital requirements, strategy testing, and technical queries.</p>
        `,
    },
    {
        id: 30,
        title: 'Sample Trading Plans',
        content: `
            <h3>Practical Templates</h3>
            <p>Structured plans for different capital levels: Beginner ($1k), Intermediate ($5k), and Advanced ($20k).</p>
        `,
    },
];
