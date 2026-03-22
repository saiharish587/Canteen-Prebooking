// Default configuration file for frontend API integration
// Copy this to js/config.js and customize as needed

// Dynamically determine API URL based on current domain
function getAPIBaseURL() {
    // For development: http://localhost/canteen-api/api
    // For production: https://canteen-prebooking.onrender.com/api
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    // Check if on localhost or 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}${port}/canteen-api/api`;
    }
    
    // For production deployments - use Render backend
    return 'https://canteen-prebooking.onrender.com/api';
}

const CONFIG = {
    // API Configuration
    API_BASE_URL: getAPIBaseURL(),
    API_TIMEOUT: 30000,  // 30 seconds
    
    // Storage Keys
    STORAGE_KEY_ACCESS_TOKEN: 'bvrit_access_token',
    STORAGE_KEY_REFRESH_TOKEN: 'bvrit_refresh_token',
    STORAGE_KEY_USER_ID: 'bvrit_user_id',
    STORAGE_KEY_USERNAME: 'bvrit_username',
    STORAGE_KEY_ORDER_TYPE: 'bvrit_order_type',
    
    // Authentication
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,  // Refresh token 5 mins before expiry
    
    // Menu Configuration
    MENU_CATEGORIES: ['breakfast', 'lunch', 'snacks', 'beverages'],
    DEFAULT_CATEGORY: 'breakfast',
    ITEMS_PER_PAGE: 20,
    MAX_ITEMS_PER_PAGE: 100,
    
    // Order Configuration
    ORDER_TYPES: {
        DINE_IN: 'dine-in',
        TAKEAWAY: 'takeaway',
        DELIVERY: 'delivery'
    },
    
    PAYMENT_METHODS: {
        CASH: 'cash',
        CARD: 'card',
        UPI: 'upi',
        WALLET: 'wallet'
    },
    
    // GST Configuration
    GST_RATE: 0.09,  // 9%
    
    // Session Configuration
    CART_EXPIRY_HOURS: 24,
    SESSION_TIMEOUT_MINUTES: 30,
    
    // Email Configuration
    ALLOWED_EMAIL_DOMAIN: '@bvrit.ac.in',
    
    // Feature Flags
    FEATURES: {
        REAL_TIME_TRACKING: false,  // Enable WebSocket for real-time tracking
        EMAIL_NOTIFICATIONS: false, // Enable transactional emails
        SMS_NOTIFICATIONS: false,   // Enable SMS notifications
        VOICE_ORDERS: false         // Enable voice-based ordering
    },
    
    // Logging Configuration
    DEBUG_MODE: true,
    LOG_NETWORK_REQUESTS: true,
    
    // Pagination
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    
    // Ratings
    MIN_RATING: 1,
    MAX_RATING: 5,
    
    // Order Status
    ORDER_STATUSES: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        PREPARING: 'preparing',
        READY: 'ready',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    // Error Messages
    ERRORS: {
        NOT_AUTHENTICATED: 'Please login to continue',
        NOT_AUTHORIZED: 'You do not have permission to perform this action',
        NOT_FOUND: 'Resource not found',
        VALIDATION_ERROR: 'Please check your input',
        SERVER_ERROR: 'Server error. Please try again later',
        NETWORK_ERROR: 'Network error. Please check your connection',
        API_CONNECTION_ERROR: 'Cannot connect to API server'
    },
    
    // Success Messages
    SUCCESS: {
        LOGIN: 'Welcome back!',
        SIGNUP: 'Account created successfully!',
        LOGOUT: 'You have been logged out',
        ORDER_CREATED: 'Order placed successfully',
        ITEM_ADDED_TO_CART: 'Item added to cart',
        ITEM_REMOVED_FROM_CART: 'Item removed from cart'
    }
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
