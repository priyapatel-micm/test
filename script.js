/* ========================================
   FORMA E-Commerce — script.js
   Features: routing, product rendering, cart (localStorage), checkout validation
   ======================================== */

// =============================================
// PRODUCT DATA
// =============================================
const PRODUCTS = [
  {
    id: 1, name: "Arch Runner Pro", category: "footwear",
    price: 4499, originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
    description: "Engineered for all-day comfort with our signature Arch Support System. Lightweight mesh upper, responsive foam midsole, and a durable rubber outsole built to handle city streets and trail paths alike.",
    rating: 5, reviews: 142, sale: true
  },
  {
    id: 2, name: "Canvas Weekender Bag", category: "accessories",
    price: 3299, originalPrice: null,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    description: "Premium waxed canvas with full-grain leather handles and brass hardware. Fits a weekend's worth of essentials — or everything you need for a Monday morning.",
    rating: 5, reviews: 89, sale: false
  },
  {
    id: 3, name: "Merino Crew Sweater", category: "apparel",
    price: 2899, originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80",
    description: "100% extra-fine merino wool. Naturally temperature-regulating, incredibly soft against skin. A sweater you'll reach for every season.",
    rating: 4, reviews: 67, sale: true
  },
  {
    id: 4, name: "Linen Throw Blanket", category: "home",
    price: 1899, originalPrice: null,
    image: "https://images.unsplash.com/photo-1545289414-1c3cb1c06238?w=600&q=80",
    description: "Stonewashed linen in a generous 140×180cm. Perfectly draped over a sofa or layered on a bed. Softens with every wash.",
    rating: 5, reviews: 204, sale: false
  },
  {
    id: 5, name: "Minimalist Watch", category: "accessories",
    price: 6499, originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    description: "Swiss quartz movement, sapphire crystal glass, and a genuine Italian leather strap. Designed to be worn from boardroom to beach.",
    rating: 5, reviews: 312, sale: true
  },
  {
    id: 6, name: "Slip-On Loafer", category: "footwear",
    price: 3799, originalPrice: null,
    image: "https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=600&q=80",
    description: "Hand-stitched full-grain leather upper, memory foam insole, and a flexible rubber sole. The loafer that goes with everything.",
    rating: 4, reviews: 55, sale: false
  },
  {
    id: 7, name: "Ceramic Mug Set", category: "home",
    price: 1299, originalPrice: null,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
    description: "Set of 4 hand-thrown stoneware mugs. Each one subtly unique, glazed in a warm matte finish. Dishwasher and microwave safe.",
    rating: 5, reviews: 178, sale: false
  },
  {
    id: 8, name: "Classic Oxford Shirt", category: "apparel",
    price: 2199, originalPrice: 2699,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
    description: "Japanese oxford cotton, a slightly relaxed fit, and mother-of-pearl buttons. Available in 6 colours. Wash at 30°, tumble dry low.",
    rating: 4, reviews: 93, sale: true
  }
];

// =============================================
// STATE
// =============================================
let cart = JSON.parse(localStorage.getItem('forma_cart')) || [];
let previousPage = 'home';
let currentCategory = '';
let currentProduct = null;

// =============================================
// UTILITY: Save cart to localStorage
// =============================================
function saveCart() {
  localStorage.setItem('forma_cart', JSON.stringify(cart));
}

// =============================================
// UTILITY: Format currency (₹)
// =============================================
function formatPrice(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// =============================================
// UTILITY: Render star rating
// =============================================
function renderStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

// =============================================
// TOAST NOTIFICATION
// =============================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// =============================================
// PAGE ROUTING (single-page navigation)
// =============================================
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Highlight active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Render page content if needed
  if (pageId === 'products') renderAllProducts();
  if (pageId === 'cart') renderCart();
  if (pageId === 'checkout') renderCheckoutSummary();

  // Close mobile nav
  closeMobileNav();
}

function goBack() {
  showPage(previousPage);
}

// =============================================
// MOBILE NAV TOGGLE
// =============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

function closeMobileNav() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}

// =============================================
// BUILD PRODUCT CARD HTML
// =============================================
function buildProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    ${product.sale ? '<span class="badge-sale">SALE</span>' : ''}
    <div class="product-card-img">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
    </div>
    <div class="product-card-body">
      <div class="product-card-category">${product.category}</div>
      <div class="product-card-name">${product.name}</div>
      <div class="product-card-footer">
        <div class="product-price">
          ${formatPrice(product.price)}
          ${product.originalPrice ? `<span class="original">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <button class="btn-add-card" title="Add to cart"
          onclick="event.stopPropagation(); addToCart(${product.id})">+</button>
      </div>
    </div>
  `;
  // Click card → detail page
  card.addEventListener('click', () => openProductDetail(product.id));
  return card;
}

// =============================================
// HOME: FEATURED PRODUCTS (first 4)
// =============================================
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = '';
  PRODUCTS.slice(0, 4).forEach(p => grid.appendChild(buildProductCard(p)));
}

