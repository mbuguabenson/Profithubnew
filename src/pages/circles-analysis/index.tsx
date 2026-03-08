import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { AnalysisSection, DigitCircles, TradingEngine } from './components';
import './circles-analysis.scss';

const CirclesAnalysis = observer(() => {
    const { analysis } = useStore();
    const {
        current_price,
        symbol,
        total_ticks,
        even_odd_history,
        over_under_history,
        matches_differs_history,
        rise_fall_history,
        percentages = { even: 50, odd: 50, over: 50, under: 50, match: 0, differ: 0, rise: 0, fall: 0 },
        current_streaks = {
            even_odd: { count: 0, type: 'EVEN' },
            over_under: { count: 0, type: 'OVER' },
            match_diff: { count: 0, type: 'MATCH' },
            rise_fall: { count: 0, type: 'RISE' },
        },
        setSymbol,
        setTotalTicks,
        last_digit,
        markets,
        over_under_threshold,
        match_diff_digit,
    } = analysis;

    const availableMarkets = markets.length > 0 
        ? markets 
        : [
            {
                group: 'Synthetic Indices',
                items: [
                    { value: '1HZ10V', label: 'Volatility 10 (1s) Index' },
                    { value: '1HZ25V', label: 'Volatility 25 (1s) Index' },
                    { value: '1HZ50V', label: 'Volatility 50 (1s) Index' },
                    { value: '1HZ75V', label: 'Volatility 75 (1s) Index' },
                    { value: '1HZ100V', label: 'Volatility 100 (1s) Index' },
                    { value: 'R_10', label: 'Volatility 10 Index' },
                    { value: 'R_25', label: 'Volatility 25 Index' },
                    { value: 'R_50', label: 'Volatility 50 Index' },
                    { value: 'R_75', label: 'Volatility 75 Index' },
                    { value: 'R_100', label: 'Volatility 100 Index' },
                ]
            }
        ];

    useEffect(() => {
        // Initialization if needed
    }, []);

    return (
        <div className='circles-analysis-container'>
            <header className='analysis-header'>
                <div className='header-left'>
                    <div className='market-selector-wrapper'>
                        <label>Select Market</label>
                        <select value={symbol} onChange={e => setSymbol(e.target.value)} className='premium-select'>
                            {availableMarkets.map(group => (
                                <optgroup key={group.group} label={group.group}>
                                    {group.items.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div className='ticks-input-wrapper'>
                        <label>Last Ticks</label>
                        <input
                            type='number'
                            value={total_ticks}
                            onChange={e => setTotalTicks(parseInt(e.target.value))}
                            className='premium-input'
                        />
                    </div>
                </div>

                <div className='header-right'>
                    <div className='price-display-card'>
                        <span className='label'>LIVE PRICE</span>
                        <span className='price-value'>{current_price}</span>
                    </div>
                    <div className={`digit-display-card ${last_digit !== null ? (last_digit % 2 === 0 ? 'digit--even' : 'digit--odd') : ''}`}>
                        <span className='label'>LAST DIGIT</span>
                        <span className='digit-value'>{last_digit ?? '-'}</span>
                    </div>
                </div>
            </header>

            <DigitCircles />

            <div className='circles-analysis__content'>
                <TradingEngine />
                
                <div className='analysis-sections-grid'>
                    <AnalysisSection
                        title='Matches/Differs'
                        streak={current_streaks.match_diff}
                        history={matches_differs_history}
                        left_label={`MATCHES ${match_diff_digit}`}
                        left_pct={percentages.match}
                        right_label={`DIFFERS ${match_diff_digit}`}
                        right_pct={percentages.differ}
                        type='M_D'
                    />
                    <AnalysisSection
                        title='Over/Under'
                        streak={current_streaks.over_under}
                        history={over_under_history}
                        left_label={`OVER ${over_under_threshold}`}
                        left_pct={percentages.over}
                        right_label={`UNDER ${over_under_threshold}`}
                        right_pct={percentages.under}
                        type='U_O'
                    />
                    <AnalysisSection
                        title='Even/Odd'
                        streak={current_streaks.even_odd}
                        history={even_odd_history}
                        left_label='EVEN'
                        left_pct={percentages.even}
                        right_label='ODD'
                        right_pct={percentages.odd}
                        type='E_O'
                    />
                    <AnalysisSection
                        title='Rise/Fall'
                        streak={current_streaks.rise_fall}
                        history={rise_fall_history}
                        left_label='RISE'
                        left_pct={percentages.rise}
                        right_label='FALL'
                        right_pct={percentages.fall}
                        type='R_F'
                    />
                </div>
            </div>
        </div>
    );
});

export default CirclesAnalysis;
