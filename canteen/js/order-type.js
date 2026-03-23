// Check if user is logged in
console.log('order-type.js loaded');
console.log('Page load time:', new Date().toLocaleTimeString());
console.log('URL:', window.location.href);
console.log('localStorage at load:', Object.entries(localStorage).map(([k,v]) => k + ': ' + (v ? v.substring(0,20) + '...' : 'null')));

// Global variable to store current user
let currentUser = null;

// Function to check auth and proceed
function checkAuthAndInit() {
    currentUser = localStorage.getItem('bvrit_current_user');
    const accessToken = localStorage.getItem('bvrit_access_token');
    const userType = localStorage.getItem('bvrit_user_type');
    const urlParams = new URLSearchParams(window.location.search);
    const isFromLogin = urlParams.get('auth') === '1';

    console.log('=== checkAuthAndInit called ===');
    console.log('currentUser:', currentUser);
    console.log('accessToken exists?:', !!accessToken);
    console.log('userType:', userType);
    console.log('fromLogin URL param?:', isFromLogin);

    // If coming from login, always trust the credentials even if slightly delay
    if(isFromLogin) {
        console.log('✅ From login redirect - skipping auth check');
        document.body.style.opacity = '1';
        initGreeting();
        return;
    }

    // Check if user is still logged in (has both user and token)
    if(currentUser && accessToken) {
        console.log('✅ Auth PASSED - valid credentials found');
        document.body.style.opacity = '1';
        initGreeting();
        return;
    }

    // If we have currentUser but no token, try to work with what we have
    // (for backwards compatibility with admin offline access)
    if(currentUser && (userType === 'admin' || accessToken?.startsWith('admin_token'))) {
        console.log('✅ Auth PASSED - admin offline access');
        document.body.style.opacity = '1';
        initGreeting();
        return;
    }

    // Auth failed - clear storage and redirect to login
    console.error('❌ Auth FAILED - no valid credentials');
    console.log('DEBUG: currentUser =', currentUser, ', accessToken =', accessToken);
    localStorage.removeItem('bvrit_current_user');
    localStorage.removeItem('bvrit_access_token');
    localStorage.removeItem('bvrit_user_type');
    localStorage.removeItem('bvrit_is_admin');
    alert('Please login to proceed.');
    window.location.href = 'index.html';
}

// Call with longer delay (500ms) to ensure localStorage is synced after redirect
setTimeout(checkAuthAndInit, 500);

// Initialize greeting
function initGreeting(){
    const username = currentUser || 'User';
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if(hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if(hour >= 17) greeting = 'Good Evening';
    
    document.getElementById('userGreeting').textContent = `${greeting}, ${username}! 🎉`;
}

// Select order type
function selectOrderType(type, event){
    event.stopPropagation();
    
    // Disable both cards during transition
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.add('disabled');
    });

    // Store the order type in localStorage
    localStorage.setItem('bvrit_order_type', type);

    // Redirect to menu after a brief delay
    setTimeout(() => {
        window.location.href = 'menu.html';
    }, 500);
}
