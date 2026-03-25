import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './rise-fall-tab.scss';

const RiseFallTab = observer(() => {
    const { analysis_market } = useStore();
    const { current_price, is_rising, is_falling, tick_history, rise_percentage, fall_percentage, subscribe } =
        analysis_market;

    useEffect(() => {
        subscribe();
    }, [subscribe]);

    return (
        <div className='rise-fall-tab'>
            <div className='rise-fall-tab__header'>
                <div className='stat-card'>
                    <span className='stat-card__label'>RISE PERCENTAGE</span>
                    <span className='stat-card__value rise'>{rise_percentage}%</span>
                </div>
                <div className='stat-card'>
                    <span className='stat-card__label'>FALL PERCENTAGE</span>
                    <span className='stat-card__value fall'>{fall_percentage}%</span>
                </div>
            </div>

            <div className='rise-fall-tab__main'>
                <div className={`price-orb ${is_rising ? 'rising' : is_falling ? 'falling' : ''}`}>
                    <div className='price-orb__inner'>
                        <span className='price-orb__value'>{current_price}</span>
                        <div className='price-orb__arrow'>
                            {is_rising && '▲'}
                            {is_falling && '▼'}
                            {!is_rising && !is_falling && '•'}
                        </div>
                    </div>
                </div>
            </div>

            <div className='rise-fall-tab__history'>
                <h3>Real-time Tick History</h3>
                <div className='history-list'>
                    {tick_history.map((tick, i) => (
                        <div key={i} className={`history-item ${tick.direction}`}>
                            <span>{new Date(tick.time).toLocaleTimeString()}</span>
                            <span>{tick.price.toFixed(5)}</span>
                            <span className='direction-icon'>{tick.direction === 'up' ? '▲' : '▼'}</span>
                        </div>
                    ))}
                    {tick_history.length === 0 && <div className='loading-placeholder'>Waiting for market data...</div>}
                </div>
            </div>
        </div>
    );
});

export default RiseFallTab;
