let selectedPaymentMethod = null;
let cartData = null;

// Check auth before init
function checkAuthBeforeCheckout(){
    const token = localStorage.getItem('bvrit_access_token');
    const user = localStorage.getItem('bvrit_current_user');
    const userType = localStorage.getItem('bvrit_user_type');
    
    console.log('Checkout auth check:');
    console.log('Token exists:', !!token);
    console.log('User:', user);
    console.log('User type:', userType);
    
    // Allow if both user and token exist
    if(user && token) {
        return;
    }
    
    // Allow admin offline access
    if(user && userType === 'admin') {
        return;
    }
    
    // Auth failed
    alert('Please login to proceed to checkout.');
    window.location.href = 'index.html';
}

// Initialize page
function initCheckout(){
    const cart = JSON.parse(localStorage.getItem('bvrit_cart') || '{}');
    if(Object.keys(cart).length === 0){
        document.getElementById('itemsList').innerHTML = '<p style="text-align:center;color:#f44336;font-weight:700">No items in cart. Please add items first.</p>';
        document.querySelector('.btn-place-order').disabled = true;
        return;
    }
    
    cartData = cart;
    displayItems();
}

// Display cart items
function displayItems(){
    let html = '';
    let subtotal = 0;

    for(const key in cartData){
        const item = cartData[key];
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        
        html += `
            <div class="order-item">
                <div class="item-info">
                    <h4>${escapeHtml(item.name)}</h4>
                    <span>₹${item.price} × ${item.qty} items</span>
                </div>
                <div class="item-price">₹${itemTotal}</div>
            </div>
        `;
    }

    document.getElementById('itemsList').innerHTML = html;
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('totalAmount').textContent = `₹${subtotal}`;
    document.getElementById('payAmount').textContent = subtotal;
}

// Show payment section
function showPayment(){
    document.getElementById('paymentSection').classList.add('show');
    document.querySelector('.order-summary').style.background = 'rgba(76,175,80,0.1)';
    document.querySelector('.order-summary').style.borderColor = 'rgba(76,175,80,0.3)';
    document.getElementById('paymentSection').scrollIntoView({behavior:'smooth'});
}

// Hide payment section
function hidePayment(){
    document.getElementById('paymentSection').classList.remove('show');
    document.querySelector('.order-summary').style.background = '';
    document.querySelector('.order-summary').style.borderColor = '';
    document.querySelector('.btn-place-order').disabled = false;
    document.querySelector('.btn-place-order').textContent = '📦 Place Order';
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
}

// Select payment method
function selectPayment(method, element){
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    
    // Hide all forms
    document.getElementById('upiForm').style.display = 'none';
    document.getElementById('cardForm').style.display = 'none';
    
    // Show selected form
    if(method === 'upi'){
        document.getElementById('upiForm').style.display = 'block';
        document.getElementById('qrCode').style.display = 'block';
    }
    else if(method === 'card') document.getElementById('cardForm').style.display = 'block';
}

// Process payment
function processPayment(){
    console.log('=== processPayment START ===');
    console.log('selectedPaymentMethod:', selectedPaymentMethod);
    
    if(!selectedPaymentMethod){
        console.error('❌ No payment method selected');
        showError('Please select a payment method');
        return;
    }

    // Validate based on payment method
    if(selectedPaymentMethod === 'upi'){
        console.log('Validating UPI payment...');
        // QR code shown, user can scan or enter manually
        const upiId = document.getElementById('upiId').value.trim();
        console.log('UPI ID provided?', !!upiId);
        
        if(!upiId) {
            // Allow QR code payment without manual entry
            // In real scenario, QR would initiate payment
            console.log('✅ QR code payment mode');
        }
        else if(!upiId.includes('@')){
            console.error('❌ Invalid UPI ID format');
            showError('Please enter a valid UPI ID');
            return;
        }
    }
    else if(selectedPaymentMethod === 'card'){
        console.log('Validating card payment...');
        const cardNumber = document.getElementById('cardNumber').value.trim().replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        
        console.log('Card validation:', {cardNumber: cardNumber.length + ' digits', expiryDate, cvv: '***'});
        
        if(!cardNumber || cardNumber.length !== 16){
            console.error('❌ Invalid card number');
            showError('Please enter a valid 16-digit card number');
            return;
        }
        if(!expiryDate || !expiryDate.includes('/')){
            console.error('❌ Invalid expiry date format');
            showError('Please enter expiry date in MM/YY format');
            return;
        }
        if(!cvv || cvv.length < 3){
            console.error('❌ Invalid CVV');
            showError('Please enter a valid CVV');
            return;
        }
    }
    else if(selectedPaymentMethod === 'cash'){
        console.log('✅ Cash payment selected - no validation needed');
    }

    // Process payment
    console.log('✅ Validation passed - calling processPaymentTransaction()');
    processPaymentTransaction();
}

