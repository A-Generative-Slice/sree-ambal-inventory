/**
 * ============================================================================
 * SREE AMBAL CATERING — MINIMAL MULTILINGUAL PORTAL v2 (app.js)
 * 200+ South Indian Catalog, Batch Cart, Mandatory Photo Security, Approvals & CSV
 * ============================================================================
 */

// Firebase Production Credentials (You can replace this placeholder with your own configuration)
const firebaseConfig = {
  apiKey: "AIzaSyDAlPb_MgAFlx1UyI1xIOrKCsO25Qm-wKM",
  authDomain: "sree-ambal-catering.firebaseapp.com",
  projectId: "sree-ambal-catering",
  storageBucket: "sree-ambal-catering.firebasestorage.app",
  messagingSenderId: "418935087027",
  appId: "1:418935087027:web:89d80282a2d5358e8675c6",
  measurementId: "G-WRK303ZBMY"
};

// Core Target Items & Seed Categories
const TARGET_ITEMS = ['Sugar', 'Rice', 'Logistics Containers'];

// State Management
let db = null;
let inventoryData = [];
let activeCatalog = [];
let batchCart = [];
let currentTxType = 'IN';
let cartPhotoDataUrl = null;
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

let auditLogs = JSON.parse(localStorage.getItem('sreeambal_audit_logs') || '[]');
let staffAccounts = JSON.parse(localStorage.getItem('sreeambal_staff_accounts') || '[]');
let customRequests = JSON.parse(localStorage.getItem('sreeambal_custom_requests') || '[]');
let currentUserRole = localStorage.getItem('sreeambal_user_role') || null;
let currentStaffName = localStorage.getItem('sreeambal_staff_name') || 'Ground Staff';

// DOM Elements
const networkStatusPill = document.getElementById('network-status');
const statusText = document.getElementById('status-text');
const offlineBanner = document.getElementById('offline-banner');
const switchRoleBtn = document.getElementById('switch-role-btn');
const roleSubtitle = document.getElementById('role-subtitle');

/**
 * 1. Initialize PWA Service Worker
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
        .catch(err => console.warn('[PWA] Service Worker error:', err));
    });
  }
}

/**
 * 2. Initialize App, Catalog & Supabase Channels
 */
function initApp() {
  // Load catalog from window or module
  if (typeof SOUTH_INDIAN_CATALOG !== 'undefined') {
    activeCatalog = [...SOUTH_INDIAN_CATALOG];
  } else if (window.SOUTH_INDIAN_CATALOG) {
    activeCatalog = [...window.SOUTH_INDIAN_CATALOG];
  }

  // Add any saved approved custom items to activeCatalog
  const savedCustom = JSON.parse(localStorage.getItem('sreeambal_approved_custom') || '[]');
  savedCustom.forEach(item => {
    if (!activeCatalog.some(c => c.id === item.id)) activeCatalog.push(item);
  });

  // Setup Network Listeners
  window.addEventListener('online', () => handleNetworkChange(true));
  window.addEventListener('offline', () => handleNetworkChange(false));
  handleNetworkChange(navigator.onLine);

  // Initialize Firebase
  if (typeof firebase !== 'undefined') {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      
      // Enable offline persistence for seamless offline experience
      db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn('[Firestore Persistence]: Multiple tabs open, persistence can only be enabled in one tab.');
        } else if (err.code == 'unimplemented') {
          console.warn('[Firestore Persistence]: The current browser does not support all of the features required.');
        }
      });
      
      setupRealtimeChannels();
    } catch (err) {
      console.warn('[Firebase Init Exception]:', err);
      showToast('Offline Mode: Firebase SDK initialization failed', 'error');
    }
  } else {
    showToast('Offline Mode: Firebase SDK unreachable', 'error');
  }

  // Seed staff accounts if empty
  if (staffAccounts.length === 0) {
    staffAccounts = [
      { id: 'staff-1', name: 'Kumar - Kitchen Supervisor', email: 'kumar@sreeambal.com', status: 'Approved', regTime: '2026-07-01', pin: '1111' },
      { id: 'staff-2', name: 'Ramesh - Storekeeper', email: 'ramesh@sreeambal.com', status: 'Approved', regTime: '2026-07-02', pin: '2222' },
      { id: 'staff-3', name: 'Anand - Delivery Lead', email: 'anand@sreeambal.com', status: 'Pending Approval', regTime: '2026-07-05', pin: '3333' }
    ];
    saveStaffAccounts();
  }

  // Fetch live staff accounts and audit logs from database in background
  fetchStaffAccounts();
  fetchAuditLogs();

  // Apply multilingual translations
  if (typeof applyTranslations === 'function') applyTranslations();

  // Route View based on active role
  routeToActiveRole();
  fetchInventory(false);
}

/**
 * 3. Network Status & Refresh Handler
 */
function handleNetworkChange(online) {
  if (networkStatusPill && statusText) {
    if (online) {
      networkStatusPill.className = 'status-pill status-online';
      statusText.textContent = typeof t === 'function' ? t('statusConnected') : 'Live Connected';
      if (offlineBanner) offlineBanner.classList.add('hidden');
      if (inventoryData.length > 0) fetchInventory(true);
    } else {
      networkStatusPill.className = 'status-pill status-offline';
      statusText.textContent = typeof t === 'function' ? t('statusOffline') : 'Offline Mode';
      if (offlineBanner) offlineBanner.classList.remove('hidden');
    }
  }
}

function forceRefreshData() {
  const btn = document.getElementById('refresh-btn');
  if (btn) {
    btn.style.transform = 'rotate(360deg)';
    btn.style.transition = 'transform 0.6s ease';
  }
  fetchInventory(false).finally(() => {
    setTimeout(() => { if (btn) btn.style.transform = 'none'; }, 600);
    showToast('Database ledger refreshed!', 'info');
  });
}

