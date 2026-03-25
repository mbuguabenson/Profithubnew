# 💎 ProfitHub — Complete Tab Build Guide

> **Purpose:** This document is the single source of truth for rebuilding the four core ProfitHub tabs with 100% fidelity in logic, UI, and performance. Read every section before writing a single line of code.

---

## 🏗️ GLOBAL PREREQUISITES

### 1. Tech Stack

| Concern | Library | Version |
|---|---|---|
| UI | React | ^18.2.0 |
| State | MobX + mobx-react-lite | ^6.12.3 / ^4.0.7 |
| Routing | react-router-dom (HashRouter) | ^7.13.0 |
| Build | rsbuild | ^1.0.1-beta.1 |
| Styles | SCSS + CSS Variables | — |
| Icons | @deriv/quill-icons | ^2.4.14 |
| Animation | framer-motion | ^6.5.1 |

### 2. Store Architecture

```
RootStore
├── AnalysisStore          ← Digit stats, history, market data
├── AnalysisMarketStore    ← WebSocket tick subscription + history
├── DigitCrackerStore      ← Wraps DigitStatsEngine + DigitTradeEngine
├── SmartTradingStore      ← Manual trade execution + auto-trading bots
├── CopyTraderStore        ← Demo-to-Real mirror logic
├── ClientStore            ← Account list, loginid, balance, currency
└── UIStore                ← Dark mode, drawer states
```

### 3. Required SCSS Variables

```scss
// In _themes.scss
--general-section-1: /* dark panel bg */
--general-section-2: /* darker bg */
--general-hover:     /* subtle hover state */
--text-prominent:    /* primary text color */
--text-general:      /* secondary text */
--border-subtle:     /* subtle border */
--brand-red-coral:   #ff444f;
--brand-secondary:   #a855f7;
```

### 4. Branding

- **Primary color:** `#ff444f` (red-coral) — active tabs, CTAs, trade buttons
- **Accent:** `linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)` — premium badges
- **Font:** IBM Plex Sans (body), Roboto Mono (numbers/stats)

---

## 🤖 TAB A: FREE BOTS (`#free_bots`)

### File: `src/pages/free-bots/free-bots-tab.tsx`

### Layout

```
FreeBotsTab
├── LiveMarketAnalysis   ← Neural Market Feed
│   ├── Header (Title + LIVE badge + market selector)
│   ├── Stats row (Spot Price + Last Digit)
│   └── DigitDistribution histogram (10 bars)
├── Category Filters     ← All / Automatic / Hybrid / Shield
└── BotGrid
    └── BotCard[]        ← Each bot is a glassmorphism card
```

### `LiveMarketAnalysis` — Histogram Logic

```tsx
// Bar height formula (CSS variable):
'--bar-height': `${Math.min(stat.percentage * 5, 100)}%`

// Bar color logic:
background: stat.digit === last_digit ? '#fff'       // active = white
          : stat.digit % 2 === 0       ? '#3b82f6'   // even = blue
          :                              '#ec4899'   // odd = pink
```

- **Data source:** `analysis.digit_stats` (from `AnalysisStore`)
- **Mount:** `analysis.subscribeToTicks()` in `useEffect`
- **Unmount:** `analysis.unsubscribeFromTicks()` cleanup

### `BotCard` — Glassmorphism Card Pattern

```tsx
// CSS variable injection (inline style):
style={{ '--bot-color': bot.color, '--bot-color-rgb': hexToRgb(bot.color) }}

// Icon by category:
'Automatic' → 🤖
'Hybrid'    → ⚡
'Shield'    → 🛡️
```

- **Stats shown:** Win Rate `~85%`, Risk Level `Moderate`
- **CTA:** "Deploy Strategy" → calls `loadBotToBuilder(bot)`

### `useFreeBots` Hook (required)

```ts
const { selectedCategory, setSelectedCategory, categories, filteredBots, loadBotToBuilder, isLoading } = useFreeBots();
```

