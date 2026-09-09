// Ban Ban Café - Main Application Logic & Advanced Features

// Application State
const state = {
    products: PRODUCTS,
    combos: COMBOS,
    reviews: REVIEWS,
    cart: JSON.parse(localStorage.getItem('banban_cart')) || [],
    favorites: JSON.parse(localStorage.getItem('banban_favorites')) || [],
    theme: localStorage.getItem('banban_theme') || 'light',
    coupon: JSON.parse(localStorage.getItem('banban_coupon')) || null,
    orders: JSON.parse(localStorage.getItem('banban_orders')) || [],
    reservations: JSON.parse(localStorage.getItem('banban_reservations')) || [],
    deliveryTip: 0,
    activeCategory: 'All',
    searchQuery: '',
    sortBy: 'popular',
    dietaryFilter: 'all',
    selectedProduct: null,
    currentOrderTrack: null,
    activeOrderTimer: null,
    soundEnabled: true
};

// Initialize App on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    applyTheme(state.theme);

    // Hide splash screen after progress bar completes
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.classList.add('hidden');
    }, 3200);

    // Initial Renders
    renderQuickCategories();
    renderCombos();
    renderMenu();
    renderPopularItems();
    renderReviews();
    updateCartUI();
    updateFavoritesCount();

    // Setup Animations & Observers
    setupScrollReveal();
    setupEventListeners();
});

// Theme Toggle
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('banban_theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    playSound(440, 0.1);
    showToast(`Switched to ${state.theme} mode`, 'info');
}

// Web Audio API Synthesized Sound Effects
function playSound(freq = 520, duration = 0.15, type = 'sine') {
    if (!state.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Audio fallback
    }
}

// Flying Add-to-Cart Item Animation
function animateFlyToCart(sourceElement, imageSrc) {
    const cartIcon = document.querySelector('.cart-badge-count');
    if (!cartIcon || !sourceElement) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imageSrc || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=100&q=80';
    img.className = 'flying-item';
    img.style.left = `${sourceRect.left + sourceRect.width / 2 - 20}px`;
    img.style.top = `${sourceRect.top + sourceRect.height / 2 - 20}px`;
    img.style.setProperty('--target-x', `${cartRect.left - sourceRect.left}px`);
    img.style.setProperty('--target-y', `${cartRect.top - sourceRect.top}px`);

    document.body.appendChild(img);

    playSound(600, 0.12);

    setTimeout(() => {
        img.remove();
        cartIcon.style.transform = 'scale(1.4)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }, 800);
}

// Confetti Burst Particle Canvas Animation
function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#d97736', '#5c3a21', '#2e7d32', '#ffb300', '#e53935'];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2 - 100,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rSpeed: (Math.random() - 0.5) * 10
        });
    }

    let opacity = 1;
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4;
            p.rotation += p.rSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        opacity -= 0.015;
        if (opacity > 0) {
            requestAnimationFrame(render);
        } else {
            canvas.remove();
        }
    }
    render();
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-check-circle';
    if (type === 'danger') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'info') icon = 'fa-info-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.4s forwards cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}

// Scroll Reveal Observer Setup
function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Quick Categories Render
function renderQuickCategories() {
    const container = document.getElementById('quick-categories-list');
    if (!container) return;

    const cats = [
        { name: 'Tea', icon: '🍵' },
        { name: 'Coffee', icon: '☕' },
        { name: 'Cold Beverages', icon: '🥤' },
        { name: 'Snacks', icon: '🥨' },
        { name: 'Sandwiches', icon: '🥪' },
        { name: 'Burgers', icon: '🍔' },
        { name: 'Desserts', icon: '🍩' },
        { name: 'Cakes', icon: '🍰' }
    ];

    container.innerHTML = cats.map(c => `
        <div class="quick-cat-card ${state.activeCategory === c.name ? 'active' : ''}" onclick="filterByCategory('${c.name}')">
            <div class="quick-cat-icon">${c.icon}</div>
            <div class="quick-cat-name">${c.name}</div>
        </div>
    `).join('');
}