// =============================================
// CATEGORY FILTER (from home chips)
// =============================================
function filterCategory(cat) {
  currentCategory = cat;
  // Highlight chip
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.toggle('active',
      (cat === '' && chip.textContent.includes('All')) ||
      chip.textContent.toLowerCase().includes(cat)
    );
  });
  showPage('products');
}

// =============================================
// ALL PRODUCTS PAGE
// =============================================
function renderAllProducts() {
  const grid = document.getElementById('allProductsGrid');
  grid.innerHTML = '';
  let products = [...PRODUCTS];

  // Filter by category
  if (currentCategory) {
    products = products.filter(p => p.category === currentCategory);
  }

  // Apply sort
  const sort = document.getElementById('sortSelect').value;
  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));

  if (products.length === 0) {
    grid.innerHTML = '<p style="color:var(--clr-ink-light);padding:2rem 0">No products found in this category.</p>';
    return;
  }
  products.forEach(p => grid.appendChild(buildProductCard(p)));
}

// Sort dropdown handler
function sortProducts() {
  renderAllProducts();
}

// =============================================
// PRODUCT DETAIL PAGE
// =============================================
function openProductDetail(id) {
  previousPage = document.querySelector('.page.active')?.id || 'home';
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  currentProduct = { ...product, qty: 1 };

  const container = document.getElementById('productDetailContent');
  container.innerHTML = `
    <div class="detail-img-wrap">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="detail-info">
      <div class="detail-category">${product.category}</div>
      <h1 class="detail-name">${product.name}</h1>
      <div class="detail-price">
        ${formatPrice(product.price)}
        ${product.originalPrice ? `<span class="detail-original">${formatPrice(product.originalPrice)}</span>` : ''}
      </div>
      <div class="detail-stars">${renderStars(product.rating)} <small style="color:var(--clr-ink-light)">(${product.reviews} reviews)</small></div>
      <p class="detail-desc">${product.description}</p>
      <div class="detail-qty">
        <label>Quantity</label>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeDetailQty(-1)">−</button>
          <span id="detailQty">1</span>
          <button class="qty-btn" onclick="changeDetailQty(1)">+</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="addDetailToCart()">Add to Cart</button>
        <button class="btn btn-secondary" onclick="showPage('products')">Continue Shopping</button>
      </div>
    </div>
  `;
  showPage('product-detail');
}

// Change quantity on detail page
function changeDetailQty(delta) {
  currentProduct.qty = Math.max(1, (currentProduct.qty || 1) + delta);
  document.getElementById('detailQty').textContent = currentProduct.qty;
}

// Add selected quantity from detail page to cart
function addDetailToCart() {
  if (!currentProduct) return;
  const qty = currentProduct.qty || 1;
  for (let i = 0; i < qty; i++) addToCart(currentProduct.id, false);
  showToast(`${qty} × ${currentProduct.name} added to cart`);
  updateCartCount();
}

// =============================================
// CART LOGIC
// =============================================

// Add single unit to cart
function addToCart(id, notify = true) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price,
                image: product.image, category: product.category, qty: 1 });
  }
  saveCart();
  updateCartCount();
  if (notify) showToast(`${product.name} added to cart`);
}

// Update item quantity in cart
function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  updateCartCount();
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartCount();
  showToast('Item removed from cart');
}

// Compute cart totals
function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 2000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

// Update cart badge in navbar
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

// =============================================
// RENDER CART PAGE
// =============================================
function renderCart() {
  const list = document.getElementById('cartItemsList');
  const summary = document.getElementById('cartSummary');

  if (cart.length === 0) {
    list.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="#" onclick="showPage(\'products\'); return false;">Start shopping →</a></p>';
    summary.innerHTML = '';
    return;
  }

  list.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-cat">${item.category}</div>
        <div class="cart-item-price">${formatPrice(item.price)} each</div>
        <div class="cart-item-controls" style="margin-top:.6rem">
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
      <div class="cart-item-subtotal">${formatPrice(item.price * item.qty)}</div>
    `;
    list.appendChild(div);
  });

  // Summary panel
  const { subtotal, shipping, tax, total } = getCartTotals();
  summary.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-line"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-line"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
    <div class="summary-line"><span>GST (18%)</span><span>${formatPrice(tax)}</span></div>
    <div class="summary-line total"><span>Total</span><span>${formatPrice(total)}</span></div>
    <button class="btn btn-primary btn-full" onclick="showPage('checkout')">Proceed to Checkout</button>
    <button class="btn btn-secondary btn-full" style="margin-top:.75rem" onclick="showPage('products')">Continue Shopping</button>
  `;
}

