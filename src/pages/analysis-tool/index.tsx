import { Suspense, lazy, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ChunkLoader from '@/components/loader/chunk-loader';
import AdvancedOverUnderTab from '../smart-trading/components/advanced-over-under-tab';
import DiffersTab from '../smart-trading/components/differs-tab';
import EvenOddTab from '../smart-trading/components/even-odd-tab';
import MatchesTab from '../smart-trading/components/matches-tab';
import OverUnderTab from '../smart-trading/components/over-under-tab';
import './analysis-tool.scss';

const EasyTool = lazy(() => import('../easy-tool/index'));

type TAnalysisSubTab = 'easy_tool' | 'even_odd' | 'over_under' | 'adv_over_under' | 'differs' | 'matches';

const AnalysisTool = observer(() => {
    const [active_subtab, setActiveSubtab] = useState<TAnalysisSubTab>('easy_tool');

    const renderActiveTab = () => {
        switch (active_subtab) {
            case 'easy_tool':
                return (
                    <Suspense fallback={<ChunkLoader message='Loading Easy Tool...' />}>
                        <EasyTool />
                    </Suspense>
                );
            case 'even_odd':
                return <EvenOddTab />;
            case 'over_under':
                return <OverUnderTab />;
            case 'adv_over_under':
                return <AdvancedOverUnderTab />;
            case 'differs':
                return <DiffersTab />;
            case 'matches':
                return <MatchesTab />;
            default:
                return (
                    <Suspense fallback={<ChunkLoader message='Loading Easy Tool...' />}>
                        <EasyTool />
                    </Suspense>
                );
        }
    };

    return (
        <div className='analysis-tool'>
            <div className='analysis-tool__tabs'>
                <button
                    className={active_subtab === 'easy_tool' ? 'active' : ''}
                    onClick={() => setActiveSubtab('easy_tool')}
                >
                    Easy Tool
                </button>
                <button
                    className={active_subtab === 'even_odd' ? 'active' : ''}
                    onClick={() => setActiveSubtab('even_odd')}
                >
                    Even/Odd
                </button>
                <button
                    className={active_subtab === 'over_under' ? 'active' : ''}
                    onClick={() => setActiveSubtab('over_under')}
                >
                    Over/Under
                </button>
                <button
                    className={active_subtab === 'adv_over_under' ? 'active' : ''}
                    onClick={() => setActiveSubtab('adv_over_under')}
                >
                    Advanced Over/Under
                </button>
                <button
                    className={active_subtab === 'differs' ? 'active' : ''}
                    onClick={() => setActiveSubtab('differs')}
                >
                    Differs
                </button>
                <button
                    className={active_subtab === 'matches' ? 'active' : ''}
                    onClick={() => setActiveSubtab('matches')}
                >
                    Matches
                </button>
            </div>

            <div className='analysis-tool__content'>{renderActiveTab()}</div>
        </div>
    );
});

export default AnalysisTool;