// Combos Render
function renderCombos() {
    const container = document.getElementById('combos-grid');
    if (!container) return;

    container.innerHTML = state.combos.map(combo => `
        <div class="combo-card reveal">
            <span class="combo-badge">${combo.badge}</span>
            <img src="${combo.image}" alt="${combo.title}" class="combo-img" loading="lazy">
            <div class="combo-body">
                <h3 class="combo-title">${combo.title}</h3>
                <p class="combo-items">${combo.itemsText}</p>
                <div class="combo-footer">
                    <div class="combo-price-group">
                        <span class="combo-price">₹${combo.price}</span>
                        <span class="combo-orig-price">₹${combo.originalPrice}</span>
                    </div>
                    <button class="btn-primary" style="padding: 8px 16px; font-size: 0.85rem;" onclick="addComboToCart(event, '${combo.id}')">
                        <i class="fas fa-cart-plus"></i> Add Combo
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    setupScrollReveal();
}

// Popular / Most Loved Items Render
function renderPopularItems() {
    const container = document.getElementById('popular-grid');
    if (!container) return;

    const popular = state.products.filter(p => p.badge === 'Bestseller' || p.badge === 'Popular').slice(0, 4);
    container.innerHTML = popular.map(product => createProductCardHTML(product)).join('');
}

// Main Menu Render with Filter/Search/Sort
function renderMenu() {
    const container = document.getElementById('menu-products-grid');
    if (!container) return;

    let filtered = state.products.filter(p => {
        const matchesCat = state.activeCategory === 'All' || p.category === state.activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(state.searchQuery.toLowerCase());
        let matchesDiet = true;
        if (state.dietaryFilter === 'veg') matchesDiet = p.isVeg;
        if (state.dietaryFilter === 'vegan') matchesDiet = p.isVegan;
        if (state.dietaryFilter === 'eggless') matchesDiet = p.isEggless;

        return matchesCat && matchesSearch && matchesDiet;
    });

    if (state.sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else {
        filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state reveal">
                <i class="fas fa-search empty-icon"></i>
                <h3>No items found</h3>
                <p>No delicious items match your search "${state.searchQuery}". Try searching for something else!</p>
                <button class="btn-secondary" style="margin-top: 15px;" onclick="resetFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(product => createProductCardHTML(product)).join('');
    setupScrollReveal();
}

// Generate Product Card HTML
function createProductCardHTML(product) {
    const isFav = state.favorites.includes(product.id);
    const isDrink = product.category === 'Tea' || product.category === 'Coffee' || product.category === 'Cold Beverages';

    return `
        <div class="product-card reveal">
            <div class="product-img-container" onclick="openProductModal('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
                ${product.badge ? `<span class="badge-tag">${product.badge}</span>` : ''}
                <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${product.id}')">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span class="veg-indicator" title="Vegetarian"></span>
                    <span class="rating-pill"><i class="fas fa-star"></i> ${product.rating} (${product.reviewsCount})</span>
                </div>
                <h3 class="product-title" onclick="openProductModal('${product.id}')">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="price-tag">₹${product.price}</span>
                    <div style="display:flex; gap:6px;">
                        ${isDrink ? `<button class="customize-btn" onclick="openDrinkBuilderModal('${product.id}')" title="Customize Drink"><i class="fas fa-sliders-h"></i></button>` : ''}
                        <button class="add-cart-btn" onclick="addToCart(event, '${product.id}')">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Filter Handlers
function filterByCategory(category) {
    state.activeCategory = category;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderQuickCategories();
    renderMenu();
}

function handleSearch(query) {
    state.searchQuery = query;
    renderMenu();
}

function handleSort(sortBy) {
    state.sortBy = sortBy;
    renderMenu();
}

function handleDietary(diet) {
    state.dietaryFilter = diet;
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diet === diet);
    });
    renderMenu();
}

function resetFilters() {
    state.activeCategory = 'All';
    state.searchQuery = '';
    state.sortBy = 'popular';
    state.dietaryFilter = 'all';

    const searchInput = document.getElementById('search-menu-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.category === 'All'));
    document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.diet === 'all'));

    renderQuickCategories();
    renderMenu();
}

// Favorites Management
function toggleFavorite(id) {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
        state.favorites.splice(index, 1);
        showToast('Removed from Favorites', 'info');
    } else {
        state.favorites.push(id);
        const prod = state.products.find(p => p.id === id);
        playSound(700, 0.15);
        showToast(`❤️ Added ${prod ? prod.name : 'item'} to Favorites!`, 'success');
    }
    localStorage.setItem('banban_favorites', JSON.stringify(state.favorites));
    updateFavoritesCount();
    renderMenu();
    renderPopularItems();
}

