import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './initial-loader.scss';

const CONNECTION_STEPS = [
    { id: 1, label: 'Connecting to Deriv API...', icon: '📡' },
    { id: 2, label: 'Fetching market data...', icon: '📊' },
    { id: 3, label: 'Initializing AI engine...', icon: '🧠' },
    { id: 4, label: 'Loading trading bots...', icon: '🤖' },
    { id: 5, label: 'Preparing your dashboard...', icon: '✅' },
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 6,
}));

export default function InitialLoader() {
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const startTimeRef = useRef(Date.now());
    const DURATION = 4000;

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setStepIndex(i => Math.min(i + 1, CONNECTION_STEPS.length - 1));
        }, DURATION / CONNECTION_STEPS.length);

        const progTimer = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const next = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(next);
            if (next >= 100) clearInterval(progTimer);
        }, 20);

        return () => {
            clearInterval(stepTimer);
            clearInterval(progTimer);
        };
    }, []);

    const currentStep = CONNECTION_STEPS[stepIndex];

    return (
        <motion.div
            className='ph-loader'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
        >
            {/* ── Floating Particles ── */}
            <div className='ph-particles'>
                {PARTICLES.map(p => (
                    <motion.div
                        key={p.id}
                        className='ph-particle'
                        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                        animate={{ y: [0, -30, 0], opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            {/* ── Gradient Orbs ── */}
            <div className='ph-orb ph-orb--blue' />
            <div className='ph-orb ph-orb--orange' />
            <div className='ph-orb ph-orb--purple' />

            {/* ── Abstract Ticker Lines (background) ── */}
            <div className='ph-ticker-bg' aria-hidden='true'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={`ph-ticker-line ph-ticker-line--${i % 2 === 0 ? 'up' : 'down'}`}
                        style={{ left: `${12 + i * 14}%`, height: `${40 + Math.random() * 40}%` }}
                        animate={{ scaleY: [1, 1.4, 0.8, 1.2, 1] }}
                        transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    />
                ))}
            </div>

            {/* ── Glassmorphism Card ── */}
            <motion.div
                className='ph-card'
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Logo */}
                <div className='ph-logo'>
                    <div className='ph-logo-icon'>
                        <svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <circle cx='20' cy='20' r='19' stroke='url(#logoRing)' strokeWidth='2' />
                            <path
                                d='M10 28L16 20L22 24L30 13'
                                stroke='url(#logoLine)'
                                strokeWidth='2.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <circle cx='30' cy='13' r='2.5' fill='#f97316' />
                            <defs>
                                <linearGradient
                                    id='logoRing'
                                    x1='0'
                                    y1='0'
                                    x2='40'
                                    y2='40'
                                    gradientUnits='userSpaceOnUse'
                                >
                                    <stop stopColor='#3b82f6' />
                                    <stop offset='1' stopColor='#f97316' />
                                </linearGradient>
                                <linearGradient
                                    id='logoLine'
                                    x1='10'
                                    y1='28'
                                    x2='30'
                                    y2='13'
                                    gradientUnits='userSpaceOnUse'
                                >
                                    <stop stopColor='#22d3ee' />
                                    <stop offset='1' stopColor='#f97316' />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className='ph-logo-text'>
                        <span className='ph-logo-brand'>ProfitHub</span>
                        <span className='ph-logo-tag'>Smart Deriv Trader</span>
                    </div>
                </div>

                {/* Welcome Text */}
                <div className='ph-headline'>
                    <h1 className='ph-title'>
                        Welcome to <span className='ph-gradient-text'>Smart Deriv Trader</span>
                    </h1>
                    <AnimatePresence mode='wait'>
                        <motion.p
                            key={stepIndex}
                            className='ph-subtitle'
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35 }}
                        >
                            <span className='ph-step-icon'>{currentStep.icon}</span>
                            {currentStep.label}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Progress Bar */}
                <div className='ph-progress-wrap'>
                    <div className='ph-bar-rail'>
                        <motion.div
                            className='ph-bar-fill'
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.15, ease: 'linear' }}
                        />
                        <div className='ph-bar-shimmer' />
                    </div>
                    <div className='ph-progress-info'>
                        <div className='ph-dots'>
                            <span className='ph-dot' />
                            <span className='ph-dot' />
                            <span className='ph-dot' />
                        </div>
                        <span className='ph-percent'>{Math.floor(progress)}%</span>
                    </div>
                </div>

                {/* Connection Steps */}
                <div className='ph-steps'>
                    {CONNECTION_STEPS.map((step, i) => (
                        <div
                            key={step.id}
                            className={`ph-step ${i <= stepIndex ? 'ph-step--done' : ''} ${i === stepIndex ? 'ph-step--active' : ''}`}
                        >
                            <div className='ph-step-dot' />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <p className='ph-footer'>© 2025 ProfitHub · Powered by Deriv</p>
            </motion.div>
        </motion.div>
    );
}
