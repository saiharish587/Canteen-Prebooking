// Check if user is logged in - with longer delay to ensure localStorage is set
let currentUser = null; // Define globally

setTimeout(function() {
    currentUser = localStorage.getItem('bvrit_current_user');
    const accessToken = localStorage.getItem('bvrit_access_token');
    const userType = localStorage.getItem('bvrit_user_type');
    const isAdmin = localStorage.getItem('bvrit_is_admin') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const isFromLogin = urlParams.get('auth') === '1';

    console.log('✅ menu.js - Auth check after 1000ms delay:');
    console.log('  currentUser:', currentUser);
    console.log('  accessToken exists?:', !!accessToken);
    console.log('  userType:', userType);
    console.log('  isAdmin:', isAdmin);
    console.log('  fromLogin URL param?:', isFromLogin);

    // If coming from login, allow access
    if(isFromLogin) {
        console.log('✅ Auth PASSED - from login redirect');
        initUserGreeting();
        document.body.style.opacity = '1';
        return;
    }

    // If admin, allow access
    if(isAdmin || userType === 'admin') {
        console.log('✅ Auth PASSED - admin access');
        initUserGreeting();
        document.body.style.opacity = '1';
        return;
    }

    // Otherwise require full credentials
    if(currentUser && accessToken) {
        console.log('✅ Auth PASSED - valid credentials');
        initUserGreeting();
        document.body.style.opacity = '1';
    } else {
        console.error('❌ Auth check FAILED - redirecting to login');
        localStorage.removeItem('bvrit_current_user');
        localStorage.removeItem('bvrit_access_token');
        localStorage.removeItem('bvrit_user_type');
        localStorage.removeItem('bvrit_is_admin');
        alert('Session expired. Please login again.');
        window.location.href = 'index.html';
    }
}, 1000);