function updateFavoritesCount() {
    const el = document.getElementById('fav-badge-count');
    if (el) el.innerText = state.favorites.length;
}

function openFavoritesModal() {
    const favProducts = state.products.filter(p => state.favorites.includes(p.id));
    const container = document.getElementById('favorites-grid');
    if (!container) return;

    if (favProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="far fa-heart empty-icon"></i>
                <h3>No favorites yet</h3>
                <p>Click the heart icon on any food item to save your favorite dishes!</p>
            </div>
        `;
    } else {
        container.innerHTML = favProducts.map(p => createProductCardHTML(p)).join('');
    }

    openModal('favorites-modal');
}

// Cart System
function addToCart(event, productId, quantity = 1, customName = null, customPrice = null) {
    const product = state.products.find(p => p.id === productId);
    if (!product && !customName) return;

    const name = customName || product.name;
    const price = customPrice || product.price;
    const image = product ? product.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80';

    if (event && event.currentTarget) {
        animateFlyToCart(event.currentTarget, image);
    }

    const existingIndex = state.cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
    } else {
        state.cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();
    showToast(`✓ ${name} added to cart!`, 'success');
}

function addComboToCart(event, comboId) {
    const combo = state.combos.find(c => c.id === comboId);
    if (!combo) return;

    if (event && event.currentTarget) {
        animateFlyToCart(event.currentTarget, combo.image);
    }

    combo.itemsToCart.forEach(item => {
        const existingIndex = state.cart.findIndex(i => i.id === item.id);
        if (existingIndex > -1) {
            state.cart[existingIndex].quantity += 1;
        } else {
            state.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1
            });
        }
    });

    saveCart();
    updateCartUI();
    showToast(`✓ Added ${combo.title} to cart!`, 'success');
}

function updateCartQuantity(productId, change) {
    const index = state.cart.findIndex(i => i.id === productId || i.name === productId);
    if (index === -1) return;

    state.cart[index].quantity += change;

    if (state.cart[index].quantity <= 0) {
        const item = state.cart[index];
        state.cart.splice(index, 1);
        showToast(`Removed ${item.name} from cart`, 'info');
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    const index = state.cart.findIndex(i => i.id === productId || i.name === productId);
    if (index > -1) {
        const item = state.cart[index];
        state.cart.splice(index, 1);
        saveCart();
        updateCartUI();
        showToast(`Removed ${item.name} from cart`, 'info');
    }
}

function clearCart() {
    if (state.cart.length === 0) return;
    state.cart = [];
    state.coupon = null;
    state.deliveryTip = 0;
    saveCart();
    updateCartUI();
    showToast('Cart cleared', 'info');
}

function setDeliveryTip(amount) {
    state.deliveryTip = amount;
    updateCartUI();
    showToast(`Added ₹${amount} driver tip. Thank you!`, 'success');
}

function saveCart() {
    localStorage.setItem('banban_cart', JSON.stringify(state.cart));
    localStorage.setItem('banban_coupon', JSON.stringify(state.coupon));
}

function updateCartUI() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    document.querySelectorAll('.cart-badge-count').forEach(el => el.innerText = totalQty);

    const bodyEl = document.getElementById('cart-drawer-body');
    if (bodyEl) {
        if (state.cart.length === 0) {
            bodyEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-basket empty-icon"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add something delicious from our Ban Ban menu to get started!</p>
                </div>
            `;
        } else {
            bodyEl.innerHTML = state.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="close-btn" style="width:28px;height:28px;font-size:0.9rem;" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    let deliveryFee = 0;
    if (subtotal > 0 && subtotal < 500) {
        deliveryFee = 40;
    }

    let discount = 0;
    if (state.coupon) {
        if (state.coupon.type === 'percent') {
            discount = Math.round((subtotal * state.coupon.value) / 100);
        } else if (state.coupon.type === 'flat' && subtotal >= (state.coupon.minOrder || 0)) {
            discount = state.coupon.value;
        }
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee + state.deliveryTip - discount);

    const subtotalEl = document.getElementById('cart-subtotal');
    const deliveryEl = document.getElementById('cart-delivery');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('cart-grand-total');
    const minOrderMsg = document.getElementById('min-order-msg');

    if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
    if (deliveryEl) deliveryEl.innerText = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    if (discountEl) discountEl.innerText = discount > 0 ? `-₹${discount}` : '₹0';
    if (totalEl) totalEl.innerText = `₹${grandTotal}`;

    if (minOrderMsg) {
        if (subtotal > 0 && subtotal < 100) {
            minOrderMsg.style.display = 'block';
            minOrderMsg.innerText = `⚠️ Minimum order amount is ₹100. Add ₹${100 - subtotal} more to checkout.`;
        } else {
            minOrderMsg.style.display = 'none';
        }
    }
}

// Coupon System
function applyCouponCode(forcedCode = null) {
    const input = document.getElementById('coupon-input');
    const code = (forcedCode || (input ? input.value : '')).trim().toUpperCase();
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!code) {
        showToast('Please enter a coupon code', 'warning');
        return;
    }

    if (code === 'BANBAN10' || code === 'BREW10') {
        state.coupon = { code: 'BANBAN10', type: 'percent', value: 10 };
        triggerConfetti();
        showToast('🎉 BANBAN10 applied! 10% discount added.', 'success');
    } else if (code === 'WELCOME50') {
        if (subtotal < 300) {
            showToast('WELCOME50 requires minimum order of ₹300', 'warning');
            return;
        }
        state.coupon = { code: 'WELCOME50', type: 'flat', value: 50, minOrder: 300 };
        triggerConfetti();
        showToast('🎉 WELCOME50 applied! ₹50 OFF.', 'success');
    } else if (code === 'SPIN20') {
        state.coupon = { code: 'SPIN20', type: 'percent', value: 20 };
        triggerConfetti();
        showToast('🎉 SPIN20 applied! 20% Spin Discount!', 'success');
    } else {
        showToast('Invalid coupon code. Try BANBAN10 or WELCOME50', 'danger');
        return;
    }

    saveCart();
    updateCartUI();
}

