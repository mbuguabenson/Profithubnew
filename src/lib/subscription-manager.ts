/**
 * Centralized WebSocket Subscription Manager
 * Uses a dedicated raw WebSocket connection for tick subscriptions,
 * bypassing the Deriv SDK's auth-blocking queue.
 */

import { getAppId, getSocketURL } from '@/components/shared';
import { website_name } from '@/utils/site-config';
import { getInitialLanguage } from '@deriv-com/translations';

type SubscriptionCallback = (data: unknown) => void;

interface ActiveSubscription {
    symbol: string;
    id: string | null;
    callbacks: Set<SubscriptionCallback>;
    unsubscribe: (() => void) | null;
    lastHistory?: Record<string, unknown>;
    lastTick?: Record<string, unknown>;
}

export class SubscriptionManager {
    private activeSubscriptions: Map<string, ActiveSubscription> = new Map();
    private ws: WebSocket | null = null;
    private reqId = 1000; // Start at 1000 to avoid clashes with main SDK req_ids
    private connectPromise: Promise<void> | null = null;

    /**
     * Get or create the dedicated raw WebSocket for tick subscriptions
     */
    private getConnection(): Promise<void> {
        // Already connected
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        // Already connecting, return existing promise
        if (this.connectPromise) {
            return this.connectPromise;
        }

        // Build the socket URL
        const server = (getSocketURL() || 'ws.derivws.com').replace(/[^a-zA-Z0-9.]/g, '');
        const appId = (getAppId() || '121856').toString().replace(/[^a-zA-Z0-9]/g, '');
        const lang = (getInitialLanguage() || 'EN').toUpperCase();
        const brand = (website_name || 'deriv').toLowerCase();
        const url = `wss://${server}/websockets/v3?app_id=${appId}&l=${lang}&brand=${brand}`;

        this.connectPromise = new Promise<void>((resolve, reject) => {
            try {
                if (this.ws) {
                    try {
                        this.ws.close();
                    } catch (_) {
                        /* ignore */
                    }
                }
                const ws = new WebSocket(url);
                this.ws = ws;

                const timeout = setTimeout(() => {
                    reject(new Error('WebSocket connection timeout'));
                    this.connectPromise = null;
                }, 10000);

                ws.onopen = () => {
                    clearTimeout(timeout);
                    console.log('[SubscriptionManager] Dedicated WS connected:', url);
                    this.connectPromise = null;
                    resolve();
                };

                ws.onmessage = (event: MessageEvent) => {
                    try {
                        const data = JSON.parse(event.data as string) as Record<string, unknown>;
                        this.handleMessage(data);
                    } catch (_) {
                        /* ignore parse errors */
                    }
                };

                ws.onclose = () => {
                    console.warn('[SubscriptionManager] Dedicated WS closed');
                    this.ws = null;
                    this.connectPromise = null;
                    // Clear all cached subscription IDs since the connection is gone
                    this.activeSubscriptions.forEach(sub => {
                        sub.id = null;
                    });
                };

                ws.onerror = () => {
                    clearTimeout(timeout);
                    this.connectPromise = null;
                    reject(new Error('WebSocket connection failed'));
                };
            } catch (err) {
                this.connectPromise = null;
                reject(err);
            }
        });

        return this.connectPromise;
    }

    /**
     * Handle incoming WebSocket messages and route to callbacks
     */
    private handleMessage(data: Record<string, unknown>) {
        const tick_data = data.tick as Record<string, unknown> | undefined;
        const req_data = data.echo_req as Record<string, unknown> | undefined;
        const msg_type = data.msg_type as string | undefined;

        // Determine symbol for filtering
        const msgSymbol =
            (tick_data?.symbol as string) || (req_data?.ticks_history as string) || (req_data?.ticks as string);

        if (msg_type === 'tick' || msg_type === 'history') {
            this.activeSubscriptions.forEach(sub => {
                if (!msgSymbol || msgSymbol === sub.symbol) {
                    if (msg_type === 'history') {
                        sub.lastHistory = data;
                    } else if (msg_type === 'tick') {
                        sub.lastTick = data;
                    }
                    sub.callbacks.forEach(cb => cb(data));
                }
            });
        }
    }

