import { Text, Button } from '@deriv-com/ui';
import { localize } from '@deriv-com/translations';
import { 
    LabelPairedGearCaptionRegularIcon, 
    LabelPairedSlidersCaptionRegularIcon, 
    LabelPairedLightbulbCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon
} from '@deriv/quill-icons/LabelPaired';
import classNames from 'classnames';
import './bot-card.scss';

export type BotType = 'automated' | 'normal' | 'ai';

interface BotCardProps {
    type: BotType;
    title: string;
    description: string;
    badge?: string;
    onRun?: () => void;
    onDownload?: () => void;
    is_builder_entry?: boolean;
    tradeType?: 'even-odd' | 'over-under' | 'rise-fall' | 'differs' | string;
}

const BotCard: React.FC<BotCardProps> = ({ 
    type, 
    title, 
    description, 
    badge, 
    onRun, 
    onDownload,
    is_builder_entry,
    tradeType 
}) => {
    const getIcon = () => {
        if (is_builder_entry) {
            return (
                <div className='bot-card__ai-logo'>
                    <span className='bot-card__ai-text'>Ai</span>
                    <div className='bot-card__ai-dot' />
                </div>
            );
        }
        switch (type) {
            case 'automated': return <LabelPairedSlidersCaptionRegularIcon />;
            case 'normal': return <LabelPairedGearCaptionRegularIcon />;
            case 'ai': return <LabelPairedLightbulbCaptionRegularIcon />;
            default: return <LabelPairedPuzzlePieceTwoCaptionBoldIcon />;
        }
    };

    return (
        <div 
            className={classNames(
                'bot-card', 
                `bot-card--${type}`, 
                { 'bot-card--builder': is_builder_entry },
                tradeType ? `bot-card--${tradeType}` : ''
            )}
            onClick={is_builder_entry ? onRun : undefined}
        >
            <div className='bot-card__header'>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {badge && <div className='bot-card__badge'>{badge}</div>}
                    {tradeType && (
                        <div className={`bot-card__category bot-card__category--${tradeType}`}>
                            {tradeType.replace('-', ' ').toUpperCase()}
                        </div>
                    )}
                </div>
                <div className='bot-card__icon-wrapper'>
                    {getIcon()}
                </div>
            </div>
            
            <div className='bot-card__content'>
                <Text size='sm' weight='bold' color='prominent' className='bot-card__title'>
                    {title}
                </Text>
                <Text size='xs' color='less-prominent' className='bot-card__description'>
                    {description}
                </Text>
            </div>

            <div className='bot-card__actions'>
                <Button color='primary' size='sm' variant='contained' onClick={onRun} className='bot-card__btn'>
                    {localize('Load')}
                </Button>
                {onDownload && (
                    <Button color='primary' size='sm' variant='outlined' onClick={onDownload} className='bot-card__btn bot-card__btn--outlined'>
                        {localize('Download')}
                    </Button>
                )}
            </div>
        </div>
    );
};

// Export default
export default BotCard;
