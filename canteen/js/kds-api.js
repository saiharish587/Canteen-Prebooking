/**
 * Kitchen Display System - API Service
 * Handles all API communication with the backend
 */

class KDSApiService {
    constructor() {
        this.baseURL = 'http://localhost/canteen-api/api';
        this.token = localStorage.getItem('kds_token') || '';
        this.soundEnabled = localStorage.getItem('kds_sound') !== 'false';
        this.autoRefresh = localStorage.getItem('kds_auto_refresh') !== 'false';
        this.debug = true; // Enable debugging
    }

    log(message, data = null) {
        if (this.debug) {
            console.log(`[KDS API] ${message}`, data || '');
        }
    }

    error(message, error = null) {
        console.error(`[KDS API ERROR] ${message}`, error || '');
    }

    /**
     * Set API token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('kds_token', token);
        this.log('Token set', token.substring(0, 20) + '...');
    }

    /**
     * Build headers for API requests
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Get all orders (admin endpoint)
     */
    async getAllOrders(status = null, type = null) {
        try {
            let url = `${this.baseURL}/admin/orders`;
            const params = [];

            if (status) params.push(`status=${status}`);
            if (type) params.push(`type=${type}`);

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            throw error;
        }
    }

    /**
     * Get pending orders (kitchen display)
     */
    async getPendingOrders() {
        try {
            const url = `${this.baseURL}/admin/orders/pending`;
            this.log('Fetching pending orders from:', url);
            this.log('Token:', this.token ? this.token.substring(0, 30) + '...' : 'NO TOKEN');
            this.log('Headers:', this.getHeaders());

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            this.log('Response status:', response.status);

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    console.error('[KDS API] Full error response:', errorData);
                    this.error(`HTTP ${response.status}`, errorData.message || JSON.stringify(errorData));
                    // Return error as a proper response object
                    return {
                        success: false,
                        message: errorData.message || `HTTP ${response.status}`,
                        data: null
                    };
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error('[KDS API] Error text response:', errorText);
                    this.error(`HTTP ${response.status}`, errorText);
                    return {
                        success: false,
                        message: `HTTP ${response.status}: ${errorText}`,
                        data: null
                    };
                }
            }

            const data = await response.json();
            this.log('Pending orders loaded:', data.data?.length || 0);
            return data;
        } catch (error) {
            this.error('Failed to fetch pending orders', error);
            return {
                success: false,
                message: error.message || 'Network error',
                data: null
            };
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`${this.baseURL}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Failed to update order ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Confirm order
     */
    async confirmOrder(orderId) {
        return this.updateOrderStatus(orderId, 'confirmed');
    }

    /**
     * Mark order as preparing
     */
    async markPreparing(orderId) {
        return this.updateOrderStatus(orderId, 'preparing');
    }

    /**
     * Mark order as ready
     */
    async markReady(orderId) {
        return this.updateOrderStatus(orderId, 'ready');
    }

    /**
     * Mark order as completed
     */
    async markCompleted(orderId) {
        return this.updateOrderStatus(orderId, 'completed');
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId) {
        return this.updateOrderStatus(orderId, 'cancelled');
    }

    /**
     * Get order statistics
     */
    async getStats() {
        try {
            const response = await fetch(`${this.baseURL}/admin/orders`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET'
            });

            return response.ok;
        } catch (error) {
            console.error('Connection failed:', error);
            return false;
        }
    }

    /**
     * Play sound notification
     */
    playSound(type = 'notification') {
        if (!this.soundEnabled) return;

        // Using Web Audio API for cross-browser compatibility
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if (type === 'notification') {
                // Simple beep sound
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } else if (type === 'ready') {
                // Two-tone alert - Order is ready
                const playTone = (freq, duration, delay) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(audioContext.destination);

                    osc.frequency.value = freq;
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration);

                    osc.start(audioContext.currentTime + delay);
                    osc.stop(audioContext.currentTime + delay + duration);
                };

                playTone(1000, 0.2, 0);
                playTone(1200, 0.2, 0.25);
            }
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings(settings) {
        if (settings.token) {
            this.setToken(settings.token);
        }
        if (settings.hasOwnProperty('soundEnabled')) {
            this.soundEnabled = settings.soundEnabled;
            localStorage.setItem('kds_sound', settings.soundEnabled);
        }
        if (settings.hasOwnProperty('autoRefresh')) {
            this.autoRefresh = settings.autoRefresh;
            localStorage.setItem('kds_auto_refresh', settings.autoRefresh);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        return {
            token: localStorage.getItem('kds_token') || '',
            soundEnabled: localStorage.getItem('kds_sound') !== 'false',
            autoRefresh: localStorage.getItem('kds_auto_refresh') !== 'false',
            refreshRate: parseInt(localStorage.getItem('kds_refresh_rate') || '10', 10)
        };
    }
}

// Create global instance
const kdsApi = new KDSApiService();
