/**
 * API Service Layer - Unified API Interface
 * Handles all API communication with Render backend
 * BVRIT Canteen Frontend - Standardized Service
 * 
 * This is the PRIMARY API service for all frontend communication.
 * Consolidates auth, menu, cart, order, and admin endpoints.
 */

// Get API URL based on environment
function getAPIURL() {
    // Development: Use PHP built-in server on port 8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000/api';
    }
    // Production: Use Render backend
    return 'https://canteen-prebooking.onrender.com/api';
}

const API_URL = getAPIURL();

// Utility function to check if token is valid
function isTokenValid() {
    const token = localStorage.getItem('bvrit_access_token');
    return token && token.length > 0;
}

// Utility function to clear all auth data
function clearAllAuthData() {
    localStorage.removeItem('bvrit_access_token');
    localStorage.removeItem('bvrit_refresh_token');
    localStorage.removeItem('bvrit_current_user');
    localStorage.removeItem('bvrit_user_id');
    localStorage.removeItem('bvrit_user_type');
    localStorage.removeItem('bvrit_is_admin');
}

class APIService {
    constructor() {
        this.accessToken = localStorage.getItem('bvrit_access_token');
        this.refreshToken = localStorage.getItem('bvrit_refresh_token');
        this.tokenRefreshTimer = null;
    }

    // Helper: Get request options with auth header
    getHeaders(extraHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...extraHeaders
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    // Helper: Handle response
    async handleResponse(response) {
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Invalid server response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                this.clearAuth();
                window.location.href = '/canteen/index.html';
            }
            throw new Error(data.message || data.error?.message || 'API Error');
        }

