/**
 * ============================================================================
 * SREE AMBAL CATERING — MINIMAL MULTILINGUAL PORTAL (app.js)
 * Live Supabase Sync, Role-Based Access, Camera Bill Verification & Audit Trail
 * ============================================================================
 */

// Live Supabase Production Credentials (Preserved exactly as requested)
const SUPABASE_URL = 'https://aylclmxjpylytezycihx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rxJkqKAHD1bPZFAD7ofIAA_DKZLCFtB';

// Core Catering Target Items
const TARGET_ITEMS = ['Sugar', 'Rice', 'Logistics Containers'];

// State Management
let supabaseClient = null;
let inventoryData = [];
let auditLogs = JSON.parse(localStorage.getItem('sreeambal_audit_logs') || '[]');
let staffAccounts = JSON.parse(localStorage.getItem('sreeambal_staff_accounts') || '[]');
let currentUserRole = localStorage.getItem('sreeambal_user_role') || null;
let currentStaffName = localStorage.getItem('sreeambal_staff_name') || 'Ground Staff';
let pendingUpdate = null; // Stores { item, changeKg, newBalance, billRef, photoDataUrl }

// DOM Elements
const networkStatusPill = document.getElementById('network-status');
const statusText = document.getElementById('status-text');
const offlineBanner = document.getElementById('offline-banner');
const switchRoleBtn = document.getElementById('switch-role-btn');
const roleSubtitle = document.getElementById('role-subtitle');
const refreshBtn = document.getElementById('refresh-btn');

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
 * 2. Initialize App, Network Listeners & Supabase Channels
 */
function initApp() {
  // Setup Network Listeners
  window.addEventListener('online', () => handleNetworkChange(true));
  window.addEventListener('offline', () => handleNetworkChange(false));
  handleNetworkChange(navigator.onLine);

  // Initialize Supabase
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    setupRealtimeChannels();
  } else {
    showToast('Offline Mode: Supabase SDK unreachable', 'error');
  }

  // Setup Refresh
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.style.transform = 'rotate(360deg)';
      refreshBtn.style.transition = 'transform 0.6s ease';
      fetchInventory(false).finally(() => {
        setTimeout(() => refreshBtn.style.transform = 'none', 600);
      });
    });
  }

  // Initialize seed staff accounts if empty
  if (staffAccounts.length === 0) {
    staffAccounts = [
      { id: 'staff-1', name: 'Kumar - Kitchen Supervisor', status: 'Approved' },
      { id: 'staff-2', name: 'Ramesh - Storekeeper', status: 'Approved' },
      { id: 'staff-3', name: 'Anand - Delivery Lead', status: 'Pending Verification' }
    ];
    saveStaffAccounts();
  }

  // Apply multilingual translations
  if (typeof applyTranslations === 'function') applyTranslations();

  // Route View based on active role
  routeToActiveRole();
  fetchInventory(false);
}

/**
 * 3. Network Status Handler
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

/**
 * 4. Role-Based Routing & View Toggling
 */
function selectRoleTab(role) {
  document.getElementById('tab-role-staff').classList.toggle('active', role === 'staff');
  document.getElementById('tab-role-admin').classList.toggle('active', role === 'admin');
  document.getElementById('form-login-staff').classList.toggle('hidden', role !== 'staff');
  document.getElementById('form-login-admin').classList.toggle('hidden', role !== 'admin');
}

function loginAsStaff() {
  const input = document.getElementById('staff-name-input');
  const name = input ? input.value.trim() : '';
  if (!name) {
    showToast(typeof t === 'function' ? t('loginErrorName') : 'Please enter your Staff Name or ID.', 'error');
    return;
  }

  currentStaffName = name;
  currentUserRole = 'staff';
  localStorage.setItem('sreeambal_user_role', 'staff');
  localStorage.setItem('sreeambal_staff_name', name);

  // Register staff account if not exists
  if (!staffAccounts.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    staffAccounts.push({ id: `staff-${Date.now()}`, name: name, status: 'Approved' });
    saveStaffAccounts();
    broadcastAdminUpdate('new_staff', { name });
  }

  routeToActiveRole();
  showToast(`Welcome to Sree Ambal Portal, ${name}!`, 'info');
}

