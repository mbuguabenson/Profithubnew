import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

const DigitCircles = observer(() => {
    const { analysis } = useStore();
    const { digit_stats, last_digit } = analysis;

    const group1 = digit_stats.slice(0, 5);
    const group2 = digit_stats.slice(5, 10);

    const renderDigitGroup = (digits: typeof digit_stats) => {
        return digits.map(stat => {
            const isCurrent = stat.digit === last_digit;
            
            // Colors based on rank and current status
            let color = '#3b82f6'; // Default Blue
            if (stat.rank === 1) color = '#00ff41'; // Green for top
            else if (stat.rank === 10) color = '#ff073a'; // Red for least
            
            if (isCurrent) color = '#ff9f00'; // Orange for NOW

            return (
                <div key={stat.digit} className={`digit-card-v2 ${isCurrent ? 'is-now' : ''}`} data-rank={stat.rank}>
                    {isCurrent && (
                        <div className='now-badge-wrapper'>
                            <span className='now-badge'>NOW</span>
                        </div>
                    )}
                    <div className='digit-main-circle'>
                        <svg width='70' height='70' viewBox='0 0 70 70'>
                            <circle 
                                className='circle-track' 
                                cx='35' cy='35' r='30' 
                                fill='none' 
                                stroke='rgba(255, 255, 255, 0.05)' 
                                strokeWidth='6'
                            />
                            <circle
                                className='circle-progress-arc'
                                cx='35'
                                cy='35'
                                r='30'
                                fill='none'
                                stroke={color}
                                strokeWidth='6'
                                strokeLinecap='round'
                                strokeDasharray={`${(2 * Math.PI * 30) / 4} ${2 * Math.PI * 30}`}
                                strokeDashoffset={-(2 * Math.PI * 30) * 0.375}
                                style={{ filter: isCurrent ? `drop-shadow(0 0 8px ${color})` : 'none' }}
                            />
                        </svg>
                        <div className='digit-center-text'>
                            <span className='digit-num' style={{ color: isCurrent ? color : '#fff' }}>{stat.digit}</span>
                            <span className='digit-pct' style={{ color: isCurrent ? color : '#60a5fa' }}>{stat.percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className='digit-sample-size'>
                        n={stat.count}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className='digit-circles-wrapper'>
            <div className='digit-circles-row'>
                {renderDigitGroup(group1)}
            </div>
            <div className='digit-circles-row'>
                {renderDigitGroup(group2)}
            </div>
        </div>
    );
});

export default DigitCircles;
