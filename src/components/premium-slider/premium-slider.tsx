import React from 'react';
import './premium-slider.scss';

interface PremiumInputProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    onChange: (value: number) => void;
    color?: 'blue' | 'rose' | 'emerald' | 'purple' | 'gold' | 'cyan' | 'indigo' | 'violet' | 'amber' | 'orange' | 'teal' | 'sky';
}

const PremiumSlider: React.FC<PremiumInputProps> = ({
    label,
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    suffix = '',
    onChange,
    color = 'blue'
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        onChange(isNaN(val) ? 0 : val);
    };

    return (
        <div className={`premium-slider premium-slider--${color} premium-input-mode`}>
            <div className='premium-slider__header'>
                <span className='premium-slider__label'>{label}</span>
            </div>
            <div className='premium-slider__container input-container'>
                <div className='input-wrapper'>
                    <input
                        type='number'
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={handleInputChange}
                        className='premium-slider__text-input'
                    />
                    {suffix && <span className='input-suffix'>{suffix}</span>}
                </div>
            </div>
        </div>
    );
};

export default PremiumSlider;
