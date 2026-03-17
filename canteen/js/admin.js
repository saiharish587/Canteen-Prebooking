// Check if user is admin
const isAdmin = localStorage.getItem('bvrit_is_admin') === 'true';
if(!isAdmin){
    alert('Access denied. Admin credentials required.');
    window.location.href = 'index.html';
}

let allItems = [];
let filteredCategory = 'all';

// Extract menu items from menu.html and create menu structure
function createMenuItemsFromMenu(){
    const menuItems = [
        // Breakfast
        { id: 1, name: 'Idli (4 pcs)', category: 'breakfast', price: 35, available: true, description: 'South Indian favorite', image: "./images/idly.jpg" },
        { id: 2, name: 'Plain Dosa', category: 'breakfast', price: 45, available: true, description: 'Crispy rice crepe with sambar & chutney', image: './images/dosa.jpg' },
        { id: 3, name: 'Masala Dosa', category: 'breakfast', price: 50, available: true, description: 'Crispy dosa with spiced potato filling', image: './images/m dosa.jpg' },
        { id: 4, name: 'Puri (4 pcs)', category: 'breakfast', price: 35, available: true, description: 'Puri with potato curry', image: './images/puri.jpg' },
        { id: 5, name: 'Upma', category: 'breakfast', price: 30, available: true, description: 'Tasty and healthy', image: './images/upma.jpg' },
        { id: 6, name: 'Pesarattu', category: 'breakfast', price: 50, available: true, description: 'Green gram dosa', image: './images/peasarattu.jpg' },
        { id: 7, name: 'Poha', category: 'breakfast', price: 30, available: true, description: 'Flattened rice with peanuts & onions', image: './images/poha.jpg' },
        { id: 8, name: 'Egg Dosa', category: 'breakfast', price: 55, available: true, description: 'Dosa topped with scrambled egg', image: './images/egg dosa.jpg' },
        
        // Meals
        { id: 9, name: 'Veg Meals (Full)', category: 'meals', price: 100, available: true, description: 'Unlimited Rice + Veg Curries', image: './images/veg meals.jpg' },
        { id: 10, name: 'Veg Meals (Mini)', category: 'meals', price: 70, available: true, description: 'Limited Rice + Veg Curry', image: './images/veg meals.jpg' },
        { id: 11, name: 'Curd Rice', category: 'meals', price: 50, available: true, description: 'Cool yogurt rice with pickle', image: './images/curd_rice.jpg' },
        { id: 12, name: 'Sambar Rice', category: 'meals', price: 50, available: true, description: 'Rice mixed with sambar', image: './images/sambar_rice.jpg' },
        { id: 13, name: 'Lemon Rice', category: 'meals', price: 50, available: true, description: 'Tangy lemon flavored rice', image: './images/lemon_rice.jpg' },
        { id: 14, name: 'Pulihora', category: 'meals', price: 50, available: true, description: 'Traditional tamarind rice', image: './images/pulihora.jpg' },
        { id: 15, name: 'Chapati (2 pcs)', category: 'meals', price: 20, available: true, description: 'Soft chapatis', image: './images/chapatis.jpg' },
        { id: 16, name: 'Roti with Dal', category: 'meals', price: 55, available: true, description: '2 Rotis with dal fry', image: './images/roti.jpg' },
        { id: 17, name: 'Chicken Meals (Full)', category: 'meals', price: 130, available: true, description: 'Unlimited Rice + Chicken Curry', image: './images/chicken_meals.avif' },
        { id: 18, name: 'Chicken Meals (Mini)', category: 'meals', price: 105, available: true, description: 'Limited Rice + Chicken Curry', image: './images/chicken_meals.avif' },
        { id: 19, name: 'Chicken + Chapati', category: 'meals', price: 100, available: true, description: 'Chapatis with chicken curry', image: './images/chicken_chapati.jpg' },
        
        // Veg
        { id: 20, name: 'Veg Biryani', category: 'veg', price: 100, available: true, description: 'Fragrant rice with vegetables', image: './images/veg_biryani.jpg' },
        { id: 21, name: 'Veg Fried Rice', category: 'veg', price: 60, available: true, description: 'Stir-fried rice with vegetables', image: './images/veg.jpg' },
        { id: 22, name: 'Veg Noodles', category: 'veg', price: 60, available: true, description: 'Hakka noodles with vegetables', image: './images/veg_noodles.jpg' },
        { id: 23, name: 'Veg Manchuria', category: 'veg', price: 60, available: true, description: 'Crispy vegetable balls in sauce', image: './images/360_F_324567329_VIPsg4s4kWkvqJviANcIgeYPG602kN56.jpg' },
        { id: 24, name: 'Paneer Curry', category: 'veg', price: 80, available: true, description: 'Cottage cheese in spicy gravy', image: './images/paneer-curry-recipe.jpg' },
        { id: 25, name: 'Gobi Manchuria', category: 'veg', price: 70, available: true, description: 'Crispy cauliflower in spicy sauce', image: './images/gobi-manchurian-cauliflower-manchurian.jpg' },
        
        // Non-Veg
        { id: 26, name: 'Chicken Biryani', category: 'nonveg', price: 140, available: true, description: 'Hyderabadi style biryani', image: './images/Chicken-Biryani-Featured.jpg' },
        { id: 27, name: 'Egg Biryani', category: 'nonveg', price: 90, available: true, description: 'Rice with boiled eggs', image: './images/Egg-Biryani-Featured-1.jpg' },
        { id: 28, name: 'Chicken Fried Rice', category: 'nonveg', price: 80, available: true, description: 'Fried rice with chicken', image: './images/Shutterstock_1043177881.jpg' },
        { id: 29, name: 'Egg Fried Rice', category: 'nonveg', price: 80, available: true, description: 'Fried rice with scrambled eggs', image: './images/Egg-fried-rice-2.jpg' },
        { id: 30, name: 'Chicken Noodles', category: 'nonveg', price: 80, available: true, description: 'Hakka noodles with chicken', image: './images/1200-by-1200-images-5.jpg' },
        
        // Snacks
        { id: 31, name: 'Samosa (2 pcs)', category: 'snacks', price: 20, available: true, description: 'Crispy pastry with potato', image: './images/61050397.avif' },
        { id: 32, name: 'Veg Puff (2 pcs)', category: 'snacks', price: 30, available: true, description: 'Flaky puff with veg filling', image: './images/CopyofLSD07524.webp' },
        { id: 33, name: 'Egg Puff (2 pcs)', category: 'snacks', price: 35, available: true, description: 'Puff pastry with egg', image: './images/Kerala-Egg-Puffs.webp' },
        { id: 34, name: 'Mirchi Bajji (4 pcs)', category: 'snacks', price: 30, available: true, description: 'Stuffed chili fritters', image: './images/Mirapakaya-Bajji-2.jpg' },
        { id: 35, name: 'Punugulu (6 pcs)', category: 'snacks', price: 20, available: true, description: 'Crispy rice dumplings', image: './images/15706112943_9e29e241d8_z.jpg' },
        { id: 36, name: 'Maggi Noodles', category: 'snacks', price: 40, available: true, description: 'Hot masala maggi', image: './images/hq720.jpg' },
        
        // Beverages
        { id: 37, name: 'Tea', category: 'beverages', price: 15, available: true, description: 'Hot masala chai', image: './images/ginger-tea-recipe-3.webp' },
        { id: 38, name: 'Coffee', category: 'beverages', price: 25, available: true, description: 'Traditional filter coffee', image: './images/tips-to-recognize-good-quality-coffee-424970.webp' },
        { id: 39, name: 'Thumps Up', category: 'beverages', price: 30, available: true, description: 'Energizing cola drink - 400ml', image: './images/thums-up-250.webp' },
        { id: 40, name: 'Mountain Dew', category: 'beverages', price: 30, available: true, description: 'Citrus soda with intense flavor - 400ml', image: './images/mountain-dew-2lt-1702624298919_SKU-1666_0.webp' },
        { id: 41, name: 'Pulpy', category: 'beverages', price: 30, available: true, description: 'Fruit juice with pulp - 400ml', image: './images/61D+jP7XKBL.jpg' },
        { id: 42, name: 'Maaza', category: 'beverages', price: 30, available: true, description: 'Mango fruit juice - 400ml', image: './images/maaza.jpg' },
        { id: 43, name: 'Nimboz', category: 'beverages', price: 30, available: true, description: 'Citrus flavored drink - 400ml', image: './images/265893_8-7-up-nimbooz-soft-drink-with-real-lemon-juice.webp' },
        { id: 44, name: 'Badam Milk', category: 'beverages', price: 45, available: true, description: 'Nutritious almond milk drink', image: './images/1276fff5-c071-45c2-88a5-fc5f0f05f2a4-SKU017161.webp' },
    ];
    return menuItems;
}