// Custom Drink Builder Modal ("Brew Your Own Cup")
function openDrinkBuilderModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.selectedProduct = product;
    const body = document.getElementById('drink-builder-body');
    if (!body) return;

    body.innerHTML = `
        <div style="text-align:center; margin-bottom:15px;">
            <h3 style="font-weight:800; font-size:1.4rem;">☕ Custom Brew ${product.name}</h3>
            <p style="color:var(--text-muted); font-size:0.85rem;">Customize size, milk, sugar, and extra shots!</p>
        </div>

        <form id="builder-form" onsubmit="handleCustomDrinkAdd(event, '${product.id}')">
            <div style="margin-bottom:15px;">
                <label class="form-label">Cup Size</label>
                <div style="display:flex; gap:10px;">
                    <label class="chip-btn active" style="flex:1; text-align:center;"><input type="radio" name="size" value="0" checked onchange="updateCustomPrice(${product.price})"> Regular</label>
                    <label class="chip-btn" style="flex:1; text-align:center;"><input type="radio" name="size" value="20" onchange="updateCustomPrice(${product.price})"> Medium (+₹20)</label>
                    <label class="chip-btn" style="flex:1; text-align:center;"><input type="radio" name="size" value="40" onchange="updateCustomPrice(${product.price})"> Large (+₹40)</label>
                </div>
            </div>

            <div style="margin-bottom:15px;">
                <label class="form-label">Milk Preference</label>
                <select id="milk-opt" class="select-dropdown" style="width:100%;" onchange="updateCustomPrice(${product.price})">
                    <option value="0">Whole Dairy Milk</option>
                    <option value="15">Oat Milk (+₹15)</option>
                    <option value="15">Almond Milk (+₹15)</option>
                    <option value="0">Skimmed Milk</option>
                </select>
            </div>

            <div style="margin-bottom:15px;">
                <label class="form-label">Sweetness Level</label>
                <div style="display:flex; gap:10px;">
                    <label class="chip-btn" style="flex:1; text-align:center;"><input type="radio" name="sugar" value="0"> 0% No Sugar</label>
                    <label class="chip-btn active" style="flex:1; text-align:center;"><input type="radio" name="sugar" value="50" checked> 50% Medium</label>
                    <label class="chip-btn" style="flex:1; text-align:center;"><input type="radio" name="sugar" value="100"> 100% Full</label>
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <label class="form-label">Extra Add-ons</label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.85rem;">
                    <label><input type="checkbox" name="extra" value="20" onchange="updateCustomPrice(${product.price})"> Extra Shot (+₹20)</label>
                    <label><input type="checkbox" name="extra" value="15" onchange="updateCustomPrice(${product.price})"> Whipped Cream (+₹15)</label>
                    <label><input type="checkbox" name="extra" value="15" onchange="updateCustomPrice(${product.price})"> Caramel Drizzle (+₹15)</label>
                    <label><input type="checkbox" name="extra" value="25" onchange="updateCustomPrice(${product.price})"> Boba Pearls (+₹25)</label>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <span style="font-weight:700;">Calculated Price:</span>
                <span id="custom-total-price" style="font-size:1.4rem; font-weight:800; color:var(--accent);">₹${product.price}</span>
            </div>

            <button type="submit" class="btn-primary" style="width:100%;">
                <i class="fas fa-plus"></i> Add Custom Drink to Cart
            </button>
        </form>
    `;

    openModal('drink-builder-modal');
}