/**
 * 4. Single Language Dropdown Toggle & Switching
 */
function toggleLangMenu() {
  const menu = document.getElementById('lang-dropdown-menu');
  const btn = document.getElementById('lang-toggle-btn');
  if (menu && btn) {
    const isHidden = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !isHidden);
    btn.setAttribute('aria-expanded', isHidden);
  }
}

function selectLang(langCode) {
  const menu = document.getElementById('lang-dropdown-menu');
  const label = document.getElementById('current-lang-label');
  if (menu) menu.classList.add('hidden');
  
  const names = { en: 'English', ta: 'தமிழ்', ml: 'മലയാളം', hi: 'हिन्दी', te: 'తెలుగు' };
  if (label) label.textContent = names[langCode] || 'English';

  if (typeof switchLanguage === 'function') {
    switchLanguage(langCode);
  }
  if (currentUserRole === 'staff') {
    renderCatalogGrid();
  }
}

// Close language menu when clicking outside
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.lang-dropdown-wrapper');
  const menu = document.getElementById('lang-dropdown-menu');
  if (wrapper && !wrapper.contains(e.target) && menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
  }
});

/**
 * 5. Role-Based Routing, Staff Login & Approval State Machine
 */
function selectRoleTab(role) {
  document.getElementById('tab-role-staff').classList.toggle('active', role === 'staff');
  document.getElementById('tab-role-admin').classList.toggle('active', role === 'admin');
  document.getElementById('form-login-staff').classList.toggle('hidden', role !== 'staff');
  document.getElementById('form-login-admin').classList.toggle('hidden', role !== 'admin');
}

function loginAsStaff() {
  const input = document.getElementById('staff-name-input');
  const val = input ? input.value.trim() : '';
  if (!val) {
    showToast('Please enter your 4-digit Staff PIN.', 'error');
    return;
  }

  // Find user by PIN
  let userAcc = staffAccounts.find(s => s.pin === val);
  // Fallback: also match by name for legacy users
  if (!userAcc) userAcc = staffAccounts.find(s => s.name.toLowerCase() === val.toLowerCase());
  
  if (!userAcc) {
    showToast('No account found with this PIN. Please register first.', 'error');
    return;
  }

  currentStaffName = userAcc.name;
  localStorage.setItem('sreeambal_staff_name', currentStaffName);

  if (userAcc.status === 'Pending Approval') {
    currentUserRole = 'pending';
    localStorage.setItem('sreeambal_user_role', 'pending');
    routeToActiveRole();
    showToast('Your account is currently waiting for Admin approval.', 'info');
    return;
  } else if (userAcc.status === 'Rejected') {
    showToast('⚠️ Access denied: Your staff account was rejected by Admin.', 'error');
    return;
  }

  currentUserRole = 'staff';
  localStorage.setItem('sreeambal_user_role', 'staff');
  routeToActiveRole();
  showToast(`Welcome back, ${currentStaffName}! (PIN: ${userAcc.pin})`, 'info');
}

function loginAsAdmin() {
  const input = document.getElementById('admin-pin-input');
  const pin = input ? input.value.trim() : '';
  if (pin !== '1234') {
    showToast('Invalid Admin PIN. Default is 1234.', 'error');
    return;
  }

  currentUserRole = 'admin';
  localStorage.setItem('sreeambal_user_role', 'admin');
  routeToActiveRole();
  showToast('Admin Dashboard Access Granted.', 'info');
}

function logoutRole() {
  currentUserRole = null;
  localStorage.removeItem('sreeambal_user_role');
  routeToActiveRole();
}

function routeToActiveRole() {
  const viewLogin = document.getElementById('view-login');
  const viewPending = document.getElementById('view-pending-approval');
  const viewStaff = document.getElementById('view-staff');
  const viewAdmin = document.getElementById('view-admin');

  if (switchRoleBtn) switchRoleBtn.classList.toggle('hidden', !currentUserRole || currentUserRole === 'pending');

  if (!currentUserRole) {
    if (viewLogin) viewLogin.classList.remove('hidden');
    if (viewPending) viewPending.classList.add('hidden');
    if (viewStaff) viewStaff.classList.add('hidden');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (roleSubtitle) roleSubtitle.textContent = 'Minimal Multilingual Portal';
  } else if (currentUserRole === 'pending') {
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewPending) viewPending.classList.remove('hidden');
    if (viewStaff) viewStaff.classList.add('hidden');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (roleSubtitle) roleSubtitle.textContent = 'Status: Waiting for Approval';
    const userDisp = document.getElementById('pending-user-display');
    if (userDisp) userDisp.innerHTML = `<strong>Registered Staff:</strong> ${currentStaffName}<br><strong>Status:</strong> <span style="color: #fbbf24">Pending Administrator Review</span>`;
  } else if (currentUserRole === 'staff') {
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewPending) viewPending.classList.add('hidden');
    if (viewStaff) viewStaff.classList.remove('hidden');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (roleSubtitle) roleSubtitle.textContent = `Staff: ${currentStaffName}`;
    renderCatalogGrid();
  } else if (currentUserRole === 'admin') {
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewPending) viewPending.classList.add('hidden');
    if (viewStaff) viewStaff.classList.add('hidden');
    if (viewAdmin) viewAdmin.classList.remove('hidden');
    if (roleSubtitle) roleSubtitle.textContent = 'Administrator Control Panel';
    renderAdminDashboard();
  }
}