// Process payment by creating order from existing cart
async function processPaymentTransaction(){
    console.log('=== processPaymentTransaction START ===');
    showLoading(true);
    
    try {
        console.log('Step 1: Checking payment method');
        console.log('selectedPaymentMethod:', selectedPaymentMethod);
        
        if(!selectedPaymentMethod){
            showLoading(false);
            showError('Please select a payment method');
            console.error('❌ No payment method selected');
            return;
        }
        
        console.log('Step 2: Syncing cart items to API...');
        console.log('cartData:', cartData);
        console.log('window.apiService exists?', !!window.apiService);
        
        // First, sync local cart items to API
        try {
            for(const key in cartData) {
                const item = cartData[key];
                console.log(`Processing item: ${key}`, item);
                
                if(item.itemId && item.qty > 0) {
                    console.log(`Adding ${item.qty}x ${item.name} (ID: ${item.itemId}) to cart`);
                    const response = await window.apiService.addToCart(item.itemId, item.qty, '');
                    console.log(`Response for ${item.name}:`, response);
                    
                    if(!response.success) {
                        console.warn(`Failed to add ${item.name} to cart:`, response);
                    }
                }
            }
            console.log('✅ Cart sync complete');
        } catch(e) {
            console.error('Error syncing cart items:', e);
            console.error('Stack:', e.stack);
            showLoading(false);
            showError('Failed to sync cart items: ' + e.message);
            return;
        }
        
        // Create order from API cart
        console.log('Step 3: Getting order details');
        const orderType = localStorage.getItem('bvrit_order_type') || 'takeaway';
        console.log('🛍️ Order type:', orderType);
        console.log('💳 Payment method:', selectedPaymentMethod);
        console.log('Creating order with:', {orderType, selectedPaymentMethod});
        
        console.log('Step 4: Calling createOrder()');
        console.log('API Service URL check:', window.apiService);
        
        const orderResponse = await window.apiService.createOrder(orderType, selectedPaymentMethod);
        
        console.log('✅ Order response received:', orderResponse);
        
        if(!orderResponse.success){
            console.error('❌ Order creation failed');
            showLoading(false);
            throw new Error(orderResponse.message || orderResponse.error || 'Failed to create order');
        }
        
        console.log('✅ Order created successfully!');
        showLoading(false);
        
        const total = document.getElementById('totalAmount').textContent;
        const orderNumber = orderResponse.data?.order_number || orderResponse.data?.order_id || ('ORD' + Date.now().toString().slice(-6));
        const username = localStorage.getItem('bvrit_current_user') || 'Valued Customer';
        
        // Populate order details
        const detailsHTML = `
            <div class="detail-row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                <span class="detail-label" style="color:#aaa;">Order ID:</span>
                <span class="detail-value" style="color:#87CEEB;font-weight:600;">${orderNumber}</span>
            </div>
            <div class="detail-row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                <span class="detail-label" style="color:#aaa;">Total Amount:</span>
                <span class="detail-value" style="color:#87CEEB;font-weight:600;">${total}</span>
            </div>
            <div class="detail-row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                <span class="detail-label" style="color:#aaa;">Preparation Time:</span>
                <span class="detail-value" style="color:#87CEEB;font-weight:600;">10-15 minutes ⏱️</span>
            </div>
            <div class="detail-row" style="display:flex;justify-content:space-between;padding:8px 0;">
                <span class="detail-label" style="color:#aaa;">Status:</span>
                <span class="detail-value" style="color:#87CEEB;font-weight:600;">Being Prepared 👨‍🍳</span>
            </div>
        `;
        
        document.getElementById('successDetails').innerHTML = detailsHTML;
        
        // Populate greeting message
        const greetingHTML = `
            Thank you, <strong>${escapeHtml(username)}!</strong><br>
            <span style="font-size:14px;opacity:0.9">Your order will be ready at the canteen counter</span>
        `;
        
        document.getElementById('greetingMessage').innerHTML = greetingHTML;
        
        // Show success modal using Bootstrap
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Hide checkout content
        document.querySelector('main').style.display = 'none';
        
        // Update button status after payment is complete
        const placeOrderBtn = document.querySelector('.btn-place-order');
        if(placeOrderBtn){
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = '✓ Order Confirmed';
        }
        
        // Clear cart
        localStorage.removeItem('bvrit_cart');
        
        // Countdown and logout
        let countdown = 15;
        const countdownInterval = setInterval(()=>{
            countdown--;
            document.getElementById('countdownNumber').textContent = countdown;
            
            if(countdown <= 0){
                clearInterval(countdownInterval);
                // Logout user
                localStorage.removeItem('bvrit_current_user');
                localStorage.removeItem('bvrit_is_admin');
                // Redirect to home
                window.location.href = 'index.html';
            }
        }, 1000);
    } catch(error) {
        console.error('=== ERROR IN PAYMENT PROCESSING ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        showLoading(false);
        showError('Failed to create order: ' + error.message);
    }
}

// Utility functions
function showError(message){
    const errorEl = document.getElementById('errorMsg');
    errorEl.innerHTML = message;
    errorEl.classList.add('show');
    setTimeout(()=> errorEl.classList.remove('show'), 5000);
}

function showSuccess(message){
    const successEl = document.getElementById('successMsg');
    successEl.innerHTML = message;
    successEl.classList.add('show');
    document.getElementById('paymentSection').style.display = 'none';
}

function showLoading(show){
    document.getElementById('loadingSpinner').classList.toggle('show', show);
    document.getElementById('payNowBtn').disabled = show;
}

function goBack(){
    window.location.href = 'menu.html';
}

function logoutUser(){
    // Clear session and cart data
    localStorage.removeItem('bvrit_current_user');
    localStorage.removeItem('bvrit_is_admin');
    localStorage.removeItem('bvrit_cart');
    // Redirect to home page
    window.location.href = 'index.html';
}

function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

// Initialize on load
checkAuthBeforeCheckout();
initCheckout();
