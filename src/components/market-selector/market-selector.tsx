import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './market-selector.scss';

const MarketSelector = observer(() => {
    const { analysis_market } = useStore();
    const { current_price, last_digit, symbol, markets, setSymbol } = analysis_market;

    return (
        <div className='market-selector-v2'>
            <div className='market-selector-v2__main'>
                <div className='selector-group'>
                    <label className='selector-label'>SELECT MARKET</label>
                    <div className='select-wrapper'>
                        <select
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className='market-select-v2'
                        >
                            {markets.map(group => (
                                <optgroup key={group.group} label={group.group}>
                                    {group.items.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className='select-arrow'>▾</div>
                    </div>
                </div>

                <div className='stats-group'>
                    <div className='stat-item price'>
                        <span className='stat-label'>LIVE PRICE</span>
                        <span className='stat-value'>{current_price}</span>
                    </div>
                    <div className={`stat-item digit ${last_digit !== null ? (last_digit % 2 === 0 ? 'even' : 'odd') : ''}`}>
                        <span className='stat-label'>LAST DIGIT</span>
                        <span className='stat-value'>{last_digit ?? '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MarketSelector;
