import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import MarketSelector from '@/components/market-selector/market-selector';
import { AnalysisSection, DigitCircles, TradingEngine } from './components';
import './circles-analysis.scss';

const CirclesAnalysis = observer(() => {
    const { analysis } = useStore();
    const {
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
        over_under_threshold,
        match_diff_digit,
    } = analysis;

    useEffect(() => {
        // Initialization if needed
    }, []);

    return (
        <div className='circles-analysis-container'>
            <MarketSelector />

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
