const isTmbEnabled = async () => {
    const search = window.location.search;
    let platform;
    if (search) {
        const url_params = new URLSearchParams(search);
        platform = url_params.get('platform');
    }
    // add deriv and impersonation check
    const triggerImplicitFlow = platform === 'derivgo' || sessionStorage.getItem('is_disable_tmb') === 'true';

    if (triggerImplicitFlow) {
        sessionStorage.setItem('is_disable_tmb', 'true');
    }

    const storedValue = localStorage.getItem('is_tmb_enabled');
    const is_localhost = window.location.hostname === 'localhost';

    if (storedValue !== null) {
        return storedValue === 'true';
    }

    return !triggerImplicitFlow && !is_localhost;
};

export default isTmbEnabled;
