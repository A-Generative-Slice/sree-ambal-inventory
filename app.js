/**
 * ============================================================================
 * SREE AMBAL CATERING — GROUND STAFF MOBILE INVENTORY LEDGER
 * Complete Offline-Capable PWA with Real-Time Supabase Sync & iOS 14 Theme
 * ============================================================================
 */

// Supabase Live Production Credentials
const SUPABASE_URL = 'https://aylclmxjpylytezycihx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rxJkqKAHD1bPZFAD7ofIAA_DKZLCFtB';

// Target Items Required for Catering Operations
const TARGET_ITEMS = ['Sugar', 'Rice', 'Logistics Containers'];

// State Management
let supabaseClient = null;
let inventoryData = [];
let isOnline = navigator.onLine;
let activeChannel = null;

// DOM Elements
const networkStatusPill = document.getElementById('network-status');
const statusText = document.getElementById('status-text');
const offlineBanner = document.getElementById('offline-banner');
const loadingContainer = document.getElementById('loading-container');
const inventoryGrid = document.getElementById('inventory-grid');
const refreshBtn = document.getElementById('refresh-btn');
const lastUpdatedText = document.getElementById('last-updated-text');
const toastContainer = document.getElementById('toast-container');

/**
 * 1. PWA Service Worker Registration
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * 2. Initialize App and Network Event Listeners
 */
function initApp() {
  // Setup Network Listeners
  window.addEventListener('online', () => handleNetworkChange(true));
  window.addEventListener('offline', () => handleNetworkChange(false));
  handleNetworkChange(navigator.onLine);

  // Initialize Supabase Client
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    setupRealtimeSubscription();
  } else {
    console.error('[Supabase] Client SDK not found via CDN. Operating in local offline fallback.');
    showToast('Offline Mode: Supabase SDK unreachable', 'error');
  }

  // Setup Refresh Button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('spinning');
      fetchInventory(false).finally(() => {
        setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
      });
    });
  }

  // Initial Fetch
  fetchInventory(false);
}

/**
 * 3. Network Status Handler
 */
function handleNetworkChange(online) {
  isOnline = online;
  if (isOnline) {
    if (networkStatusPill) {
      networkStatusPill.className = 'status-pill status-online';
      statusText.textContent = 'Live Connected';
    }
    if (offlineBanner) {
      offlineBanner.classList.add('hidden');
    }
    // Attempt automatic sync when reconnecting
    if (inventoryData.length > 0) {
      fetchInventory(true);
    }
  } else {
    if (networkStatusPill) {
      networkStatusPill.className = 'status-pill status-offline';
      statusText.textContent = 'Offline Mode';
    }
    if (offlineBanner) {
      offlineBanner.classList.remove('hidden');
    }
    showToast('Network disconnected. Working from offline cache.', 'error');
  }
}

/**
 * 4. Database Operations: Fetch Real-Time Balance
 */
async function fetchInventory(silent = false) {
  if (!silent && loadingContainer && inventoryData.length === 0) {
    loadingContainer.classList.remove('hidden');
    inventoryGrid.classList.add('hidden');
  }

  // Check if offline before querying database
  if (!navigator.onLine || !supabaseClient) {
    console.log('[Inventory] Offline or Client unavailable. Loading from localStorage cache.');
    loadFromLocalStorage();
    return;
  }

  try {
    if (networkStatusPill && isOnline) {
      networkStatusPill.className = 'status-pill status-syncing';
      statusText.textContent = 'Syncing...';
    }

    const { data, error } = await supabaseClient
      .from('inventory_ledger')
      .select('*');

    if (error) {
      throw error;
    }

    if (data && Array.isArray(data)) {
      // Process and sort inventory: prioritize Sugar, Rice, and Logistics Containers
      inventoryData = processInventoryData(data);
      saveToLocalStorage(inventoryData);
      renderInventory(inventoryData);

      if (lastUpdatedText) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lastUpdatedText.textContent = `Live database synced at ${timeStr}`;
      }
    }
  } catch (error) {
    console.warn('[Supabase Fetch Exception]: Gracefully handling drop:', error);
    showToast('Network exception occurred during fetch. Loading cached data.', 'error');
    loadFromLocalStorage();
  } finally {
    if (loadingContainer) {
      loadingContainer.classList.add('hidden');
    }
    if (inventoryGrid) {
      inventoryGrid.classList.remove('hidden');
    }
    if (networkStatusPill && isOnline) {
      networkStatusPill.className = 'status-pill status-online';
      statusText.textContent = 'Live Connected';
    }
  }
}

