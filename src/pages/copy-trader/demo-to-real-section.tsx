import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './demo-to-real-section.scss';

const DemoToRealSection = observer(() => {
    const { client, copy_trader } = useStore();
    const {
        selected_real_account_loginid,
        is_demo_to_real_active,
        demo_to_real_status,
        demo_to_real_error,
        setSelectedRealAccount,
        startDemoToRealCopy,
        stopDemoToRealCopy,
    } = copy_trader;

    // Get list of real accounts (non-virtual) from client's account list
    const realAccounts = useMemo(() => {
        return client.account_list.filter(account => !account.is_virtual);
    }, [client.account_list]);

    const handleToggle = () => {
        if (is_demo_to_real_active) {
            stopDemoToRealCopy();
        } else {
            startDemoToRealCopy();
        }
    };

    const getStatusBadge = () => {
        switch (demo_to_real_status) {
            case 'connecting':
                return <span className='status-badge connecting'>Connecting...</span>;
            case 'active':
                return <span className='status-badge active'>● Active</span>;
            case 'error':
                return <span className='status-badge error'>✕ Error</span>;
            default:
                return <span className='status-badge idle'>○ Ready</span>;
        }
    };

    return (
        <div className={`demo-to-real-minimal ${is_demo_to_real_active ? 'enabled' : ''}`}>
            <div className='minimal-row'>
                <div className='row-item title'>
                    <h2>Demo to Real</h2>
                    {getStatusBadge()}
                </div>

                <div className='row-item account-info'>
                    <span className='login-pill'>{client.loginid}</span>
                </div>

                <div className='row-item selector'>
                    <select
                        value={selected_real_account_loginid}
                        onChange={e => setSelectedRealAccount(e.target.value)}
                        disabled={is_demo_to_real_active}
                    >
                        <option value=''>-- Select Target Real Account --</option>
                        {realAccounts.map(account => (
                            <option key={account.loginid} value={account.loginid}>
                                {account.loginid} ({account.currency})
                            </option>
                        ))}
                    </select>
                </div>

                <div className='row-item action'>
                    <button
                        className={`toggle-minimal ${is_demo_to_real_active ? 'active' : ''}`}
                        onClick={handleToggle}
                        disabled={
                            demo_to_real_status === 'connecting' ||
                            (!selected_real_account_loginid && !is_demo_to_real_active)
                        }
                    >
                        {demo_to_real_status === 'connecting' ? '...' : is_demo_to_real_active ? 'Stop' : 'Start'}
                    </button>
                </div>
            </div>
            {demo_to_real_error && <div className='error-line'>{demo_to_real_error}</div>}
        </div>
    );
});

export default DemoToRealSection;
