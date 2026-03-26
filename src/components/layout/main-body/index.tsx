import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import './main-body.scss';

type TMainBodyProps = {
    children: React.ReactNode;
};

const MainBody: React.FC<TMainBodyProps> = ({ children }) => {
    const current_theme = localStorage.getItem('theme') ?? 'light';
    const { ui } = useStore() ?? {
        ui: {
            setDevice: () => {},
        },
    };
    const { setDevice } = ui;
    const { isDesktop, isMobile, isTablet } = useDevice();

    // Theme handling is now centralized in AppRoot.tsx
    // Removed redundant/stale localStorage checking logic from here.

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDevice('mobile');
            } else if (width < 1024) {
                setDevice('tablet');
            } else {
                setDevice('desktop');
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setDevice]);

    return <div className='main-body'>{children}</div>;
};

export default MainBody;
