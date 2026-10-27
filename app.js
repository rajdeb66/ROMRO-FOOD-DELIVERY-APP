import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseSettings = Boolean(supabaseUrl || supabaseAnonKey);
let supabase = null;
let supabaseClientError = '';
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Invalid ROMEO Supabase configuration.', error);
    supabaseClientError = 'The Supabase configuration is invalid. Check the project URL and public anon key.';
  }
}
const supabaseConfigError = (hasSupabaseSettings && !(supabaseUrl && supabaseAnonKey))
  || (import.meta.env.PROD && !(supabaseUrl && supabaseAnonKey))
  ? 'Production mode requires both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Live ordering is disabled until they are configured.'
  : supabaseClientError;
const isLiveMode = import.meta.env.PROD || Boolean(supabase) || hasSupabaseSettings;

const defaultRestaurants = [
  { id: 'spice', name: 'The Spice Route', cuisine: 'North Indian · Biryani', rating: '4.8', time: '25–30 min', price: '₹350 for two', emoji: '🍛', offer: '20% OFF', category: 'Indian',
    items: [
      { id: 'butter', name: 'Butter Paneer Masala', detail: 'Creamy tomato gravy, house spice blend', price: 289, emoji: '🍲' },
      { id: 'biryani', name: 'Hyderabadi Dum Biryani', detail: 'Slow cooked basmati rice, raita on the side', price: 329, emoji: '🍛' },
      { id: 'naan', name: 'Garlic Butter Naan', detail: 'Tandoor baked and brushed with butter', price: 69, emoji: '🫓' },
    ] },
  { id: 'dosa', name: 'Dosa District', cuisine: 'South Indian · Breakfast', rating: '4.7', time: '20–25 min', price: '₹250 for two', emoji: '🥞', offer: 'Free delivery', category: 'South Indian',
    items: [
      { id: 'masala-dosa', name: 'Mysore Masala Dosa', detail: 'Crisp dosa, potato masala, coconut chutney', price: 189, emoji: '🥞' },
      { id: 'idli', name: 'Steamed Idli (3 pcs)', detail: 'Soft idlis with sambar and chutneys', price: 99, emoji: '🥥' },
      { id: 'vada', name: 'Medu Vada (2 pcs)', detail: 'Golden lentil fritters with sambar', price: 109, emoji: '🍩' },
    ] },
  { id: 'wok', name: 'Wok This Way', cuisine: 'Chinese · Asian', rating: '4.6', time: '30–35 min', price: '₹400 for two', emoji: '🍜', offer: '₹100 OFF', category: 'Chinese',
    items: [
      { id: 'noodles', name: 'Chilli Garlic Noodles', detail: 'Wok-tossed noodles, seasonal vegetables', price: 249, emoji: '🍜' },
      { id: 'manchurian', name: 'Veg Manchurian', detail: 'Crispy veg balls in a tangy sauce', price: 219, emoji: '🥡' },
      { id: 'rice', name: 'Schezwan Fried Rice', detail: 'Spicy rice with vegetables and spring onion', price: 229, emoji: '🍚' },
    ] },
  { id: 'oven', name: 'Little Oven', cuisine: 'Pizza · Italian', rating: '4.5', time: '25–35 min', price: '₹500 for two', emoji: '🍕', offer: 'Buy 1 Get 1', category: 'Pizza',
    items: [
      { id: 'margherita', name: 'Classic Margherita', detail: 'Mozzarella, basil, slow-cooked tomato', price: 299, emoji: '🍕' },
      { id: 'farmhouse', name: 'Garden Farmhouse', detail: 'Peppers, olives, onion, mushroom', price: 379, emoji: '🫑' },
      { id: 'garlic-bread', name: 'Cheesy Garlic Bread', detail: 'Oven-baked with herbs and mozzarella', price: 159, emoji: '🥖' },
    ] },
  { id: 'sweet', name: 'Sugar & Spice', cuisine: 'Desserts · Bakery', rating: '4.9', time: '20–25 min', price: '₹300 for two', emoji: '🍰', offer: 'Fresh today', category: 'Desserts',
    items: [
      { id: 'cake', name: 'Chocolate Truffle Cake', detail: 'Rich dark chocolate, made fresh today', price: 199, emoji: '🍰' },
      { id: 'gulab', name: 'Gulab Jamun (2 pcs)', detail: 'Warm, soft and soaked in rose syrup', price: 89, emoji: '🍮' },
      { id: 'brownie', name: 'Walnut Brownie', detail: 'Fudgy chocolate with toasted walnuts', price: 129, emoji: '🍫' },
    ] },
  { id: 'green', name: 'Green Bowl Co.', cuisine: 'Healthy · Salad bowls', rating: '4.7', time: '20–30 min', price: '₹400 for two', emoji: '🥗', offer: '15% OFF', category: 'Healthy',
    items: [
      { id: 'buddha', name: 'Buddha Bowl', detail: 'Quinoa, roasted vegetables, tahini', price: 289, emoji: '🥗' },
      { id: 'paneer-bowl', name: 'Tandoori Paneer Bowl', detail: 'Brown rice, paneer, mint yoghurt', price: 309, emoji: '🥙' },
      { id: 'smoothie', name: 'Mango Smoothie', detail: 'Alphonso mango blended with yoghurt', price: 149, emoji: '🥭' },
    ] },
];