        return data;
    }

    // Helper: Clear authentication
    clearAuth() {
        localStorage.removeItem('bvrit_access_token');
        localStorage.removeItem('bvrit_refresh_token');
        localStorage.removeItem('bvrit_current_user');
        localStorage.removeItem('bvrit_user_id');
        localStorage.removeItem('bvrit_user_type');
        this.accessToken = null;
        this.refreshToken = null;
        if (this.tokenRefreshTimer) clearTimeout(this.tokenRefreshTimer);
    }

    // ==================== AUTH ENDPOINTS ====================

    async register(email, username, password, firstName = '', lastName = '') {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    first_name: firstName,
                    last_name: lastName
                }),
                signal: AbortSignal.timeout(30000)
            });

            const data = await this.handleResponse(response);

            if (data.data?.access_token) {
                this.setTokens(data.data.access_token, data.data.refresh_token);
                this.storeUserData(data.data);
            }

            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email, password }),
                signal: AbortSignal.timeout(30000)
            });

            const data = await this.handleResponse(response);

            if (data.data?.access_token) {
                this.setTokens(data.data.access_token, data.data.refresh_token);
                this.storeUserData(data.data);
                this.scheduleTokenRefresh();
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });
        } catch (e) {
            console.warn('Logout request failed:', e);
        } finally {
            this.clearAuth();
        }
    }

    async getMe() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get me error:', error);
            throw error;
        }
    }

    async refreshToken() {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            const data = await this.handleResponse(response);

            if (data.data?.access_token) {
                this.setTokens(data.data.access_token, this.refreshToken);
                this.scheduleTokenRefresh();
            }

            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearAuth();
            throw error;
        }
    }

    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('bvrit_access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('bvrit_refresh_token', refreshToken);
        }
    }

    storeUserData(data) {
        localStorage.setItem('bvrit_current_user', data.username);
        localStorage.setItem('bvrit_user_id', data.user_id);
        localStorage.setItem('bvrit_user_type', data.user_type);
    }

    scheduleTokenRefresh() {
        // Refresh token 5 minutes before expiry (300 seconds)
        if (this.tokenRefreshTimer) clearTimeout(this.tokenRefreshTimer);
        const ttl = 3300000; // 55 minutes
        this.tokenRefreshTimer = setTimeout(() => {
            this.refreshToken().catch(err => console.error('Auto-refresh failed:', err));
        }, ttl);
    }

    // ==================== MENU ENDPOINTS ====================

    async getMenuItems(category = '', page = 1, limit = 20) {
        try {
            const params = new URLSearchParams({ page, limit });
            if (category && category !== 'all') params.append('category', category);

            const response = await fetch(`${API_URL}/menu?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get menu items error:', error);
            throw error;
        }
    }

    async getMenuItem(itemId) {
        try {
            const response = await fetch(`${API_URL}/menu/${itemId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get menu item error:', error);
            throw error;
        }
    }

    async searchMenu(query, limit = 10) {
        try {
            const response = await fetch(`${API_URL}/menu/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Search menu error:', error);
            throw error;
        }
    }

    async getCategories() {
        try {
            const response = await fetch(`${API_URL}/menu/categories`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    }

    // ==================== CART ENDPOINTS ====================

    async getCart() {
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get cart error:', error);
            throw error;
        }
    }

    async addToCart(itemId, quantity, specialInstructions = '') {
        try {
            const response = await fetch(`${API_URL}/cart/add`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    item_id: itemId,
                    quantity,
                    special_instructions: specialInstructions
                }),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
        }
    }

    async updateCartItem(itemId, quantity) {
        try {
            const response = await fetch(`${API_URL}/cart/item/${itemId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ quantity }),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update cart item error:', error);
            throw error;
        }
    }

    async removeFromCart(itemId) {
        try {
            const response = await fetch(`${API_URL}/cart/item/${itemId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Remove from cart error:', error);
            throw error;
        }
    }

    async clearCart() {
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Clear cart error:', error);
            throw error;
        }
    }

    async validateCart() {
        try {
            const response = await fetch(`${API_URL}/cart/validate`, {
                method: 'POST',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Validate cart error:', error);
            throw error;
        }
    }

    // ==================== ORDER ENDPOINTS ====================

    async createOrder(orderType, paymentMethod, specialInstructions = '') {
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    order_type: orderType,
                    payment_method: paymentMethod,
                    special_instructions: specialInstructions
                }),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }

    async getOrders(status = '', type = '', page = 1) {
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (status) params.append('status', status);
            if (type) params.append('type', type);

            const response = await fetch(`${API_URL}/orders?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get orders error:', error);
            throw error;
        }
    }

    async getOrder(orderId) {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }

    async processPayment(orderId, paymentData) {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(paymentData),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Process payment error:', error);
            throw error;
        }
    }

    async cancelOrder(orderId) {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Cancel order error:', error);
            throw error;
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    async getAdminMenuItems(category = '') {
        try {
            const params = new URLSearchParams();
            if (category) params.append('category', category);

            const response = await fetch(`${API_URL}/admin/menu?${params}`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get admin menu error:', error);
            throw error;
        }
    }

    async createMenuItem(itemData) {
        try {
            const response = await fetch(`${API_URL}/admin/menu`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(itemData),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Create menu item error:', error);
            throw error;
        }
    }

    async updateMenuItem(itemId, itemData) {
        try {
            const response = await fetch(`${API_URL}/admin/menu/${itemId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(itemData),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update menu item error:', error);
            throw error;
        }
    }

    async deleteMenuItem(itemId) {
        try {
            const response = await fetch(`${API_URL}/admin/menu/${itemId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete menu item error:', error);
            throw error;
        }
    }

    async updateMenuItemPrice(itemId, price) {
        try {
            const response = await fetch(`${API_URL}/admin/menu/${itemId}/price`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ price }),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update price error:', error);
            throw error;
        }
    }

    async toggleMenuItemAvailability(itemId) {
        try {
            const response = await fetch(`${API_URL}/admin/menu/${itemId}/availability`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Toggle availability error:', error);
            throw error;
        }
    }
}

// Create global instance
const apiService = new APIService();