// =============================================
// RENDER CHECKOUT SIDEBAR SUMMARY
// =============================================
function renderCheckoutSummary() {
  const el = document.getElementById('checkoutSummary');
  if (cart.length === 0) { el.innerHTML = ''; return; }
  const { subtotal, shipping, tax, total } = getCartTotals();
  const itemsHtml = cart.map(item =>
    `<div class="checkout-summary-item">
      <span>${item.name} × ${item.qty}</span>
      <span>${formatPrice(item.price * item.qty)}</span>
    </div>`
  ).join('');

  el.innerHTML = `
    <h3>Your Order</h3>
    ${itemsHtml}
    <hr style="border:none;border-top:1px solid var(--clr-border);margin:1rem 0">
    <div class="checkout-summary-item"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="checkout-summary-item"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
    <div class="checkout-summary-item"><span>GST (18%)</span><span>${formatPrice(tax)}</span></div>
    <div class="checkout-summary-item" style="font-size:1rem;font-weight:700;color:var(--clr-ink);margin-top:.5rem">
      <span>Total</span><span>${formatPrice(total)}</span>
    </div>
  `;
}

// =============================================
// CHECKOUT FORM VALIDATION
// =============================================
function setError(fieldId, errId, message) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (message) {
    field.classList.add('invalid');
    err.textContent = message;
    return false;
  } else {
    field.classList.remove('invalid');
    err.textContent = '';
    return true;
  }
}

function validateForm() {
  let valid = true;

  // First name
  const fn = document.getElementById('firstName').value.trim();
  if (!fn) valid = setError('firstName', 'firstNameErr', 'First name is required') && valid;
  else setError('firstName', 'firstNameErr', '');

  // Last name
  const ln = document.getElementById('lastName').value.trim();
  if (!ln) valid = setError('lastName', 'lastNameErr', 'Last name is required') && valid;
  else setError('lastName', 'lastNameErr', '');

  // Email
  const email = document.getElementById('email').value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) valid = setError('email', 'emailErr', 'Email is required') && valid;
  else if (!emailRe.test(email)) valid = setError('email', 'emailErr', 'Enter a valid email') && valid;
  else setError('email', 'emailErr', '');

  // Phone
  const phone = document.getElementById('phone').value.trim().replace(/\s+/g, '');
  if (!phone) valid = setError('phone', 'phoneErr', 'Phone number is required') && valid;
  else if (phone.length < 10) valid = setError('phone', 'phoneErr', 'Enter a valid phone number') && valid;
  else setError('phone', 'phoneErr', '');

  // Address
  const addr = document.getElementById('address').value.trim();
  if (!addr) valid = setError('address', 'addressErr', 'Address is required') && valid;
  else setError('address', 'addressErr', '');

  // City
  const city = document.getElementById('city').value.trim();
  if (!city) valid = setError('city', 'cityErr', 'City is required') && valid;
  else setError('city', 'cityErr', '');

  // PIN
  const pin = document.getElementById('pincode').value.trim();
  if (!pin) valid = setError('pincode', 'pincodeErr', 'PIN Code is required') && valid;
  else if (!/^\d{6}$/.test(pin)) valid = setError('pincode', 'pincodeErr', 'Enter a valid 6-digit PIN') && valid;
  else setError('pincode', 'pincodeErr', '');

  // State
  const state = document.getElementById('state').value;
  if (!state) valid = setError('state', 'stateErr', 'Please select a state') && valid;
  else setError('state', 'stateErr', '');

  // Card name
  const cname = document.getElementById('cardName').value.trim();
  if (!cname) valid = setError('cardName', 'cardNameErr', 'Name on card is required') && valid;
  else setError('cardName', 'cardNameErr', '');

  // Card number (16 digits, spaces allowed)
  const cnum = document.getElementById('cardNumber').value.replace(/\s+/g, '');
  if (!cnum) valid = setError('cardNumber', 'cardNumberErr', 'Card number is required') && valid;
  else if (!/^\d{16}$/.test(cnum)) valid = setError('cardNumber', 'cardNumberErr', 'Enter a valid 16-digit card number') && valid;
  else setError('cardNumber', 'cardNumberErr', '');

  // Expiry MM/YY
  const exp = document.getElementById('expiry').value.trim();
  if (!exp) valid = setError('expiry', 'expiryErr', 'Expiry is required') && valid;
  else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) valid = setError('expiry', 'expiryErr', 'Format: MM/YY') && valid;
  else setError('expiry', 'expiryErr', '');

  // CVV
  const cvv = document.getElementById('cvv').value.trim();
  if (!cvv) valid = setError('cvv', 'cvvErr', 'CVV is required') && valid;
  else if (!/^\d{3}$/.test(cvv)) valid = setError('cvv', 'cvvErr', 'Enter a 3-digit CVV') && valid;
  else setError('cvv', 'cvvErr', '');

  return valid;
}

// Format card number with spaces as user types
document.getElementById('cardNumber').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '').substring(0, 16);
  this.value = val.replace(/(.{4})/g, '$1 ').trim();
});

// Format expiry with slash
document.getElementById('expiry').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
  this.value = val;
});

// Checkout form submit
document.getElementById('checkoutForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm()) return;
  // Clear cart and show success
  cart = [];
  saveCart();
  updateCartCount();
  showPage('success');
  this.reset();
});

// =============================================
// INITIALISE
// =============================================
function init() {
  renderFeatured();
  updateCartCount();
  showPage('home');
}

init();
