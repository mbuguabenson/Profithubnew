import { useCallback } from 'react';
import { useStore } from './useStore';

const useThemeSwitcher = () => {
    const { ui } = useStore() ?? {
        ui: {
            setDarkMode: () => {},
            is_dark_mode_on: false,
        },
    };

    const toggleTheme = useCallback(() => {
        ui.setDarkMode(!ui.is_dark_mode_on);
    }, [ui]);

    return {
        toggleTheme,
        is_dark_mode_on: ui.is_dark_mode_on,
        setDarkMode: ui.setDarkMode,
    };
};

export default useThemeSwitcher;