- `categories`: `['All', 'Automatic', 'Hybrid', 'Shield']`
- `filteredBots`: Filtered by `selectedCategory`
- `loadBotToBuilder`: Injects bot config into `DigitTradeEngine` and switches to Trading Tools tab

### Loading Overlay

```tsx
<div className='loading-overlay'>
  <div className='spinner-box'>
    <div className='circle' />
    <div className='circle-inner' />
    <span className='logo-center'>🧠</span>
  </div>
  <p>Syncing Neural Link...</p>
</div>
```

---

## 🔬 TAB B: ANALYSIS TOOL (`#analysis_tool`)

### File: `src/pages/analysis-tool/index.tsx`

### Sub-Tab Registry

```ts
type TAnalysisSubTab = 'easy_tool' | 'even_odd' | 'over_under' | 'adv_over_under' | 'differs' | 'matches' | 'rise_fall';
```

| Tab Label | Component | Contract Type |
|---|---|---|
| Easy Tool | `EasyTool` (lazy) | Combined |
| Even/Odd | `EvenOddTab` | DIGITEVEN / DIGITODD |
| Over/Under | `OverUnderTab` | DIGITOVER / DIGITUNDER |
| Advanced Over/Under | `AdvancedOverUnderTab` | DIGITOVER / DIGITUNDER |
| Differs | `DiffersTab` | DIGITDIFF |
| Matches | `MatchesTab` | DIGITMATCH |
| Rise/Fall | `RiseFallTab` | RISE / FALL |

**Required:** Always call `analysis_market.subscribe()` in `useEffect` on mount for the parent `AnalysisTool`.

---

### Sub-Tab: Even/Odd

**File:** `src/pages/smart-trading/components/even-odd-tab.tsx`

#### Analysis Windows
Computed using `useMemo` over `ticks` array:
```ts
last10  = analyzeEvenOdd(ticks, 10)
last25  = analyzeEvenOdd(ticks, 25)
last50  = analyzeEvenOdd(ticks, 50)
last100 = analyzeEvenOdd(ticks, 100)

// Core formula:
evenPercent = (evenCount / total) * 100
oddPercent  = (oddCount  / total) * 100
```

#### Signal Engine
```ts
// Volatility = stdDev of evenPercent across windows [10, 25, 50]
// Trend = compare last10 vs last50:
//   > +2% = INCREASING | < -2% = DECREASING | else STABLE

// Signal:
if (dominantPercent >= 56 && isIncreasing) → 'TRADE NOW' (HIGH confidence)
if (dominantPercent >= 52)                 → 'WAIT'      (MEDIUM confidence)
else                                       → 'NEUTRAL'   (LOW confidence)
```

#### UI Components
1. **Signal Badge** — `signal-badge trade-now | wait | neutral` class
2. **Power Cards** — Two glassmorphism cards (EVEN + ODD) with nested bar charts for 10/50/100 tick windows
3. **Metrics Grid** — Volatility score, Power Trend, 1H Change, Recent Change
4. **Big Action Button** — `TRADE ${dominant} NOW - ${pct}%` — calls `smart_trading.manualTrade(contractType)`
5. **Auto Trading Config** — Trigger Condition, Target Prediction, Entry Pattern, Trigger %, Consecutive Ticks
6. **Last 40 Digits Tape** — Scrollable `E/O` circles row at the bottom

**Tick subscription:** Uses `ticks_service.monitor({ symbol, callback })` pattern, cleanup on unmount with `stopMonitor`.

---

### Sub-Tab: Rise/Fall

**File:** `src/pages/analysis-tool/RiseFallTab.tsx`

#### State (from `analysis_market`)
```ts
{ current_price, is_rising, is_falling, tick_history, rise_percentage, fall_percentage }
```