function checkApprovalStatus() {
  const userAcc = staffAccounts.find(s => s.name.toLowerCase() === currentStaffName.toLowerCase());
  if (userAcc && userAcc.status === 'Approved') {
    currentUserRole = 'staff';
    localStorage.setItem('sreeambal_user_role', 'staff');
    routeToActiveRole();
    showToast('🎉 Your account has been approved! Access granted.', 'info');
  } else if (userAcc && userAcc.status === 'Rejected') {
    logoutRole();
    showToast('⚠️ Your account was rejected by Admin.', 'error');
  } else {
    showToast('⏳ Still waiting for Administrator approval.', 'info');
  }
}

/**
 * 6. Registration & Custom Item Modal Handlers
 */
function showRegisterModal() {
  document.getElementById('register-modal').classList.remove('hidden');
}

function closeRegisterModal() {
  document.getElementById('register-modal').classList.add('hidden');
}

async function fetchStaffAccounts() {
  if (db && navigator.onLine) {
    try {
      const snapshot = await db.collection('staff_accounts').get();
      const data = [];
      snapshot.forEach(doc => data.push(doc.data()));
      if (data.length > 0) {
        staffAccounts = data;
        saveStaffAccounts();
        if (currentUserRole === 'admin') renderAdminDashboard();
      }
    } catch (err) {
      console.warn('[Staff Accounts Fetch Exception]:', err);
    }
}

async function fetchAuditLogs() {
  if (db && navigator.onLine) {
    try {
      const snapshot = await db.collection('audit_logs').get();
      const logs = [];
      snapshot.forEach(doc => logs.push(doc.data()));
      if (logs.length > 0) {
        logs.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        auditLogs = logs;
        try {
          localStorage.setItem('sreeambal_audit_logs', JSON.stringify(auditLogs));
        } catch(e) {}
        if (currentUserRole === 'admin') renderAdminDashboard();
      }
    } catch (err) {
      console.warn('[Audit Logs Fetch Exception]:', err);
    }
  }
}

async function submitRegistration() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  if (!username || !email || !password) {
    showToast('Please fill in all mandatory fields (*)', 'error');
    return;
  }

  if (staffAccounts.some(s => s.name.toLowerCase() === username.toLowerCase())) {
    showToast('Username already exists. Please choose another or login directly.', 'error');
    return;
  }

  // Generate a random 4-digit PIN for new registration
  const pin = Math.floor(1000 + Math.random() * 9000).toString();

  const newAcc = {
    id: `staff-${Date.now()}`,
    name: username,
    email: email,
    status: 'Pending Approval',
    regTime: new Date().toISOString().split('T')[0],
    pin: pin
  };

  staffAccounts.push(newAcc);
  saveStaffAccounts();
  closeRegisterModal();

  currentStaffName = username;
  localStorage.setItem('sreeambal_staff_name', username);
  currentUserRole = 'pending';
  localStorage.setItem('sreeambal_user_role', 'pending');
  
  routeToActiveRole();
  showToast(`Account registered! Your login PIN is: ${pin} (Pending approval)`, 'info');

  // Insert into Firestore
  if (db && navigator.onLine) {
    try {
      await db.collection('staff_accounts').doc(newAcc.id).set(newAcc);
    } catch (err) {
      console.warn('[Staff Accounts Firestore Insert Exception]:', err);
    }
  }

  broadcastAdminUpdate('new_registration', newAcc);
}

function showCustomItemModal() {
  document.getElementById('custom-item-modal').classList.remove('hidden');
}

function closeCustomItemModal() {
  document.getElementById('custom-item-modal').classList.add('hidden');
}

function submitCustomItemRequest() {
  const name = document.getElementById('custom-item-name').value.trim();
  const unit = document.getElementById('custom-item-unit').value;
  if (!name) {
    showToast('Please enter the item or category name.', 'error');
    return;
  }

  const newReq = {
    id: `req-${Date.now()}`,
    reqBy: currentStaffName,
    name: name,
    unit: unit,
    status: 'Pending Approval'
  };

  customRequests.push(newReq);
  localStorage.setItem('sreeambal_custom_requests', JSON.stringify(customRequests));
  closeCustomItemModal();
  showToast('Custom item request submitted for Admin approval!', 'info');
  broadcastAdminUpdate('new_custom_request', newReq);
}

/**
 * 7. Database Operations & Inventory Sync
 */
async function fetchInventory(silent = false) {
  const loadingContainer = document.getElementById('loading-container');
  const inventoryGrid = document.getElementById('inventory-grid');

  if (!silent && loadingContainer && inventoryData.length === 0) {
    if (loadingContainer) loadingContainer.classList.remove('hidden');
    if (inventoryGrid) inventoryGrid.classList.add('hidden');
  }

  if (!navigator.onLine || !db) {
    loadFromLocalStorage();
    return;
  }

  try {
    if (networkStatusPill && navigator.onLine) {
      networkStatusPill.className = 'status-pill status-syncing';
      statusText.textContent = 'Syncing...';
    }

    const snapshot = await db.collection('inventory_ledger').get();
    const data = [];
    snapshot.forEach(doc => {
      const row = doc.data();
      data.push({
        id: doc.id,
        item_name: row.item_name || 'Unknown',
        quantity_kg: row.quantity_kg || 0
      });
    });

    if (data && Array.isArray(data)) {
      inventoryData = data.map(row => ({
        id: row.id,
        name: row.item_name,
        qty: Number(row.quantity_kg)
      }));
      localStorage.setItem('sreeambal_inventory_cache', JSON.stringify(inventoryData));
      if (currentUserRole === 'staff') renderCatalogGrid();
    }
  } catch (err) {
    console.warn('[Firestore Fetch Exception]: Fallback to local:', err);
    loadFromLocalStorage();
  } finally {
    if (loadingContainer) loadingContainer.classList.add('hidden');
    if (inventoryGrid) inventoryGrid.classList.remove('hidden');
    if (networkStatusPill && navigator.onLine) {
      networkStatusPill.className = 'status-pill status-online';
      statusText.textContent = 'Live Connected';
    }
  }
}

