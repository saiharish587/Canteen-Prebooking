// Check if user is logged in with valid credentials
const currentUser = localStorage.getItem('bvrit_current_user');
const registeredUsers = JSON.parse(localStorage.getItem('bvrit_users') || '{}');
const isAdmin = localStorage.getItem('bvrit_is_admin') === 'true';

// Redirect to login if no user session OR user doesn't exist in database (except for admin)
if(!currentUser || (!registeredUsers[currentUser] && !isAdmin)){
    localStorage.removeItem('bvrit_current_user'); // Clear invalid session
    alert('Please login to access the menu.');
    window.location.href = 'index.html';
}

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

// Load menu items from admin localStorage
function loadMenuItemsFromAdmin(){
    const adminItems = JSON.parse(localStorage.getItem('bvrit_menu_items') || 'null');
    if(!adminItems) return; // Use default items if admin hasn't set any

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

// Cart functionality
let cart = JSON.parse(localStorage.getItem('bvrit_cart') || '{}');

function addToCart(btn){
    event.stopPropagation(); // Prevent cart from closing
    const item = btn.closest('.menu-item');
    const name = item.dataset.name;
    const price = parseInt(item.dataset.price);
    const key = name.replace(/\s+/g, '_').toLowerCase();
    
    if(!cart[key]){
        cart[key] = { name, price, qty: 0 };
    }
    cart[key].qty++;
    
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
        btn.textContent = 'Add +';
        btn.classList.remove('added');
    }, 800);
    
    updateCartUI();
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
    cart[key].qty += delta;
    if(cart[key].qty <= 0) delete cart[key];
    updateCartUI();
}

function removeItem(key){
    delete cart[key];
    updateCartUI();
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
    window.location.href = 'index.html';
}

// Go back to admin page
function goBackToAdmin(){
    window.location.href = 'admin.html';
}

// Show back to admin button if admin is logged in
function showAdminButton(){
    if(isAdmin){
        document.getElementById('backToAdminBtn').style.display = 'block';
    }
}

// Initialize
initUserGreeting();
loadMenuItemsFromAdmin(); // Load any admin changes
updateCartUI(); // This will load and display any previously saved items from localStorage
showAdminButton(); // Show admin button if admin is viewing
