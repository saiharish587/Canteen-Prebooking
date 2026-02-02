let selectedPaymentMethod = null;
let cartData = null;

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
    if(!selectedPaymentMethod){
        showError('Please select a payment method');
        return;
    }

    // Validate based on payment method
    if(selectedPaymentMethod === 'upi'){
        // QR code shown, user can scan or enter manually
        const upiId = document.getElementById('upiId').value.trim();
        if(!upiId) {
            // Allow QR code payment without manual entry
            // In real scenario, QR would initiate payment
        }
        else if(!upiId.includes('@')){
            showError('Please enter a valid UPI ID');
            return;
        }
    }
    else if(selectedPaymentMethod === 'card'){
        const cardNumber = document.getElementById('cardNumber').value.trim().replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        
        if(!cardNumber || cardNumber.length !== 16){
            showError('Please enter a valid 16-digit card number');
            return;
        }
        if(!expiryDate || !expiryDate.includes('/')){
            showError('Please enter expiry date in MM/YY format');
            return;
        }
        if(!cvv || cvv.length < 3){
            showError('Please enter a valid CVV');
            return;
        }
    }

    // Process payment
    processPaymentTransaction();
}

// Simulate payment transaction
function processPaymentTransaction(){
    showLoading(true);
    setTimeout(()=>{
        showLoading(false);
        
        const total = document.getElementById('totalAmount').textContent;
        const orderNumber = 'ORD' + Date.now().toString().slice(-6);
        const username = localStorage.getItem('bvrit_current_user') || 'Valued Customer';
        
        // Populate order details
        const detailsHTML = `
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${orderNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">${total}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Preparation Time:</span>
                <span class="detail-value">10-15 minutes ⏱️</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">Being Prepared 👨‍🍳</span>
            </div>
        `;
        
        document.getElementById('successDetails').innerHTML = detailsHTML;
        
        // Populate greeting message
        const greetingHTML = `
            Thank you, <strong>${escapeHtml(username)}!</strong><br>
            <span style="font-size:14px;opacity:0.9">Your order will be ready at the canteen counter</span>
        `;
        
        document.getElementById('greetingMessage').innerHTML = greetingHTML;
        
        // Show success modal
        document.getElementById('successModal').classList.add('show');
        
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
    }, 2000);
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
initCheckout();
