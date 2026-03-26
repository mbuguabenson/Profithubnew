import { action, makeObservable, observable } from 'mobx';
import { isTouchDevice } from '@/components/shared/utils/screen/responsive';

export default class UiStore {
    is_mobile = true;
    is_desktop = true;
    is_tablet = false;
    is_chart_layout_default = true;
    is_dark_mode_on = false;
    account_switcher_disabled_message = '';
    current_focus: string | null = null;
    show_prompt = false;
    is_trading_assessment_for_new_user_enabled = false;
    is_accounts_switcher_on = false;
    is_onscreen_keyboard_active = false;

    constructor() {
        makeObservable(this, {
            account_switcher_disabled_message: observable,
            current_focus: observable,
            is_accounts_switcher_on: observable,
            is_dark_mode_on: observable,
            is_desktop: observable,
            is_mobile: observable,
            is_tablet: observable,
            is_chart_layout_default: observable,
            is_onscreen_keyboard_active: observable,
            is_trading_assessment_for_new_user_enabled: observable,
            show_prompt: observable,
            setAccountSwitcherDisabledMessage: action.bound,
            setCurrentFocus: action.bound,
            setDarkMode: action.bound,
            setDevice: action.bound,
            setPromptHandler: action.bound,
            setIsTradingAssessmentForNewUserEnabled: action.bound,
            toggleAccountsDialog: action.bound,
            toggleOnScreenKeyboard: action.bound,
        });

        const storedTheme = localStorage.getItem('theme');
        console.warn(`[UiStore] Initializing theme from localStorage: "${storedTheme}"`);
        this.is_dark_mode_on = storedTheme === 'dark';
    }

    setPromptHandler = (should_show: boolean) => {
        this.show_prompt = should_show;
    };

    setAccountSwitcherDisabledMessage = (message: string) => {
        if (message) {
            this.account_switcher_disabled_message = message;
        }
    };

    setIsTradingAssessmentForNewUserEnabled = (value: boolean) => {
        this.is_trading_assessment_for_new_user_enabled = value;
    };

    setDarkMode = (value: boolean) => {
        this.is_dark_mode_on = value;
        localStorage.setItem('theme', value ? 'dark' : 'light');
    };

    setDevice = (value: 'mobile' | 'desktop' | 'tablet') => {
        this.is_mobile = value === 'mobile';
        this.is_desktop = value === 'desktop';
        this.is_tablet = value === 'tablet';
    };

    toggleAccountsDialog = (message: string | boolean = false) => {
        if (typeof message === 'string') {
            this.setAccountSwitcherDisabledMessage(message);
        }
        this.is_accounts_switcher_on = !this.is_accounts_switcher_on;
    };

    toggleOnScreenKeyboard = (value: boolean) => {
        this.is_onscreen_keyboard_active = value;
    };

    setCurrentFocus = (value: string | null) => {
        this.current_focus = value;
    };

    get is_touch() {
        return isTouchDevice();
    }
}