#### UI Components
1. **Header stat cards** — `RISE PERCENTAGE` and `FALL PERCENTAGE`
2. **Price Orb** — A large pulsing circle:
   - Class `rising` when `is_rising === true`
   - Class `falling` when `is_falling === true`
   - Shows ▲ / ▼ / • inside
3. **Tick History List** — Timestamped list of `{ direction, price }` entries, colored by direction

---

### Sub-Tab: Differs / Matches / Over-Under

All follow the same pattern as the Even/Odd sub-tab:
- `analyzeDigits(ticks, window)` → `percentage` and `count` per digit
- `signal` computed via `useMemo`
- **Power card** showing current strength
- **Auto-trading configuration** linked to `smart_trading.strategies[STRATEGY_KEY]`
- **Digit rank table** showing top 5 highest/lowest digits

**Differs-specific:** Lock onto digits 2–7 with `percentage < differs_max_percentage` and track appearances.

**Matches-specific:** Find dominant digit with `is_increasing === true` and market is rising.

---

## ⚡ TAB C: TRADING TOOLS (`#trading_tools`)

### File: `src/pages/main/main.tsx` → `<TradingTools />`

This is an **inline composite component** with two sub-tabs rendered inside the parent page.

### Sub-Tab Switcher (Pill Buttons)
```tsx
const [activeTab, setActiveTab] = useState<'smartauto' | 'digitcracker'>('smartauto');

// Active style:
background: activeTab === 'smartauto' ? 'var(--brand-red-coral)' : 'var(--general-section-2)'
color:      activeTab === 'smartauto' ? '#fff' : 'var(--text-general)'
transition: 'all 0.2s'
borderRadius: '20px'
```

**Market Selector bar** appears at the top, shared by both sub-tools.

---

### Tool A: Smart Auto 24 (`circles-analysis`)

**File:** `src/pages/circles-analysis/index.tsx`

#### Section Grid (2×2)
Each section renders an `AnalysisSection` component:
```tsx
<AnalysisSection
  title="Even/Odd"
  streak={current_streaks.even_odd}        // { count, type }
  history={even_odd_history}               // TAnalysisHistory[]
  left_label="EVEN" left_pct={percentages.even}
  right_label="ODD"  right_pct={percentages.odd}
  type='E_O'
/>
```

Four sections: **Matches/Differs**, **Over/Under**, **Even/Odd**, **Rise/Fall**

#### `DigitCircles` Component
- Renders 10 digit cards in two rows (0–4, 5–9)
- Each card is an SVG with a partial arc (bottom 40% of circle)
- Arc color logic:
  ```ts
  rank === 1   → '#00ff41'  // Green  (most frequent)
  rank === 10  → '#ff073a'  // Red    (least frequent)
  isCurrent    → '#ff9f00'  // Orange (live digit = "NOW")
  else         → '#3b82f6'  // Blue   (default)
  ```
- Arc formula: `strokeDasharray={circumference / 4} ${circumference}`
- Glow filter on active digit: `filter: drop-shadow(0 0 6px ${color})`
- "NOW" badge above the active digit

#### `TradingEngine` Component
- Lists the 4 strategies with toggle buttons
- Each shows `Runs: X/Y` counter
- Start/Stop auto-trading per strategy

---

### Tool B: Digit Cracker

**File:** `src/pages/digit-cracker/index.tsx`

#### 3-Column Layout
```
[Digit Analytics] | [Strategy Config] | [Trading Ledger]
```

#### Column 1: Digit Analytics
- Two rows of 5 `digit-card-v2` components
- Each card = SVG arc + digit label + percentage + `n={count}`
- Active digit gets `is-now` class and a `NOW` badge

#### Column 2: Strategy Config

4 strategy tabs: `EVEN/ODD`, `DIFFERS`, `MATCHES`, `OVER/UNDER`

For each strategy, a settings form:

| Field | Type | Notes |
|---|---|---|
| Stake Amount | number | Base trade stake |
| Take Profit | number | Auto-stop when session profit exceeds this |
| Stop Loss | number | Auto-stop when session loss exceeds this |
| Martingale Multiplier | number | Stake multiplier on each loss |
| Maximum Runs | number | Total trade count before auto-stop |
| Tick Duration | number | Contract duration in ticks |
| Prediction | number (0–9) | For Differs/Matches/Over-Under only |

**Toggles row:** Martingale `ON/OFF`, Stop Loss `ON/OFF`, Compounding `ON/OFF`

**Action row:**
- `Trade Once` → `trade_engine.toggleStrategy(strategy, false)`
- `Start Auto Trading` / `Stop Auto Trading` → `trade_engine.toggleStrategy(strategy, true)`

**Strategy-specific fields:**
- **Even/Odd**: Trigger Condition, Target Prediction, Entry Pattern, Trigger %, Consecutive Ticks
- **Differs**: Max Allowed %, Target Appearances, Bulk Trades
- **Matches/Over-Under**: (inherit base fields only)

#### Column 3: Trading Ledger

3 log sub-tabs: `Summary`, `Transactions`, `Journal`

**Summary** — Stats grid:
```tsx
{ Total Trades, Wins, Losses, Win Rate%, Session Profit, Total Profit }
```

**Transactions** — Only `type === 'trade' | 'success' | 'error'` from logs:
```tsx
{ timestamp, message, icon: ✅ / ❌ / ⚡ }
```

**Journal** — ALL log entries:
```tsx
{ timestamp, message, type-based color }
```

**Auto-scroll:** `logRef.current.scrollTop = logRef.current.scrollHeight` triggered by `logs.length`

#### Trade Execution Flow (`DigitTradeEngine.executeTrade`)

```
1. Guard: if (is_executing) return
2. Set is_executing = true
3. Send proposal: { proposal:1, amount, basis:'stake', contract_type, currency, duration, underlying_symbol, barrier? }
4. Receive proposal.id
5. Send buy: { buy: proposal.id, price: stake }
6. Receive buy.contract_id
7. Poll monitorTrade() every 1000ms until proposal_open_contract.is_sold === 1
8. handleResult: update profit, apply Martingale, check Take Profit / Stop Loss
9. Set is_executing = false
```

#### Martingale Logic
```ts
calculateStake():
  if (last_result === 'LOSS' && use_martingale)
    stake = stake * multiplier ^ current_streak
  else
    stake = config.stake
```

---

## 🪞 TAB D: COPY TRADING (`#copy_trading`)

### File: `src/pages/copy-trader/index.tsx`

### Layout

```
CopyTrading
├── Hero Header         ← "Copy Trading Premium" title
└── Content
    ├── Main Column
    │   ├── DemoToRealSection
    │   └── ClientTokensSection
    └── Aside Column
        └── Reflection Stream (trade mirror table)
```

---

### Section 1: Demo-to-Real Mirror

**File:** `src/pages/copy-trader/demo-to-real-section.tsx`

#### State (from `copy_trader` store)
```ts
{
  selected_real_account_loginid,
  is_demo_to_real_active,
  demo_to_real_status: 'idle' | 'connecting' | 'active' | 'error',
  demo_to_real_error,
}
```

#### UI: Flat Minimal Row Layout
```
[Title "Demo to Real"] [StatusBadge]  [LoginId Pill]  [Account Dropdown]  [Start/Stop Button]
```

**Status Badges:**
```tsx
'connecting' → <span className='status-badge connecting'>Connecting...</span>
'active'     → <span className='status-badge active'>● Active</span>
'error'      → <span className='status-badge error'>✕ Error</span>
'idle'       → <span className='status-badge idle'>○ Ready</span>
```

**Account dropdown** — only non-virtual accounts:
```ts
const realAccounts = client.account_list.filter(a => !a.is_virtual);
```

**Toggle logic:**
```ts
if (is_demo_to_real_active) stopDemoToRealCopy();
else startDemoToRealCopy();
```

