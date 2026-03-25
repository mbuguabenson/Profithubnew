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
    { icon: '🤖', label: 'Bot Builder', desc: 'Automated strategy engine' },
    { icon: '📊', label: 'Charts', desc: 'Real-time market charts' },
    { icon: '🧪', label: 'Analysis Tool', desc: 'Advanced market analytics' },
    { icon: '⚡', label: 'Easy Tool', desc: 'Quick-start trading bots' },
    { icon: '🆓', label: 'Free Bots', desc: 'Pre-built expert bots' },
    { icon: '📋', label: 'Reports', desc: 'P&L & performance reports' },
    { icon: '📡', label: 'Signals', desc: 'Real-time entry alerts' },
    { icon: '👥', label: 'Copy Trade', desc: 'Follow top expert bots' },
    { icon: '🛡️', label: 'Risk Guard', desc: 'Smart capital protection' },
];

const SOCIAL_LINKS = [
    {
        type: 'whatsapp',
        path: 'M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.099-.47-.15-.668.15-.198.3-.771.971-.945 1.171-.174.2-.347.225-.648.075-.301-.15-1.27-.468-2.42-1.492-.894-.798-1.498-1.783-1.673-2.083-.174-.3-.018-.462.13-.611.135-.133.301-.35.452-.524.15-.174.2-.3.301-.5.1-.2.05-.375-.025-.524-.075-.15-.668-1.611-.916-2.203-.242-.581-.486-.503-.668-.512-.172-.008-.37-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.076.149.2 2.095 3.199 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.721 2.016-1.417.248-.696.248-1.294.174-1.417-.074-.123-.272-.198-.574-.348zM12.016 22.016c-1.815 0-3.522-.511-4.981-1.393l-.358-.217-3.7 1.213 1.233-3.606-.239-.38A9.914 9.914 0 012.1 12.016C2.1 6.541 6.541 2.1 12.016 2.1c5.476 0 9.917 4.441 9.917 9.916s-4.441 9.917-9.917 9.917zM24 12.016C24 5.379 18.621 0 12.016 0A12.011 12.011 0 000 12.016c0 2.324.664 4.49 1.817 6.323L0 24l5.834-1.916a11.956 11.956 0 006.182 1.932C18.621 24 24 18.621 24 12.016z',
    },
    {
        type: 'telegram',
        path: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.213-3.047 5.57-5.06c.24-.213-.054-.33-.373-.12l-6.887 4.333-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z',
    },
    {
        type: 'instagram',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.475 1.382.897.422.422.681.822.897 1.382.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.475.96-.897 1.382-.422.422-.822.681-1.382.897-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.475-1.382-.897-.422-.422-.681-.822-.897-1.382-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.475-.96.897-1.382.422-.422.822-.681 1.382-.897.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.132 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126s1.337 1.079 2.126 1.384c.766.296 1.636.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384s1.079-1.338 1.384-2.126c.296-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126s-1.338-1.079-2.126-1.384c-.765-.296-1.636-.499-2.913-.558C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    },
    {
        type: 'tiktok',
        path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.72.42-1.24 1.16-1.31 1.99-.1.88.24 1.83.92 2.39.75.64 1.83.74 2.74.37 1.07-.44 1.25-1.36 1.25-2.26 0-3.14-.02-6.28-.02-9.42-.01-.16.03-.32.03-.48z',
    },
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
    }, []);

    return (
        <div className='quantum-loader'>
            {/* ── BROWSER CLIP DEFINITION ── */}
            <svg width='0' height='0' style={{ position: 'absolute' }}>
                <defs>
                    <clipPath id='squircleClip' clipPathUnits='objectBoundingBox'>
                        <path d='M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5'></path>
                    </clipPath>
                </defs>
            </svg>

            <div className='quantum-bg'>
                <div className='q-aurora q-aurora--magenta' />
                <div className='q-aurora q-aurora--purple' />
                <div className='q-grid' />
            </div>

            <div className='quantum-content'>
                {/* ── PROFITHUB LOGO ── */}
                <motion.div
                    className='q-brand-logo-container'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img src='/logo-ph.png' alt='ProfitHub Logo' className='q-brand-logo' />
                </motion.div>

                <motion.h1
                    className='q-title q-title--orange'
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    PROFIT HUB TRADING TOOL
                </motion.h1>

                <motion.p
                    className='q-subtitle q-subtitle--green'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Advanced Trading with Precision and Automation
                </motion.p>

                {/* ── CAPABILITIES GRID (3x3 Layout) ── */}
                <div className='q-capabilities'>
                    <div className='q-grid-layout'>
                        {CAPABILITIES.map((cap, i) => (
                            <motion.div
                                key={cap.label}
                                className='q-card'
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + i * 0.05 }}
                            >
                                <div className='q-card-icon'>{cap.icon}</div>
                                <div className='q-card-content'>
                                    <div className='q-card-label'>{cap.label}</div>
                                    <div className='q-card-desc'>{cap.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── PROGRESS SECTION ── */}
                <div className='q-progress-section'>
                    <div className='q-progress-header'>
                        <div className='q-ph-left'>
                            <span className='q-loading-icon'>🌀</span>
                            System Syncing
                        </div>
                        <div className='q-ph-right'>{Math.floor(progress)}%</div>
                    </div>
                    <div className='q-bar-rail'>
                        <motion.div
                            className='q-bar-fill'
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        >
                            <div className='q-bar-glow' />
                        </motion.div>
                    </div>
                    <div className='q-status-text'>
                        <AnimatePresence exitBeforeEnter>
                            <motion.span
                                key={logIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                            >
                                {QUANTUM_LOGS[logIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── SOCIAL HUB (Updated Socials) ── */}
                <div className='q-social-hub'>
                    {SOCIAL_LINKS.map((social, i) => (
                        <motion.div
                            key={social.type}
                            className='q-squircle-wrapper'
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 + i * 0.08 }}
                        >
                            <div className='q-sq-backdrop' />
                            <div
                                className={`q-sq-icon-box q-sq-icon-box--${social.type}`}
                                style={{ clipPath: 'url(#squircleClip)' }}
                            >
                                <svg viewBox='0 0 24 24' fill='currentColor'>
                                    <path d={social.path} />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── BRANDING ── */}
                <div className='q-branding'>
                    <div className='q-brand-text'>PROFIT HUB TECHNOLOGIES INC.</div>

                    <motion.div
                        className='q-powered-by'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 }}
                    >
                        <span className='q-pb-label'>POWERED BY</span>
                        <img src='/deriv-logo.svg' alt='Deriv Logo' className='q-pb-logo' />
                        <span className='q-pb-name'>DERIV</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
