/**
 * Kitchen Display System - Main Logic
 */

class KitchenDisplaySystem {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentFilter = 'all';
        this.autoRefreshInterval = null;
        this.statsUpdateInterval = null;
        this.connectionCheckInterval = null;
        // Settings will be loaded after kdsApi is verified in init()
        this.settings = {};
        this.isConnected = false;
        this.debugLogs = [];

        this.init();
    }

    addDebugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.debugLogs.push(`[${timestamp}] ${message}`);
        
        // Keep only last 50 logs
        if (this.debugLogs.length > 50) {
            this.debugLogs.shift();
        }

        // Update debug panel
        const debugPanel = document.getElementById('debugContent');
        if (debugPanel) {
            debugPanel.innerHTML = this.debugLogs.map(log => 
                `<div>${log}</div>`
            ).join('');
            debugPanel.scrollTop = debugPanel.scrollHeight;
        }

        // Update debug info in settings modal
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML = this.debugLogs.slice(-10).map(log => 
                `<div style="color: #aaa; margin: 3px 0;">${log}</div>`
            ).join('');
        }
    }

    /**
     * Initialize KDS
     */
    init() {
        // Load settings from kdsApi if available
        if (typeof kdsApi !== 'undefined') {
            this.settings = kdsApi.loadSettings();
        }

        this.addDebugLog('KDS Initializing...');
        this.addDebugLog('Token set: ' + (this.settings.token ? 'YES' : 'NO'));
        
        // Check if token is set - just log, don't block UI
        if (!this.settings.token) {
            this.addDebugLog('⚠️ No API token configured');
            this.showToast('⚠️ No token - Click ⚙️ Settings to configure', 'warning');
        }

        this.setupEventListeners();
        this.updateClock();
        this.checkConnection();
        
        if (this.settings.token) {
            this.loadOrders();
        } else {
            // Show placeholder message but don't block interface
            document.getElementById('ordersGrid').innerHTML = '<div class="empty" style="margin-top: 100px;">📌 Click ⚙️ Settings to enter your API token</div>';
        }

        // Update clock every second
        setInterval(() => this.updateClock(), 1000);

        // Check connection every 10 seconds
        this.connectionCheckInterval = setInterval(() => this.checkConnection(), 10000);

        // Auto-refresh if enabled
        if (this.settings.autoRefresh && this.settings.token) {
            this.startAutoRefresh();
        }
    }

    /**
     * Test API token
     */
    async testToken() {
        const token = document.getElementById('apiToken').value;

        if (!token) {
            this.addDebugLog('❌ Token field is empty');
            this.showToast('Please enter a token', 'error');
            return;
        }

        this.addDebugLog('Testing token...');
        kdsApi.setToken(token);

        try {
            const response = await kdsApi.getPendingOrders();
            
            if (response.success) {
                this.addDebugLog('✅ Token is valid!');
                this.showToast('✅ Token is valid!', 'success');
            } else {
                this.addDebugLog('❌ Token invalid: ' + (response.message || 'Unknown error'));
                this.showToast('❌ ' + (response.message || 'Invalid token'), 'error');
            }
        } catch (error) {
            this.addDebugLog('❌ Connection error: ' + error.message);
            this.showToast('❌ Connection error: ' + error.message, 'error');
        }
    }
    /**
     * Login as admin and get token
     */
    async loginAsAdmin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (!email || !password) {
            this.showToast('Please enter email and password', 'error');
            return;
        }

        this.addDebugLog('Logging in as admin...');
        const btn = document.getElementById('adminLoginBtn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost/canteen-api/api'
                : 'https://canteen-prebooking.onrender.com/api';
            
            const response = await fetch(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.data.access_token) {
                const token = data.data.access_token;
                document.getElementById('apiToken').value = token;
                kdsApi.setToken(token);
                this.addDebugLog('✅ Login successful! Token obtained.');
                this.showToast('✅ Login successful! Token saved.', 'success');
                
                // Auto-test the token
                await this.testToken();
            } else {
                this.addDebugLog('❌ Login failed: ' + (data.message || 'Unknown error'));
                this.showToast('❌ ' + (data.message || 'Login failed'), 'error');
            }
        } catch (error) {
            this.addDebugLog('❌ Connection error: ' + error.message);
            this.showToast('❌ Connection error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.displayOrders();
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.addDebugLog('Manual refresh triggered');
            this.loadOrders();
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Modal close buttons
        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('orderModal').classList.remove('active');
        });

        document.getElementById('settingsClose').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.remove('active');
        });

        // Test token button
        document.getElementById('testTokenBtn').addEventListener('click', () => {
            this.testToken();
        });

        // Admin login button
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', async () => {
                await this.loginAsAdmin();
            });
        }

        // Settings save
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    /**
     * Update clock
     */
    updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('currentTime').textContent = time;
    }

    /**
     * Check API connection
     */
    async checkConnection() {
        try {
            console.log('[KDS] Checking connection...');
            const connected = await kdsApi.testConnection();
            this.isConnected = connected;
            this.updateConnectionStatus();
            console.log('[KDS] Connection check: ' + (connected ? 'OK' : 'FAILED'));
        } catch (error) {
            console.error('[KDS] Connection check error:', error);
            this.isConnected = false;
            this.updateConnectionStatus();
        }
    }

    /**
     * Update connection status display
     */
    updateConnectionStatus() {
        const badge = document.getElementById('connectionStatus');
        badge.classList.remove('connected', 'disconnected', 'connecting');

        if (this.isConnected) {
            badge.textContent = '🟢 Connected';
            badge.classList.add('connected');
        } else {
            badge.textContent = '🔴 Disconnected';
            badge.classList.add('disconnected');
        }
    }

    /**
     * Load orders from API
     */
    async loadOrders() {
        try {
            console.log('[KDS] Loading orders...');
            this.addDebugLog('Loading orders...');
            
            if (!this.settings.token) {
                this.addDebugLog('❌ No token available');
                this.displayNoOrders();
                return;
            }

            this.addDebugLog('Using token: ' + this.settings.token.substring(0, 20) + '...');

            const response = await kdsApi.getPendingOrders();

            console.log('[KDS] Response:', response);

            if (response.success === false) {
                // API returned an error
                const errorMsg = response.message || 'Failed to load orders';
                this.addDebugLog('❌ API Error: ' + errorMsg);
                this.showToast('Error: ' + errorMsg, 'error');
                this.displayNoOrders();
                return;
            }

            if (response.success === true || response.data) {
                this.orders = response.data || [];
                console.log('[KDS] Loaded ' + this.orders.length + ' orders');
                this.addDebugLog('✅ Loaded ' + this.orders.length + ' orders');
                this.displayOrders();
                this.updateStats();
                if (this.orders.length > 0) {
                    this.showToast('Orders loaded (' + this.orders.length + ')', 'success');
                }
            } else {
                this.addDebugLog('❌ ' + (response.message || 'Unexpected response format'));
                this.showToast('No orders to display', 'info');
                console.error('[KDS] Unexpected response:', response);
            }
        } catch (error) {
            console.error('[KDS] Error loading orders:', error);
            this.addDebugLog('❌ Error: ' + error.message);
            this.showToast('Connection error - check token', 'error');
            this.displayNoOrders();
        }
    }

    /**
     * Display orders based on current filter
     */
    displayOrders() {
        const grid = document.getElementById('ordersGrid');

        // Filter orders based on current filter
        if (this.currentFilter === 'all') {
            this.filteredOrders = this.orders;
        } else {
            this.filteredOrders = this.orders.filter(order => {
                const matches = order.status === this.currentFilter;
                if (!matches) {
                    console.log(`[KDS] Filtering out order ${order.id}: status=${order.status}, filter=${this.currentFilter}`);
                }
                return matches;
            });
        }

        console.log(`[KDS] Display: filter=${this.currentFilter}, total=${this.orders.length}, filtered=${this.filteredOrders.length}`);
        this.addDebugLog(`Displaying: ${this.filteredOrders.length} orders (filter: ${this.currentFilter})`);

        // Render orders
        if (this.filteredOrders.length === 0) {
            grid.innerHTML = '<div class="empty">No orders found</div>';
            return;
        }

        grid.innerHTML = this.filteredOrders.map(order => this.createOrderCard(order)).join('');

        // Add event listeners to action buttons  
        this.attachOrderActionListeners();
    }

    /**
     * Create order card HTML
     */
    createOrderCard(order) {
        const statusBadgeClass = order.status.replace('-', '-');

        return `
            <div class="order-card ${order.status}" data-order-id="${order.id}">
                <div class="order-header">
                    <div>
                        <div class="order-id">#${order.id}</div>
                        <div class="order-status-badge ${order.status}">${order.status.toUpperCase()}</div>
                    </div>
                    <div class="order-time">${this.formatTime(order.created_at)}</div>
                </div>

                <div class="customer-info">
                    <div class="customer-name">${order.user?.username || 'Guest'}</div>
                    <div class="order-type">${order.order_type === 'dine-in' ? '🍽️ DINE-IN' : '📦 TAKEAWAY'}</div>
                </div>

                <div class="order-items">
                    <div class="order-items-title">Items</div>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">×${item.quantity}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="order-actions">
                    ${this.getActionButtons(order)}
                </div>
            </div>
        `;
    }

    /**
     * Get action buttons based on order status
     */
    getActionButtons(order) {
        const buttons = [];

        switch (order.status) {
            case 'pending':
                buttons.push(`<button class="action-button confirm-btn" data-action="confirm" data-order-id="${order.id}">✅ CONFIRM</button>`);
                break;

            case 'confirmed':
                buttons.push(`<button class="action-button preparing-btn" data-action="preparing" data-order-id="${order.id}">👨‍🍳 PREPARING</button>`);
                break;

            case 'preparing':
                buttons.push(`<button class="action-button ready-btn" data-action="ready" data-order-id="${order.id}">✨ READY</button>`);
                break;

            case 'ready':
                buttons.push(`<button class="action-button complete-btn" data-action="completed" data-order-id="${order.id}">🎉 COMPLETED</button>`);
                break;

            case 'completed':
            case 'cancelled':
                return '';
        }

        // Add cancel button for pending and confirmed orders
        if (['pending', 'confirmed'].includes(order.status)) {
            buttons.push(`<button class="action-button cancel-btn" data-action="cancel" data-order-id="${order.id}">✕</button>`);
        }

        return buttons.join('');
    }

    /**
     * Attach action button listeners
     */
    attachOrderActionListeners() {
        document.querySelectorAll('.action-button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const orderId = e.target.dataset.orderId;
                const action = e.target.dataset.action;

                e.target.disabled = true;
                const originalText = e.target.textContent;
                e.target.textContent = 'Processing...';

                try {
                    const result = await this.performAction(orderId, action);
                    if (result) {
                        // Log the action
                        this.addDebugLog(`✓ ${action.toUpperCase()}: Order #${orderId}`);
                        
                        // Play sound
                        kdsApi.playSound(action === 'ready' ? 'ready' : 'notification');
                        
                        // Reload orders from server
                        console.log('[KDS] Reloading orders after action...');
                        await this.loadOrders();
                        
                        console.log('[KDS] Orders refreshed, count:', this.orders.length);
                    } else {
                        // Action failed - restore button
                        e.target.disabled = false;
                        e.target.textContent = originalText;
                    }
                } catch (error) {
                    console.error('[KDS] Action error:', error);
                    this.addDebugLog(`❌ Error: ${error.message}`);
                    this.showToast(`Error: ${error.message}`, 'error');
                    e.target.disabled = false;
                    e.target.textContent = originalText;
                }
            });
        });

        // Add click to view details
        document.querySelectorAll('.order-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-button')) {
                    const orderId = card.dataset.orderId;
                    const order = this.orders.find(o => o.id == orderId);
                    if (order) this.showOrderDetails(order);
                }
            });
        });
    }

    /**
     * Perform action on order
     */
    async performAction(orderId, action) {
        try {
            const actionMap = {
                'confirm': () => kdsApi.confirmOrder(orderId),
                'preparing': () => kdsApi.markPreparing(orderId),
                'ready': () => kdsApi.markReady(orderId),
                'completed': () => kdsApi.markCompleted(orderId),
                'cancel': () => kdsApi.cancelOrder(orderId)
            };

            if (!actionMap[action]) {
                throw new Error('Unknown action: ' + action);
            }

            console.log('[KDS] Calling API action:', action, 'for order:', orderId);
            const response = await actionMap[action]();
            
            console.log('[KDS] API Response:', response);

            // Check for success - handle multiple response formats
            const isSuccess = response.success === true || 
                             (response.success !== false && response.data);
            
            if (isSuccess) {
                const actionMessages = {
                    'confirm': 'Order confirmed!',
                    'preparing': 'Order marked as preparing',
                    'ready': 'Order is ready!',
                    'completed': 'Order completed!',
                    'cancel': 'Order cancelled'
                };
                this.showToast(actionMessages[action], 'success');
                console.log('[KDS] Action successful, will reload orders');
                return true;
            } else {
                const errorMsg = response.message || 'Action failed';
                console.error('[KDS] Action failed:', errorMsg);
                this.showToast(errorMsg, 'error');
                return false;
            }
        } catch (error) {
            console.error('[KDS] performAction error:', error);
            this.addDebugLog(`❌ Action failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        const stats = {
            pending: this.orders.filter(o => o.status === 'pending').length,
            confirmed: this.orders.filter(o => o.status === 'confirmed').length,
            preparing: this.orders.filter(o => o.status === 'preparing').length,
            ready: this.orders.filter(o => o.status === 'ready').length
        };

        document.getElementById('statPending').textContent = stats.pending;
        document.getElementById('statConfirmed').textContent = stats.confirmed;
        document.getElementById('statPreparing').textContent = stats.preparing;
        document.getElementById('statReady').textContent = stats.ready;
    }

    /**
     * Show order details modal
     */
    showOrderDetails(order) {
        const modal = document.getElementById('orderModal');
        const body = document.getElementById('modalBody');

        body.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3>Order #${order.id}</h3>
                <p style="color: #888; margin-top: 5px;">Status: <strong>${order.status.toUpperCase()}</strong></p>
                <p style="color: #888;">Type: <strong>${order.order_type === 'dine-in' ? 'Dine-In' : 'Takeaway'}</strong></p>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">Customer</h4>
                <p>${order.user?.username || 'Guest'}</p>
                <p style="color: #888; font-size: 12px;">${order.user?.email || 'N/A'}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">Items</h4>
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333;">
                        <span>${item.name}</span>
                        <span style="color: #888;">×${item.quantity}</span>
                    </div>
                `).join('')}
            </div>

            <div style="background: #2a2a2a; padding: 12px; border-radius: 6px;">
                <p style="margin-bottom: 5px;">Subtotal: ₹${order.total.toFixed(2)}</p>
                <p style="color: #888; font-size: 12px; margin: 5px 0;">Created: ${new Date(order.created_at).toLocaleString()}</p>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Show settings modal
     */
    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        document.getElementById('apiToken').value = this.settings.token || '';
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('autoRefresh').checked = this.settings.autoRefresh;
        document.getElementById('refreshRate').value = this.settings.refreshRate || 10;

        modal.classList.add('active');
    }

    /**
     * Save settings
     */
    saveSettings() {
        const newToken = document.getElementById('apiToken').value;
        
        if (!newToken) {
            this.addDebugLog('⚠️ Token is empty - settings not saved');
            this.showToast('Token cannot be empty', 'error');
            return;
        }

        const oldToken = this.settings.token;
        
        this.settings = {
            token: newToken,
            soundEnabled: document.getElementById('soundEnabled').checked,
            autoRefresh: document.getElementById('autoRefresh').checked,
            refreshRate: parseInt(document.getElementById('refreshRate').value, 10)
        };

        kdsApi.saveSettings(this.settings);
        localStorage.setItem('kds_refresh_rate', this.settings.refreshRate);

        this.addDebugLog('Settings saved');
        this.showToast('Settings saved', 'success');
        document.getElementById('settingsModal').classList.remove('active');

        // If token changed, reload orders
        if (oldToken !== newToken) {
            this.addDebugLog('Token changed - reloading orders');
            this.loadOrders();
        }

        // Restart auto-refresh if changed
        this.stopAutoRefresh();
        if (this.settings.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        const interval = (this.settings.refreshRate || 10) * 1000;
        this.autoRefreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.loadOrders();
            }
        }, interval);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    /**
     * Display no orders message
     */
    displayNoOrders() {
        const grid = document.getElementById('ordersGrid');
        const message = this.settings.token
            ? '<div class="empty" style="color: #888;">No orders at the moment</div>'
            : '<div class="empty" style="color: #888;">⚙️ Configure token in Settings</div>';
        grid.innerHTML = message;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        
        // Cancel any pending dismissal
        if (toast.dismissTimeout) {
            clearTimeout(toast.dismissTimeout);
        }
        
        // Update toast content and class
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        // Auto-dismiss based on type
        const duration = type === 'error' ? 4000 : type === 'warning' ? 3000 : 2500;
        
        toast.dismissTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    /**
     * Format time for display
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Minutes ago
        const mins = Math.floor(diff / 60000);
        if (mins < 60) {
            return `${mins}m ago`;
        }

        // Hours ago
        const hours = Math.floor(mins / 60);
        if (hours < 24) {
            return `${hours}h ago`;
        }

        // Time only
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Cleanup on page unload
     */
    destroy() {
        clearInterval(this.autoRefreshInterval);
        clearInterval(this.statsUpdateInterval);
        clearInterval(this.connectionCheckInterval);
    }
}

// Initialize KDS when page loads
let kds;
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof KDSApiService === 'undefined') {
            console.error('[KDS] KDSApiService not defined. kds-api.js may not have loaded.');
            document.getElementById('ordersGrid').innerHTML = '<div class="empty" style="color: red;">ERROR: API service failed to load. Check browser console.</div>';
            return;
        }

        if (typeof kdsApi === 'undefined') {
            console.error('[KDS] kdsApi instance not created.');
            document.getElementById('ordersGrid').innerHTML = '<div class="empty" style="color: red;">ERROR: KDS initialization failed. Refresh the page.</div>';
            return;
        }

        kds = new KitchenDisplaySystem();
        console.log('[KDS] Initialization complete');
    } catch (error) {
        console.error('[KDS] Fatal error during initialization:', error);
        document.getElementById('ordersGrid').innerHTML = '<div class="empty" style="color: red;">ERROR: ' + error.message + '</div>';
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (kds) kds.destroy();
});