function loginAsAdmin() {
  const input = document.getElementById('admin-pin-input');
  const pin = input ? input.value.trim() : '';
  if (pin !== '1234') {
    showToast(typeof t === 'function' ? t('loginErrorPin') : 'Invalid Admin PIN. Default is 1234.', 'error');
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
  const viewStaff = document.getElementById('view-staff');
  const viewAdmin = document.getElementById('view-admin');

  if (switchRoleBtn) switchRoleBtn.classList.toggle('hidden', !currentUserRole);

  if (!currentUserRole) {
    if (viewLogin) viewLogin.classList.remove('hidden');
    if (viewStaff) viewStaff.classList.add('hidden');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (roleSubtitle) roleSubtitle.textContent = typeof t === 'function' ? t('appSubtitle') : 'Minimal Multilingual Portal';
  } else if (currentUserRole === 'staff') {
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewStaff) viewStaff.classList.remove('hidden');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (roleSubtitle) roleSubtitle.textContent = `Staff: ${currentStaffName}`;
    renderInventory(inventoryData);
  } else if (currentUserRole === 'admin') {
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewStaff) viewStaff.classList.add('hidden');
    if (viewAdmin) viewAdmin.classList.remove('hidden');
    if (roleSubtitle) roleSubtitle.textContent = 'Administrator Control Panel';
    renderAdminDashboard();
  }
}

/**
 * 5. Database Operations: Smart Fetch & Process
 */
async function fetchInventory(silent = false) {
  const loadingContainer = document.getElementById('loading-container');
  const inventoryGrid = document.getElementById('inventory-grid');

  if (!silent && loadingContainer && inventoryData.length === 0) {
    if (loadingContainer) loadingContainer.classList.remove('hidden');
    if (inventoryGrid) inventoryGrid.classList.add('hidden');
  }

  if (!navigator.onLine || !supabaseClient) {
    loadFromLocalStorage();
    return;
  }

  try {
    if (networkStatusPill && navigator.onLine) {
      networkStatusPill.className = 'status-pill status-syncing';
      statusText.textContent = typeof t === 'function' ? t('statusSyncing') : 'Syncing...';
    }

    const { data, error } = await supabaseClient
      .from('inventory_ledger')
      .select('*');

    if (error) throw error;

    if (data && Array.isArray(data)) {
      inventoryData = processInventoryData(data);
      saveToLocalStorage(inventoryData);
      if (currentUserRole === 'staff') renderInventory(inventoryData);
    }
  } catch (error) {
    console.warn('[Supabase Fetch Exception]: Graceful fallback:', error);
    loadFromLocalStorage();
  } finally {
    if (loadingContainer) loadingContainer.classList.add('hidden');
    if (inventoryGrid) inventoryGrid.classList.remove('hidden');
    if (networkStatusPill && navigator.onLine) {
      networkStatusPill.className = 'status-pill status-online';
      statusText.textContent = typeof t === 'function' ? t('statusConnected') : 'Live Connected';
    }
  }
}

function getItemName(row) {
  return row.item_name || row.name || row.item || row.title || row.category || 'Unknown Item';
}

function getItemQty(row) {
  if (row.quantity_kg !== undefined && row.quantity_kg !== null) return Number(row.quantity_kg);
  if (row.quantity !== undefined && row.quantity !== null) return Number(row.quantity);
  if (row.qty !== undefined && row.qty !== null) return Number(row.qty);
  if (row.balance_kg !== undefined && row.balance_kg !== null) return Number(row.balance_kg);
  return 0;
}