function loadFromLocalStorage() {
  try {
    const cached = localStorage.getItem('sreeambal_inventory_cache');
    inventoryData = cached ? JSON.parse(cached) : [];
  } catch (err) {
    inventoryData = [];
  }
  if (currentUserRole === 'staff') renderCatalogGrid();
}

/**
 * 8. Multilingual Search & Catalog Grid Rendering (With Sliders & Numeric Inputs)
 */
function setCategoryFilter(category) {
  currentCategoryFilter = category;
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('onclick').includes(`'${category}'`));
  });
  renderCatalogGrid();
}

function filterCatalog() {
  const input = document.getElementById('catalog-search-input');
  currentSearchQuery = input ? input.value.trim().toLowerCase() : '';
  renderCatalogGrid();
}

function renderCatalogGrid() {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const currentLang = typeof localStorage !== 'undefined' ? localStorage.getItem('sreeambal_lang') || 'en' : 'en';

  const filtered = activeCatalog.filter(item => {
    // Category check
    if (currentCategoryFilter !== 'all' && item.category !== currentCategoryFilter) return false;
    // Search query check
    if (!currentSearchQuery) return true;
    
    const names = item.names || {};
    return Object.values(names).some(val => String(val).toLowerCase().includes(currentSearchQuery)) ||
           String(item.id).toLowerCase().includes(currentSearchQuery) ||
           String(item.category).toLowerCase().includes(currentSearchQuery);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-cell" style="grid-column: 1/-1;">No matching South Indian catering materials found. Click '+ Request New Item' to add!</div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = `inventory-card item-${item.category}`;

    // Get display name in current language or fallback to EN
    const displayName = (item.names && item.names[currentLang]) ? item.names[currentLang] : (item.names.en || item.id);
    
    // Find current database ledger balance
    const dbEntry = inventoryData.find(d => d.name.toLowerCase() === item.names.en.toLowerCase() || d.name.toLowerCase() === displayName.toLowerCase());
    const currentQty = dbEntry ? dbEntry.qty : 0;

    let icon = 'IN';
    if (item.category === 'grains') icon = 'GR';
    else if (item.category === 'spices') icon = 'SP';
    else if (item.category === 'oils') icon = 'OL';
    else if (item.category === 'sweeteners') icon = 'SW';
    else if (item.category === 'perishables') icon = 'VE';
    else if (item.category === 'dairy') icon = 'DA';
    else if (item.category === 'nuts') icon = 'NU';
    else if (item.category === 'utensils') icon = 'UT';

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-group">
          <div class="item-icon">${icon}</div>
          <div class="item-info">
            <h3>${displayName}</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Category: ${item.category}</span>
          </div>
        </div>
        <div class="card-status">${item.id}</div>
      </div>

      <div class="card-balance">
        <span class="balance-label">Ledger Balance</span>
        <div>
          <span class="qty-val">${currentQty}</span>
          <span class="qty-unit">${item.defaultUnit}</span>
        </div>
      </div>

      <!-- Synchronized Slider and Numeric Input Box -->
      <div class="item-slider-box">
        <div class="slider-row">
          <input type="range" id="slider-${item.id}" class="custom-range-slider" min="1" max="100" value="15" oninput="syncSliderVal('${item.id}', this.value)">
          <input type="number" id="num-${item.id}" class="numeric-input-box" min="1" max="10000" value="15" oninput="syncNumVal('${item.id}', this.value)">
          <span style="color: var(--text-gold); font-weight: 700;">${item.defaultUnit}</span>
        </div>
        <button class="btn-add-cart" onclick="addToBatchCart('${item.id}', '${displayName.replace(/'/g,"\\'")} ', '${item.names.en.replace(/'/g,"\\'")} ', '${item.category}', '${item.defaultUnit}')">
          ➕ Add to Batch Cart
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function syncSliderVal(itemId, val) {
  const numBox = document.getElementById(`num-${itemId}`);
  if (numBox) numBox.value = val;
}

function syncNumVal(itemId, val) {
  const slider = document.getElementById(`slider-${itemId}`);
  if (slider && val <= 100) slider.value = val;
}

/**
 * 9. Batch Cart Engine & Mandatory Photo Verification Security
 */
function addToBatchCart(itemId, displayName, englishName, category, unit) {
  const numBox = document.getElementById(`num-${itemId}`);
  const qty = numBox ? Number(numBox.value) || 1 : 1;

  const existing = batchCart.find(c => c.itemId === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    batchCart.push({ itemId, displayName: displayName.trim(), englishName: englishName.trim(), category, unit, qty });
  }

  updateCartBadge();
  showToast(`Added ${qty} ${unit} of ${displayName.trim()} to Batch Cart!`, 'info');
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = batchCart.length;
}

function openCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.remove('hidden');
  renderCartItems();
  checkCartUnlockState();
}

function closeCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.add('hidden');
}

function setTransactionType(type) {
  currentTxType = type;
  document.getElementById('btn-type-in').classList.toggle('active', type === 'IN');
  document.getElementById('btn-type-out').classList.toggle('active', type === 'OUT');
  checkCartUnlockState();
}

function renderCartItems() {
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  if (batchCart.length === 0) {
    list.innerHTML = `<div class="empty-cell" style="padding: 30px;">Your Batch Cart is empty. Add materials from the catalog above!</div>`;
    return;
  }

  list.innerHTML = batchCart.map((item, index) => `
    <div class="cart-item-row">
      <div>
        <div class="cart-item-title">${item.displayName}</div>
        <span style="font-size: 0.75rem; color: var(--text-dim);">${item.category}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="cart-item-qty">${currentTxType === 'IN' ? '+' : '-'}${item.qty} ${item.unit}</span>
        <button class="btn-remove-cart" onclick="removeFromCart(${index})" title="Remove">🗑️</button>
      </div>
    </div>
  `).join('');
}