const categories = ['All', 'Indian', 'South Indian', 'Chinese', 'Pizza', 'Desserts', 'Healthy'];
const statusLabels = {
  pending: 'Waiting for restaurant',
  accepted: 'Order accepted',
  preparing: 'Preparing your food',
  ready_for_pickup: 'Ready for pickup',
  picked_up: 'Picked up by rider',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const promoOffers = {
  ROMEO10: { label: '10% off your food subtotal', kind: 'percent', value: 10, minimum: 0, maximum: 150 },
  TASTY50: { label: '₹50 off orders over ₹399', kind: 'fixed', value: 50, minimum: 399 },
  WELCOME15: { label: '15% off orders over ₹499', kind: 'percent', value: 15, minimum: 499, maximum: 200 },
};
const restaurantPhotos = {
  Indian: './assets/indian.jpg',
  'South Indian': './assets/south-indian.jpg',
  Chinese: './assets/noodles.jpg',
  Pizza: './assets/pizza.jpg',
  Desserts: './assets/dessert.jpg',
  Healthy: './assets/salad.jpg',
  default: './assets/burger.jpg',
};

function cloneRestaurants() {
  return JSON.parse(JSON.stringify(defaultRestaurants));
}

function createInitialState() {
  return {
    role: 'customer',
    screen: 'home',
    restaurantId: null,
    category: 'All',
    customerMode: 'all',
    search: '',
    cart: [],
    orders: [],
    favorites: [],
    promoCode: '',
    restaurants: cloneRestaurants(),
    editor: null,
    user: null,
    profile: null,
    authPhone: '',
    authOtpSent: false,
    remoteLoading: isLiveMode,
    remoteError: supabaseConfigError,
  };
}

function loadState() {
  if (isLiveMode) return createInitialState();
  try {
    const saved = JSON.parse(localStorage.getItem('romeo-mvp-state'));
    if (!saved || typeof saved !== 'object') return createInitialState();
    return {
      ...createInitialState(),
      ...saved,
      cart: Array.isArray(saved.cart) ? saved.cart : [],
      orders: Array.isArray(saved.orders) ? saved.orders : [],
      favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
      promoCode: typeof saved.promoCode === 'string' ? saved.promoCode : '',
      customerMode: saved.customerMode || 'all',
      restaurants: Array.isArray(saved.restaurants) && saved.restaurants.length ? saved.restaurants : cloneRestaurants(),
      editor: saved.editor || null,
    };
  } catch (error) {
    console.error('Unable to load saved ROMEO demo data.', error);
    return createInitialState();
  }
}

let state = loadState();
let restaurants = Array.isArray(state.restaurants) ? state.restaurants : cloneRestaurants();
let toastTimer;

function syncRestaurants() {
  restaurants = Array.isArray(state.restaurants) && state.restaurants.length ? state.restaurants : cloneRestaurants();
  state.restaurants = restaurants;
}

function persist() {
  syncRestaurants();
  if (isLiveMode) return;
  localStorage.setItem('romeo-mvp-state', JSON.stringify(state));
}

function money(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function currentRestaurant() {
  return restaurants.find((restaurant) => restaurant.id === state.restaurantId) || null;
}

function cartSubtotal() {
  return state.cart.reduce((total, line) => total + line.price * line.quantity, 0);
}

function getPromoDetails(code = state.promoCode, subtotal = cartSubtotal()) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const offer = promoOffers[normalizedCode];
  if (!offer) return { code: normalizedCode, offer: null, discount: 0, error: 'That promo code is not valid.' };
  if (subtotal < offer.minimum) {
    return {
      code: normalizedCode,
      offer,
      discount: 0,
      error: `Add ${money(offer.minimum - subtotal)} more to use ${normalizedCode}.`,
    };
  }
  const amount = offer.kind === 'percent' ? subtotal * offer.value / 100 : offer.value;
  return { code: normalizedCode, offer, discount: Math.min(Math.round(amount), offer.maximum || amount), error: '' };
}

function cartCount() {
  return state.cart.reduce((total, line) => total + line.quantity, 0);
}

function selectedRestaurant() {
  return restaurants.find((restaurant) => restaurant.id === state.cart[0]?.restaurantId);
}

function notify(message) {
  const element = document.querySelector('.toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42) || 'item';
}

function getRestaurantById(id) {
  return restaurants.find((restaurant) => restaurant.id === id) || null;
}

function restaurantPhoto(restaurant) {
  return restaurantPhotos[restaurant.category] || restaurantPhotos.default;
}

function deliveryDistance(restaurant) {
  const sampleDistances = { spice: '1.2 km', dosa: '0.8 km', wok: '2.1 km', oven: '1.6 km', sweet: '1.0 km', green: '2.4 km' };
  return restaurant.distance || sampleDistances[restaurant.id] || 'Nearby';
}

function deliveryCharge(restaurant) {
  return restaurant.deliveryFee === 0 || /free delivery/i.test(restaurant.offer || '') ? 'Free delivery' : `₹${restaurant.deliveryFee || 29} delivery`;
}

function isFavoriteRestaurant(restaurantId) {
  return state.favorites.includes(restaurantId);
}

function renderSignIn() {
  if (state.remoteLoading) {
    return `<main class="auth-shell"><section class="auth-card"><span class="auth-mark">R</span><p class="eyebrow">ROMEO · LOCAL FOOD, DELIVERED</p><h1>One moment, please.</h1><p class="muted">Connecting you securely to ROMEO.</p></section></main>`;
  }
  if (state.remoteError) {
    return `<main class="auth-shell"><section class="auth-card"><span class="auth-mark">!</span><p class="eyebrow">SECURE CONNECTION</p><h1>We couldn't connect.</h1><p class="auth-error">${escapeHtml(state.remoteError)}</p><button class="primary-button full" data-action="retry-connection">Try again</button></section></main>`;
  }
  return `<main class="auth-shell"><section class="auth-card">
    <button class="brand auth-brand" data-action="go-home" aria-label="ROMEO home"><span class="brand-mark">R</span><span class="brand-name">ROM<span>E</span>O</span></button>
    <p class="eyebrow">A GOOD MEAL IS CLOSE</p>
    <h1>${state.authOtpSent ? 'Check your messages.' : 'Come on in.'}</h1>
    <p class="auth-copy">${state.authOtpSent ? `Enter the one-time code we sent to ${escapeHtml(state.authPhone)}.` : 'Sign in with your phone to order from neighbourhood kitchens.'}</p>
    ${state.authOtpSent
      ? `<label class="form-label" for="auth-code">6-digit verification code</label><input id="auth-code" class="form-control auth-input" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" /><button class="primary-button full auth-submit" data-action="verify-phone-otp">Verify and continue</button><button class="text-button auth-back" data-action="edit-phone">Use a different number</button>`
      : `<label class="form-label" for="auth-phone">Mobile number</label><div class="phone-input"><span>🇮🇳 +91</span><input id="auth-phone" class="form-control auth-input" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="98765 43210" value="${escapeHtml(state.authPhone)}" /></div><button class="primary-button full auth-submit" data-action="send-phone-otp">Send sign-in code</button>`}
    <p class="auth-legal">Your number is used to sign in and support your orders. Publish ROMEO's privacy notice and contact details before inviting customers.</p>
  </section></main>`;
}

function renderHeader() {
  return `<header class="topbar">
    <button class="brand" data-action="go-home" aria-label="ROMEO home">
      <span class="brand-mark">R</span><span class="brand-name">ROM<span>E</span>O</span>
    </button>
    <div class="top-actions"><div class="location">Delivering to<strong>📍 Jubilee Hills, Hyderabad</strong></div>${supabase && state.user ? `<button class="account-chip" data-action="sign-out" aria-label="Sign out">Sign out</button>` : `<button class="avatar" aria-label="Profile">K</button>`}</div>
  </header>`;
}

function renderRoleTabs() {
  const roles = [['customer', '🍽️ Customer'], ['partner', '🏪 Partner'], ['rider', '🛵 Rider'], ['admin', '📊 Admin']];
  const availableRoles = isLiveMode ? roles.filter(([role]) => role === 'customer') : roles;
  return `<nav class="role-tabs" aria-label="${isLiveMode ? 'Customer account' : 'MVP demo views'}">${availableRoles.map(([role, label]) => `<button class="role-tab ${state.role === role ? 'active' : ''}" data-action="set-role" data-role="${role}">${label}</button>`).join('')}</nav>`;
}

function renderHero() {
  return `<section class="hero">
    <div class="hero-copy">
      <div class="eyebrow"><span class="eyebrow-dot"></span>ROMEO · YOUR LOCAL FOOD CLUB</div>
      <h1 lang="bn">খিদে পেয়েছে? এবার <span>জমিয়ে খাওয়া হোক!</span></h1>
      <p lang="bn">একটু ঝাল, একটু মিষ্টি—পাড়ার প্রিয় স্বাদ, এক ক্লিকেই।</p>
      <button class="primary-button hero-cta" data-action="scroll-restaurants">খাবার খুঁজুন <span aria-hidden="true">→</span></button>
      <div class="hero-trust"><span>✦</span> Serving Jubilee Hills &amp; nearby</div>
    </div>
    <div class="hero-art">
      <div class="hero-photo-wrap">
        <img class="hero-food-image" src="./assets/burger-real.jpg" alt="Freshly grilled burgers with greens on a wooden board" fetchpriority="high" />
        <div class="hero-photo-shade"></div>
        <div class="photo-sticker" lang="bn">একটু ঝাল<br /><strong>একটু মিষ্টি</strong> <span>♥</span></div>
      </div>
      <div class="floating-food-card"><span class="floating-food-icon">↗</span><span><strong lang="bn">পাড়ার স্বাদ</strong><small>Made nearby. On its way to you.</small></span></div>
      <div class="hero-spark hero-spark-one">✳</div><div class="hero-spark hero-spark-two">✦</div>
    </div>
  </section>`;
}

function visibleRestaurants() {
  const term = state.search.trim().toLowerCase();
  return [...restaurants]
    .filter((restaurant) => {
      const categoryMatches = state.category === 'All' || restaurant.category === state.category;
      const modeMatches =
        state.customerMode === 'all' ||
        (state.customerMode === 'favorites' && isFavoriteRestaurant(restaurant.id)) ||
        (state.customerMode === 'deals' && /OFF|delivery|today|deal/i.test(restaurant.offer || '')) ||
        (state.customerMode === 'quick' && Number.parseInt(restaurant.time, 10) <= 25);
      const searchMatches = !term || `${restaurant.name} ${restaurant.cuisine} ${restaurant.items.map((item) => item.name).join(' ')}`.toLowerCase().includes(term);
      return categoryMatches && modeMatches && searchMatches;
    })
    .sort((first, second) => Number(isFavoriteRestaurant(second.id)) - Number(isFavoriteRestaurant(first.id)));
}

function renderRestaurantCards() {
  const visible = visibleRestaurants();
  if (!visible.length) return `<div class="empty-state"><span>🔎</span>No restaurants match that search. Try a different dish or category.</div>`;
  return `<div class="restaurant-grid">${visible.map((restaurant) => `<article class="restaurant-card" data-action="open-restaurant" data-id="${restaurant.id}" tabindex="0" role="button" aria-label="View ${escapeHtml(restaurant.name)} menu">
    <div class="restaurant-photo">
      <img src="${escapeHtml(restaurantPhoto(restaurant))}" alt="${escapeHtml(restaurant.cuisine)} from ${escapeHtml(restaurant.name)}" loading="lazy" />
      <span class="photo-scrim"></span>
      <button class="favorite-toggle ${isFavoriteRestaurant(restaurant.id) ? 'active' : ''}" data-action="toggle-favorite" data-id="${restaurant.id}" aria-label="${isFavoriteRestaurant(restaurant.id) ? 'Remove from favorites' : 'Save to favorites'}">${isFavoriteRestaurant(restaurant.id) ? '♥' : '♡'}</button>
      ${restaurant.offer ? `<span class="offer">${escapeHtml(restaurant.offer)}</span>` : ''}
      <span class="photo-caption"><span>${escapeHtml(restaurant.category)} kitchen</span></span>
    </div>
    <div class="restaurant-info"><div class="restaurant-title"><h3>${escapeHtml(restaurant.name)}</h3><span class="rating">★ ${restaurant.rating}</span></div>
      <div class="restaurant-cuisine">${escapeHtml(restaurant.cuisine)}</div>
      <div class="restaurant-facts"><span>⌖ ${escapeHtml(deliveryDistance(restaurant))}</span><span>◷ ${escapeHtml(restaurant.time)}</span></div>
      <div class="restaurant-card-footer"><span>${escapeHtml(deliveryCharge(restaurant))}</span><span>${escapeHtml(restaurant.price)}</span></div>
    </div>
  </article>`).join('')}</div>`;
}

function renderHome() {
  return `${renderHero()}
    <div class="search-row"><label class="searchbox"><input id="restaurant-search" type="search" placeholder="Search dishes or restaurants" value="${escapeHtml(state.search)}" /></label><button class="soft-button" data-action="my-orders">My orders${state.orders.length ? ` (${state.orders.length})` : ''}</button></div>
    <div class="customer-tools">
      <button class="tool-pill ${state.customerMode === 'all' ? 'active' : ''}" data-action="set-customer-mode" data-mode="all">🔥 All picks</button>
      <button class="tool-pill ${state.customerMode === 'favorites' ? 'active' : ''}" data-action="set-customer-mode" data-mode="favorites">♥ Favourites</button>
      <button class="tool-pill ${state.customerMode === 'deals' ? 'active' : ''}" data-action="set-customer-mode" data-mode="deals">⚡ Deals</button>
      <button class="tool-pill ${state.customerMode === 'quick' ? 'active' : ''}" data-action="set-customer-mode" data-mode="quick">⏱️ Fast delivery</button>
    </div>
    <div class="section-heading"><div><span class="section-kicker">A GOOD PLACE TO START</span><h2>What sounds good?</h2><p>Follow a craving. We know a place.</p></div></div>
    <div class="categories">${categories.map((category) => `<button class="category ${state.category === category ? 'active' : ''}" data-action="set-category" data-category="${category}">${category === 'All' ? '✨ ' : ''}${category}</button>`).join('')}</div>
    <div class="section-heading restaurant-section-heading" id="restaurants"><div><span class="section-kicker">GOOD THINGS, JUST AROUND THE CORNER</span><h2>Local favourites</h2><p>${visibleRestaurants().length} kitchens near Jubilee Hills</p></div><button class="text-button" data-action="reset-filters">See all</button></div>
    ${renderRestaurantCards()}`;
}

function renderCart() {
  const restaurant = selectedRestaurant();
  const subtotal = cartSubtotal();
  const deliveryFee = state.cart.length ? (subtotal >= 399 ? 0 : 29) : 0;
  const platformFee = state.cart.length ? 5 : 0;
  const total = subtotal + deliveryFee + platformFee;
  return `<aside class="cart-panel">
    <h2>Your bag <span style="color:var(--red)">(${cartCount()})</span></h2>
    <p class="muted">${restaurant ? `From ${escapeHtml(restaurant.name)}` : 'Good things are worth adding.'}</p>
    ${!state.cart.length ? `<div class="cart-empty"><span>🛍️</span>Your bag is waiting for something tasty.</div>` : `
      ${state.cart.map((line) => `<div class="cart-line"><div><div class="cart-line-name">${escapeHtml(line.name)}</div><div class="quantity"><button data-action="change-quantity" data-id="${line.id}" data-delta="-1" aria-label="Remove one">−</button><span>${line.quantity}</span><button data-action="change-quantity" data-id="${line.id}" data-delta="1" aria-label="Add one">+</button></div></div><strong>${money(line.price * line.quantity)}</strong></div>`).join('')}
      <div class="bill"><div class="bill-row"><span>Item total</span><span>${money(subtotal)}</span></div><div class="bill-row"><span>Delivery</span><span>${deliveryFee ? money(deliveryFee) : 'FREE'}</span></div><div class="bill-row"><span>Platform fee</span><span>${money(platformFee)}</span></div><div class="bill-row total"><span>Total</span><span>${money(total)}</span></div></div>
      <button class="primary-button full" data-action="checkout">Continue to checkout</button>`}
  </aside>`;
}

function renderRestaurant() {
  const restaurant = currentRestaurant();
  if (!restaurant) {
    state.screen = 'home';
    return renderHome();
  }
  return `<button class="back-button" data-action="go-home">← Back to restaurants</button>
    <div class="restaurant-header"><div class="food-icon">${restaurant.emoji}</div><div><h1>${escapeHtml(restaurant.name)}</h1><div class="muted">${escapeHtml(restaurant.cuisine)}</div><div class="restaurant-meta"><span>★ ${restaurant.rating}</span><span>${restaurant.time}</span><span>${restaurant.price}</span></div></div></div>
    <div class="content-layout"><section><div class="section-heading" style="margin-top:0"><div><h2>Popular picks</h2><p>Made fresh when you order</p></div></div>
      <div class="menu-list">${restaurant.items.map((item) => `<article class="menu-item"><div class="food-icon">${item.emoji}</div><div class="menu-details"><span class="veg-mark" aria-label="Vegetarian"></span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.detail)}</p><div class="price">${money(item.price)}</div><button class="add-button" data-action="add-item" data-restaurant="${restaurant.id}" data-id="${item.id}">Add +</button></div></article>`).join('')}</div>
    </section>${renderCart()}</div>`;
}

function statusClass(status) {
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled') return 'cancelled';
  return '';
}

function renderOrderCard(order, controls = '') {
  const restaurant = restaurants.find((entry) => entry.id === order.restaurantId);
  const itemSummary = order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ');
  return `<article class="order-card"><div class="order-main"><strong>Order ${escapeHtml(order.id)} · ${escapeHtml(order.restaurantName || restaurant?.name || 'ROMEO restaurant')}</strong><p>${escapeHtml(itemSummary)} · ${money(order.total)}</p></div><span class="status ${statusClass(order.status)}">${statusLabels[order.status] || escapeHtml(order.status)}</span>${controls ? `<div class="order-actions">${controls}</div>` : ''}</article>`;
}

function nextPartnerAction(order) {
  const actions = {
    pending: ['Accept order', 'accepted'],
    accepted: ['Start preparing', 'preparing'],
    preparing: ['Mark ready', 'ready_for_pickup'],
  };
  const next = actions[order.status];
  return next ? `<button class="primary-button" data-action="advance-order" data-id="${order.id}" data-status="${next[1]}">${next[0]}</button>` : '';
}

function renderPartner() {
  const active = state.orders.filter((order) => !['delivered', 'cancelled'].includes(order.status));
  const todayRevenue = state.orders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + order.subtotal, 0);
  return `<h1 class="page-title">Partner kitchen<small>Your orders, all in one place. This demo shares orders with the customer and rider views.</small></h1>
    <div class="notice">🔔 <strong>Partner demo:</strong> Accept orders and update preparation status here. Changes appear in the customer’s order history.</div>
    <div class="stats-grid"><div class="stat-card"><span>Active orders</span><strong>${active.length}</strong><small>Live in this demo</small></div><div class="stat-card"><span>Completed orders</span><strong>${state.orders.filter((order) => order.status === 'delivered').length}</strong><small>Today</small></div><div class="stat-card"><span>Food sales</span><strong>${money(todayRevenue)}</strong><small>Delivered orders</small></div><div class="stat-card"><span>Menu items</span><strong>${restaurants.reduce((sum, restaurant) => sum + restaurant.items.length, 0)}</strong><small>Sample menu</small></div></div>
    <section class="panel"><div class="panel-heading"><div><h2>Incoming orders</h2><p class="muted">Advance each order through the kitchen.</p></div></div>
      ${state.orders.length ? `<div class="order-list">${[...state.orders].reverse().map((order) => renderOrderCard(order, nextPartnerAction(order))).join('')}</div>` : `<div class="empty-state"><span>🍳</span>No orders yet. Place a test order from the Customer tab.</div>`}
    </section>`;
}

function renderRider() {
  const riderOrders = state.orders.filter((order) => ['ready_for_pickup', 'picked_up', 'out_for_delivery'].includes(order.status));
  return `<h1 class="page-title">Rider delivery desk<small>Your next delivery, with a simple handoff flow.</small></h1>
    <div class="notice">🛵 <strong>Rider demo:</strong> Use the actions below to simulate pickup and delivery. Live maps and dispatch are not connected.</div>
    <div class="stats-grid"><div class="stat-card"><span>Ready for pickup</span><strong>${state.orders.filter((order) => order.status === 'ready_for_pickup').length}</strong><small>Waiting at restaurant</small></div><div class="stat-card"><span>Active deliveries</span><strong>${state.orders.filter((order) => ['picked_up', 'out_for_delivery'].includes(order.status)).length}</strong><small>On your route</small></div><div class="stat-card"><span>Delivered</span><strong>${state.orders.filter((order) => order.status === 'delivered').length}</strong><small>Demo deliveries</small></div><div class="stat-card"><span>Demo earnings</span><strong>${money(state.orders.filter((order) => order.status === 'delivered').length * 45)}</strong><small>Estimate only</small></div></div>
    <section class="panel"><div class="panel-heading"><div><h2>Delivery queue</h2><p class="muted">Orders move here when the restaurant marks them ready.</p></div></div>
      ${riderOrders.length ? `<div class="order-list">${[...riderOrders].reverse().map((order) => {
        const next = order.status === 'ready_for_pickup' ? ['Confirm pickup', 'picked_up'] : order.status === 'picked_up' ? ['Start delivery', 'out_for_delivery'] : ['Mark delivered', 'delivered'];
        return renderOrderCard(order, `<button class="primary-button" data-action="advance-order" data-id="${order.id}" data-status="${next[1]}">${next[0]}</button>`);
      }).join('')}</div>` : `<div class="empty-state"><span>🛵</span>No orders ready. Check back when the kitchen marks an order ready.</div>`}
    </section>`;
}

function renderAdmin() {
  const delivered = state.orders.filter((order) => order.status === 'delivered');
  const totalSales = delivered.reduce((sum, order) => sum + order.total, 0);
  const active = state.orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;
  return `<h1 class="page-title">ROMEO operations<small>A quick snapshot of the local MVP demo data.</small></h1>
    <div class="stats-grid"><div class="stat-card"><span>Total orders</span><strong>${state.orders.length}</strong><small>All demo orders</small></div><div class="stat-card"><span>Active orders</span><strong>${active}</strong><small>In progress</small></div><div class="stat-card"><span>Delivered sales</span><strong>${money(totalSales)}</strong><small>Delivered orders only</small></div><div class="stat-card"><span>Restaurants</span><strong>${restaurants.length}</strong><small>Sample listings</small></div></div>
    <section class="panel admin-panel">
      <div class="panel-heading">
        <div><h2>Restaurant control centre</h2><p class="muted">Edit your menu lineup, pricing, and offers in real time.</p></div>
        <button class="primary-button" data-action="add-restaurant">Add restaurant</button>
      </div>
      <div class="admin-list">${restaurants.map((restaurant) => `
        <article class="admin-restaurant-card">
          <div class="admin-restaurant-header">
            <div class="food-icon wide">${restaurant.emoji}</div>
            <div class="admin-restaurant-copy">
              <div class="restaurant-title compact"><h3>${escapeHtml(restaurant.name)}</h3><span class="rating">★ ${restaurant.rating}</span></div>
              <p class="muted">${escapeHtml(restaurant.cuisine)} · ${escapeHtml(restaurant.offer)}</p>
            </div>
          </div>
          <div class="admin-metrics">
            <span><strong>${restaurant.time}</strong><small>Delivery</small></span>
            <span><strong>${restaurant.price}</strong><small>For two</small></span>
            <span><strong>${restaurant.items.length}</strong><small>Menu items</small></span>
          </div>
          <div class="admin-actions">
            <button class="outline-button" data-action="edit-restaurant" data-id="${restaurant.id}">Edit details</button>
            <button class="outline-button" data-action="menu-editor" data-id="${restaurant.id}">Edit menu</button>
            <button class="danger-button" data-action="delete-restaurant" data-id="${restaurant.id}">Delete</button>
          </div>
        </article>
      `).join('')}</div>
    </section>
    <section class="panel"><div class="panel-heading"><div><h2>All orders</h2><p class="muted">Customer and operations views use the same local demo orders.</p></div></div>
      ${state.orders.length ? `<div class="order-list">${[...state.orders].reverse().map((order) => renderOrderCard(order, order.status !== 'delivered' && order.status !== 'cancelled' ? `<button class="outline-button" data-action="cancel-order" data-id="${order.id}">Cancel order</button>` : '')).join('')}</div>` : `<div class="empty-state"><span>📋</span>No orders to show yet.</div>`}
    </section>
    <div class="footer"><button class="text-button" data-action="reset-demo">Reset demo data</button> · Clears local orders and bag from this browser</div>`;
}

function renderCustomerOrders() {
  return `<button class="back-button" data-action="go-home">← Back to restaurants</button><h1 class="page-title">Your orders<small>Track your recent ROMEO orders.</small></h1>
    ${state.orders.length ? `<div class="order-list">${[...state.orders].reverse().map((order) => renderOrderCard(order, `${!isLiveMode && order.status === 'pending' ? `<button class="outline-button" data-action="cancel-order" data-id="${order.id}">Cancel</button>` : ''}<button class="outline-button" data-action="reorder-order" data-id="${order.id}">Reorder</button>`)).join('')}</div>` : `<div class="panel empty-state"><span>🍽️</span>No orders yet. Your next favourite meal is waiting.</div>`}`;
}

async function loadRemoteData() {
  const [profileResult, restaurantResult, ordersResult] = await Promise.all([
    supabase.from('profiles').select('id, phone, display_name, role').eq('id', state.user.id).single(),
    supabase.from('restaurants')
      .select('id, name, cuisine, category, rating, eta_text, price_for_two, emoji, offer_text, distance, delivery_fee, menu_items(id, name, detail, price, emoji, is_active)')
      .eq('is_active', true)
      .order('name'),
    supabase.from('orders')
      .select('id, order_number, restaurant_id, customer_name, address, subtotal, delivery_fee, platform_fee, discount, total, promo_code, status, created_at, restaurants(name), order_items(id, menu_item_id, name, price, quantity)')
      .order('created_at', { ascending: false }),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (restaurantResult.error) throw restaurantResult.error;
  if (ordersResult.error) throw ordersResult.error;

  state.profile = profileResult.data;
  state.role = 'customer';
  restaurants = restaurantResult.data.map((entry) => ({
    id: entry.id,
    name: entry.name,
    cuisine: entry.cuisine,
    category: entry.category,
    rating: String(entry.rating),
    time: entry.eta_text,
    price: `${money(entry.price_for_two)} for two`,
    emoji: entry.emoji,
    offer: entry.offer_text || '',
    distance: entry.distance || 'Nearby',
    deliveryFee: entry.delivery_fee,
    items: (entry.menu_items || []).filter((item) => item.is_active).map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail,
      price: item.price,
      emoji: item.emoji,
    })),
  }));
  state.restaurants = restaurants;
  state.orders = ordersResult.data.map((order) => ({
    id: order.order_number,
    remoteId: order.id,
    restaurantId: order.restaurant_id,
    restaurantName: order.restaurants?.name,
    customerName: order.customer_name,
    address: order.address,
    items: (order.order_items || []).map((item) => ({
      id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    platformFee: order.platform_fee,
    discount: order.discount,
    promoCode: order.promo_code,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  }));
}

async function refreshAuthenticatedSession(session) {
  state.user = session?.user || null;
  state.remoteError = '';
  if (!state.user) {
    state.profile = null;
    state.orders = [];
    restaurants = [];
    state.restaurants = restaurants;
    state.remoteLoading = false;
    state.role = 'customer';
    render();
    return;
  }

  state.remoteLoading = true;
  render();
  try {
    await loadRemoteData();
    state.remoteLoading = false;
    render();
  } catch (error) {
    console.error('Unable to load ROMEO account data.', error);
    state.remoteError = 'Your account data could not be loaded. Please try again or contact ROMEO support.';
    state.remoteLoading = false;
    render();
  }
}

async function startApplication() {
  if (!supabase) {
    state.remoteLoading = false;
    render();
    return;
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => { void refreshAuthenticatedSession(session); }, 0);
  });
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) await refreshAuthenticatedSession(data.session);
    else {
      state.remoteLoading = false;
      render();
    }
  } catch (error) {
    console.error('Unable to start ROMEO securely.', error);
    state.remoteError = 'ROMEO could not reach its secure service. Check the Supabase project configuration.';
    state.remoteLoading = false;
    render();
  }
}

async function sendPhoneOtp() {
  const digits = document.getElementById('auth-phone')?.value.replace(/\D/g, '') || '';
  if (!/^[6-9]\d{9}$/.test(digits)) {
    notify('Enter a valid 10-digit Indian mobile number.');
    return;
  }
  const phone = `+91${digits}`;
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
  if (error) {
    console.error('Unable to send ROMEO sign-in code.', error);
    notify('We could not send a sign-in code. Please check the number and try again.');
    return;
  }
  state.authPhone = phone;
  state.authOtpSent = true;
  render();
  notify('Sign-in code sent.');
}

async function verifyPhoneOtp() {
  const token = document.getElementById('auth-code')?.value.trim() || '';
  if (!/^\d{6}$/.test(token)) {
    notify('Enter the 6-digit code from your SMS.');
    return;
  }
  const { data, error } = await supabase.auth.verifyOtp({ phone: state.authPhone, token, type: 'sms' });
  if (error) {
    console.error('Unable to verify ROMEO sign-in code.', error);
    notify('That code could not be verified. Check it or request a new one.');
    return;
  }
  state.authOtpSent = false;
  await refreshAuthenticatedSession(data.session);
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Unable to sign out of ROMEO.', error);
    notify('We could not sign you out. Please try again.');
  }
}

function renderEditorModal() {
  if (!state.editor) return '';
  if (state.editor.type === 'restaurant') {
    const restaurant = state.editor.restaurantId ? getRestaurantById(state.editor.restaurantId) : null;
    const formRestaurant = restaurant || { name: '', cuisine: '', category: 'Indian', rating: '4.8', time: '25–30 min', price: '₹350 for two', emoji: '🍽️', offer: 'Fresh today' };
    return `<div class="modal-backdrop" data-action="close-editor">
      <div class="modal" onclick="event.stopPropagation()">
        <h2>${state.editor.restaurantId ? 'Edit restaurant' : 'Add restaurant'}</h2>
        <p>Update the details your guests see across the app.</p>
        <div class="field-grid">
          <label class="field-label"><span>Name</span><input class="form-control" id="restaurant-name" value="${escapeHtml(formRestaurant.name)}" /></label>
          <label class="field-label"><span>Cuisine</span><input class="form-control" id="restaurant-cuisine" value="${escapeHtml(formRestaurant.cuisine)}" /></label>
          <label class="field-label"><span>Category</span><select class="form-control" id="restaurant-category"><option ${formRestaurant.category === 'Indian' ? 'selected' : ''}>Indian</option><option ${formRestaurant.category === 'South Indian' ? 'selected' : ''}>South Indian</option><option ${formRestaurant.category === 'Chinese' ? 'selected' : ''}>Chinese</option><option ${formRestaurant.category === 'Pizza' ? 'selected' : ''}>Pizza</option><option ${formRestaurant.category === 'Desserts' ? 'selected' : ''}>Desserts</option><option ${formRestaurant.category === 'Healthy' ? 'selected' : ''}>Healthy</option></select></label>
          <label class="field-label"><span>Rating</span><input class="form-control" id="restaurant-rating" value="${escapeHtml(formRestaurant.rating)}" /></label>
          <label class="field-label"><span>ETA</span><input class="form-control" id="restaurant-time" value="${escapeHtml(formRestaurant.time)}" /></label>
          <label class="field-label"><span>Price for two</span><input class="form-control" id="restaurant-price" value="${escapeHtml(formRestaurant.price)}" /></label>
          <label class="field-label"><span>Offer</span><input class="form-control" id="restaurant-offer" value="${escapeHtml(formRestaurant.offer)}" /></label>
          <label class="field-label"><span>Emoji</span><input class="form-control" id="restaurant-emoji" value="${escapeHtml(formRestaurant.emoji)}" maxlength="2" /></label>
        </div>
        <div class="modal-actions"><button class="outline-button" data-action="close-editor">Cancel</button><button class="primary-button" data-action="save-restaurant">${state.editor.restaurantId ? 'Save changes' : 'Create restaurant'}</button></div>
      </div>
    </div>`;
  }

  if (state.editor.type === 'menu') {
    const restaurant = getRestaurantById(state.editor.restaurantId);
    if (!restaurant) return '';
    const item = state.editor.itemId ? restaurant.items.find((entry) => entry.id === state.editor.itemId) : null;
    const formItem = item || { name: '', detail: '', price: 199, emoji: '🍽️' };
    return `<div class="modal-backdrop" data-action="close-editor">
      <div class="modal wide" onclick="event.stopPropagation()">
        <h2>${item ? 'Edit menu item' : 'Add menu item'}</h2>
        <p>Adjust the menu item, dish description, and pricing shown in the customer flow.</p>
        <div class="restaurant-editor-list">${restaurant.items.map((entry) => `<div class="menu-row"><span>${escapeHtml(entry.name)} · ${money(entry.price)}</span><div class="row-actions"><button class="tiny-button" data-action="edit-menu-item" data-restaurant="${restaurant.id}" data-id="${entry.id}">Edit</button><button class="tiny-button danger" data-action="delete-menu-item" data-restaurant="${restaurant.id}" data-id="${entry.id}">Remove</button></div></div>`).join('')}</div>
        <div class="field-grid">
          <label class="field-label"><span>Dish name</span><input class="form-control" id="menu-name" value="${escapeHtml(formItem.name)}" /></label>
          <label class="field-label"><span>Emoji</span><input class="form-control" id="menu-emoji" value="${escapeHtml(formItem.emoji)}" maxlength="2" /></label>
          <label class="field-label"><span>Price</span><input class="form-control" id="menu-price" value="${escapeHtml(formItem.price)}" type="number" min="1" /></label>
          <label class="field-label full"><span>Description</span><textarea class="form-control" id="menu-detail" rows="3">${escapeHtml(formItem.detail)}</textarea></label>
        </div>
        <div class="modal-actions"><button class="outline-button" data-action="close-editor">Cancel</button><button class="primary-button" data-action="save-menu-item" data-restaurant="${restaurant.id}" data-id="${item ? item.id : ''}">${item ? 'Save item' : 'Add item'}</button></div>
      </div>
    </div>`;
  }
  return '';
}

function renderCheckout() {
  const restaurant = selectedRestaurant();
  const subtotal = cartSubtotal();
  const delivery = subtotal >= 399 ? 0 : (restaurant?.deliveryFee ?? 29);
  const promo = state.promoCode ? getPromoDetails() : null;
  const total = subtotal + delivery + (state.cart.length ? 5 : 0) - (promo?.discount || 0);
  return `<div class="back-button"><button class="back-button" data-action="go-home">← Continue browsing</button></div>
    <h1 class="page-title">Checkout<small>Review your order before placing it.</small></h1>
    <div class="content-layout"><section class="panel"><h2>Delivery details</h2><p class="muted">${isLiveMode ? 'Your order is securely linked to your ROMEO account.' : 'Demo delivery address. No location is collected or sent.'}</p>
      <label class="form-label" for="checkout-name">Name</label><input class="form-control" id="checkout-name" value="${escapeHtml(isLiveMode ? (state.profile?.display_name || '') : 'Krish')}" autocomplete="name" />
      <label class="form-label" for="checkout-address">Delivery address</label><input class="form-control" id="checkout-address" value="${isLiveMode ? '' : 'Jubilee Hills, Hyderabad'}" autocomplete="street-address" />
      <label class="form-label" for="checkout-payment">Payment method</label><select class="form-control" id="checkout-payment"><option>Cash on delivery · pay when your order arrives</option></select>
      <div class="promo-panel">
        <label class="form-label" for="promo-code">Promo code</label>
        <div class="promo-entry"><input class="form-control" id="promo-code" placeholder="Try ROMEO10" value="${escapeHtml(state.promoCode)}" /><button class="outline-button" data-action="apply-promo">Apply</button></div>
        <p class="promo-hint">${promo ? (promo.error ? escapeHtml(promo.error) : `${escapeHtml(promo.code)} applied · ${escapeHtml(promo.offer.label)}`) : 'Try ROMEO10, TASTY50, or WELCOME15.'}</p>
        ${promo && !promo.error ? `<button class="text-button promo-remove" data-action="remove-promo">Remove code</button>` : ''}
      </div>
      <div class="notice" style="margin-top:16px">${isLiveMode ? 'MVP pilot · cash on delivery only. Online payments are not enabled.' : 'This is a local demo checkout. No payment will be collected.'}</div>
      <button class="primary-button full" data-action="place-order">${isLiveMode ? 'Place COD order' : 'Place demo order'} · ${money(total)}</button>
    </section><aside class="cart-panel"><h2>Order summary</h2><p class="muted">${restaurant ? escapeHtml(restaurant.name) : ''}</p>
      ${state.cart.map((line) => `<div class="cart-line"><span>${line.quantity} × ${escapeHtml(line.name)}</span><strong>${money(line.price * line.quantity)}</strong></div>`).join('')}
      <div class="bill"><div class="bill-row"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="bill-row"><span>Delivery</span><span>${delivery ? money(delivery) : 'FREE'}</span></div><div class="bill-row"><span>Platform fee</span><span>${money(state.cart.length ? 5 : 0)}</span></div>${promo?.discount ? `<div class="bill-row promo-saving"><span>Promo · ${escapeHtml(promo.code)}</span><span>−${money(promo.discount)}</span></div>` : ''}<div class="bill-row total"><span>Total</span><span>${money(total)}</span></div></div>
    </aside></div>`;
}

function renderContent() {
  if (state.role === 'partner') return renderPartner();
  if (state.role === 'rider') return renderRider();
  if (state.role === 'admin') return renderAdmin();
  if (state.screen === 'orders') return renderCustomerOrders();
  if (state.screen === 'checkout') return renderCheckout();
  if (state.screen === 'restaurant') return renderRestaurant();
  return renderHome();
}

function render() {
  document.title = 'ROMEO — Food, with feeling';
  if (isLiveMode && (!state.user || state.remoteLoading || state.remoteError)) {
    document.getElementById('app').innerHTML = `${renderSignIn()}<div class="toast" role="status" aria-live="polite"></div>`;
    return;
  }
  document.getElementById('app').innerHTML = `${renderHeader()}<main class="shell">${renderRoleTabs()}${renderContent()}<div class="footer">${isLiveMode ? 'ROMEO pilot · Cash on delivery' : 'ROMEO demo · Fresh food, with feeling.'}</div></main>${renderEditorModal()}<div class="toast" role="status" aria-live="polite"></div>`;
  const search = document.getElementById('restaurant-search');
  if (search) {
    search.addEventListener('input', (event) => {
      const cursor = event.target.selectionStart;
      state.search = event.target.value;
      persist();
      const scrollY = window.scrollY;
      render();
      const updatedSearch = document.getElementById('restaurant-search');
      updatedSearch.focus();
      updatedSearch.setSelectionRange(cursor, cursor);
      window.scrollTo(0, scrollY);
    });
  }
}

function addItem(restaurantId, itemId) {
  const restaurant = restaurants.find((entry) => entry.id === restaurantId);
  const item = restaurant?.items.find((entry) => entry.id === itemId);
  if (!restaurant || !item) return;
  if (state.cart.length && state.cart[0].restaurantId !== restaurantId) {
    const accepted = window.confirm('Your bag has items from another restaurant. Clear it and add this item?');
    if (!accepted) return;
    state.cart = [];
    state.promoCode = '';
  }
  const existing = state.cart.find((line) => line.id === item.id);
  if (existing) existing.quantity += 1;
  else state.cart.push({ ...item, restaurantId, quantity: 1 });
  persist();
  render();
  notify(`${item.name} added to your bag`);
}

async function placeOrder() {
  if (!state.cart.length) return;
  const nameInput = document.getElementById('checkout-name');
  const addressInput = document.getElementById('checkout-address');
  const customerName = nameInput?.value.trim();
  const address = addressInput?.value.trim();
  if (!customerName || !address) {
    notify('Add your name and delivery address to continue');
    return;
  }

  if (supabase) {
    const submitButton = document.querySelector('[data-action="place-order"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Placing secure order…';
    }
    const { error } = await supabase.rpc('place_order', {
      p_restaurant_id: state.cart[0].restaurantId,
      p_items: state.cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      p_customer_name: customerName,
      p_delivery_address: address,
      p_promo_code: state.promoCode || null,
    });
    if (error) {
      console.error('Unable to place ROMEO order.', error);
      notify('We could not place the order. Your bag is still here; please try again.');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Place COD order';
      }
      return;
    }
    try {
      await loadRemoteData();
    } catch (loadError) {
      console.error('Order placed but order history could not be refreshed.', loadError);
      state.remoteError = 'Your order was submitted, but we could not refresh its status. Check My orders or contact ROMEO support.';
    }
    state.cart = [];
    state.promoCode = '';
    state.screen = 'orders';
    persist();
    render();
    notify('Your order is in! The restaurant will confirm it shortly.');
    return;
  }

  const subtotal = cartSubtotal();
  const promo = state.promoCode ? getPromoDetails() : null;
  const discount = promo && !promo.error ? promo.discount : 0;
  const order = {
    id: `RM-${Date.now().toString().slice(-6)}`,
    restaurantId: state.cart[0].restaurantId,
    customerName,
    address,
    items: state.cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    subtotal,
    promoCode: discount ? promo.code : '',
    discount,
    total: subtotal + (subtotal >= 399 ? 0 : 29) + 5 - discount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  state.orders.push(order);
  state.cart = [];
  state.promoCode = '';
  state.screen = 'orders';
  persist();
  render();
  notify('Demo order placed. Open Partner to process it.');
}

function updateOrder(orderId, nextStatus) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) return;
  const allowed = {
    pending: ['accepted', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['picked_up', 'cancelled'],
    picked_up: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
  };
  if (!allowed[order.status]?.includes(nextStatus)) {
    notify('That status change is not available for this order.');
    return;
  }
  order.status = nextStatus;
  persist();
  render();
  notify(`Order ${order.id}: ${statusLabels[nextStatus]}`);
}

function reorderOrder(orderId) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) return;
  const restaurant = getRestaurantById(order.restaurantId);
  if (!restaurant) {
    notify('This restaurant is no longer available.');
    return;
  }

  state.cart = order.items.map((item) => {
    const menuMatch = restaurant.items.find((entry) => entry.id === item.id);
    return {
      ...menuMatch,
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity) || 1,
      restaurantId: order.restaurantId,
      emoji: menuMatch?.emoji || '🍽️',
    };
  });
  state.role = 'customer';
  state.screen = 'restaurant';
  state.restaurantId = order.restaurantId;
  persist();
  render();
  notify(`Reordered ${restaurant.name} into your bag.`);
}

function saveRestaurantChanges() {
  const name = document.getElementById('restaurant-name')?.value.trim();
  const cuisine = document.getElementById('restaurant-cuisine')?.value.trim();
  const category = document.getElementById('restaurant-category')?.value || 'Indian';
  const rating = document.getElementById('restaurant-rating')?.value.trim() || '4.8';
  const time = document.getElementById('restaurant-time')?.value.trim() || '25–30 min';
  const price = document.getElementById('restaurant-price')?.value.trim() || '₹350 for two';
  const offer = document.getElementById('restaurant-offer')?.value.trim() || 'Fresh today';
  const emoji = document.getElementById('restaurant-emoji')?.value.trim() || '🍽️';

  if (!name || !cuisine) {
    notify('Give the restaurant a name and cuisine before saving.');
    return;
  }

  const isCreating = !(state.editor && state.editor.restaurantId);
  if (state.editor && state.editor.restaurantId) {
    const restaurant = getRestaurantById(state.editor.restaurantId);
    if (!restaurant) return;
    Object.assign(restaurant, { name, cuisine, category, rating, time, price, offer, emoji });
  } else {
    const id = slugify(`${name}-${Date.now()}`);
    restaurants.push({
      id,
      name,
      cuisine,
      category,
      rating,
      time,
      price,
      emoji,
      offer,
      items: [
        { id: 'starter', name: 'Chef special', detail: 'Freshly made to order.', price: 199, emoji: '🍽️' },
      ],
    });
    state.restaurantId = id;
    state.screen = 'restaurant';
  }

  state.editor = null;
  persist();
  render();
  notify(isCreating ? 'Restaurant created successfully.' : 'Restaurant updated.');
}

function saveMenuItemChanges() {
  const name = document.getElementById('menu-name')?.value.trim();
  const detail = document.getElementById('menu-detail')?.value.trim() || 'Freshly prepared for you.';
  const price = Number(document.getElementById('menu-price')?.value || 0);
  const emoji = document.getElementById('menu-emoji')?.value.trim() || '🍽️';
  if (!name || !Number.isFinite(price) || price <= 0) {
    notify('Add a dish name and a valid price to save this menu item.');
    return;
  }

  const restaurantId = state.editor?.restaurantId;
  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) return;

  const isUpdating = Boolean(state.editor?.itemId);
  const itemId = state.editor?.itemId || slugify(`${name}-${Date.now()}`);
  const item = { id: itemId, name, detail, price, emoji };
  const index = restaurant.items.findIndex((entry) => entry.id === itemId);
  if (index >= 0) restaurant.items[index] = item;
  else restaurant.items.push(item);

  state.editor = null;
  persist();
  render();
  notify(isUpdating ? 'Menu item updated.' : 'Menu item added.');
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, role, category, delta, restaurant, status } = button.dataset;
  switch (action) {
    case 'set-role':
      if (isLiveMode && role !== 'customer') return;
      state.role = role;
      state.screen = 'home';
      state.restaurantId = null;
      break;
    case 'go-home':
      state.role = 'customer';
      state.screen = 'home';
      state.restaurantId = null;
      state.customerMode = 'all';
      break;
    case 'set-category':
      state.category = category;
      state.screen = 'home';
      break;
    case 'set-customer-mode':
      state.customerMode = button.dataset.mode || 'all';
      state.screen = 'home';
      break;
    case 'reset-filters':
      state.category = 'All';
      state.search = '';
      state.customerMode = 'all';
      break;
    case 'toggle-favorite': {
      const favoriteIndex = state.favorites.indexOf(id);
      if (favoriteIndex >= 0) state.favorites.splice(favoriteIndex, 1);
      else state.favorites.push(id);
      break;
    }
    case 'open-restaurant':
      if (button.tagName === 'ARTICLE' || button.tagName === 'BUTTON') {
        state.restaurantId = id;
        state.screen = 'restaurant';
      }
      break;
    case 'add-item':
      addItem(restaurant, id);
      return;
    case 'change-quantity': {
      const line = state.cart.find((item) => item.id === id);
      if (line) {
        line.quantity += Number(delta);
        if (line.quantity <= 0) state.cart = state.cart.filter((item) => item.id !== id);
      }
      break;
    }
    case 'checkout':
      if (!state.cart.length) {
        notify('Add something delicious to your bag first');
        return;
      }
      state.screen = 'checkout';
      break;
    case 'place-order':
    void placeOrder();
      return;
    case 'send-phone-otp':
    void sendPhoneOtp();
    return;
    case 'verify-phone-otp':
    void verifyPhoneOtp();
    return;
    case 'edit-phone':
    state.authOtpSent = false;
    render();
    return;
    case 'sign-out':
    void signOut();
    return;
    case 'retry-connection':
    state.remoteError = '';
    state.remoteLoading = true;
    render();
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (data.session) return refreshAuthenticatedSession(data.session);
      state.remoteLoading = false;
      render();
    }).catch((error) => {
      console.error('Unable to reconnect to ROMEO.', error);
      state.remoteError = 'ROMEO could not reach its secure service. Check the Supabase project configuration.';
      state.remoteLoading = false;
      render();
    });
    return;
    case 'apply-promo': {
      const input = document.getElementById('promo-code');
      const promo = getPromoDetails(input?.value);
      if (promo.error) {
        notify(promo.error);
        return;
      }
      state.promoCode = promo.code;
      persist();
      void startApplication();
      notify(`${promo.code} applied. You save ${money(promo.discount)}.`);
      return;
    }
    case 'remove-promo':
      state.promoCode = '';
      break;
    case 'my-orders':
      state.screen = 'orders';
      break;
    case 'reorder-order':
      reorderOrder(id);
      return;
    case 'advance-order':
      updateOrder(id, status);
      return;
    case 'cancel-order':
      updateOrder(id, 'cancelled');
      return;
    case 'add-restaurant':
      state.editor = { type: 'restaurant', restaurantId: null };
      break;
    case 'edit-restaurant':
      state.editor = { type: 'restaurant', restaurantId: id };
      break;
    case 'delete-restaurant': {
      if (!window.confirm('Delete this restaurant and its menu from ROMEO?')) return;
      const targetRestaurant = getRestaurantById(id);
      if (targetRestaurant) {
        restaurants = restaurants.filter((restaurantEntry) => restaurantEntry.id !== id);
        state.restaurants = restaurants;
        if (state.cart.some((line) => line.restaurantId === id)) state.cart = [];
      }
      break;
    }
    case 'menu-editor':
      state.editor = { type: 'menu', restaurantId: id, itemId: null };
      break;
    case 'edit-menu-item':
      state.editor = { type: 'menu', restaurantId: restaurant, itemId: id };
      break;
    case 'delete-menu-item': {
      const restaurantEntry = getRestaurantById(restaurant);
      if (!restaurantEntry) return;
      restaurantEntry.items = restaurantEntry.items.filter((entry) => entry.id !== id);
      state.editor = { type: 'menu', restaurantId: restaurant, itemId: null };
      break;
    }
    case 'save-restaurant':
      saveRestaurantChanges();
      return;
    case 'save-menu-item':
      saveMenuItemChanges();
      return;
    case 'close-editor':
      state.editor = null;
      break;
    case 'reset-demo':
      if (window.confirm('Clear the demo cart and all demo orders from this browser?')) {
        state = createInitialState();
        restaurants = state.restaurants;
      }
      break;
    case 'scroll-restaurants':
      document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    default:
      return;
  }
  persist();
  render();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.matches('#auth-phone')) {
    event.preventDefault();
    void sendPhoneOtp();
    return;
  }
  if (event.key === 'Enter' && event.target.matches('#auth-code')) {
    event.preventDefault();
    void verifyPhoneOtp();
    return;
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.restaurant-card')) {
    event.preventDefault();
    event.target.click();
  }
});

void startApplication();