function updateCustomPrice(basePrice) {
    const sizeVal = parseInt(document.querySelector('input[name="size"]:checked')?.value || 0);
    const milkVal = parseInt(document.getElementById('milk-opt')?.value || 0);
    let extrasVal = 0;
    document.querySelectorAll('input[name="extra"]:checked').forEach(cb => extrasVal += parseInt(cb.value));

    const total = basePrice + sizeVal + milkVal + extrasVal;
    const el = document.getElementById('custom-total-price');
    if (el) el.innerText = `₹${total}`;
}

function handleCustomDrinkAdd(e, productId) {
    e.preventDefault();
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const totalEl = document.getElementById('custom-total-price');
    const customPrice = parseInt(totalEl.innerText.replace('₹', ''));

    addToCart(null, productId, 1, `Customized ${product.name}`, customPrice);
    closeModal('drink-builder-modal');
}

// Table Booking / Party Reservation Modal
function openTableBookingModal() {
    openModal('table-booking-modal');
}

function handleTableBookingSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('book-name').value;
    const phone = document.getElementById('book-phone').value;
    const guests = document.getElementById('book-guests').value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const location = document.getElementById('book-loc').value;

    const reservation = { id: 'RES' + Date.now(), name, phone, guests, date, time, location };
    state.reservations.unshift(reservation);
    localStorage.setItem('banban_reservations', JSON.stringify(state.reservations));

    triggerConfetti();
    closeModal('table-booking-modal');
    showToast(`🎉 Table reserved for ${guests} guests at Ban Ban Café!`, 'success');
}

// Daily Spin & Win Wheel Modal
function openSpinWheelModal() {
    openModal('spin-wheel-modal');
}

function spinTheWheel() {
    const wheel = document.getElementById('wheel-circle');
    if (!wheel) return;

    playSound(800, 0.4);
    const randomDeg = 1440 + Math.floor(Math.random() * 360);
    wheel.style.transition = 'transform 3s cubic-bezier(0.15, 0.9, 0.3, 1)';
    wheel.style.transform = `rotate(${randomDeg}deg)`;

    setTimeout(() => {
        triggerConfetti();
        applyCouponCode('SPIN20');
        closeModal('spin-wheel-modal');
    }, 3200);
}

// Cart Drawer Open/Close
function toggleCartDrawer(open) {
    const drawer = document.getElementById('cart-drawer-overlay');
    if (!drawer) return;
    if (open) {
        drawer.classList.add('open');
    } else {
        drawer.classList.remove('open');
    }
}

// Product Details Modal
function openProductModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.selectedProduct = product;
    const modalContent = document.getElementById('product-modal-body');
    if (!modalContent) return;

    modalContent.innerHTML = `
        <div class="product-detail-layout">
            <div>
                <img src="${product.image}" alt="${product.name}" class="detail-img">
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="veg-indicator" title="Vegetarian"></span>
                    <span class="rating-pill"><i class="fas fa-star"></i> ${product.rating} (${product.reviewsCount} reviews)</span>
                </div>
                <h2 style="font-size:1.5rem; font-weight:800; margin-bottom:10px;">${product.name}</h2>
                <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:15px;">${product.description}</p>

                <div style="margin-bottom:15px;">
                    <strong>Ingredients:</strong>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                        ${product.ingredients.map(i => `<span class="chip-btn">${i}</span>`).join('')}
                    </div>
                </div>

                <div style="font-size:1.5rem; font-weight:800; color:var(--primary); margin-bottom:20px;">₹${product.price}</div>

                <div style="display:flex; gap:15px; align-items:center;">
                    <div class="quantity-controls" style="margin-top:0;">
                        <button class="qty-btn" style="width:34px;height:34px;" onclick="changeModalQty(-1)">-</button>
                        <span id="modal-qty" class="qty-val" style="font-size:1.1rem; width:30px;">1</span>
                        <button class="qty-btn" style="width:34px;height:34px;" onclick="changeModalQty(1)">+</button>
                    </div>
                    <button class="btn-primary" style="flex-grow:1;" onclick="addModalProductToCart(event)">
                        <i class="fas fa-shopping-bag"></i> Add to Order
                    </button>
                </div>
            </div>
        </div>
    `;

    openModal('product-detail-modal');
}

