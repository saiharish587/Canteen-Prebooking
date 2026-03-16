/**
 * BVRIT Canteen - Integrated API Service with localStorage fallback
 * Provides a unified interface for API communication with offline support
 */

class IntegratedAPIService {
    constructor() {
        this.apiService = window.apiService || new APIService();
        this.useAPI = true; // Toggle between API and localStorage
    }

    // ==================== Authentication ====================
    
    async register(email, username, password, firstName = '', lastName = '') {
        if (this.useAPI) {
            try {
                return await this.apiService.register(email, username, password, firstName, lastName);
            } catch (error) {
                console.error('API register failed:', error);
                throw error;
            }
        }
    }

    async login(email, password) {
        if (this.useAPI) {
            try {
                const response = await this.apiService.login(email, password);
                if (response.data?.access_token) {
                    // Store tokens
                    localStorage.setItem('bvrit_access_token', response.data.access_token);
                    localStorage.setItem('bvrit_refresh_token', response.data.refresh_token);
                    localStorage.setItem('bvrit_current_user', response.data.username);
                    localStorage.setItem('bvrit_user_id', response.data.user_id);
                    localStorage.setItem('bvrit_user_type', response.data.user_type);
                }
                return response;
            } catch (error) {
                console.error('API login failed:', error);
                throw error;
            }
        }
    }

    async logout() {
        if (this.useAPI) {
            try {
                await this.apiService.logout();
            } catch (error) {
                console.warn('API logout failed:', error);
            }
        }
        // Always clear local storage
        localStorage.removeItem('bvrit_access_token');
        localStorage.removeItem('bvrit_refresh_token');
        localStorage.removeItem('bvrit_current_user');
        localStorage.removeItem('bvrit_user_id');
        localStorage.removeItem('bvrit_user_type');
        localStorage.removeItem('bvrit_is_admin');
    }

    // ==================== Menu ====================

    async getMenuItems(category = '', limit = 20) {
        if (this.useAPI) {
            try {
                return await this.apiService.getMenuItems(category, 1, limit);
            } catch (error) {
                console.error('API getMenuItems failed:', error);
                throw error;
            }
        }
    }

    async getMenuItem(itemId) {
        if (this.useAPI) {
            try {
                return await this.apiService.getMenuItem(itemId);
            } catch (error) {
                console.error('API getMenuItem failed:', error);
                throw error;
            }
        }
    }

    async searchMenu(query) {
        if (this.useAPI) {
            try {
                return await this.apiService.searchMenu(query);
            } catch (error) {
                console.error('API searchMenu failed:', error);
                throw error;
            }
        }
    }

    // ==================== Cart ====================

    async getCart() {
        if (this.useAPI) {
            try {
                return await this.apiService.getCart();
            } catch (error) {
                console.error('API getCart failed:', error);
                throw error;
            }
        }
    }

    async addToCart(itemId, quantity, specialInstructions = '') {
        if (this.useAPI) {
            try {
                return await this.apiService.addToCart(itemId, quantity, specialInstructions);
            } catch (error) {
                console.error('API addToCart failed:', error);
                throw error;
            }
        }
    }

    async updateCartItem(itemId, quantity) {
        if (this.useAPI) {
            try {
                return await this.apiService.updateCartItem(itemId, quantity);
            } catch (error) {
                console.error('API updateCartItem failed:', error);
                throw error;
            }
        }
    }

    async removeFromCart(itemId) {
        if (this.useAPI) {
            try {
                return await this.apiService.removeFromCart(itemId);
            } catch (error) {
                console.error('API removeFromCart failed:', error);
                throw error;
            }
        }
    }

    async clearCart() {
        if (this.useAPI) {
            try {
                return await this.apiService.clearCart();
            } catch (error) {
                console.error('API clearCart failed:', error);
                throw error;
            }
        }
    }

    // ==================== Orders ====================

    async createOrder(orderType, paymentMethod, specialInstructions = '') {
        if (this.useAPI) {
            try {
                return await this.apiService.createOrder(orderType, paymentMethod, specialInstructions);
            } catch (error) {
                console.error('API createOrder failed:', error);
                throw error;
            }
        }
    }

    async getOrders(status = '', type = '') {
        if (this.useAPI) {
            try {
                return await this.apiService.getOrders(status, type);
            } catch (error) {
                console.error('API getOrders failed:', error);
                throw error;
            }
        }
    }

    async getOrder(orderId) {
        if (this.useAPI) {
            try {
                return await this.apiService.getOrder(orderId);
            } catch (error) {
                console.error('API getOrder failed:', error);
                throw error;
            }
        }
    }

    // ==================== Admin ====================

    async getAdminMenuItems(category = '') {
        if (this.useAPI) {
            try {
                return await this.apiService.getAdminMenuItems(category);
            } catch (error) {
                console.error('API getAdminMenuItems failed:', error);
                throw error;
            }
        }
    }

    async createMenuItem(itemData) {
        if (this.useAPI) {
            try {
                return await this.apiService.createMenuItem(itemData);
            } catch (error) {
                console.error('API createMenuItem failed:', error);
                throw error;
            }
        }
    }

    async updateMenuItem(itemId, itemData) {
        if (this.useAPI) {
            try {
                return await this.apiService.updateMenuItem(itemId, itemData);
            } catch (error) {
                console.error('API updateMenuItem failed:', error);
                throw error;
            }
        }
    }

    async deleteMenuItem(itemId) {
        if (this.useAPI) {
            try {
                return await this.apiService.deleteMenuItem(itemId);
            } catch (error) {
                console.error('API deleteMenuItem failed:', error);
                throw error;
            }
        }
    }

    async toggleMenuItemAvailability(itemId, isAvailable) {
        if (this.useAPI) {
            try {
                return await this.apiService.toggleMenuItemAvailability(itemId, isAvailable);
            } catch (error) {
                console.error('API toggleMenuItemAvailability failed:', error);
                throw error;
            }
        }
    }

    async updateMenuItemPrice(itemId, price) {
        if (this.useAPI) {
            try {
                return await this.apiService.updateMenuItemPrice(itemId, price);
            } catch (error) {
                console.error('API updateMenuItemPrice failed:', error);
                throw error;
            }
        }
    }
}

// Initialize integrated service globally
window.integratedAPI = new IntegratedAPIService();
