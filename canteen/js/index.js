// Admin credentials (per requirement)
const ADMIN_EMAIL = 'admin@bvrit.ac.in';
const ADMIN_PASSWORD = 'Admin@123';

// Track login state
let isLoggedIn = false;
let currentUsername = null;
let isAdmin = false;

// Modal functions
function openLoginModal(){
    document.getElementById('loginModal').classList.add('show');
}
function closeClosedModal(){
    document.getElementById('closedModal').classList.remove('show');
}
function closeLoginModal(){
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('userUsername').value = '';
    document.getElementById('userPassword').value = '';
    clearErrors();
}
window.onclick = function(e){
    const modal = document.getElementById('loginModal');
    if(e.target === modal) closeLoginModal();
}

// cart state
const cart = {};
function updateCartUI(){
    const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
    document.getElementById('cartCount').textContent = count;
    const itemsEl = document.getElementById('cartItems');
    itemsEl.innerHTML = '';
    let total = 0;
    for(const key in cart){
        const it = cart[key];
        total += it.price * it.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<div><strong style="color:#fff">${escapeHtml(it.name)}</strong><div style="font-size:12px;color:var(--muted)">₹${it.price} x ${it.qty}</div></div><div style="display:flex;gap:8px;align-items:center"><button class='quantity-btn' onclick="changeQty('${key}',-1)">-</button><button class='quantity-btn' onclick="changeQty('${key}',1)">+</button><button class='quantity-btn' style="background:#ef4444;color:white" onclick="discardItem('${key}')">✕</button></div>`;
        itemsEl.appendChild(div);
    }
    document.getElementById('cartTotal').textContent = `Total: ₹${total}`;
}
function addToCart(btn){
    if(!isLoggedIn){openLoginModal();return;}
    const card = btn.closest('.menu-item');
    if(!card) return;
    const name = card.getAttribute('data-name');
    const price = Number(card.getAttribute('data-price'))||0;
    const key = name.replace(/\s+/g,'_').toLowerCase();
    if(!cart[key]) cart[key] = {name,price,qty:0};
    cart[key].qty += 1;
    updateCartUI();
    // small feedback
    btn.textContent = '✓ Added!';
    setTimeout(()=> btn.textContent = 'Add to Cart',700);
}
function changeQty(key,delta){
    if(!cart[key]) return;
    cart[key].qty += delta;
    if(cart[key].qty<=0) delete cart[key];
    updateCartUI();
}
function discardItem(key){
    if(!cart[key]) return;
    delete cart[key];
    updateCartUI();
}
function toggleCart(){
    document.getElementById('cartModal').classList.toggle('show');
}
// Close cart when clicking outside
document.addEventListener('click', function(event){
    const cartModal = document.getElementById('cartModal');
    const cartFab = document.getElementById('cartFab');
    
    // If cart is open and click is outside both cart and button, close it
    if(cartModal.classList.contains('show') && 
       !cartModal.contains(event.target) && 
       !cartFab.contains(event.target)){
        cartModal.classList.remove('show');
    }
});
function checkoutOrder(){
    if(Object.keys(cart).length===0){ alert('Cart is empty'); return; }
    // Save cart to localStorage and redirect to checkout page
    localStorage.setItem('bvrit_cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

// --- Login & role logic ---
function validateEmailStrict(email){
    const domain = '@bvrit.ac.in';
    if(!email || typeof email !== 'string') return {valid:false,message:'Enter an email'};
    if(!email.endsWith(domain)) return {valid:false,message:'Email must end with @bvrit.ac.in'};
    const local = email.slice(0,-domain.length);
    const ok = /^[A-Za-z0-9._+-]+$/.test(local);
    if(!ok) return {valid:false,message:'Invalid email format'};
    
    // Email constraint: at most 15 characters (supports student IDs like 24211a6763)
    if(local.length > 15){
        return {valid:false,message:'Email should be at most 15 characters (not including @bvrit.ac.in)'};
    }
    
    if(local.length < 1){
        return {valid:false,message:'Email cannot be empty'};
    }
    
    return {valid:true,local};
}
function validatePasswordSimple(pwd){
    if(!pwd||pwd.length===0) return {valid:false,message:'Password cannot be empty'};
    if(pwd.length<8) return {valid:false,message:'Password must be at least 8 characters'};
    if(pwd.length>50) return {valid:false,message:'Password must not exceed 50 characters'};
    if(!/[A-Z]/.test(pwd)) return {valid:false,message:'Password must contain at least one uppercase letter'};
    if(!/[a-z]/.test(pwd)) return {valid:false,message:'Password must contain at least one lowercase letter'};
    if(!/[0-9]/.test(pwd)) return {valid:false,message:'Password must contain at least one number'};
    if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return {valid:false,message:'Password must contain at least one special character (!@#$%^&*)'};
    return {valid:true};
}
function classifyUser(local,fullEmail){
    if(fullEmail===ADMIN_EMAIL) return 'admin';
    const first = local.charAt(0);
    if(/[0-9]/.test(first)){
        const alphaCount = (local.match(/[A-Za-z]/g)||[]).length;
        if(alphaCount<=2) return 'student';
        return 'unknown';
    }
    if(/[A-Za-z]/.test(first)) return 'faculty';
    return 'unknown';
}
function clearErrors(){
    ['usernameError','passwordError'].forEach(id=>{const el=document.getElementById(id); if(el) el.classList.remove('show')});
    ['userUsername','userPassword'].forEach(id=>{const inp=document.getElementById(id); if(inp) inp.classList.remove('error')});
    const s=document.getElementById('loginSuccess'); if(s){s.classList.remove('show'); s.textContent=''}
}
function validateUsername(username){
    if(!username||username.length===0) return {valid:false,message:'Username cannot be empty'};
    
    // Check if it's an email (for admin login or email-based accounts)
    if(username.includes('@')){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(username)) return {valid:false,message:'Please enter a valid email address'};
        return {valid:true};
    }
    
    // Otherwise, validate as username
    if(username.length<3) return {valid:false,message:'Username must be at least 3 characters'};
    if(username.length>20) return {valid:false,message:'Username must not exceed 20 characters'};
    if(!/^[A-Za-z]/.test(username)) return {valid:false,message:'Username must start with a letter'};
    if(!/^[A-Za-z][A-Za-z0-9_-]*$/.test(username)) return {valid:false,message:'Username can only contain letters, numbers, _ and - (no spaces or special characters)'};
    if(/ {2,}/.test(username)) return {valid:false,message:'Username cannot have consecutive spaces'};
    return {valid:true};
}
function validateAdminEmail(email){
    if(!email||email.length===0) return {valid:false,message:'Email cannot be empty'};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) return {valid:false,message:'Please enter a valid email address'};
    return {valid:true};
}
function handleLogin(e){
    e.preventDefault(); clearErrors();
    
    // Note: Operating hours are validated server-side, not blocking client-side during dev/testing
    const username = document.getElementById('userUsername').value.trim();
    const pwd = document.getElementById('userPassword').value;
    
    console.log('🔐 [handleLogin] Username entered:', username);
    console.log('🔐 [handleLogin] Password length:', pwd ? pwd.length : 0);
    console.log('🔐 [handleLogin] Admin email constant:', ADMIN_EMAIL);
    console.log('🔐 [handleLogin] Admin password constant:', ADMIN_PASSWORD);
    console.log('🔐 [handleLogin] Email match?:', username === ADMIN_EMAIL);
    console.log('🔐 [handleLogin] Username match?:', username === 'admin');
    console.log('🔐 [handleLogin] Password match?:', pwd === ADMIN_PASSWORD);
    
    // Check if trying to login as admin first (check both email and username 'admin')
    if((username === ADMIN_EMAIL || username === 'admin') && pwd === ADMIN_PASSWORD) {
        console.log('✅ [ADMIN LOGIN DETECTED] Proceeding with admin login');
        isAdmin = true;
        const s=document.getElementById('loginSuccess');
        s.textContent='🔐 Admin access granted!';
        s.style.background='';
        s.style.color='';
        s.classList.add('show');
        currentUsername = 'admin';
        localStorage.setItem('bvrit_current_user', 'admin');
        localStorage.setItem('bvrit_is_admin', 'true');
        // Generate a token for admin offline access (required by order-type.js auth check)
        localStorage.setItem('bvrit_access_token', 'admin_token_' + Date.now());
        localStorage.setItem('bvrit_user_type', 'admin');
        console.log('✅ [ADMIN LOGIN] localStorage set, closing modal...');
        closeLoginModal();
        console.log('✅ [ADMIN LOGIN] Modal closed, redirecting to admin.html...');
        setTimeout(()=>{ 
            console.log('✅ [REDIRECT] Now redirecting to admin.html');
            window.location.href = 'admin.html'; 
        }, 500);
        return;
    }
    
    // Check if username is empty
    if(!username || username.length === 0){
        document.getElementById('usernameError').textContent='Username cannot be empty';
        document.getElementById('usernameError').classList.add('show');
        document.getElementById('userUsername').classList.add('error');
        return;
    }
    
    let hasError=false;
    const uv = validateUsername(username);
    if(!uv.valid){document.getElementById('usernameError').textContent=uv.message;document.getElementById('usernameError').classList.add('show');document.getElementById('userUsername').classList.add('error');hasError=true}
    const pv = validatePasswordSimple(pwd);
    if(!pv.valid){document.getElementById('passwordError').textContent=pv.message;document.getElementById('passwordError').classList.add('show');document.getElementById('userPassword').classList.add('error');hasError=true}
    if(hasError) return;

    // Call API to login (instead of checking localStorage)
    loginViaAPI(username, pwd);
}

async function loginViaAPI(username, pwd) {
    try {
        let email = username;
        console.log('🔐 [LOGIN START] Username/Email:', username);
        console.log('🔐 [LOGIN START] Password length:', pwd ? pwd.length : 0);
        console.log('🔐 [LOGIN START] Password value:', pwd);
        
        // Get correct API URL
        const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost/canteen-api/api' 
            : 'https://canteen-prebooking.onrender.com/api';
        
        console.log('🔐 [API URL] Using:', apiUrl);
        
        // If input doesn't contain @, it's a username - need to get email from API
        if (!username.includes('@')) {
            console.log('🔐 [METHOD] Username provided - fetching email from API');
            try {
                const getEmailUrl = `${apiUrl}/auth/get-email`;
                console.log('🔐 [GET-EMAIL] Calling:', getEmailUrl);
                console.log('🔐 [GET-EMAIL] Posting username:', username);
                
                const response = await fetch(getEmailUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ username: username })
                });
                
                console.log('🔐 [GET-EMAIL RESPONSE]', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok
                });
                
                const data = await response.json();
                console.log('🔐 [GET-EMAIL DATA]', data);
                
                if (!data.success) {
                    console.error('❌ [GET-EMAIL FAILED]', data.message);
                    document.getElementById('usernameError').textContent = data.message || 'Username not found - "' + username + '" does not exist';
                    document.getElementById('usernameError').classList.add('show');
                    document.getElementById('userUsername').classList.add('error');
                    return;
                }
                email = data.email;
                console.log('✅ [GET-EMAIL SUCCESS] Email:', email);
            } catch (error) {
                console.error('❌ [GET-EMAIL ERROR]', error);
                document.getElementById('usernameError').textContent = 'Network error. Please check your connection.';
                document.getElementById('usernameError').classList.add('show');
                return;
            }
        } else {
            console.log('🔐 [METHOD] Email provided directly');
        }
        
        // Call API login endpoint with email
        const loginUrl = `${apiUrl}/auth/login`;
        console.log('🔐 [LOGIN REQUEST]', {url: loginUrl, email: email, passwordLength: pwd.length});
        
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: email,
                password: pwd
            })
        });
        
        console.log('🔐 [LOGIN RESPONSE]', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: {
                'content-type': response.headers.get('content-type'),
                'access-control-allow-origin': response.headers.get('access-control-allow-origin')
            }
        });
        
        const data = await response.json();
        
        console.log('🔐 [LOGIN DATA]', {
            success: data.success,
            message: data.message,
            hasData: !!data.data,
            hasToken: !!(data.data && data.data.access_token),
            tokenLength: data.data && data.data.access_token ? data.data.access_token.length : 0,
            username: data.data && data.data.username,
            serialno: data.data && data.data.serialno
        });
        
        if(data.success && data.data) {
            console.log('✅ [LOGIN SUCCESS] Login successful');
            
            // Handle missing token - create a fallback token if API didn't return one
            let token = data.data.access_token;
            if (!token) {
                console.warn('⚠️  [FALLBACK TOKEN] API did not return access_token, creating fallback');
                token = 'fallback_' + btoa(JSON.stringify({
                    user: data.data.username || username,
                    time: Date.now()
                }));
            }
            
            // Store token and user info
            localStorage.setItem('bvrit_access_token', token);
            localStorage.setItem('bvrit_current_user', data.data.username || username);
            localStorage.setItem('bvrit_user_id', data.data.serialno || data.data.user_id);
            
            // Store user type for role-based redirects
            if (data.data.user_type) {
                localStorage.setItem('bvrit_user_type', data.data.user_type);
                localStorage.setItem('bvrit_is_admin', data.data.user_type === 'admin' ? 'true' : 'false');
            }
            
            console.log('✅ [STORAGE SUCCESS] Items stored in localStorage');
            console.log('  - Token length:', token.length);
            console.log('  - Username:', data.data.username || username);
            console.log('  - User ID:', data.data.serialno || data.data.user_id);
            console.log('  - User Type:', data.data.user_type);
            
            const s=document.getElementById('loginSuccess');
            s.textContent=`Welcome ${data.data.username || username}!`;
            s.style.background='';
            s.style.color='';
            s.classList.add('show');
            
            currentUsername = data.data.username || username;
            isLoggedIn = true;
            
            // Close modal before redirecting
            closeLoginModal();
            
            // Determine redirect based on user type
            let redirectUrl = 'order-type.html?auth=1&t=' + Date.now();
            if (data.data.user_type === 'admin') {
                redirectUrl = 'admin.html';
                console.log('✅ [ADMIN LOGIN] Redirecting to admin panel');
            } else {
                console.log('✅ [USER LOGIN] Redirecting to order type selection');
            }
            
            // Redirect after storage is confirmed with longer delay
            setTimeout(()=>{ 
                console.log('✅ Redirecting to:', redirectUrl);
                window.location.href = redirectUrl; 
            }, 1000);
        } else {
            console.error('❌ [LOGIN FAILED]', {
                success: data.success,
                message: data.message,
                dataExists: !!data.data
            });
            
            let displayMsg = data.message || 'Invalid credentials';
            if (!data.success) {
                displayMsg = data.message || 'Login failed. Please check your credentials.';
            } else if (!data.data) {
                displayMsg = 'Server error: Invalid response. Please try again.';
                console.error('❌ [MISSING DATA]', 'Server returned success but no data object');
            }
            
            document.getElementById('passwordError').textContent = displayMsg;
            document.getElementById('passwordError').classList.add('show');
            document.getElementById('userPassword').classList.add('error');
        }
    } catch(error) {
        console.error('❌ [CATCH ERROR]', {
            type: error.name,
            message: error.message,
            stack: error.stack.substring(0, 200)
        });
        
        let displayMsg = 'Login failed. Please try again.';
        if (error.message.includes('fetch')) {
            displayMsg = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('JSON')) {
            displayMsg = 'Server returned invalid response. Please try again.';
        }
        
        document.getElementById('passwordError').textContent = displayMsg;
        document.getElementById('passwordError').classList.add('show');
        document.getElementById('userPassword').classList.add('error');
    }
}

// Signup helpers
function openSignupModal(){ document.getElementById('signupModal').classList.add('show'); }
function closeSignupModal(){
    document.getElementById('signupModal').classList.remove('show');
    const u=document.getElementById('signupUsername'); if(u) u.value='';
    const e=document.getElementById('signupEmail'); if(e) e.value='';
    const p=document.getElementById('signupPassword'); if(p) p.value='';
    const cp=document.getElementById('signupConfirmPassword'); if(cp) cp.value='';
    const su=document.getElementById('signupUsernameError'); if(su) su.classList.remove('show');
    const se=document.getElementById('signupEmailError'); if(se) se.classList.remove('show');
    const sp=document.getElementById('signupPasswordError'); if(sp) sp.classList.remove('show');
    const scp=document.getElementById('signupConfirmPasswordError'); if(scp) scp.classList.remove('show');
    const s=document.getElementById('signupSuccess'); if(s){s.classList.remove('show'); s.textContent=''}
}
// Switch between login and signup
function switchToSignup(){
    closeLoginModal();
    setTimeout(()=> openSignupModal(), 300);
}
function switchToLogin(){
    closeSignupModal();
    setTimeout(()=> openLoginModal(), 300);
}
function handleSignup(e){
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pwd = document.getElementById('signupPassword').value;
    const confirmPwd = document.getElementById('signupConfirmPassword').value;
    
    console.log('=== SIGNUP DEBUG ===');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', pwd);
    
    // clear errors
    const su=document.getElementById('signupUsernameError'); if(su) su.classList.remove('show');
    const se=document.getElementById('signupEmailError'); if(se) se.classList.remove('show');
    const sp=document.getElementById('signupPasswordError'); if(sp) sp.classList.remove('show');
    const scp=document.getElementById('signupConfirmPasswordError'); if(scp) scp.classList.remove('show');

    let hasError=false;
    const uv = validateUsername(username);
    console.log('Username validation:', uv.valid, uv.message);
    if(!uv.valid){document.getElementById('signupUsernameError').textContent=uv.message;document.getElementById('signupUsernameError').classList.add('show');hasError=true}
    
    const ev = validateEmailStrict(email);
    console.log('Email validation:', ev.valid, ev.message);
    if(!ev.valid){document.getElementById('signupEmailError').textContent=ev.message;document.getElementById('signupEmailError').classList.add('show');hasError=true}
    
    const pv = validatePasswordSimple(pwd);
    console.log('Password validation:', pv.valid, pv.message);
    if(!pv.valid){document.getElementById('signupPasswordError').textContent=pv.message;document.getElementById('signupPasswordError').classList.add('show');hasError=true}
    
    if(pwd !== confirmPwd){
        console.log('Password mismatch');
        document.getElementById('signupConfirmPasswordError').textContent='Passwords do not match';
        document.getElementById('signupConfirmPasswordError').classList.add('show');
        hasError=true
    }
    
    console.log('Has error?', hasError);
    if(hasError) return;

    // Call API to register user instead of storing in localStorage
    registerViaAPI(username, email, pwd);
}

async function registerViaAPI(username, email, password) {
    try {
        // Detect API URL based on environment
        const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost/canteen-api/api' 
            : 'https://canteen-prebooking.onrender.com/api';
        
        console.log('📝 [SIGNUP START] Sending to:', apiUrl + '/auth/register');
        console.log('📝 [SIGNUP] Username:', username);
        console.log('📝 [SIGNUP] Email:', email);
        console.log('📝 [SIGNUP] Password length:', password.length);
        
        const response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('📝 [SIGNUP RESPONSE]', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            success: data.success,
            message: data.message,
            hasData: !!data.data,
            hasToken: data.data && !!data.data.access_token,
            errors: data.errors
        });
        console.log('📝 [SIGNUP FULL DATA]:', data);
        
        if (response.ok && data.success) {
            console.log('✅ [SIGNUP SUCCESS] Registration successful');
            // Registration successful
            if (data.data && data.data.access_token) {
                localStorage.setItem('bvrit_access_token', data.data.access_token);
            }
            if (data.data && data.data.serialno) {
                localStorage.setItem('bvrit_user_id', data.data.serialno);
            }
            localStorage.setItem('bvrit_current_user', username);
            
            // Store user type for role-based redirects
            if (data.data && data.data.user_type) {
                localStorage.setItem('bvrit_user_type', data.data.user_type);
                localStorage.setItem('bvrit_is_admin', data.data.user_type === 'admin' ? 'true' : 'false');
            }
            
            // Close modal
            const modal = document.getElementById('signupModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            alert('✅ Signup successful! Redirecting...');
            
            // Determine redirect based on user type
            let redirectUrl = 'order-type.html?auth=1&t=' + Date.now();
            if (data.data && data.data.user_type === 'admin') {
                redirectUrl = 'admin.html';
                console.log('✅ [SIGNUP] Admin registration - redirecting to admin panel');
            }
            
            // Longer delay to ensure localStorage is persisted
            setTimeout(() => {
                console.log('✅ [SIGNUP] Redirecting to:', redirectUrl);
                console.log('✅ [SIGNUP] Token in storage:', !!localStorage.getItem('bvrit_access_token'));
                window.location.href = redirectUrl;
            }, 1000);
        } else if (!response.ok) {
            console.error('❌ [SIGNUP] HTTP Error:', response.status, response.statusText);
            console.error('❌ [SIGNUP] Response body:', data);
            let errorMsg = `Server Error (${response.status}): `;
            if (data.message) {
                errorMsg += data.message;
            } else if (data.errors) {
                let errors = [];
                for (let field in data.errors) {
                    errors.push(`${field}: ${data.errors[field].join(', ')}`);
                }
                errorMsg += errors.join('\n');
            } else {
                errorMsg += 'Unknown error. Check console for details.';
            }
            alert(errorMsg);
        } else if (data.errors) {
            console.error('❌ [SIGNUP] Validation errors:', data.errors);
            let errorMsg = 'Validation failed:\n';
            for (let field in data.errors) {
                errorMsg += `${field}: ${data.errors[field].join(', ')}\n`;
            }
            alert(errorMsg);
        } else if (data.message) {
            console.error('❌ [SIGNUP] Error message:', data.message);
            alert('Error: ' + data.message);
        } else {
            console.error('❌ [SIGNUP] Unexpected response:', data);
            alert('Signup failed. Check console for details.');
    } catch (error) {
        console.error('❌ [SIGNUP NETWORK ERROR]', error);
        alert('Connection error: ' + error.message + '. Make sure the backend is running at ' + 
              (window.location.hostname === 'localhost' ? 'http://localhost/canteen-api/api' : 'https://canteen-prebooking.onrender.com/api'));
    }
}

// Enable cart and buttons after login
function enableCartAndButtons(){
    isLoggedIn = true;
    document.getElementById('cartFab').classList.add('show');
    // Show Add to Cart buttons, hide Login to Order buttons
    document.querySelectorAll('.add-btn').forEach(btn => btn.classList.add('show'));
    document.querySelectorAll('.login-to-order').forEach(btn => btn.style.display = 'none');
    // Update menu hint
    const hint = document.getElementById('menuLoginHint');
    if(hint) hint.innerHTML = `✅ Welcome! You can now add items to your cart.`;
}

// Handle Order Now button click
function handleOrderNow(){
    // Development mode: Remove operating hours check for testing
    // Note: Operating hours validation happens server-side
    
    if(!isLoggedIn){
        openLoginModal();
    } else {
        document.getElementById('menuGrid').scrollIntoView({behavior:'smooth'});
    }
}

// small util
function escapeHtml(str){return String(str).replace(/[&<>\"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;"}[m]})}

// ========== DAILY SPECIALS SYSTEM ==========
const dailySpecials = {
    0: { // Sunday - Family Day
        dayName: "SUNDAY",
        theme: "Family Feast Day 👨‍👩‍👧‍👦",
        mainOffer: "Family Combo: Buy 3 meals, get 1 FREE!",
        gradient: "linear-gradient(135deg,#e91e63,#f06292)",
        offers: [
            { icon: "�", title: "Biryani Special", desc: "Biryani + Drink ₹110", bg: "linear-gradient(135deg,#fff8e1,#ffecb3)", titleColor: "#f57c00", descColor: "#795548" },
            { icon: "🍱", title: "Thali + Dessert", desc: "Premium Combo ₹130", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "☕", title: "Combo + Tea", desc: "FREE Tea with combo", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "👨‍👩‍👧", title: "Family Pack", desc: "4 Meals ₹350", bg: "linear-gradient(135deg,#fce4ec,#f8bbd9)", titleColor: "#c2185b", descColor: "#880e4f" }
        ],
        heroText: "🎉 Sunday Special: <strong style='color:#e91e63'>Family Combo - Buy 3 Get 1 FREE</strong> | All day offer!"
    },
    1: { // Monday - Motivation Monday
        dayName: "MONDAY",
        theme: "Motivation Monday ☕",
        mainOffer: "FREE Coffee with any meal above ₹80!",
        gradient: "linear-gradient(135deg,#4caf50,#81c784)",
        offers: [
            { icon: "🌅", title: "Breakfast Deal", desc: "Breakfast + Coffee ₹50", bg: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", titleColor: "#2e7d32", descColor: "#1b5e20" },
            { icon: "🍱", title: "Thali + Coffee", desc: "Premium Thali Combo", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "🥪", title: "Snack + Tea", desc: "Tea + Samosa ₹25", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "☕", title: "Coffee FREE", desc: "With meals >₹80", bg: "linear-gradient(135deg,#efebe9,#d7ccc8)", titleColor: "#5d4037", descColor: "#3e2723" }
        ],
        heroText: "☕ Monday Motivation: <strong style='color:#4caf50'>FREE Coffee</strong> with meals above ₹80!"
    },
    2: { // Tuesday - Tasty Tuesday
        dayName: "TUESDAY",
        theme: "Tasty Tuesday 🍛",
        mainOffer: "25% OFF on all Biryani variants!",
        gradient: "linear-gradient(135deg,#ff9800,#ffb74d)",
        offers: [
            { icon: "🍚", title: "Veg Biryani", desc: "Special Price ₹75", bg: "linear-gradient(135deg,#fff8e1,#ffecb3)", titleColor: "#f57c00", descColor: "#e65100" },
            { icon: "🍛", title: "Special Biryani", desc: "Premium ₹90", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "🥗", title: "Biryani + Raita", desc: "Combo ₹85", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "🔥", title: "All Biryani", desc: "25% OFF Today", bg: "linear-gradient(135deg,#fff3e0,#ffe0b2)", titleColor: "#e65100", descColor: "#bf360c" }
        ],
        heroText: "🍛 Tasty Tuesday: <strong style='color:#ff9800'>25% OFF</strong> on all Biryani variants!"
    },
    3: { // Wednesday - Wellness Wednesday
        dayName: "WEDNESDAY",
        theme: "Wellness Wednesday 🥗",
        mainOffer: "Healthy options at 20% OFF!",
        gradient: "linear-gradient(135deg,#8bc34a,#aed581)",
        offers: [
            { icon: "🥗", title: "Fresh Salad", desc: "Salad Bowl ₹40", bg: "linear-gradient(135deg,#f1f8e9,#dcedc8)", titleColor: "#558b2f", descColor: "#33691e" },
            { icon: "🍱", title: "Diet Thali", desc: "Healthy Thali ₹100", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "🍹", title: "Fruit + Juice", desc: "Fresh Combo ₹45", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "💚", title: "Healthy Menu", desc: "20% OFF All", bg: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", titleColor: "#2e7d32", descColor: "#1b5e20" }
        ],
        heroText: "🥗 Wellness Wednesday: <strong style='color:#8bc34a'>20% OFF</strong> on healthy menu items!"
    },
    4: { // Thursday - Thali Thursday
        dayName: "THURSDAY",
        theme: "Thali Thursday 🍱",
        mainOffer: "Premium Thali at ₹99 for everyone!",
        gradient: "linear-gradient(135deg,#9c27b0,#ba68c8)",
        offers: [
            { icon: "🍽️", title: "Mini Thali", desc: "Budget Thali ₹70", bg: "linear-gradient(135deg,#fff8e1,#ffecb3)", titleColor: "#f57c00", descColor: "#795548" },
            { icon: "🍱", title: "Premium Thali", desc: "Special ₹99", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "⭐", title: "Regular Thali", desc: "Full Meal ₹85", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "🔥", title: "All Thalis", desc: "₹99 Today Only", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#4a148c" }
        ],
        heroText: "🍱 Thali Thursday: <strong style='color:#9c27b0'>Premium Thali ₹99</strong> for everyone!"
    },
    5: { // Friday - Fried-day Friday
        dayName: "FRIDAY",
        theme: "Fry-Day Friday 🍟",
        mainOffer: "All fried snacks at FLAT 30% OFF!",
        gradient: "linear-gradient(135deg,#f44336,#ef5350)",
        offers: [
            { icon: "🥟", title: "Samosa + Vada", desc: "Combo ₹30", bg: "linear-gradient(135deg,#ffebee,#ffcdd2)", titleColor: "#c62828", descColor: "#b71c1c" },
            { icon: "🍟", title: "Snack Platter", desc: "Assorted ₹60", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "☕", title: "Tea + Pakoda", desc: "Evening Snack ₹35", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "🔥", title: "All Snacks", desc: "30% OFF Today", bg: "linear-gradient(135deg,#ffebee,#ffcdd2)", titleColor: "#d32f2f", descColor: "#c62828" }
        ],
        heroText: "🍟 Fry-Day Friday: <strong style='color:#f44336'>30% OFF</strong> on all fried snacks!"
    },
    6: { // Saturday - Sweet Saturday
        dayName: "SATURDAY",
        theme: "Sweet Saturday 🍰",
        mainOffer: "FREE Dessert with meals above ₹100!",
        gradient: "linear-gradient(135deg,#e91e63,#f48fb1)",
        offers: [
            { icon: "🍦", title: "Ice Cream", desc: "Special ₹25", bg: "linear-gradient(135deg,#fce4ec,#f8bbd9)", titleColor: "#c2185b", descColor: "#880e4f" },
            { icon: "🍮", title: "Gulab Jamun", desc: "FREE with meal", bg: "linear-gradient(135deg,#e3f2fd,#bbdefb)", titleColor: "#1976d2", descColor: "#455a64" },
            { icon: "🍩", title: "Jalebi + Tea", desc: "Combo ₹40", bg: "linear-gradient(135deg,#f3e5f5,#e1bee7)", titleColor: "#7b1fa2", descColor: "#6a1b9a" },
            { icon: "🎁", title: "Free Dessert", desc: "With meals >₹100", bg: "linear-gradient(135deg,#fce4ec,#f8bbd9)", titleColor: "#c2185b", descColor: "#880e4f" }
        ],
        heroText: "🍰 Sweet Saturday: <strong style='color:#e91e63'>FREE Dessert</strong> with meals above ₹100!"
    }
};

function loadDailySpecials() {
    const today = new Date().getDay();
    const special = dailySpecials[today];
    
    // Update badge
    const badge = document.getElementById('dailyBadge');
    // Daily special removed - using highlights instead
}

function updateCanteenStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const statusDiv = document.getElementById('canteenStatus');
    if(statusDiv) {
        if(currentHour >= 7 && currentHour < 21) {
            statusDiv.style.background = 'linear-gradient(90deg,#4caf50,#8bc34a)';
            statusDiv.innerHTML = '<span>✅</span> OPEN NOW: 7:00 AM - 9:00 PM';
        } else {
            statusDiv.style.background = 'linear-gradient(90deg,#f44336,#e53935)';
            statusDiv.innerHTML = '<span>🚫</span> CLOSED: Opens at 7:00 AM';
        }
    }
}

// Check if user is already logged in from localStorage
function restoreLoginState() {
    const token = localStorage.getItem('bvrit_access_token');
    const username = localStorage.getItem('bvrit_current_user');
    const userType = localStorage.getItem('bvrit_user_type');
    
    if (token && username) {
        console.log('✅ [RESTORE LOGIN] Found token in localStorage');
        console.log('   Username:', username);
        console.log('   User Type:', userType);
        
        isLoggedIn = true;
        currentUsername = username;
        
        if (userType === 'admin') {
            isAdmin = true;
            localStorage.setItem('bvrit_is_admin', 'true');
        }
        
        // Re-enable cart and order buttons
        enableCartAndButtons();
        
        console.log('✅ [RESTORE LOGIN] State restored successfully');
        console.log('   isLoggedIn:', isLoggedIn);
        console.log('   currentUsername:', currentUsername);
    } else {
        console.log('ℹ️ [NO LOGIN STATE] No token found - user not logged in');
        isLoggedIn = false;
    }
}

// init
restoreLoginState();
updateCartUI();
loadDailySpecials();
updateCanteenStatus();