function changeModalQty(delta) {
    const qtyEl = document.getElementById('modal-qty');
    if (!qtyEl) return;
    let current = parseInt(qtyEl.innerText) + delta;
    if (current < 1) current = 1;
    qtyEl.innerText = current;
}

function addModalProductToCart(event) {
    if (!state.selectedProduct) return;
    const qtyEl = document.getElementById('modal-qty');
    const qty = qtyEl ? parseInt(qtyEl.innerText) : 1;

    addToCart(event, state.selectedProduct.id, qty);
    closeModal('product-detail-modal');
}

// Checkout Process
function openCheckoutModal() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal < 100) {
        showToast('Minimum order amount is ₹100', 'warning');
        return;
    }

    toggleCartDrawer(false);
    renderCheckoutSummary();
    openModal('checkout-modal');
}

function renderCheckoutSummary() {
    const container = document.getElementById('checkout-summary-body');
    if (!container) return;

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let deliveryFee = subtotal < 500 ? 40 : 0;
    let discount = 0;
    if (state.coupon) {
        if (state.coupon.type === 'percent') discount = Math.round((subtotal * state.coupon.value) / 100);
        else if (state.coupon.type === 'flat') discount = state.coupon.value;
    }
    const grandTotal = Math.max(0, subtotal + deliveryFee + state.deliveryTip - discount);

    container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px;">
            ${state.cart.map(i => `
                <div class="summary-line">
                    <span>${i.name} × ${i.quantity}</span>
                    <span>₹${i.price * i.quantity}</span>
                </div>
            `).join('')}
        </div>
        <div class="summary-line"><span>Subtotal:</span> <span>₹${subtotal}</span></div>
        <div class="summary-line"><span>Delivery Fee:</span> <span>${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
        ${state.deliveryTip > 0 ? `<div class="summary-line"><span>Rider Tip:</span> <span>₹${state.deliveryTip}</span></div>` : ''}
        ${discount > 0 ? `<div class="summary-line" style="color:var(--success);"><span>Discount:</span> <span>-₹${discount}</span></div>` : ''}
        <div class="summary-line grand-total"><span>Grand Total:</span> <span>₹${grandTotal}</span></div>
    `;
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const pincode = document.getElementById('cust-pincode').value.trim();
    const orderType = document.querySelector('input[name="orderType"]:checked')?.value || 'Delivery';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash on Delivery';

    if (!name || !phone || !address || !city || !pincode) {
        showToast('Please fill all required fields', 'warning');
        return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal < 500 ? 40 : 0;
    let discount = 0;
    if (state.coupon) {
        if (state.coupon.type === 'percent') discount = Math.round((subtotal * state.coupon.value) / 100);
        else if (state.coupon.type === 'flat') discount = state.coupon.value;
    }
    const grandTotal = Math.max(0, subtotal + deliveryFee + state.deliveryTip - discount);

    const fakeOrderId = 'BAN' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 11);
    const order = {
        id: fakeOrderId,
        date: new Date().toLocaleString(),
        customer: { name, phone, email, address, city, pincode },
        orderType,
        paymentMethod,
        items: [...state.cart],
        subtotal,
        deliveryFee,
        discount,
        total: grandTotal,
        statusStep: 1,
        prepTime: '20-25 mins'
    };

    state.orders.unshift(order);
    localStorage.setItem('banban_orders', JSON.stringify(state.orders));
    state.currentOrderTrack = order;

    triggerConfetti();
    playSound(900, 0.4);

    state.cart = [];
    state.coupon = null;
    state.deliveryTip = 0;
    saveCart();
    updateCartUI();

    closeModal('checkout-modal');
    renderOrderConfirmation(order);
    openModal('confirmation-modal');

    startOrderTrackingSimulation(order.id);
}

// Order Confirmation Render
function renderOrderConfirmation(order) {
    const body = document.getElementById('confirmation-body');
    if (!body) return;

    body.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:3.5rem; color:var(--success); margin-bottom:10px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 style="font-size:1.8rem; font-weight:800; color:var(--text);">Order Confirmed!</h2>
            <p style="color:var(--text-muted);">Thank you for ordering from Ban Ban Café.</p>
            <div style="background:var(--badge-bg); color:var(--badge-text); display:inline-block; padding:6px 16px; border-radius:var(--radius-full); font-weight:800; margin-top:10px;">
                Order ID: ${order.id}
            </div>
        </div>

        <div style="background:var(--bg); padding:15px; border-radius:var(--radius-sm); margin-bottom:20px; border:1px solid var(--border);">
            <h4 style="font-weight:700; margin-bottom:8px;">Order Details</h4>
            <p style="font-size:0.9rem;"><strong>Customer:</strong> ${order.customer.name} (${order.customer.phone})</p>
            <p style="font-size:0.9rem;"><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
            <p style="font-size:0.9rem;"><strong>Payment:</strong> ${order.paymentMethod}</p>
            <p style="font-size:0.9rem;"><strong>Estimated Time:</strong> 🕒 ${order.prepTime}</p>
            <hr style="margin:10px 0; border:none; border-top:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem;">
                <span>Total Amount Paid:</span>
                <span>₹${order.total}</span>
            </div>
        </div>

        <div style="display:flex; gap:15px;">
            <button class="btn-primary" style="flex:1;" onclick="closeModal('confirmation-modal'); openOrderTrackingModal('${order.id}');">
                <i class="fas fa-route"></i> Track Live Order
            </button>
            <button class="btn-secondary" style="flex:1;" onclick="closeModal('confirmation-modal');">
                Continue Shopping
            </button>
        </div>
    `;
}

// Live Order Tracker Modal & Simulation
function openOrderTrackingModal(orderId = null) {
    let order = null;
    if (orderId) {
        order = state.orders.find(o => o.id === orderId);
    } else if (state.orders.length > 0) {
        order = state.orders[0];
    }

    if (!order) {
        showToast('No active orders to track', 'info');
        return;
    }

    state.currentOrderTrack = order;
    updateOrderTrackingUI();
    openModal('tracking-modal');
}

function updateOrderTrackingUI() {
    const order = state.currentOrderTrack;
    if (!order) return;

    const body = document.getElementById('tracking-body');
    if (!body) return;

    const steps = [
        { title: 'Order Placed', desc: 'We have received your order.' },
        { title: 'Order Confirmed', desc: 'Ban Ban Kitchen has accepted your order.' },
        { title: 'Preparing Food', desc: 'Our chef is brewing & baking fresh items.' },
        { title: order.orderType === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup', desc: order.orderType === 'Delivery' ? 'Rider is on the way to your location.' : 'Your food is hot and ready at the counter.' },
        { title: 'Delivered / Completed', desc: 'Enjoy your delicious Ban Ban feast!' }
    ];

    body.innerHTML = `
        <div style="margin-bottom:20px; text-align:center;">
            <h3 style="font-weight:800; font-size:1.4rem;">Live Order Tracking</h3>
            <p style="font-size:0.9rem; color:var(--text-muted);">Tracking Order #${order.id}</p>
        </div>

        <div class="timeline">
            ${steps.map((step, idx) => {
        const stepNum = idx + 1;
        let statusClass = '';
        if (stepNum < order.statusStep) statusClass = 'completed';
        else if (stepNum === order.statusStep) statusClass = 'active';

        return `
                    <div class="timeline-step ${statusClass}">
                        <div class="step-icon-box">
                            <i class="fas ${stepNum < order.statusStep ? 'fa-check' : 'fa-circle'}"></i>
                        </div>
                        <div class="step-content">
                            <h4>${step.title}</h4>
                            <p>${step.desc}</p>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>

        <div style="text-align:center; margin-top:20px;">
            <button class="btn-secondary" style="font-size:0.85rem;" onclick="simulateNextTrackStep('${order.id}')">
                <i class="fas fa-forward"></i> Simulate Next Status Update
            </button>
        </div>
    `;
}

function startOrderTrackingSimulation(orderId) {
    if (state.activeOrderTimer) clearInterval(state.activeOrderTimer);

    state.activeOrderTimer = setInterval(() => {
        const order = state.orders.find(o => o.id === orderId);
        if (order && order.statusStep < 5) {
            order.statusStep += 1;
            localStorage.setItem('banban_orders', JSON.stringify(state.orders));
            if (state.currentOrderTrack && state.currentOrderTrack.id === orderId) {
                updateOrderTrackingUI();
            }
        } else {
            clearInterval(state.activeOrderTimer);
        }
    }, 12000);
}

function simulateNextTrackStep(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order && order.statusStep < 5) {
        order.statusStep += 1;
        localStorage.setItem('banban_orders', JSON.stringify(state.orders));
        updateOrderTrackingUI();
        playSound(650, 0.15);
        showToast(`Order status updated to stage ${order.statusStep}`, 'info');
    } else {
        showToast('Order is already fully delivered/completed!', 'success');
    }
}

// User Account & Orders History Modal
function openAccountModal() {
    const container = document.getElementById('account-body');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <div style="width:70px; height:70px; background:var(--accent); color:#fff; border-radius:50%; display:grid; place-items:center; font-size:2rem; margin:0 auto 10px;">
                <i class="fas fa-user"></i>
            </div>
            <h3 style="font-weight:800; font-size:1.3rem;">Welcome to Ban Ban!</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Demo User Profile</p>
        </div>

        <div style="background:var(--bg); padding:15px; border-radius:var(--radius-sm); margin-bottom:20px; border:1px solid var(--border);">
            <h4 style="font-weight:700; margin-bottom:8px;"><i class="fas fa-history"></i> Recent Order History (${state.orders.length})</h4>
            ${state.orders.length === 0 ? `
                <p style="color:var(--text-muted); font-size:0.85rem;">No previous orders placed yet.</p>
            ` : `
                <div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto;">
                    ${state.orders.map(o => `
                        <div style="background:var(--card-bg); padding:10px; border-radius:6px; border:1px solid var(--border); font-size:0.85rem;">
                            <div style="display:flex; justify-content:space-between; font-weight:700;">
                                <span>Order #${o.id}</span>
                                <span>₹${o.total}</span>
                            </div>
                            <div style="color:var(--text-muted); font-size:0.75rem;">${o.date} • ${o.items.length} items</div>
                            <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem; margin-top:6px;" onclick="closeModal('account-modal'); openOrderTrackingModal('${o.id}');">
                                Track Order
                            </button>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <div style="background:var(--bg); padding:15px; border-radius:var(--radius-sm); border:1px solid var(--border);">
            <h4 style="font-weight:700; margin-bottom:8px;"><i class="fas fa-calendar-alt"></i> Table Reservations (${state.reservations.length})</h4>
            ${state.reservations.length === 0 ? `
                <p style="color:var(--text-muted); font-size:0.85rem;">No table reservations booked.</p>
            ` : `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${state.reservations.map(r => `
                        <div style="font-size:0.85rem;">📅 ${r.date} at ${r.time} • ${r.guests} guests (${r.location})</div>
                    `).join('')}
                </div>
            `}
        </div>
    `;

    openModal('account-modal');
}

// Reviews Render
function renderReviews() {
    const container = document.getElementById('reviews-grid');
    if (!container) return;

    container.innerHTML = state.reviews.map(r => `
        <div class="review-card reveal">
            <div class="review-header">
                <img src="${r.avatar}" alt="${r.name}" class="review-avatar">
                <div>
                    <div class="review-author">${r.name}</div>
                    <div class="review-role">${r.role}</div>
                </div>
            </div>
            <div class="review-stars">
                ${'<i class="fas fa-star"></i>'.repeat(r.rating)}
            </div>
            <p style="font-size:0.9rem; color:var(--text-muted); font-style:italic;">"${r.comment}"</p>
        </div>
    `).join('');

    setupScrollReveal();
}

// Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
}

// Global Event Listeners Setup
function setupEventListeners() {
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn?.classList.add('visible');
        } else {
            backToTopBtn?.classList.remove('visible');
        }
    });

    backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    const contactForm = document.getElementById('contact-form');
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        triggerConfetti();
        showToast('Thank you! Your message has been sent to Ban Ban.', 'success');
        contactForm.reset();
    });
}