// Initialize user greeting
function initUserGreeting(){
    const username = currentUser || 'User';
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if(hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if(hour >= 17) greeting = 'Good Evening';
    
    document.getElementById('welcomeMessage').textContent = `👋 ${greeting}, ${username}!`;
    document.getElementById('userGreeting').textContent = `Welcome, ${username}!`;
    document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
    
    const now = new Date();
    document.getElementById('welcomeTime').textContent = `📅 ${now.toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})} | ⏰ ${now.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}`;
    
    // Display order type
    displayOrderType();
}

// Display order type
function displayOrderType(){
    const orderType = localStorage.getItem('bvrit_order_type');
    const badge = document.getElementById('orderTypeBadge');
    
    if(orderType === 'takeaway'){
        badge.innerHTML = '🛍️ Takeaway Order';
        badge.style.background = 'linear-gradient(90deg,#ff9800,#ffb74d)';
    } else if(orderType === 'eatin'){
        badge.innerHTML = '🍽️ Eat In Order';
        badge.style.background = 'linear-gradient(90deg,#9c27b0,#ba68c8)';
    }
}

// Load menu items from API (primary) or admin localStorage (fallback)
async function loadMenuItemsFromAPI(){
    const token = localStorage.getItem('bvrit_access_token');
    const apiUrl = getAPIURL();
    
    try {
        const response = await fetch(`${apiUrl}/menu`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Loaded menu items from API:', data.items?.length || data.data?.length, 'items');
        
        // Return items in expected format
        return data.items || data.data || [];
    } catch (error) {
        console.warn('⚠️  Failed to load from API, trying localStorage fallback:', error.message);
        
        // Fallback to admin localStorage
        const adminItems = JSON.parse(localStorage.getItem('bvrit_menu_items') || 'null');
        if (adminItems) {
            console.log('Using', adminItems.length, 'items from localStorage');
            return adminItems;
        }
        
        console.error('❌ No menu items available from API or localStorage');
        return [];
    }
}

// Initialize menu and load items from API
async function initializeMenu(){
    try {
        const menuItems = await loadMenuItemsFromAPI();
        
        if (menuItems.length === 0) {
            document.getElementById('menuContainer').innerHTML = 
                '<p style="padding:20px;text-align:center;color:#f44336">Menu items not available. Please try again later.</p>';
            return;
        }
        
        // Group items by category
        const grouped = {};
        menuItems.forEach(item => {
            const cat = item.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        // Render menu
        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
            html += `<div class="menu-category" data-category="${category}">
                <h3 class="category-title">${category.toUpperCase()}</h3>
                <div class="items-grid">`;
            
            items.forEach(item => {
                html += `
                    <div class="menu-item" data-name="${escapeHtml(item.name)}" 
                         data-item-id="${item.id}" data-price="${item.price}">
                        <div class="item-image">
                            ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}">` : '<div style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;height:100%;color:#999">🍽️</div>'}
                        </div>
                        <div class="item-content">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p class="description">${escapeHtml(item.description || '')}</p>
                            <div class="item-footer">
                                <span class="price">₹${item.price}</span>
                                <button class="add-btn" onclick="addToCart(this)">Add +</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        document.getElementById('menuContainer').innerHTML = html;
        
        // Re-apply admin customizations if any
        loadMenuItemsFromAdmin();
    } catch (error) {
        console.error('Error initializing menu:', error);
        document.getElementById('menuContainer').innerHTML = 
            '<p style="padding:20px;text-align:center;color:#f44336">Error loading menu. Please refresh.</p>';
    }
}

// Load menu items from admin localStorage (to override prices/availability)
function loadMenuItemsFromAdmin(){
    const adminItems = JSON.parse(localStorage.getItem('bvrit_menu_items') || 'null');
    if(!adminItems) return;

    // Update prices and availability based on admin changes
    adminItems.forEach(adminItem => {
        const menuItems = document.querySelectorAll('[data-name="' + adminItem.name + '"]');
        menuItems.forEach(menuItem => {
            // Update price
            const priceElement = menuItem.querySelector('.price');
            if(priceElement){
                priceElement.textContent = `₹${adminItem.price}`;
            }
            // Update data attribute for cart
            menuItem.dataset.price = adminItem.price;

            // Hide/show item based on availability
            if(!adminItem.available){
                menuItem.style.opacity = '0.5';
                menuItem.style.pointerEvents = 'none';
                const button = menuItem.querySelector('.add-btn');
                if(button) button.textContent = '❌ Not Available';
            }
        });
    });
}



// ==================== API URL Helper ====================
function getAPIURL() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost/canteen-api/api';
    }
    return 'https://canteen-prebooking.onrender.com/api';
}

// Category Filter
function filterCategory(category){
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.menu-category').forEach(cat => {
        if(category === 'all'){
            cat.style.display = 'block';
        } else {
            cat.style.display = cat.dataset.category === category ? 'block' : 'none';
        }
    });
}

// Cart functionality - Now uses API
let cart = JSON.parse(localStorage.getItem('bvrit_cart') || '{}');

async function addToCart(btn){
    event.stopPropagation(); // Prevent cart from closing
    const item = btn.closest('.menu-item');
    const itemName = item.dataset.name;
    const itemId = item.dataset.itemId;
    const name = itemName;
    const price = parseInt(item.dataset.price);
    
    // Check if user is logged in
    const token = localStorage.getItem('bvrit_access_token');
    console.log('🛒 addToCart called:');
    console.log('  Token exists?', !!token);
    if(token) console.log('  Token preview:', token.substring(0, 40));
    
    if(!token){
        alert('Please login to add items to cart');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // If no item ID in HTML, look it up by name
        let finalItemId = itemId;
        if(!finalItemId) {
            console.log('Looking up menu item:', itemName);
            // Make a simple fetch to get menu items and find the ID
            const apiUrl = getAPIURL();
            const response = await fetch(`${apiUrl}/menu`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if(data.data && data.data.items) {
                const foundItem = data.data.items.find(m => m.name === itemName);
                if(foundItem) {
                    finalItemId = foundItem.id;
                    console.log('Found menu item ID:', finalItemId);
                }
            }
        }
        
        if(!finalItemId) {
            throw new Error('Menu item not found in database. Please try again.');
        }
        
        // Use APIService to add item (handles headers and token correctly)
        console.log('About to call addToCart...');
        console.log('window.apiService exists?', !!window.apiService);
        console.log('global apiService exists?', typeof apiService !== 'undefined');
        console.log('Token in localStorage:', !!localStorage.getItem('bvrit_access_token'));
        
        const service = window.apiService || (typeof apiService !== 'undefined' ? apiService : null);
        
        if(!service) {
            console.error('API Service not initialized - using fallback fetch');
            // Fallback to direct API call
            const apiUrl = getAPIURL();
            console.log('Sending request with:');
            console.log('  URL:', `${apiUrl}/cart/add`);
            console.log('  Method: POST');
            console.log('  Headers: Authorization Bearer + X-Auth-Token');
            console.log('  Token:', token.substring(0, 40) + '...');
            
            const response = await fetch(`${apiUrl}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Auth-Token': token
                },
                body: JSON.stringify({
                    item_id: parseInt(finalItemId),
                    quantity: 1,
                    special_instructions: ''
                })
            });
            
            const data = await response.json();
            console.log('Fallback fetch response:', {status: response.status, data});
            if(!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add item');
            }
        } else {
            console.log('Using APIService to add to cart');
            const response = await service.addToCart(parseInt(finalItemId), 1, '');
            console.log('APIService response:', response);
            if(!response || !response.success){
                throw new Error(response?.message || 'Failed to add item to cart');
            }
        }
        
        // Update local cart UI
        const key = name.replace(/\s+/g, '_').toLowerCase();
        if(!cart[key]){
            cart[key] = { itemId: finalItemId, name, price, qty: 0 };
        }
        cart[key].qty++;
        
        btn.textContent = '✓ Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = 'Add +';
            btn.classList.remove('added');
        }, 800);
        
        updateCartUI();
    } catch(error) {
        console.error('Error adding to cart:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        alert('Failed to add item to cart: ' + error.message);
    }
}

function updateCartUI(){
    const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Save cart to localStorage
    localStorage.setItem('bvrit_cart', JSON.stringify(cart));
    
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartTotalFab').textContent = `₹${total}`;
    
    const itemsContainer = document.getElementById('cartItems');
    const summaryContainer = document.getElementById('cartSummary');
    
    if(count === 0){
        itemsContainer.innerHTML = '<p style="color:#666;text-align:center;padding:20px">Your cart is empty</p>';
        summaryContainer.style.display = 'none';
    } else {
        let html = '';
        for(const key in cart){
            const item = cart[key];
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <span>₹${item.price} each</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQty('${key}', -1); event.stopPropagation();">-</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty('${key}', 1); event.stopPropagation();">+</button>
                        <button class="remove-btn" onclick="removeItem('${key}'); event.stopPropagation();">✕</button>
                    </div>
                </div>
            `;
        }
        itemsContainer.innerHTML = html;
        summaryContainer.style.display = 'block';
        
        document.getElementById('subtotal').textContent = `₹${total}`;
        document.getElementById('discount').textContent = `-₹0`;
        document.getElementById('grandTotal').textContent = `₹${total}`;
    }
}

function changeQty(key, delta){
    if(!cart[key]) return;
    const newQty = cart[key].qty + delta;
    const itemId = cart[key].itemId;
    const token = localStorage.getItem('bvrit_access_token');
    
    if(newQty <= 0){
        removeItem(key);
        return;
    }
    
    // If no itemId, just update localStorage (offline mode)
    if(!itemId){
        cart[key].qty = newQty;
        localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        updateCartUI();
        return;
    }
    
    if(!token) {
        // No token, just update locally
        cart[key].qty = newQty;
        localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        updateCartUI();
        return;
    }
    
    // Call API to update quantity
    fetch('/canteen-api/public/api/cart/item/' + itemId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token
        },
        body: JSON.stringify({ quantity: newQty })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            cart[key].qty = newQty;
            localStorage.setItem('bvrit_cart', JSON.stringify(cart));
            updateCartUI();
        } else {
            console.error('API Error:', data.message);
            // Fall back to local update
            cart[key].qty = newQty;
            localStorage.setItem('bvrit_cart', JSON.stringify(cart));
            updateCartUI();
        }
    })
    .catch(error => {
        console.error('Failed to update cart via API:', error);
        // Fall back to local update
        cart[key].qty = newQty;
        localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        updateCartUI();
    });
}