// Initialize menu items from localStorage or use menu items
function initializeMenuItems(){
    let savedItems = JSON.parse(localStorage.getItem('bvrit_menu_items') || 'null');
    const defaultItems = createMenuItemsFromMenu();
    
    if(!savedItems){
        allItems = defaultItems;
        saveMenuItems();
    } else {
        // Update saved items with images from defaults if missing
        allItems = savedItems.map(saved => {
            const defaultItem = defaultItems.find(d => d.id === saved.id || d.name === saved.name);
            if(defaultItem && !saved.image){
                saved.image = defaultItem.image;
            }
            return saved;
        });
        saveMenuItems();
    }
    
    renderItems();
}

// Reset menu to defaults with all images
function resetToDefaults(){
    if(confirm('Reset all menu items to defaults? This will restore original prices and images.')){
        localStorage.removeItem('bvrit_menu_items');
        allItems = createMenuItemsFromMenu();
        saveMenuItems();
        renderItems();
        alert('Menu reset to defaults!');
    }
}

// Save all changes with visual feedback
function saveAllChanges(){
    saveMenuItems();
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Saved!';
    btn.style.background = 'linear-gradient(90deg,#4caf50,#66bb6a)';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'linear-gradient(90deg,#2196f3,#1976d2)';
    }, 2000);
}