    /**
     * Send a raw message over the dedicated WebSocket
     */
    private sendRaw(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
        return this.getConnection().then(() => {
            return new Promise<Record<string, unknown>>((resolve, reject) => {
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                    reject(new Error('WebSocket not open'));
                    return;
                }

                const req_id = ++this.reqId;
                const message = { ...payload, req_id };

                // One-time message listener for this request's response
                const onMessage = (event: MessageEvent) => {
                    try {
                        const data = JSON.parse(event.data as string) as Record<string, unknown>;
                        if (data.req_id === req_id) {
                            this.ws!.removeEventListener('message', onMessage);
                            resolve(data);
                        }
                    } catch (_) {
                        /* ignore */
                    }
                };

                const onClose = () => {
                    this.ws?.removeEventListener('message', onMessage);
                    reject(new Error('WebSocket closed before response'));
                };

                this.ws.addEventListener('message', onMessage);
                this.ws.addEventListener('close', onClose, { once: true });
                this.ws.send(JSON.stringify(message));
            });
        });
    }

    /**
     * Subscribe to ticks_history for a symbol.
     * Returns unsubscribe function.
     */
    async subscribeToTicks(symbol: string, callback: SubscriptionCallback, count: number = 1000): Promise<() => void> {
        const key = `ticks_${symbol}`;

        // If already subscribed, just add callback and send cached data
        if (this.activeSubscriptions.has(key)) {
            const sub = this.activeSubscriptions.get(key)!;
            sub.callbacks.add(callback);

            // Immediately send cached data to the new callback to fix late-subscriber lockups
            if (sub.lastHistory) {
                try {
                    callback(sub.lastHistory);
                } catch (_) {
                    /* ignore */
                }
            }
            if (sub.lastTick) {
                try {
                    callback(sub.lastTick);
                } catch (_) {
                    /* ignore */
                }
            }

            return () => {
                sub.callbacks.delete(callback);
                if (sub.callbacks.size === 0) {
                    this.unsubscribe(key);
                }
            };
        }

        // Create new subscription entry
        const subscription: ActiveSubscription = {
            symbol,
            id: null,
            callbacks: new Set([callback]),
            unsubscribe: null,
        };
        this.activeSubscriptions.set(key, subscription);

        try {
            // Send ticks_history with subscribe: 1 over raw WebSocket
            const response = await this.sendRaw({
                ticks_history: symbol,
                count,
                end: 'latest',
                style: 'ticks',
                subscribe: 1,
            });

            if (response.error) {
                const err = response.error as Record<string, unknown>;
                if (err.code === 'AlreadySubscribed') {
                    console.log(`[SubscriptionManager] Already subscribed to ${symbol} (using existing)`);
                } else {
                    this.activeSubscriptions.delete(key);
                    throw new Error(String(err.message || 'Subscription failed'));
                }
            }

            // Store subscription ID for cleanup
            if (response.subscription) {
                const sub_info = response.subscription as Record<string, unknown>;
                subscription.id = sub_info.id as string;
            }

            // Dispatch initial history/tick to callback
            if (!response.error) {
                callback(response);
                if (response.msg_type === 'history') {
                    subscription.lastHistory = response;
                }
            }

            console.log(`[SubscriptionManager] Subscribed to ${symbol}, id: ${subscription.id}`);
        } catch (error) {
            console.error('[SubscriptionManager] Failed to subscribe:', error);
            this.activeSubscriptions.delete(key);
            throw error;
        }

        return () => {
            const sub = this.activeSubscriptions.get(key);
            if (sub) {
                sub.callbacks.delete(callback);
                if (sub.callbacks.size === 0) {
                    this.unsubscribe(key);
                }
            }
        };
    }

    /**
     * Unsubscribe from a specific symbol
     */
    private unsubscribe(key: string) {
        const subscription = this.activeSubscriptions.get(key);
        if (!subscription) return;

        // Forget subscription on server if we have an ID
        if (subscription.id && this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify({ forget: subscription.id, req_id: ++this.reqId }));
            } catch (_) {
                /* ignore */
            }
        }

        this.activeSubscriptions.delete(key);
        console.log(`[SubscriptionManager] Unsubscribed from ${key}`);
    }

    /**
     * Unsubscribe from all active subscriptions
     */
    unsubscribeAll() {
        const keys = Array.from(this.activeSubscriptions.keys());
        keys.forEach(key => this.unsubscribe(key));
    }

    /**
     * Reset manager state (useful on connection loss/reset)
     */
    reset() {
        this.activeSubscriptions.clear();
        if (this.ws) {
            try {
                this.ws.close();
            } catch (_) {
                /* ignore */
            }
            this.ws = null;
        }
        this.connectPromise = null;
    }

    /**
     * Get active subscriptions count
     */
    getActiveCount(): number {
        return this.activeSubscriptions.size;
    }

    /**
     * Check if subscribed to a symbol
     */
    isSubscribed(symbol: string): boolean {
        return this.activeSubscriptions.has(`ticks_${symbol}`);
    }

    /**
     * Legacy: allow setting the API (no-op now since we use raw WS)
     * Kept for backwards compatibility
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setApi(__api: unknown) {
        // No-op: we no longer use the SDK API for subscriptions
    }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