function removeItem(key){
    const itemId = cart[key]?.itemId;
    const token = localStorage.getItem('bvrit_access_token');
    
    // If no itemId, just delete from localStorage
    if(!itemId){
        delete cart[key];
        localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        updateCartUI();
        return;
    }
    
    if(!token) {
        // No token, just delete locally
        delete cart[key];
        localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        updateCartUI();
        return;
    }
    
    // Try to call API to remove from database
    fetch('/canteen-api/public/api/cart/item/' + itemId, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            delete cart[key];
            localStorage.setItem('bvrit_cart', JSON.stringify(cart));
            updateCartUI();
        } else {
            console.error('API Error:', data.message);
            // Fall back to local delete
            delete cart[key];
            localStorage.setItem('bvrit_cart', JSON.stringify(cart));
            updateCartUI();
        }
    })
    .catch(error => {
        console.error('Failed to remove item via API:', error);
        // Fall back to local delete
        delete cart[key];
        localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        updateCartUI();
    });
}

function toggleCart(){
    document.getElementById('cartModal').classList.toggle('show');
}

// Close cart when clicking outside
document.addEventListener('click', function(event){
    const cartModal = document.getElementById('cartModal');
    const cartFab = document.querySelector('.cart-fab');
    
    // If cart is open and click is outside both cart and button, close it
    if(cartModal.classList.contains('show') && 
       !cartModal.contains(event.target) && 
       !cartFab.contains(event.target)){
        cartModal.classList.remove('show');
    }
});