function removeFromCart(index) {
  batchCart.splice(index, 1);
  updateCartBadge();
  renderCartItems();
  checkCartUnlockState();
}

function handleCartPhotoCaptured(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 600; // Resize to max 600px for super fast Firestore & LocalStorage sync
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      cartPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.65);

      const status = document.getElementById('cart-photo-status');
      const btn = document.getElementById('btn-cart-camera');
      if (status) status.classList.remove('hidden');
      if (btn) btn.style.background = 'rgba(16, 185, 129, 0.3)';
      showToast('✅ Security Photo Receipt Compressed & Attached (~40KB)!', 'info');
      checkCartUnlockState();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function checkCartUnlockState() {
  const submitBtn = document.getElementById('btn-submit-cart');
  const submitText = document.getElementById('submit-btn-text');
  const billInput = document.getElementById('cart-bill-ref');
  const billVal = billInput ? billInput.value.trim() : '';

  if (!submitBtn || !submitText) return;

  // Enforce mandatory photo AND bill reference AND cart items > 0
  if (batchCart.length > 0 && billVal !== '' && cartPhotoDataUrl !== null) {
    submitBtn.disabled = false;
    submitBtn.className = 'btn-submit-cart unlocked';
    submitText.textContent = `🟢 Submit Batch Stock Log (${currentTxType})`;
  } else {
    submitBtn.disabled = true;
    submitBtn.className = 'btn-submit-cart disabled';
    if (batchCart.length === 0) {
      submitText.textContent = '🛒 Add Items to Cart First';
    } else if (billVal === '') {
      submitText.textContent = '🔒 Enter Bill / Gate Pass No. to Unlock';
    } else if (cartPhotoDataUrl === null) {
      submitText.textContent = '🔒 Attach Receipt Photo to Unlock Submission';
    }
  }
}