/**
 * Helper to normalize item names from database schemas
 */
function getItemName(row) {
  return row.item_name || row.name || row.item || row.title || row.category || 'Unknown Item';
}

/**
 * Helper to normalize quantity from database schemas
 */
function getItemQty(row) {
  if (row.quantity_kg !== undefined && row.quantity_kg !== null) return Number(row.quantity_kg);
  if (row.quantity !== undefined && row.quantity !== null) return Number(row.quantity);
  if (row.qty !== undefined && row.qty !== null) return Number(row.qty);
  if (row.balance_kg !== undefined && row.balance_kg !== null) return Number(row.balance_kg);
  return 0;
}

/**
 * Process raw database rows and guarantee presence of target items
 */
function processInventoryData(rawRows) {
  const normalized = rawRows.map(row => ({
    ...row,
    displayName: getItemName(row),
    currentQty: getItemQty(row)
  }));

  // Ensure 'Sugar', 'Rice', and 'Logistics Containers' are always present
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

  // Sort: Target items first in operational order, then others alphabetically
  return normalized.sort((a, b) => {
    const idxA = TARGET_ITEMS.findIndex(t => a.displayName.toLowerCase().includes(t.toLowerCase()) || (t === 'Logistics Containers' && a.displayName.toLowerCase().includes('logistic')));
    const idxB = TARGET_ITEMS.findIndex(t => b.displayName.toLowerCase().includes(t.toLowerCase()) || (t === 'Logistics Containers' && b.displayName.toLowerCase().includes('logistic')));
    
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

/**
 * 5. LocalStorage Cache Fallback for Offline Resilience
 */
function saveToLocalStorage(data) {
  try {
    localStorage.setItem('sreeambal_inventory_cache', JSON.stringify(data));
    localStorage.setItem('sreeambal_cache_timestamp', new Date().toISOString());
  } catch (err) {
    console.warn('[Cache] Could not save to localStorage:', err);
  }
}

function loadFromLocalStorage() {
  try {
    const cached = localStorage.getItem('sreeambal_inventory_cache');
    const timestamp = localStorage.getItem('sreeambal_cache_timestamp');

    if (cached) {
      inventoryData = JSON.parse(cached);
      renderInventory(inventoryData);
      if (lastUpdatedText && timestamp) {
        const dateStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        lastUpdatedText.textContent = `Offline Mode (Cached: ${dateStr})`;
      }
    } else {
      // If no cache exists yet, initialize empty targets
      inventoryData = processInventoryData([]);
      renderInventory(inventoryData);
      if (lastUpdatedText) {
        lastUpdatedText.textContent = 'Offline Mode (Default balances)';
      }
    }
  } catch (err) {
    console.error('[Cache] Failed to load offline cache:', err);
  } finally {
    if (loadingContainer) loadingContainer.classList.add('hidden');
    if (inventoryGrid) inventoryGrid.classList.remove('hidden');
  }
}

/**
 * 6. Render Inventory Cards to DOM
 */
function renderInventory(items) {
  if (!inventoryGrid) return;
  inventoryGrid.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('div');
    const lowerName = item.displayName.toLowerCase();
    
    let itemClass = 'item-other';
    let icon = '🗄️';
    if (lowerName.includes('sugar')) {
      itemClass = 'item-sugar';
      icon = '🍬';
    } else if (lowerName.includes('rice')) {
      itemClass = 'item-rice';
      icon = '🍚';
    } else if (lowerName.includes('logistic') || lowerName.includes('container')) {
      itemClass = 'item-logistics';
      icon = '📦';
    }

    card.className = `inventory-card ${itemClass}`;
    card.id = `card-${item.id || item.displayName}`;

    const idAttr = item.id ? (String(item.id).startsWith('virtual-') ? 'New Ledger Entry' : `ID: #${item.id}`) : 'Active Ledger';

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-group">
          <div class="item-icon">${icon}</div>
          <div class="item-info">
            <h3>${item.displayName}</h3>
            <span class="item-meta">Catering Ground Stock</span>
          </div>
        </div>
        <div class="card-status">${idAttr}</div>
      </div>

      <div class="card-balance">
        <span class="balance-label">Current Balance</span>
        <div class="qty-wrapper">
          <span class="qty-val" id="qty-${item.id || item.displayName}">${item.currentQty}</span>
          <span class="qty-unit">kg</span>
        </div>
      </div>

      <div class="button-grid">
        <button class="btn-inc btn-minus-50" type="button" aria-label="Subtract 50 kg from ${item.displayName}">- 50 kg</button>
        <button class="btn-inc btn-minus-25" type="button" aria-label="Subtract 25 kg from ${item.displayName}">- 25 kg</button>
        <button class="btn-inc btn-plus-25" type="button" aria-label="Add 25 kg to ${item.displayName}">+ 25 kg</button>
        <button class="btn-inc btn-plus-50" type="button" aria-label="Add 50 kg to ${item.displayName}">+ 50 kg</button>
      </div>
    `;

    // Attach event listeners to buttons
    const buttons = card.querySelectorAll('.btn-inc');
    buttons[0].addEventListener('click', () => handleQuantityChange(item, -50));
    buttons[1].addEventListener('click', () => handleQuantityChange(item, -25));
    buttons[2].addEventListener('click', () => handleQuantityChange(item, 25));
    buttons[3].addEventListener('click', () => handleQuantityChange(item, 50));

    inventoryGrid.appendChild(card);
  });
}

/**
 * 7. Zero Keyboard Inputs & Database Update Execution
 * Requirement: Tapping an increment button must launch a native browser confirm() alert ("Confirm inventory update?").
 */
async function handleQuantityChange(item, changeKg) {
  // 1. Launch native confirm dialog with exact string matching requirement
  const isConfirmed = window.confirm("Confirm inventory update?");
  if (!isConfirmed) {
    return;
  }

  // 2. Network Check - Handle gracefully if offline
  if (!navigator.onLine || !isOnline || !supabaseClient) {
    showToast('Network Offline: Unable to update database live. Please reconnect to Wi-Fi/4G.', 'error');
    return;
  }

  const currentVal = Number(item.currentQty) || 0;
  const newBalance = Math.max(0, currentVal + changeKg); // Prevent negative stock balance

  // Find DOM buttons and disable during network request to prevent double-submitting
  const cardElement = document.getElementById(`card-${item.id || item.displayName}`);
  const buttons = cardElement ? cardElement.querySelectorAll('.btn-inc') : [];
  buttons.forEach(btn => btn.disabled = true);

  try {
    let updateQuery = supabaseClient
      .from('inventory_ledger')
      .update({ quantity_kg: newBalance });

    // Match by ID if exists, otherwise match by column name
    if (item.id !== undefined && item.id !== null && !String(item.id).startsWith('virtual-')) {
      updateQuery = updateQuery.eq('id', item.id);
    } else if (item.item_name) {
      updateQuery = updateQuery.eq('item_name', item.item_name);
    } else if (item.name) {
      updateQuery = updateQuery.eq('name', item.name);
    } else {
      updateQuery = updateQuery.eq('item', item.displayName);
    }

    const { data, error } = await updateQuery.select();

    if (error) {
      throw error;
    }

    // Success: Update internal state and DOM smoothly
    item.currentQty = newBalance;
    if (item.quantity_kg !== undefined) item.quantity_kg = newBalance;

    saveToLocalStorage(inventoryData);

    const qtySpan = document.getElementById(`qty-${item.id || item.displayName}`);
    if (qtySpan) {
      qtySpan.textContent = newBalance;
      qtySpan.classList.add('updated');
      setTimeout(() => qtySpan.classList.remove('updated'), 600);
    }

    showToast(`Updated ${item.displayName} (${changeKg > 0 ? '+' : ''}${changeKg} kg) → New Balance: ${newBalance} kg`, 'info');
  } catch (error) {
    console.error('[Supabase Update Error]: Graceful exception handling:', error);
    showToast('Failed to update inventory live: Network or database exception.', 'error');
  } finally {
    // Re-enable buttons
    buttons.forEach(btn => btn.disabled = false);
  }
}

/**
 * 8. Real-time Subscription via Supabase Channels
 */
function setupRealtimeSubscription() {
  if (!supabaseClient) return;

  try {
    activeChannel = supabaseClient
      .channel('public:inventory_ledger')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_ledger' },
        (payload) => {
          console.log('[Realtime] Ledger update detected:', payload);
          // Refresh silently in background when database changes
          fetchInventory(true);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Channel status:', status);
      });
  } catch (err) {
    console.warn('[Realtime] Could not connect realtime channel:', err);
  }
}

/**
 * 9. Non-Intrusive Toast Notification Helper
 */
function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-message">
      <span>${type === 'error' ? '⚠️' : '✅'}</span>
      <span>${message}</span>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Remove toast automatically after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  initApp();
});