function checkout(){
    const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    if(count === 0){
        alert('Your cart is empty!');
        return;
    }
    
    // Save cart to localStorage and redirect to checkout page
    localStorage.setItem('bvrit_cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

function logout(){
    localStorage.removeItem('bvrit_current_user');
    localStorage.removeItem('bvrit_admin_viewing_menu'); // Clear admin viewing flag on logout
    localStorage.removeItem('bvrit_is_admin'); // Clear admin status
    window.location.href = 'index.html';
}

// Go back to admin page
function goBackToAdmin(){
    // Clear the admin viewing flag when going back
    localStorage.removeItem('bvrit_admin_viewing_menu');
    window.location.href = 'admin.html';
}

// Show back to admin button only if admin accessed menu from admin panel
function showAdminButton(){
    const isAdmin = localStorage.getItem('bvrit_is_admin') === 'true';
    const adminViewingMenu = localStorage.getItem('bvrit_admin_viewing_menu') === 'true';
    if(isAdmin && adminViewingMenu){
        document.getElementById('backToAdminBtn').style.display = 'block';
    }
}

// Initialize
initializeMenu(); // Load menu items from API (primary) or localStorage (fallback)
loadCartFromAPI(); // Load cart from API
showAdminButton(); // Show admin button if admin is viewing

async function loadCartFromAPI(){
    const token = localStorage.getItem('bvrit_access_token');
    if(!token) {
        console.log('No token - using localStorage cart');
        updateCartUI(); // Use localStorage if not authenticated
        return;
    }
    
    try {
        const apiUrl = getAPIURL();
        console.log('Loading cart from API with token:', token.substring(0, 30) + '...');
        const response = await fetch(`${apiUrl}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Cart API response status:', response.status);
        const data = await response.json();
        console.log('Cart API response:', data);
        
        if(response.ok && data.success && data.data && data.data.items && data.data.items.length > 0) {
            console.log('Loading cart from API:', data.data.items.length, 'items');
            // Clear local cart and rebuild from API
            cart = {};
            for(const item of data.data.items) {
                const key = item.name.replace(/\s+/g, '_').toLowerCase();
                cart[key] = {
                    itemId: item.menu_item_id,
                    name: item.name,
                    price: parseFloat(item.price),
                    qty: item.quantity
                };
            }
            localStorage.setItem('bvrit_cart', JSON.stringify(cart));
        } else {
            console.log('Cart is empty or API failed');
        }
    } catch(error) {
        console.error('Error loading cart from API:', error);
        console.log('Continuing with localStorage cart');
    }
    
    updateCartUI();
}

// ==================== Order History Functions ====================

async function viewOrderHistory() {
    const overlay = document.getElementById('orderHistoryOverlay');
    const historyList = document.getElementById('orderHistoryList');
    
    // Show overlay and loading state
    overlay.classList.add('show');
    historyList.innerHTML = '<div class="loading-spinner">Loading your orders...</div>';
    
    try {
        const token = localStorage.getItem('bvrit_access_token');
        
        console.log('Order History - Token:', !!token);
        
        if(!token) {
            historyList.innerHTML = '<div class="empty-orders"><p>⚠️ Please login to view your orders</p></div>';
            return;
        }
        
        // Fetch orders list
        const apiUrl = getAPIURL();
        const response = await fetch(`${apiUrl}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Orders API Response Status:', response.status);
        const data = await response.json();
        console.log('Orders API Response Data:', data);
        
        // Handle different response formats
        let orders = [];
        if(data.success) {
            orders = data.data || [];
        } else if(Array.isArray(data)) {
            orders = data;
        } else if(data.orders && Array.isArray(data.orders)) {
            orders = data.orders;
        }
        
        console.log('Processed Orders:', orders);
        
        if(orders && orders.length > 0) {
            // Fetch full details for each order (including items)
            const enrichedOrders = await Promise.all(
                orders.map(order => fetchOrderDetails(token, order.id).catch(e => {
                    console.error('Error fetching order details for order', order.id, e);
                    return order; // Fall back to basic order info
                }))
            );
            displayOrders(enrichedOrders);
        } else {
            historyList.innerHTML = '<div class="empty-orders"><p>📭 No orders found</p><p style="font-size:12px;color:#999">You haven\'t placed any orders yet. Make your first order today!</p></div>';
        }
    } catch(error) {
        console.error('Error fetching orders:', error);
        historyList.innerHTML = '<div class="empty-orders"><p>❌ Error loading orders</p><p style="font-size:12px;color:#999">' + (error.message || 'Unknown error') + '</p></div>';
    }
}

async function fetchOrderDetails(token, orderId) {
    try {
        const apiUrl = getAPIURL();
        const response = await fetch(`${apiUrl}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if(response.ok) {
            const data = await response.json();
            console.log('Order details for', orderId, ':', data);
            return data.data || data;
        } else {
            console.warn('Failed to fetch details for order', orderId);
            return null;
        }
    } catch(error) {
        console.error('Error fetching order details:', error);
        return null;
    }
}

function displayOrders(orders) {
    const historyList = document.getElementById('orderHistoryList');
    historyList.innerHTML = '';
    
    if(!orders || orders.length === 0) {
        historyList.innerHTML = '<div class="empty-orders"><p>📭 No orders found</p></div>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
    });
    
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        historyList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-history-item';
    
    if(!order) {
        return card; // Return empty card if order is null
    }
    
    // Format date - handle different date formats
    const dateString = order.created_at || order.createdAt || new Date().toISOString();
    const orderDate = new Date(dateString);
    const dateStr = orderDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Status badge - handle different status field names
    const status = order.status || order.order_status || 'Pending';
    const statusClass = `status-${status.toLowerCase().replace(/\s/g, '-')}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Parse items - the API now returns items properly formatted
    let items = [];
    if(order.items && Array.isArray(order.items)) {
        items = order.items;
    }
    
    // Create items list HTML
    const itemsHTML = items.length > 0 ? items.map(item => {
        const itemName = item.name || item.menu_item_name || item.item_name || 'Unknown Item';
        const quantity = item.quantity || item.qty || 1;
        const price = item.price || item.unit_price || 0;
        const itemTotal = parseInt(price) * parseInt(quantity);
        return `<div class="order-item-detail">
                    <span><span class="item-name">${itemName}</span> x${quantity}</span>
                    <span>₹${itemTotal}</span>
                </div>`;
    }).join('') : '<p style="color:#999;font-size:12px">No items details available</p>';
    
    // Calculate total - try different field names for the total amount
    const totalAmount = order.final_amount || order.total_amount || order.total || order.grand_total || 0;
    
    console.log('Order Card - Order ID:', order.id, 'Items:', items, 'Total:', totalAmount);
    
    card.innerHTML = `
        <div class="order-header">
            <div style="display:flex;flex-direction:column;gap:4px;flex:1">
                <span class="order-id" style="font-size:16px;font-weight:900">📦 Order #${order.id}</span>
                <span style="font-size:12px;color:rgba(255,255,255,0.7)">${dateStr}</span>
            </div>
            <span class="order-status ${statusClass}">${statusText}</span>
        </div>
        <div class="order-items">
            ${itemsHTML}
        </div>
        <div class="order-total">
            <span>Total:</span>
            <span class="amount">₹${parseInt(totalAmount) || 0}</span>
        </div>
    `;
    
    return card;
}

function closeOrderHistory(event) {
    // If clicking on overlay (not modal content)
    if(event && event.target.id !== 'orderHistoryOverlay') {
        return;
    }
    
    const overlay = document.getElementById('orderHistoryOverlay');
    overlay.classList.remove('show');
}
