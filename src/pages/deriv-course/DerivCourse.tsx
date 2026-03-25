import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSE_OVERVIEW, COURSE_CHAPTERS } from './course-data';
import './deriv-course.scss';

const RESOURCES = [
    { icon: '📖', title: 'Trading Glossary', desc: 'Comprehensive dictionary of key trading terms and definitions specific to Deriv.' },
    { icon: '📊', title: 'Contract Comparison', desc: 'Side-by-side comparison matrix of all Deriv contract types and their mechanics.' },
    { icon: '🧮', title: 'Risk Calculator', desc: 'Interactive tool to calculate position sizes and risk parameters based on balance.' },
    { icon: '📋', title: 'Journal Template', desc: 'Downloadable framework for tracking and analyzing trade history.' },
    { icon: '📝', title: 'Trading Plan Template', desc: 'Structured document to help define strategy, entry/exit, and risk limits.' },
    { icon: '⚠️', title: 'Scam Warning List', desc: 'Updated list of known fraudulent services and red flags in the space.' },
];

export default function DerivCourse() {
    const [activeTab, setActiveTab] = useState('overview');
    const [openChapter, setOpenChapter] = useState<number | null>(1);
    const [isAllExpanded, setIsAllExpanded] = useState(false);

    const toggleChapter = (id: number) => {
        setOpenChapter(openChapter === id ? null : id);
    };

    const handleExpandAll = () => {
        setIsAllExpanded(!isAllExpanded);
    };

    const jumpToChapter = (id: number) => {
        setActiveTab('chapters');
        setOpenChapter(id);
        setTimeout(() => {
            const element = document.getElementById(`chapter-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className='deriv-course'>
            <motion.div 
                className='deriv-course__hero'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className='deriv-course__hero-content'>
                    <motion.span 
                        className='hero-badge'
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Master the Markets
                    </motion.span>
                    <motion.h1 
                        initial={{ x: -30, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {COURSE_OVERVIEW.welcome}
                    </motion.h1>
                    <motion.p 
                        className='hero-subtitle'
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <span>📘</span> Your Path to Trading Excellence
                    </motion.p>
                    <motion.p 
                        className='hero-description'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {COURSE_OVERVIEW.description}
                    </motion.p>
                    <motion.div 
                        className='hero-actions'
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <motion.button 
                            className='hero-btn'
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('chapters')}
                        >
                            <span className='icon'>⚡</span> Start Learning
                        </motion.button>
                        <div className='hero-stats'>
                            {COURSE_OVERVIEW.stats.map((stat, i) => (
                                <div key={i} className='hero-stat-item'>
                                    <span className='val'>{stat.value}</span>
                                    <span className='lbl'>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                <div className='deriv-course__hero-visual'>
                    <div className='hero-image-container'>
                        <img src='/C:/Users/benso/.gemini/antigravity/brain/a7bcb02c-43c8-46b9-bd55-d0d8ae8fa941/deriv_course_hero_banner_1773578170432.png' alt='Deriv Course' />
                    </div>
                </div>
            </motion.div>

            <div className='deriv-course__tabs-wrapper'>
                <div className='deriv-course__tabs'>
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''} 
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview {activeTab === 'overview' ? '▴' : '▾'}
                    </button>
                    <button 
                        className={activeTab === 'chapters' ? 'active' : ''} 
                        onClick={() => setActiveTab('chapters')}
                    >
                        All Chapters {activeTab === 'chapters' ? '▴' : '▾'}
                    </button>
                    <button 
                        className={activeTab === 'resources' ? 'active' : ''} 
                        onClick={() => setActiveTab('resources')}
                    >
                        Resources {activeTab === 'resources' ? '▴' : '▾'}
                    </button>
                    <div className='tabs-right'>
                        <span className='globe'>🌐</span>
                        <span className='lang'>EN</span>
                    </div>
                </div>
            </div>

            <main className='deriv-course__content'>
                <AnimatePresence exitBeforeEnter>
                    {activeTab === 'overview' && (
                        <motion.div 
                            key='overview'
                            className='deriv-course__overview'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className='overview-layout'>
                                <section className='curriculum-content'>
                                    <div className='grid-header'>
                                        <h2 style={{ fontSize: '32px', marginBottom: '40px', color: '#fff' }}>Course Blueprint</h2>
                                    </div>
                                    <div className='curriculum-grid'>
                                        {COURSE_OVERVIEW.curriculum.map((cat, i) => (
                                            <motion.div 
                                                key={i} 
                                                className='curriculum-card'
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className='card-icon'>{cat.icon}</div>
                                                <div className='card-info'>
                                                    <h4>{cat.category}</h4>
                                                    <span className='count'>{cat.count}</span>
                                                    <ul className='item-list'>
                                                        {cat.items.slice(0, 3).map((item, j) => (
                                                            <li key={j}>{item}</li>
                                                        ))}
                                                        {cat.items.length > 3 && <li className='more'>View {cat.items.length - 3} more...</li>}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                <div className='sidebar-section'>
                                    <div className='glass-panel quick-start'>
                                        <h3><span>🚀</span> Accelerate</h3>
                                        <div className='steps-container'>
                                            {COURSE_OVERVIEW.quickStart.map((s, i) => (
                                                <div key={i} className='step-btn' onClick={() => {
                                                    if (s.step === 1) jumpToChapter(1);
                                                    if (s.step === 2) jumpToChapter(7);
                                                    if (s.step === 3) jumpToChapter(17);
                                                    if (s.step === 4) jumpToChapter(30);
                                                }}>
                                                    <div className='num'>{s.step}</div>
                                                    <div className='info'>
                                                        <h5>{s.title}</h5>
                                                        <p>{s.desc || (s as any).create}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='glass-panel key-topics'>
                                        <h3><span>⭐</span> Foundations</h3>
                                        <div className='topics-grid'>
                                            {COURSE_OVERVIEW.keyTopics.map((topic, i) => (
                                                <div key={i} className='topic-card' style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                                                    <span className='icon' style={{ fontSize: '20px' }}>{topic.icon}</span>
                                                    <div className='txt'>
                                                        <h5 style={{ color: '#fff', fontSize: '14px' }}>{topic.title}</h5>
                                                        <p style={{ opacity: 0.5, fontSize: '12px' }}>{topic.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chapters' && (
                        <motion.div 
                            key='chapters'
                            className='deriv-course__chapters'
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className='chapters-top-bar'>
                                <div className='header-info'>
                                    <h3>Course Modules</h3>
                                    <p>Deep dive into professional trading mechanics</p>
                                </div>
                                <button className='expand-all-btn' onClick={handleExpandAll}>
                                    {isAllExpanded ? 'Collapse All' : 'Expand All'}
                                </button>
                            </div>
                            
                            <div className='chapters-stack'>
                                {COURSE_CHAPTERS.map((chap) => (
                                    <div 
                                        key={chap.id} 
                                        id={`chapter-${chap.id}`}
                                        className={`chapter-accordion ${openChapter === chap.id || isAllExpanded ? 'active' : ''}`}
                                    >
                                        <div className='chapter-accordion-header' onClick={() => toggleChapter(chap.id)}>
                                            <div className='left-side'>
                                                <span className='label'>Module {chap.id}</span>
                                                <span className='title'>{chap.title}</span>
                                            </div>
                                            <div className='right-side'>
                                                <span className='time'>{Math.ceil(chap.content.length / 500)} min read</span>
                                                <span className={`arrow ${openChapter === chap.id || isAllExpanded ? 'rotated' : ''}`}>▼</span>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {(openChapter === chap.id || isAllExpanded) && (
                                                <motion.div 
                                                    className='chapter-accordion-body'
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    <div 
                                                        className='content-renderer'
                                                        dangerouslySetInnerHTML={{ __html: chap.content }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'resources' && (
                        <motion.div 
                            key='resources'
                            className='deriv-course__resources'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className='resource-grid'>
                                {RESOURCES.map((res) => (
                                    <div key={res.title} className='resource-tile'>
                                        <div className='icon-box'>{res.icon}</div>
                                        <div className='tile-content'>
                                            <h4>{res.title}</h4>
                                            <p>{res.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