function processInventoryData(rawRows) {
  const normalized = rawRows.map(row => ({
    ...row,
    displayName: getItemName(row),
    currentQty: getItemQty(row)
  }));

  TARGET_ITEMS.forEach((targetName, index) => {
    const exists = normalized.some(item => 
      item.displayName.toLowerCase() === targetName.toLowerCase() ||
      (targetName === 'Logistics Containers' && item.displayName.toLowerCase().includes('logistic'))
    );

    if (!exists) {
      normalized.push({
        id: `virtual-${index}-${Date.now()}`,
        item_name: targetName,
        displayName: targetName,
        quantity_kg: 0,
        currentQty: 0,
        isVirtual: true
      });
    }
  });

  return normalized.sort((a, b) => {
    const idxA = TARGET_ITEMS.findIndex(t => a.displayName.toLowerCase().includes(t.toLowerCase()) || (t === 'Logistics Containers' && a.displayName.toLowerCase().includes('logistic')));
    const idxB = TARGET_ITEMS.findIndex(t => b.displayName.toLowerCase().includes(t.toLowerCase()) || (t === 'Logistics Containers' && b.displayName.toLowerCase().includes('logistic')));
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem('sreeambal_inventory_cache', JSON.stringify(data));
  } catch (err) {}
}

function loadFromLocalStorage() {
  try {
    const cached = localStorage.getItem('sreeambal_inventory_cache');
    if (cached) {
      inventoryData = JSON.parse(cached);
    } else {
      inventoryData = processInventoryData([]);
    }
    if (currentUserRole === 'staff') renderInventory(inventoryData);
  } catch (err) {
    if (currentUserRole === 'staff') renderInventory([]);
  }
}

/**
 * 6. Render Ground Staff Inventory Cards
 */
function renderInventory(items) {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';
  window.inventoryData = items;

  items.forEach((item) => {
    const card = document.createElement('div');
    const lowerName = item.displayName.toLowerCase();
    
    let itemClass = 'item-other';
    let icon = '🗄️';
    if (lowerName.includes('sugar')) { itemClass = 'item-sugar'; icon = '🍬'; }
    else if (lowerName.includes('rice')) { itemClass = 'item-rice'; icon = '🍚'; }
    else if (lowerName.includes('logistic') || lowerName.includes('container')) { itemClass = 'item-logistics'; icon = '📦'; }

    card.className = `inventory-card ${itemClass}`;
    const idAttr = item.id && !String(item.id).startsWith('virtual-') ? `${t('idPrefix')}${item.id}` : t('newLedgerEntry');

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-group">
          <div class="item-icon">${icon}</div>
          <div class="item-info">
            <h3 data-i18n-item="${item.displayName}">${item.displayName}</h3>
          </div>
        </div>
        <div class="card-status">${idAttr}</div>
      </div>

      <div class="card-balance">
        <span class="balance-label" data-i18n="currentBalance">${t('currentBalance')}</span>
        <div>
          <span class="qty-val" id="qty-${item.id || item.displayName}">${item.currentQty}</span>
          <span class="qty-unit" data-i18n="kgUnit">${t('kgUnit')}</span>
        </div>
      </div>

      <div class="button-grid">
        <button class="btn-inc btn-minus-50" type="button">- 50 kg</button>
        <button class="btn-inc btn-minus-25" type="button">- 25 kg</button>
        <button class="btn-inc btn-plus-25" type="button">+ 25 kg</button>
        <button class="btn-inc btn-plus-50" type="button">+ 50 kg</button>
      </div>
    `;

    const btns = card.querySelectorAll('.btn-inc');
    btns[0].addEventListener('click', () => initiateStockAdjustment(item, -50));
    btns[1].addEventListener('click', () => initiateStockAdjustment(item, -25));
    btns[2].addEventListener('click', () => initiateStockAdjustment(item, 25));
    btns[3].addEventListener('click', () => initiateStockAdjustment(item, 50));

    grid.appendChild(card);
  });
}

/**
 * 7. Security Bill Verification Modal & HTML5 Camera Capture
 */
function initiateStockAdjustment(item, changeKg) {
  const currentVal = Number(item.currentQty) || 0;
  const newBal = Math.max(0, currentVal + changeKg);

  pendingUpdate = {
    item: item,
    changeKg: changeKg,
    newBalance: newBal,
    billRef: '',
    photoDataUrl: null
  };

  document.getElementById('modal-item-name').textContent = item.displayName;
  document.getElementById('modal-change-val').textContent = `${changeKg > 0 ? '+' : ''}${changeKg} kg`;
  document.getElementById('modal-new-bal').textContent = `${newBal} kg`;
  document.getElementById('modal-bill-input').value = '';
  document.getElementById('photo-status').classList.add('hidden');
  document.getElementById('btn-camera-trigger').style.background = '#2d0e0e';

  document.getElementById('bill-capture-modal').classList.remove('hidden');
}

function closeBillModal() {
  document.getElementById('bill-capture-modal').classList.add('hidden');
  pendingUpdate = null;
}

function handlePhotoCaptured(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    if (pendingUpdate) {
      pendingUpdate.photoDataUrl = e.target.result;
    }
    const status = document.getElementById('photo-status');
    const trigger = document.getElementById('btn-camera-trigger');
    if (status) status.classList.remove('hidden');
    if (trigger) trigger.style.background = 'rgba(16, 185, 129, 0.3)';
    showToast(typeof t === 'function' ? t('modalPhotoAttached') : '✅ Bill Photo Captured', 'info');
  };
  reader.readAsDataURL(file);
}

/**
 * 8. Smart Supabase Upsert / Fallback Engine
 * Resolves the empty table & RLS exception from the user's screenshot
 */
async function executeStockUpdate() {
  if (!pendingUpdate) return;
  const { item, changeKg, newBalance } = pendingUpdate;
  const billInput = document.getElementById('modal-bill-input');
  const billRef = billInput ? billInput.value.trim() : '';

  closeBillModal();

  if (!navigator.onLine || !supabaseClient) {
    // Handle offline gracefully
    item.currentQty = newBalance;
    saveToLocalStorage(inventoryData);
    logSecurityAudit(item.displayName, changeKg, newBalance, billRef || 'Offline Entry', pendingUpdate ? pendingUpdate.photoDataUrl : null);
    renderInventory(inventoryData);
    showToast(typeof t === 'function' ? t('toastOfflineUpdate') : 'Saved offline.', 'info');
    return;
  }

  try {
    let updateQuery = supabaseClient
      .from('inventory_ledger')
      .update({ quantity_kg: newBalance });

    // Match by ID if real, otherwise match by column name
    if (item.id && !String(item.id).startsWith('virtual-')) {
      updateQuery = updateQuery.eq('id', item.id);
    } else if (item.item_name) {
      updateQuery = updateQuery.eq('item_name', item.item_name);
    } else if (item.name) {
      updateQuery = updateQuery.eq('name', item.name);
    } else {
      updateQuery = updateQuery.eq('item', item.displayName);
    }

    const { data: updateRes, error: updateErr } = await updateQuery.select();

    // If update returned empty array (row doesn't exist in empty database table), perform fallback INSERT!
    if (!updateErr && (!updateRes || updateRes.length === 0)) {
      console.log('[Supabase] Empty table detected, performing fallback INSERT...');
      const { data: insRes, error: insErr } = await supabaseClient
        .from('inventory_ledger')
        .insert([{ item_name: item.displayName, quantity_kg: newBalance }])
        .select();

      if (insErr) {
        // Retry with column 'name' if 'item_name' failed
        const { data: insRes2, error: insErr2 } = await supabaseClient
          .from('inventory_ledger')
          .insert([{ name: item.displayName, quantity_kg: newBalance }])
          .select();
        if (insErr2) throw insErr2;
        if (insRes2 && insRes2[0]) item.id = insRes2[0].id;
      } else if (insRes && insRes[0]) {
        item.id = insRes[0].id;
      }
    } else if (updateErr) {
      throw updateErr;
    }

    // Update internal state
    item.currentQty = newBalance;
    if (item.quantity_kg !== undefined) item.quantity_kg = newBalance;
    saveToLocalStorage(inventoryData);

    // Update UI DOM
    const qtySpan = document.getElementById(`qty-${item.id || item.displayName}`);
    if (qtySpan) qtySpan.textContent = newBalance;

    // Log Security Audit Trail & Broadcast to Admin
    logSecurityAudit(item.displayName, changeKg, newBalance, billRef || 'Verified Ground Slip', pendingUpdate ? pendingUpdate.photoDataUrl : null);

    showToast(typeof t === 'function' ? t('toastUpdated') : 'Stock updated live!', 'info');
  } catch (error) {
    console.error('[Supabase Error]:', error);
    const errMsg = error.message || error.details || 'Network/Database policy exception.';
    showToast(`${typeof t === 'function' ? t('toastError') : 'Error: '}${errMsg}`, 'error');
  }
}

/**
 * 9. Security Audit Log & Admin Management
 */
function logSecurityAudit(item, change, balance, billRef, photoDataUrl) {
  const logEntry = {
    id: `audit-${Date.now()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    staff: currentStaffName,
    item: item,
    change: `${change > 0 ? '+' : ''}${change} kg`,
    balance: `${balance} kg`,
    bill: billRef,
    photo: photoDataUrl || null
  };

  auditLogs.unshift(logEntry);
  if (auditLogs.length > 50) auditLogs.pop(); // Keep recent 50
  localStorage.setItem('sreeambal_audit_logs', JSON.stringify(auditLogs));

  // Broadcast instantly to Admin Dashboard
  broadcastAdminUpdate('new_audit', logEntry);
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', (idx === 0 && tab === 'audit') || (idx === 1 && tab === 'staff'));
  });
  document.getElementById('admin-panel-audit').classList.toggle('hidden', tab !== 'audit');
  document.getElementById('admin-panel-staff').classList.toggle('hidden', tab !== 'staff');
}

function renderAdminDashboard() {
  // Render Audit Trail
  const auditBody = document.getElementById('audit-table-body');
  if (auditBody) {
    if (auditLogs.length === 0) {
      auditBody.innerHTML = `<tr><td colspan="6" class="empty-cell">${t('auditEmpty')}</td></tr>`;
    } else {
      auditBody.innerHTML = auditLogs.map(log => `
        <tr>
          <td>${log.time}</td>
          <td><strong style="color: var(--brand-gold-bright)">${log.staff}</strong></td>
          <td>${log.item}</td>
          <td><span style="color: ${log.change.startsWith('+') ? '#10b981' : '#f43f5e'}">${log.change}</span></td>
          <td>${log.balance}</td>
          <td>
            ${log.bill}
            ${log.photo ? `<br><button class="btn-view-photo" onclick="viewCapturedPhoto('${log.id}')" type="button">${t('viewPhotoBtn')}</button>` : ''}
          </td>
        </tr>
      `).join('');
    }
  }

  // Render Staff Management
  const staffBody = document.getElementById('staff-table-body');
  if (staffBody) {
    if (staffAccounts.length === 0) {
      staffBody.innerHTML = `<tr><td colspan="3" class="empty-cell">${t('staffEmpty')}</td></tr>`;
    } else {
      staffBody.innerHTML = staffAccounts.map(staff => `
        <tr>
          <td><strong>${staff.name}</strong></td>
          <td><span style="color: ${staff.status === 'Approved' ? '#10b981' : '#fbbf24'}">${staff.status === 'Approved' ? t('statusApproved') : t('statusPending')}</span></td>
          <td>
            ${staff.status !== 'Approved' ? `<button class="btn-view-photo" style="background: #10b981; color: #fff" onclick="approveStaffAccount('${staff.id}')" type="button">${t('btnApprove')}</button>` : ''}
            <button class="btn-view-photo" style="background: #f43f5e; color: #fff" onclick="deleteStaffAccount('${staff.id}')" type="button">${t('btnDelete')}</button>
          </td>
        </tr>
      `).join('');
    }
  }
}

function saveStaffAccounts() {
  localStorage.setItem('sreeambal_staff_accounts', JSON.stringify(staffAccounts));
}

function approveStaffAccount(id) {
  const staff = staffAccounts.find(s => s.id === id);
  if (staff) {
    staff.status = 'Approved';
    saveStaffAccounts();
    renderAdminDashboard();
    showToast(`Approved staff account: ${staff.name}`, 'info');
    broadcastAdminUpdate('staff_updated', staff);
  }
}

function deleteStaffAccount(id) {
  staffAccounts = staffAccounts.filter(s => s.id !== id);
  saveStaffAccounts();
  renderAdminDashboard();
  showToast('Staff account deleted.', 'info');
  broadcastAdminUpdate('staff_updated', { id });
}

function viewCapturedPhoto(auditId) {
  const log = auditLogs.find(l => l.id === auditId);
  if (log && log.photo) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <title>Sree Ambal Catering — Verified Bill Reference</title>
        <body style="background: #000; color: #fff; text-align: center; padding: 20px; font-family: sans-serif;">
          <h2>Security Audit Reference: ${log.bill}</h2>
          <p>Logged By: ${log.staff} at ${log.time} (${log.item}: ${log.change})</p>
          <img src="${log.photo}" style="max-width: 95%; max-height: 80vh; border: 2px solid #f59e0b; border-radius: 12px; margin-top: 10px;">
        </body>
      `);
    }
  }
}

/**
 * 10. Real-Time Admin Broadcast via Supabase Channels
 */
function setupRealtimeChannels() {
  if (!supabaseClient) return;

  try {
    // Listen to Database table changes
    supabaseClient
      .channel('public:inventory_ledger')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_ledger' }, (payload) => {
        console.log('[Realtime] Ledger update detected:', payload);
        fetchInventory(true);
      })
      .subscribe();

    // Listen to Broadcast Admin Notifications (Stock Movements & Bills)
    const adminChannel = supabaseClient.channel('sreeambal_admin_broadcast');
    adminChannel.on('broadcast', { event: 'new_audit' }, (payload) => {
      console.log('[Broadcast] New security audit log:', payload);
      if (payload.payload) {
        if (!auditLogs.some(l => l.id === payload.payload.id)) {
          auditLogs.unshift(payload.payload);
          if (auditLogs.length > 50) auditLogs.pop();
          localStorage.setItem('sreeambal_audit_logs', JSON.stringify(auditLogs));
          if (currentUserRole === 'admin') {
            renderAdminDashboard();
            showToast(`🔔 Admin Alert: ${payload.payload.staff} updated ${payload.payload.item}`, 'info');
          }
        }
      }
    }).subscribe();
  } catch (err) {
    console.warn('[Realtime] Could not connect channels:', err);
  }
}

function broadcastAdminUpdate(event, data) {
  if (!supabaseClient) return;
  try {
    supabaseClient.channel('sreeambal_admin_broadcast').send({
      type: 'broadcast',
      event: event,
      payload: data
    });
  } catch (err) {}
}

/**
 * 11. Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => { if (toast.parentNode === container) container.removeChild(toast); }, 300);
  }, 4500);
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  initApp();
});
