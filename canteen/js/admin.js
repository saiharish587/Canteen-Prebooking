// Check authentication and verify admin access via API
let allItems = [];
let filteredCategory = 'all';
let isLoading = false;

// Verify admin access
async function verifyAdminAccess() {
    try {
        const token = localStorage.getItem('bvrit_access_token');
        if (!token) {
            alert('Access denied. Please login as admin.');
            window.location.href = 'index.html';
            return false;
        }
        
        // Verify user is admin via API
        const response = await apiService.getMe();
        if (response.data?.user_type !== 'admin') {
            alert('Access denied. Admin credentials required.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Admin verification failed:', error);
        alert('Session expired. Please login again.');
        window.location.href = 'index.html';
        return false;
    }
}

// Load menu items from API
async function loadMenuItemsFromAPI() {
    if (isLoading) return;
    isLoading = true;
    try {
        const response = await apiService.getAdminMenuItems();
        if (response.data) {
            allItems = Array.isArray(response.data) ? response.data : response.data.items || [];
            renderItems();
        } else {
            console.warn('No menu items returned from API');
            allItems = [];
            renderItems();
        }
    } catch (error) {
        console.error('Failed to load menu items:', error);
        alert('Error loading menu items. Please refresh the page.');
    } finally {
        isLoading = false;
    }
}

// Reset menu to defaults (not applicable with API - show message)
function resetToDefaults(){
    alert('With API integration, items are managed directly from the database. Please use the menu management features to update items.');
}

// Save all changes with visual feedback
function saveAllChanges(){
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Saved!';
    btn.style.background = 'linear-gradient(90deg,#4caf50,#66bb6a)';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'linear-gradient(90deg,#2196f3,#1976d2)';
    }, 2000);
}

// No longer needed - API handles storage
function saveMenuItems(){
    // Replace with API sync if needed
}

// Render menu items
function renderItems(){
    const grid = document.getElementById('itemsGrid');
    let itemsToShow = allItems;

    // Apply filters
    if(filteredCategory === 'available'){
        itemsToShow = allItems.filter(item => item.available);
    } else if(filteredCategory === 'unavailable'){
        itemsToShow = allItems.filter(item => !item.available);
    } else if(filteredCategory !== 'all'){
        itemsToShow = allItems.filter(item => item.category === filteredCategory);
    }

    // Apply search filter
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    if(searchTerm){
        itemsToShow = itemsToShow.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.category.toLowerCase().includes(searchTerm)
        );
    }

    if(itemsToShow.length === 0){
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📭</div><p>No items found</p></div>';
        return;
    }

    grid.innerHTML = itemsToShow.map(item => {
        const imageUrl = item.image || './images/default.jpg';
        const html = `<div class="item-card ${!item.available ? 'unavailable' : ''}">
            <div class="item-image-container" data-item="${item.name}">
                <img src="${imageUrl}" alt="${item.name}" class="item-image" onload="this.classList.remove('failed')" onerror="this.classList.add('failed')">
                <div class="availability-badge ${!item.available ? 'unavailable' : ''}">
                    ${item.available ? '✓ Available' : '✕ Unavailable'}
                </div>
            </div>
            <div class="item-content">
                <div class="item-name">${item.name}</div>
                <div class="item-category">${item.category}</div>
                <div class="item-price-section">
                    <label class="item-price-label">Price: ₹</label>
                    <input type="number" class="item-price-input" value="${item.price}" onchange="updatePrice(${item.id}, this.value)">
                </div>
                <div class="item-controls">
                    <button class="control-btn toggle-btn" onclick="toggleAvailability(${item.id})">
                        ${item.available ? '🚫 Mark Unavailable' : '✅ Mark Available'}
                    </button>
                    <button class="control-btn delete-btn" onclick="deleteItem(${item.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>`;
        return html;
    }).join('');
}


// Update price via API
async function updatePrice(id, newPrice){
    const item = allItems.find(i => i.id === id);
    if(!item) return;
    
    try {
        await apiService.updateMenuItemPrice(id, parseFloat(newPrice));
        item.price = parseFloat(newPrice) || item.price;
        renderItems();
        showSuccessNotification('Price updated successfully');
    } catch (error) {
        console.error('Failed to update price:', error);
        alert('Failed to update price. Please try again.');
        renderItems(); // Revert UI
    }
}

// Toggle availability via API
async function toggleAvailability(id){
    const item = allItems.find(i => i.id === id);
    if(!item) return;
    
    try {
        await apiService.toggleMenuItemAvailability(id);
        item.available = !item.available;
        renderItems();
        showSuccessNotification(`Item marked as ${item.available ? 'available' : 'unavailable'}`);
    } catch (error) {
        console.error('Failed to toggle availability:', error);
        alert('Failed to update availability. Please try again.');
        renderItems(); // Revert UI
    }
}

// Delete item via API
async function deleteItem(id){
    if(!confirm('Are you sure you want to delete this item?')){
        return;
    }
    
    try {
        await apiService.deleteMenuItem(id);
        allItems = allItems.filter(i => i.id !== id);
        renderItems();
        showSuccessNotification('Item deleted successfully');
    } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
    }
}

// Filter by category
function filterByCategory(category){
    filteredCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderItems();
}

// Search functionality
document.getElementById('searchBox').addEventListener('input', () => {
    renderItems();
});

// Modal functions
function openAddItemModal(){
    document.getElementById('addItemModal').classList.add('show');
}

function closeAddItemModal(){
    document.getElementById('addItemModal').classList.remove('show');
    document.getElementById('addItemForm').reset();
}

function addNewItem(event){
    event.preventDefault();
    
    const name = document.getElementById('newItemName').value.trim();
    const category = document.getElementById('newItemCategory').value;
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const description = document.getElementById('newItemDescription').value.trim();

    if(!name || !category || !price){
        alert('Please fill all required fields');
        return;
    }

    addNewItemViaAPI(name, category, price, description);
}

async function addNewItemViaAPI(name, category, price, description){
    try {
        const itemData = {
            name,
            category,
            price: parseFloat(price),
            description: description || 'No description',
            is_available: true
        };
        
        const response = await apiService.createMenuItem(itemData);
        
        if (response.data) {
            allItems.push(response.data);
            renderItems();
            closeAddItemModal();
            showSuccessNotification('Item added successfully!');
        }
    } catch (error) {
        console.error('Failed to add item:', error);
        alert('Failed to add item: ' + (error.message || 'Unknown error'));
    }
}

// View menu page to check changes
function viewMenu(){
    // Save current changes before viewing
    saveMenuItems();
    // Set flag to show back to admin button in menu page
    localStorage.setItem('bvrit_admin_viewing_menu', 'true');
    // Open menu in new tab so admin can check changes
    window.open('menu.html', '_blank');
}

function logout(){
    apiService.logout().finally(() => {
        clearAllAuthData();
        window.location.href = 'index.html';
    });
}

// Helper function to show success notifications
function showSuccessNotification(message){
    console.log('✅ ' + message);
    // You can enhance this with a toast notification UI if needed
}

// Initialize
(async function(){
    const isAdmin = await verifyAdminAccess();
    if (isAdmin) {
        loadMenuItemsFromAPI();
    }
})();
