import { observer } from 'mobx-react-lite';
// Hooks not needed anymore after removals
import DemoToRealSection from './demo-to-real-section';
import ClientTokensSection from './client-tokens-section';
import './copy-trader.scss';

const CopyTrading = observer(() => {
    return (
        <div className='copy-trader'>
            <header className='copy-trader__hero'>
                <div className='hero-content'>
                    <h1>
                        Copy Trading <span>Premium</span>
                    </h1>
                    <p>Automate your success by mirroring expert trades in real-time.</p>
                </div>
            </header>

            <div className='copy-trader__sections'>
                <div className='copy-trader__main'>
                    <DemoToRealSection />
                    <ClientTokensSection />
                </div>

                <aside className='copy-trader__aside'>
                    <div className='copy-trader__monitoring'>
                        <div className='monitoring-header'>
                            <h3>Reflection Stream</h3>
                            <div className='live-indicator'>
                                <span className='dot'></span> LIVE
                            </div>
                        </div>
                        <div className='table-container'>
                            <table className='copy-table'>
                                <thead>
                                    <tr>
                                        <th>Market</th>
                                        <th>Reference</th>
                                        <th>Status</th>
                                        <th>Stake</th>
                                        <th>Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} className='no-data'>
                                            <div className='empty-state'>
                                                <div className='empty-icon'>📊</div>
                                                <p>No active mirror streams detected.</p>
                                                <span>Start trading or enable internal mirroring to see results.</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
});

export default CopyTrading;