async function submitBatchCart() {
  if (batchCart.length === 0 || !cartPhotoDataUrl) return;

  const billInput = document.getElementById('cart-bill-ref');
  const billRef = billInput ? billInput.value.trim() : 'Batch Transaction';

  const batchSummary = batchCart.map(c => `${currentTxType === 'IN' ? '+' : '-'}${c.qty}${c.unit} ${c.englishName}`).join(', ');

  // Update local ledger calculations
  batchCart.forEach(cartItem => {
    let dbEntry = inventoryData.find(d => d.name.toLowerCase() === cartItem.englishName.toLowerCase() || d.name.toLowerCase() === cartItem.displayName.toLowerCase());
    if (dbEntry) {
      dbEntry.qty = currentTxType === 'IN' ? (dbEntry.qty + cartItem.qty) : Math.max(0, dbEntry.qty - cartItem.qty);
    } else {
      inventoryData.push({
        id: `db-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
        name: cartItem.englishName,
        qty: cartItem.qty
      });
    }
  });

  localStorage.setItem('sreeambal_inventory_cache', JSON.stringify(inventoryData));

  // Fire batch upsert to Firestore if online
  if (navigator.onLine && db) {
    try {
      const batch = db.batch();
      for (const cartItem of batchCart) {
        const dbEntry = inventoryData.find(d => d.name.toLowerCase() === cartItem.englishName.toLowerCase());
        const targetQty = dbEntry ? dbEntry.qty : cartItem.qty;

        const docId = cartItem.englishName.replace(/\s+/g, '_').toLowerCase();
        const docRef = db.collection('inventory_ledger').doc(docId);
        
        batch.set(docRef, {
          item_name: cartItem.englishName,
          quantity_kg: targetQty
        }, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.warn('[Batch Firestore Exception]: Processed locally:', err);
    }
  }

  // Record unified Security Audit Trail Log
  const logEntry = {
    id: `audit-${Date.now()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: currentTxType,
    staff: currentStaffName,
    item: batchSummary,
    change: `${currentTxType} (${batchCart.length} items)`,
    balance: 'Updated Ledger',
    bill: billRef,
    photo: cartPhotoDataUrl
  };

  auditLogs.unshift(logEntry);
  if (auditLogs.length > 50) auditLogs.pop();
  try {
    localStorage.setItem('sreeambal_audit_logs', JSON.stringify(auditLogs));
  } catch(err) {
    console.warn('[LocalStorage Quota] Could not save photo to localStorage, keeping in Firestore:', err);
  }

  if (db && navigator.onLine) {
    db.collection('audit_logs').doc(logEntry.id).set(logEntry).catch(e => {
      console.warn('[Firestore Audit Save Exception]:', e);
    });
  }
  broadcastAdminUpdate('new_audit', logEntry);

  // Clean up cart and form
  batchCart = [];
  cartPhotoDataUrl = null;
  if (billInput) billInput.value = '';
  document.getElementById('cart-photo-status').classList.add('hidden');
  document.getElementById('btn-cart-camera').style.background = '#2d0e0e';
  
  updateCartBadge();
  closeCartDrawer();
  renderCatalogGrid();
  
  showToast(`🎉 Batch ${currentTxType} successfully verified & logged!`, 'info');
}

/**
 * 10. Admin Control Dashboard, Approvals & Visual Category Analytics
 */
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-btn-${tab}`).classList.add('active');

  document.getElementById('admin-panel-audit').classList.toggle('hidden', tab !== 'audit');
  document.getElementById('admin-panel-analytics').classList.toggle('hidden', tab !== 'analytics');
  document.getElementById('admin-panel-approvals').classList.toggle('hidden', tab !== 'approvals');
  document.getElementById('admin-panel-staff').classList.toggle('hidden', tab !== 'staff');

  if (tab === 'analytics') renderCategoryCharts();
}

function renderAdminDashboard() {
  // 1. Audit Trail
  const auditBody = document.getElementById('audit-table-body');
  if (auditBody) {
    if (auditLogs.length === 0) {
      auditBody.innerHTML = `<tr><td colspan="5" class="empty-cell">No stock movement transactions logged yet.</td></tr>`;
    } else {
      auditBody.innerHTML = auditLogs.map(log => `
        <tr>
          <td>${log.time}</td>
          <td><span style="color: ${log.type === 'IN' ? '#10b981' : '#f43f5e'}; font-weight: 800;">${log.type || 'IN'}</span></td>
          <td><strong style="color: var(--brand-gold-bright)">${log.staff}</strong></td>
          <td>${log.item || log.change}</td>
          <td>
            <strong>${log.bill}</strong>
            ${log.photo ? `<br><button class="btn-view-photo" onclick="viewCapturedPhoto('${log.id}')" type="button">🖼️ View Attached Receipt</button>` : ''}
          </td>
        </tr>
      `).join('');
    }
  }

  // 2. Pending Accounts Approval Table
  const pendingAccBody = document.getElementById('pending-accounts-body');
  const pendingAccounts = staffAccounts.filter(s => s.status === 'Pending Approval');
  const badge = document.getElementById('admin-notif-badge');
  if (badge) {
    const totalPending = pendingAccounts.length + customRequests.filter(r => r.status === 'Pending Approval').length;
    badge.textContent = totalPending;
    badge.classList.toggle('hidden', totalPending === 0);
  }

  if (pendingAccBody) {
    if (pendingAccounts.length === 0) {
      pendingAccBody.innerHTML = `<tr><td colspan="4" class="empty-cell">No pending staff accounts waiting for approval.</td></tr>`;
    } else {
      pendingAccBody.innerHTML = pendingAccounts.map(acc => `
        <tr>
          <td><strong>${acc.name}</strong></td>
          <td>${acc.email || 'N/A'}</td>
          <td>${acc.regTime || 'Today'}</td>
          <td>
            <button class="btn-approve" onclick="approveUserAccount('${acc.id}')">✅ Approve</button>
            <button class="btn-reject" onclick="rejectUserAccount('${acc.id}')">❌ Reject</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // 3. Pending Custom Items Table
  const pendingItemsBody = document.getElementById('pending-items-body');
  const pendingItems = customRequests.filter(r => r.status === 'Pending Approval');
  if (pendingItemsBody) {
    if (pendingItems.length === 0) {
      pendingItemsBody.innerHTML = `<tr><td colspan="4" class="empty-cell">No custom item or category requests waiting for approval.</td></tr>`;
    } else {
      pendingItemsBody.innerHTML = pendingItems.map(item => `
        <tr>
          <td>${item.reqBy}</td>
          <td><strong style="color: var(--brand-gold-bright)">${item.name}</strong></td>
          <td>${item.unit}</td>
          <td>
            <button class="btn-approve" onclick="approveCustomItem('${item.id}')">✅ Include in Catalog</button>
            <button class="btn-reject" onclick="rejectCustomItem('${item.id}')">❌ Dismiss</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // 4. All Staff Accounts Table
  const staffBody = document.getElementById('staff-table-body');
  if (staffBody) {
    staffBody.innerHTML = staffAccounts.map(staff => `
      <tr>
        <td><strong>${staff.name}</strong></td>
        <td>${staff.email || 'N/A'}</td>
        <td><span style="color: ${staff.status === 'Approved' ? '#10b981' : (staff.status === 'Rejected' ? '#f43f5e' : '#fbbf24')}; font-weight: 700;">${staff.status}</span></td>
        <td>
          ${staff.status !== 'Approved' ? `<button class="btn-approve" onclick="approveUserAccount('${staff.id}')">Approve</button>` : ''}
          <button class="btn-reject" onclick="deleteUserAccount('${staff.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }
}

function saveStaffAccounts() {
  localStorage.setItem('sreeambal_staff_accounts', JSON.stringify(staffAccounts));
}

async function approveUserAccount(id) {
  const acc = staffAccounts.find(s => s.id === id);
  if (acc) {
    acc.status = 'Approved';
    saveStaffAccounts();
    renderAdminDashboard();
    showToast(`Approved access for user: ${acc.name}`, 'info');

    // Update in Firestore
    if (db && navigator.onLine) {
      try {
        await db.collection('staff_accounts').doc(id).update({ status: 'Approved' });
      } catch (err) {
        console.warn('[Staff Accounts Firestore Update Exception]:', err);
      }
    }
    broadcastAdminUpdate('user_approved', acc);
  }
}

async function rejectUserAccount(id) {
  const acc = staffAccounts.find(s => s.id === id);
  if (acc) {
    acc.status = 'Rejected';
    saveStaffAccounts();
    renderAdminDashboard();
    showToast(`Rejected account: ${acc.name}`, 'error');

    // Update in Firestore
    if (db && navigator.onLine) {
      try {
        await db.collection('staff_accounts').doc(id).update({ status: 'Rejected' });
      } catch (err) {
        console.warn('[Staff Accounts Firestore Update Exception]:', err);
      }
    }
    broadcastAdminUpdate('user_rejected', acc);
  }
}

async function deleteUserAccount(id) {
  staffAccounts = staffAccounts.filter(s => s.id !== id);
  saveStaffAccounts();
  renderAdminDashboard();
  showToast('Staff account removed.', 'info');

  // Delete in Firestore
  if (db && navigator.onLine) {
    try {
      await db.collection('staff_accounts').doc(id).delete();
    } catch (err) {
      console.warn('[Staff Accounts Firestore Delete Exception]:', err);
    }
  }
}

async function resetAllTestData() {
  if (!confirm("Are you sure you want to clean up all test accounts and audit logs? This will reset your dashboard cleanly for the client demo.")) return;

  // 1. Reset local state
  auditLogs = [];
  try { localStorage.removeItem('sreeambal_audit_logs'); } catch(e){}

  staffAccounts = [
    { id: 'staff-1', name: 'Kumar - Kitchen Supervisor', email: 'kumar@sreeambal.com', status: 'Approved', regTime: '2026-07-01', pin: '1111' },
    { id: 'staff-2', name: 'Ramesh - Storekeeper', email: 'ramesh@sreeambal.com', status: 'Approved', regTime: '2026-07-02', pin: '2222' }
  ];
  saveStaffAccounts();

  // 2. Clear Firestore collections if online
  if (db && navigator.onLine) {
    try {
      const logsSnap = await db.collection('audit_logs').get();
      logsSnap.forEach(doc => doc.ref.delete());

      const staffSnap = await db.collection('staff_accounts').get();
      staffSnap.forEach(doc => {
        if (doc.id !== 'staff-1' && doc.id !== 'staff-2') {
          doc.ref.delete();
        }
      });
    } catch(err) {
      console.warn('[Reset Test Data Firestore Exception]:', err);
    }
  }

  renderAdminDashboard();
  showToast('✨ Cleaned all test accounts and audit logs!', 'info');
}

function approveCustomItem(id) {
  const req = customRequests.find(r => r.id === id);
  if (req) {
    req.status = 'Approved';
    localStorage.setItem('sreeambal_custom_requests', JSON.stringify(customRequests));

    const newItem = {
      id: `item-c-${Date.now()}`,
      category: 'utensils',
      defaultUnit: req.unit || 'kg',
      names: { en: req.name, ta: req.name, ml: req.name, hi: req.name, te: req.name }
    };

    activeCatalog.push(newItem);
    const savedCustom = JSON.parse(localStorage.getItem('sreeambal_approved_custom') || '[]');
    savedCustom.push(newItem);
    localStorage.setItem('sreeambal_approved_custom', JSON.stringify(savedCustom));

    renderAdminDashboard();
    showToast(`Added custom item '${req.name}' to live South Indian Catalog!`, 'info');
  }
}

function rejectCustomItem(id) {
  customRequests = customRequests.filter(r => r.id !== id);
  localStorage.setItem('sreeambal_custom_requests', JSON.stringify(customRequests));
  renderAdminDashboard();
  showToast('Custom item request dismissed.', 'info');
}

/**
 * 11. Visual Category Analytics Chart Generator
 */
function renderCategoryCharts() {
  const container = document.getElementById('category-charts-container');
  if (!container) return;

  const categories = [
    { key: 'grains', label: 'Grains & Pulses' },
    { key: 'spices', label: 'Spices & Masalas' },
    { key: 'oils', label: 'Oils & Ghee' },
    { key: 'sweeteners', label: 'Sweeteners & Acidulants' },
    { key: 'perishables', label: 'Vegetables & Perishables' },
    { key: 'dairy', label: 'Dairy & Provisions' },
    { key: 'nuts', label: 'Nuts & Dry Fruits' },
    { key: 'utensils', label: 'Utensils & Equipment' }
  ];

  // Calculate volume per category
  let maxVol = 100;
  const metrics = categories.map(cat => {
    const itemsInCat = activeCatalog.filter(c => c.category === cat.key);
    let totalVol = 0;
    itemsInCat.forEach(item => {
      const dbEntry = inventoryData.find(d => d.name.toLowerCase() === item.names.en.toLowerCase());
      if (dbEntry) totalVol += dbEntry.qty;
    });
    if (totalVol > maxVol) maxVol = totalVol;
    return { ...cat, totalVol, count: itemsInCat.length };
  });

  container.innerHTML = metrics.map(m => {
    const percent = Math.min(100, Math.round((m.totalVol / maxVol) * 100)) || 8;
    return `
      <div class="category-chart-row">
        <div class="chart-label-row">
          <span>${m.label} (${m.count} items)</span>
          <span class="chart-val-label">${m.totalVol} units</span>
        </div>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 12. Client-Side CSV Spreadsheets Export Generators
 */
function exportLedgerCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Item ID,Item Name (English),Item Name (Tamil),Category,Current Balance,Unit\n";

  activeCatalog.forEach(item => {
    const dbEntry = inventoryData.find(d => d.name.toLowerCase() === item.names.en.toLowerCase());
    const qty = dbEntry ? dbEntry.qty : 0;
    const cleanEn = `"${String(item.names.en).replace(/"/g, '""')}"`;
    const cleanTa = `"${String(item.names.ta || '').replace(/"/g, '""')}"`;
    csvContent += `${item.id},${cleanEn},${cleanTa},${item.category},${qty},${item.defaultUnit}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sreeambal_inventory_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Inventory Ledger downloaded as CSV spreadsheet!', 'info');
}

function exportLogsCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Timestamp,Transaction Type,Staff Name,Batch Items Summary,Bill Reference,Photo Verified\n";

  auditLogs.forEach(log => {
    const cleanStaff = `"${String(log.staff).replace(/"/g, '""')}"`;
    const cleanItem = `"${String(log.item || log.change).replace(/"/g, '""')}"`;
    const cleanBill = `"${String(log.bill).replace(/"/g, '""')}"`;
    const photoAttached = log.photo ? "YES (Verified)" : "NO";
    csvContent += `${log.time},${log.type || 'IN'},${cleanStaff},${cleanItem},${cleanBill},${photoAttached}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sreeambal_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Security Audit Logs downloaded as CSV spreadsheet!', 'info');
}

/**
 * 13. View Verified Receipt Photo Modal
 */
function viewCapturedPhoto(auditId) {
  const log = auditLogs.find(l => l.id === auditId);
  if (log && log.photo) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <title>Sree Ambal Catering — Verified Bill Reference</title>
        <body style="background: #000; color: #fff; text-align: center; padding: 20px; font-family: sans-serif;">
          <h2>Security Audit Reference: ${log.bill}</h2>
          <p>Logged By: ${log.staff} at ${log.time} (${log.type || 'IN'})</p>
          <img src="${log.photo}" style="max-width: 95%; max-height: 80vh; border: 2px solid #f59e0b; border-radius: 12px; margin-top: 10px;">
        </body>
      `);
    }
  }
}

/**
 * 14. Supabase Real-Time Channels
 */
/**
 * 14. Firebase Real-Time Synchronization & Broadcasts
 */
function setupRealtimeChannels() {
  if (!db) return;
  try {
    // 1. Listen for dynamic catalog updates
    db.collection('inventory_ledger').onSnapshot((snapshot) => {
      console.log('[Realtime] Ledger update detected via Firestore snapshot');
      fetchInventory(true);
    }, (err) => {
      console.warn('[Realtime Ledger Snapshot Error]:', err);
    });

    // 2. Listen for staff accounts table updates
    db.collection('staff_accounts').onSnapshot((snapshot) => {
      console.log('[Realtime] Staff accounts update detected via Firestore snapshot');
      const data = [];
      snapshot.forEach(doc => data.push(doc.data()));
      if (data.length > 0) {
        staffAccounts = data;
        saveStaffAccounts();
        if (currentUserRole === 'admin') renderAdminDashboard();

        // Auto check if this changes current user's approval status
        if (currentUserRole === 'pending') {
          const me = staffAccounts.find(s => s.name.toLowerCase() === currentStaffName.toLowerCase());
          if (me && me.status === 'Approved') {
            currentUserRole = 'staff';
            localStorage.setItem('sreeambal_user_role', 'staff');
            routeToActiveRole();
            showToast(`Welcome back, ${currentStaffName}!`, 'info');
          }
        }
      }
    }, (err) => {
      console.warn('[Realtime Staff Snapshot Error]:', err);
    });

    // 2.5. Listen for Audit Logs updates from Firestore
    db.collection('audit_logs').onSnapshot((snapshot) => {
      const logs = [];
      snapshot.forEach(doc => logs.push(doc.data()));
      if (logs.length > 0) {
        logs.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        auditLogs = logs;
        try {
          localStorage.setItem('sreeambal_audit_logs', JSON.stringify(auditLogs));
        } catch(e) {}
        if (currentUserRole === 'admin') renderAdminDashboard();
      }
    }, (err) => {
      console.warn('[Realtime Audit Logs Snapshot Error]:', err);
    });

    // 3. Realtime Peer-to-Peer Admin Broadcast Channel (Simulated using broadcasts collection)
    const pageLoadTime = Date.now();
    db.collection('broadcasts')
      .where('timestamp', '>', pageLoadTime)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const event = data.event;
            const payload = data.payload;

            if (event === 'new_audit') {
              if (payload && !auditLogs.some(l => l.id === payload.id)) {
                auditLogs.unshift(payload);
                if (auditLogs.length > 50) auditLogs.pop();
                localStorage.setItem('sreeambal_audit_logs', JSON.stringify(auditLogs));
                if (currentUserRole === 'admin') {
                  renderAdminDashboard();
                  showToast(`Alert: ${payload.staff} logged batch ${payload.type}`, 'info');
                }
              }
            } else if (event === 'new_registration') {
              if (payload && !staffAccounts.some(s => s.id === payload.id)) {
                staffAccounts.push(payload);
                saveStaffAccounts();
                if (currentUserRole === 'admin') {
                  renderAdminDashboard();
                  showToast(`New staff registration: ${payload.name}`, 'info');
                }
              }
            } else if (event === 'user_approved') {
              const approvedUser = payload;
              if (approvedUser) {
                let acc = staffAccounts.find(s => s.id === approvedUser.id);
                if (acc) {
                  acc.status = 'Approved';
                } else {
                  staffAccounts.push(approvedUser);
                }
                saveStaffAccounts();
                
                // Auto-login staff if this device is waiting for this user approval!
                if (currentUserRole === 'pending' && currentStaffName.toLowerCase() === approvedUser.name.toLowerCase()) {
                  currentUserRole = 'staff';
                  localStorage.setItem('sreeambal_user_role', 'staff');
                  routeToActiveRole();
                  showToast(`Welcome back, ${currentStaffName}!`, 'info');
                }
                if (currentUserRole === 'admin') {
                  renderAdminDashboard();
                }
              }
            }
          }
        });
      }, (err) => {
        console.warn('[Realtime Broadcast Snapshot Error]:', err);
      });
  } catch (err) {
    console.warn('[Realtime Setup Exception]:', err);
  }
}

function broadcastAdminUpdate(event, data) {
  if (!db) return;
  try {
    db.collection('broadcasts').add({
      event: event,
      payload: data,
      timestamp: Date.now()
    }).catch(err => {
      console.warn('[Broadcast Error]:', err);
    });
  } catch (err) {
    console.warn('[Broadcast Exception]:', err);
  }
}

/**
 * 15. Toast Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>[${type.toUpperCase()}]</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => { if (toast.parentNode === container) container.removeChild(toast); }, 300);
  }, 4500);
}

// Start application
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  initApp();
});