// Save menu items to localStorage
function saveMenuItems(){
    localStorage.setItem('bvrit_menu_items', JSON.stringify(allItems));
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


// Update price
function updatePrice(id, newPrice){
    const item = allItems.find(i => i.id === id);
    if(item){
        item.price = parseFloat(newPrice) || item.price;
        saveMenuItems();
        renderItems();
    }
}

// Toggle availability
function toggleAvailability(id){
    const item = allItems.find(i => i.id === id);
    if(item){
        item.available = !item.available;
        saveMenuItems();
        renderItems();
    }
}

// Delete item
function deleteItem(id){
    if(confirm('Are you sure you want to delete this item?')){
        allItems = allItems.filter(i => i.id !== id);
        saveMenuItems();
        renderItems();
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
    const image = document.getElementById('newItemImage').value.trim();

    if(!name || !category || !price){
        alert('Please fill all required fields');
        return;
    }

    const newId = Math.max(...allItems.map(i => i.id), 0) + 1;
    allItems.push({
        id: newId,
        name,
        category,
        price,
        description: description || 'No description',
        image: image || './images/default.jpg',
        available: true
    });

    saveMenuItems();
    renderItems();
    closeAddItemModal();
    alert('Item added successfully!');
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
    localStorage.removeItem('bvrit_current_user');
    localStorage.removeItem('bvrit_is_admin');
    window.location.href = 'index.html';
}

// Initialize
initializeMenuItems();
