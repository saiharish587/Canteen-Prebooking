// Check if user is logged in
const currentUser = localStorage.getItem('bvrit_current_user');
const registeredUsers = JSON.parse(localStorage.getItem('bvrit_users') || '{}');

if(!currentUser || !registeredUsers[currentUser]){
    localStorage.removeItem('bvrit_current_user');
    alert('Please login to proceed.');
    window.location.href = 'index.html';
}

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

// Initialize on page load
initGreeting();