**Disabled conditions:** Button disabled when `status === 'connecting'` or no account selected

---

### Section 2: Multi-Client Token Manager

**File:** `src/pages/copy-trader/client-tokens-section.tsx`

#### State (local React `useState`)
```ts
const [clients, setClients] = useState<ClientAccount[]>([]);
const [newToken, setNewToken] = useState('');
```

#### `ClientAccount` Type
```ts
interface ClientAccount {
  id: string;
  token: string; // stored, never displayed
  status: 'idle' | 'connecting' | 'connected' | 'error';
  accountType: string;
  balance: number;
  currency: string;
  totalRuns: number;
  totalPL: number;
  totalStake: number;
}
```

#### UI Flow
1. Input + "Add" button → creates new `ClientAccount` with `status: 'idle'`
2. Token display is masked: `{'•'.repeat(20)}`
3. Each client card shows: Account Type, Balance, P/L, Total Stake
4. "Connect Account" button → calls `connectClient(id)` → sets `status: 'connecting'` → API handshake → `status: 'connected'`
5. Connected clients show the trading stats grid

#### Reflection Stream (Aside)
```tsx
<table className='copy-table'>
  <thead>
    <tr><th>Market</th><th>Reference</th><th>Status</th><th>Stake</th><th>Result</th></tr>
  </thead>
</table>
```
Empty state: `📊 No active mirror streams detected.` with `<span>Start trading or enable internal mirroring to see results.</span>`

---

## 🎨 VISUAL SYSTEM

### Glassmorphism Card (reusable mixin)
```scss
@mixin glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

### "NOW" Pulse Glow (active digit)
```css
@keyframes pulse-glow {
  0%   { filter: drop-shadow(0 0 2px var(--brand-red-coral)); }
  50%  { filter: drop-shadow(0 0 10px var(--brand-red-coral)); }
  100% { filter: drop-shadow(0 0 2px var(--brand-red-coral)); }
}
.is-now svg circle { animation: pulse-glow 1.5s ease-in-out infinite; }
```

### Hero Blob Animation (Dashboard)
```css
@keyframes blob-move {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(40px, -30px) scale(1.1); }
  66%       { transform: translate(-20px, 20px) scale(0.9); }
}
.blob { filter: blur(80px); animation: blob-move 8s ease-in-out infinite; }
.blob-1 { background: rgba(168, 85, 247, 0.3); animation-delay: 0s; }
.blob-2 { background: rgba(236, 72, 153, 0.3); animation-delay: -2s; }
.blob-3 { background: rgba(255, 68, 79, 0.2);  animation-delay: -4s; }
```

### Strategy Toggle Button (Active State)
```scss
.toggle-switch {
  &.active {
    background: linear-gradient(135deg, #10b981, #047857);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }
}
```

### Status Dot Colors
```scss
.status-indicator { border-radius: 50%; width: 8px; height: 8px; }
.status-indicator.active { background: #00ff41; } // green  = running
.status-indicator:not(.active) { background: #ff073a; } // red = idle
```

---

## ✅ BUILD CHECKLIST

- [ ] `RootStore` + `StoreProvider` wrapping `<App>`
- [ ] `AnalysisMarketStore` subscribed to `R_100` by default on app load
- [ ] `useStore.tsx` hook providing `StoreContext`
- [ ] `_themes.scss` and CSS variable definitions in `:root`
- [ ] `@deriv/quill-icons` installed for tab icons
- [ ] Hash-based routing: `#dashboard`, `#free_bots`, `#analysis_tool`, `#trading_tools`, `#copy_trading`
- [ ] `admin.visible_tabs` object controlling tab visibility
- [ ] `MarketSelector` component available globally
- [ ] `ChunkLoader` fallback for all `React.lazy()` imports
- [ ] Glassmorphism mixin defined in shared SCSS
- [ ] `buildguide.md` understood by every developer before starting
