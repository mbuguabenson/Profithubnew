import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './initial-loader.scss';

const QUANTUM_LOGS = [
    'Initializing ProfitHub core...',
    'Stabilizing market dimensions...',
    'Synchronizing nexus nodes...',
    'Analyzing superposition states...',
    'Calibrating probability matrices...',
    'Mapping profit-stream arrays...',
    'Reality convergence in progress...',
    'Welcome to ProfitHub.',
];

const CAPABILITIES = [
    { icon: '🤖', label: 'Free Bots' },
    { icon: '🧠', label: 'AI Bots' },
    { icon: '🧪', label: 'Analysis Tool' },
    { icon: '✨', label: 'Smart Analysis' },
    { icon: '👥', label: 'Copy Trading' },
    { icon: '📡', label: 'Signals' },
];

const STEPS = [
    { id: 1, label: 'CONNECTION' },
    { id: 2, label: 'MARKET DATA' },
    { id: 3, label: 'AI ENGINE' },
    { id: 4, label: 'TRADING BOTS' },
    { id: 5, label: 'FINAL SETUP' },
];

export default function InitialLoader() {
    const [progress, setProgress] = useState(0);
    const [logIndex, setLogIndex] = useState(0);

    useEffect(() => {
        const logTimer = setInterval(() => setLogIndex(i => (i + 1) % QUANTUM_LOGS.length), 1000);
        
        const startTime = Date.now();
        const duration = 2800; 

        const progTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const nextProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(nextProgress);
            if (nextProgress >= 100) clearInterval(progTimer);
        }, 30);

        return () => {
            clearInterval(logTimer);
            clearInterval(progTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div 
            className='quantum-loader'
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
            {/* ── BROWSER CLIP DEFINITION ── */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <clipPath id="squircleClip" clipPathUnits="objectBoundingBox">
                        <path d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5"></path>
                    </clipPath>
                </defs>
            </svg>

            <div className='quantum-bg'>
                <div className='q-grid' />
            </div>

            <motion.div 
                className='q-main-card'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className='q-card-header'>
                    <div className='q-logo-row'>
                        <svg className='q-logo-svg' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3V21H21" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 14L11 10L15 14L21 8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className='q-brand-titles'>
                            <h1 className='q-main-title'>PROFIT</h1>
                            <span className='q-main-subtitle'>HUB SYSTEM</span>
                        </div>
                    </div>
                    <p className='q-welcome-text'>Welcome to <span className='q-highlight'>ProfitHub</span></p>
                    <p className='q-welcome-sub'>High-Performance Trading Ecosystem</p>
                </div>

                <div className='q-steps-row'>
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className='q-step-item'>
                            <div className={`q-step-circle ${step.id === 1 ? 'q-step-circle--active' : ''}`}>
                                {step.id}
                            </div>
                            <span className='q-step-label'>{step.label}</span>
                            {idx < STEPS.length - 1 && <div className='q-step-line' />}
                        </div>
                    ))}
                </div>

                <div className='q-grid-layout'>
                    {CAPABILITIES.map((cap, i) => (
                        <motion.div 
                            key={cap.label}
                            className='q-cap-card'
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.05) }}
                        >
                            <div className='q-cap-icon'>{cap.icon}</div>
                            <div className='q-cap-label'>{cap.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className='q-progress-area'>
                    <div className='q-status-msg'>
                        <p className='q-msg-primary'>Establishing secure connection...</p>
                        <p className='q-msg-secondary'>
                            <AnimatePresence exitBeforeEnter>
                                <motion.span
                                    key={logIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {QUANTUM_LOGS[logIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </p>
                    </div>
                    <div className='q-progress-bar-container'>
                        <div className='q-bar-rail'>
                            <motion.div 
                                className='q-bar-fill'
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                        <span className='q-progress-percent'>{Math.floor(progress)}%</span>
                    </div>
                </div>

                <div className='q-card-footer'>
                    <p>© 2025 ProfitHub Powered by Deriv. All rights reserved.</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
