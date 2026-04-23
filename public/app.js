/* ── State ──────────────────────────────────────────────── */
let allProducts = [];
let viewMode = 'grid'; // 'grid' | 'list'
let deleteTargetId = null;

/* ── DOM refs ───────────────────────────────────────────── */
const productGrid    = document.getElementById('productGrid');
const emptyState     = document.getElementById('emptyState');
const searchInput    = document.getElementById('searchInput');
const clearSearch    = document.getElementById('clearSearch');
const categoryFilter = document.getElementById('categoryFilter');
const categoryList   = document.getElementById('categoryList');

const statTotal      = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statUnits      = document.getElementById('statUnits');
const statLow        = document.getElementById('statLow');

const productModal   = document.getElementById('productModal');
const productForm    = document.getElementById('productForm');
const modalTitle     = document.getElementById('modalTitle');
const editId         = document.getElementById('editId');
const submitBtn      = document.getElementById('submitBtn');

const fName          = document.getElementById('fName');
const fCategory      = document.getElementById('fCategory');
const fSku           = document.getElementById('fSku');
const fPrice         = document.getElementById('fPrice');
const fQuantity      = document.getElementById('fQuantity');
const fDescription   = document.getElementById('fDescription');

const deleteModal       = document.getElementById('deleteModal');
const deleteProductName = document.getElementById('deleteProductName');
const toast             = document.getElementById('toast');

/* ── API helpers ────────────────────────────────────────── */
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Toast ──────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'default') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

/* ── Stats ──────────────────────────────────────────────── */
function updateStats(products) {
  const categories = new Set(products.map(p => p.category));
  const units = products.reduce((s, p) => s + p.quantity, 0);
  const low = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
  statTotal.textContent      = products.length;
  statCategories.textContent = categories.size;
  statUnits.textContent      = units.toLocaleString();
  statLow.textContent        = low;
}

/* ── Category filter population ────────────────────────── */
async function loadCategories() {
  try {
    const cats = await api('/api/categories');
    categoryFilter.innerHTML = '<option value="All">All Categories</option>';
    categoryList.innerHTML = '';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);

      const dl = document.createElement('option');
      dl.value = c;
      categoryList.appendChild(dl);
    });
  } catch {}
}

/* ── Render products ────────────────────────────────────── */
function stockClass(qty) {
  if (qty === 0) return 'out-stock';
  if (qty < 10) return 'low-stock';
  return 'in-stock';
}
function stockLabel(qty) {
  if (qty === 0) return 'Out of stock';
  if (qty < 10) return 'Low stock';
  return 'In stock';
}
function qtyClass(qty) {
  if (qty === 0) return 'zero';
  if (qty < 10) return 'low';
  return '';
}

function renderCard(p) {
  const isList = viewMode === 'list';
  const card = document.createElement('div');
  card.className = `product-card${isList ? ' list-card' : ''}`;
  card.dataset.id = p.id;

  if (isList) {
    card.innerHTML = `
      <div class="card-top list-top">
        <div>
          <div class="product-name">${escHtml(p.name)}</div>
          <div class="product-sku">${escHtml(p.sku)}</div>
        </div>
      </div>
      <span class="category-badge">${escHtml(p.category)}</span>
      <span class="stock-badge ${stockClass(p.quantity)}">${stockLabel(p.quantity)}</span>
      <div class="card-footer">
        <div class="product-price">€${Number(p.price).toFixed(2)}</div>
        <div class="qty-stepper" data-id="${p.id}">
          <button class="qty-btn qty-dec" ${p.quantity <= 0 ? 'disabled' : ''} aria-label="Decrease quantity">−</button>
          <span class="qty-display ${qtyClass(p.quantity)}">${p.quantity}</span>
          <button class="qty-btn qty-inc" aria-label="Increase quantity">+</button>
        </div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-icon btn-edit" data-id="${p.id}" aria-label="Edit product" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-delete" data-id="${p.id}" data-name="${escHtml(p.name)}" aria-label="Delete product" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>`;
  } else {
    card.innerHTML = `
      <div class="card-top">
        <span class="category-badge">${escHtml(p.category)}</span>
        <span class="stock-badge ${stockClass(p.quantity)}">${stockLabel(p.quantity)}</span>
      </div>
      <div>
        <div class="product-name">${escHtml(p.name)}</div>
        <div class="product-sku">${escHtml(p.sku)}</div>
      </div>
      ${p.description ? `<div class="product-desc">${escHtml(p.description)}</div>` : ''}
      <div class="card-footer">
        <div class="product-price">€${Number(p.price).toFixed(2)}</div>
        <div class="qty-stepper" data-id="${p.id}">
          <button class="qty-btn qty-dec" ${p.quantity <= 0 ? 'disabled' : ''} aria-label="Decrease quantity">−</button>
          <span class="qty-display ${qtyClass(p.quantity)}">${p.quantity}</span>
          <button class="qty-btn qty-inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="card-actions" style="justify-content:flex-end">
        <button class="btn btn-ghost btn-icon btn-edit" data-id="${p.id}" aria-label="Edit product" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-ghost btn-icon btn-delete" data-id="${p.id}" data-name="${escHtml(p.name)}" aria-label="Delete product" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>`;
  }

  return card;
}

function renderProducts(products) {
  productGrid.innerHTML = '';
  if (products.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  const frag = document.createDocumentFragment();
  products.forEach(p => frag.appendChild(renderCard(p)));
  productGrid.appendChild(frag);
}

/* ── Load & filter products ─────────────────────────────── */
async function loadProducts() {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category);

  try {
    const products = await api(`/api/products?${params}`);
    allProducts = products;
    updateStats(products);
    renderProducts(products);
  } catch (err) {
    showToast('Failed to load products', 'error');
  }
}

/* ── Quantity stepper (event delegation) ────────────────── */
productGrid.addEventListener('click', async (e) => {
  const inc = e.target.closest('.qty-inc');
  const dec = e.target.closest('.qty-dec');
  const btn = inc || dec;
  if (!btn) return;

  const stepper = btn.closest('.qty-stepper');
  const id = stepper.dataset.id;
  const product = allProducts.find(p => String(p.id) === id);
  if (!product) return;

  const delta = inc ? 1 : -1;
  const newQty = Math.max(0, product.quantity + delta);

  btn.disabled = true;
  try {
    const updated = await api(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQty }),
    });
    product.quantity = updated.quantity;
    // patch just the stepper & badges in the card
    const card = productGrid.querySelector(`[data-id="${id}"]`);
    if (card) {
      const display = card.querySelector('.qty-display');
      const decBtn  = card.querySelector('.qty-dec');
      const badge   = card.querySelector('.stock-badge');
      if (display) { display.textContent = updated.quantity; display.className = `qty-display ${qtyClass(updated.quantity)}`; }
      if (decBtn)  decBtn.disabled = updated.quantity <= 0;
      if (badge)   { badge.textContent = stockLabel(updated.quantity); badge.className = `stock-badge ${stockClass(updated.quantity)}`; }
    }
    updateStats(allProducts);
  } catch {
    showToast('Failed to update quantity', 'error');
  } finally {
    btn.disabled = false;
  }
});

/* ── Edit / Delete buttons (event delegation) ───────────── */
productGrid.addEventListener('click', (e) => {
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');
  if (editBtn)   openEditModal(editBtn.dataset.id);
  if (deleteBtn) openDeleteModal(deleteBtn.dataset.id, deleteBtn.dataset.name);
});

/* ── Add Product Modal ──────────────────────────────────── */
document.getElementById('openAddModal').addEventListener('click', openAddModal);
document.getElementById('closeModal').addEventListener('click',  closeProductModal);
document.getElementById('cancelModal').addEventListener('click', closeProductModal);

productModal.addEventListener('click', (e) => {
  if (e.target === productModal) closeProductModal();
});

function openAddModal() {
  editId.value = '';
  productForm.reset();
  clearFormErrors();
  modalTitle.textContent = 'ADD PRODUCT';
  submitBtn.textContent = 'Add Product';
  productModal.classList.remove('hidden');
  fName.focus();
}

function openEditModal(id) {
  const product = allProducts.find(p => String(p.id) === id);
  if (!product) return;
  editId.value       = product.id;
  fName.value        = product.name;
  fCategory.value    = product.category;
  fSku.value         = product.sku;
  fPrice.value       = product.price;
  fQuantity.value    = product.quantity;
  fDescription.value = product.description || '';
  clearFormErrors();
  modalTitle.textContent = 'EDIT PRODUCT';
  submitBtn.textContent = 'Save Changes';
  productModal.classList.remove('hidden');
  fName.focus();
}

function closeProductModal() {
  productModal.classList.add('hidden');
}

/* ── Form validation & submit ───────────────────────────── */
function clearFormErrors() {
  ['fName','fCategory','fSku','fPrice','fQuantity'].forEach(id => {
    document.getElementById(id).classList.remove('error');
  });
  ['errName','errCategory','errSku','errPrice','errQuantity'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function validateForm() {
  let valid = true;
  const check = (fieldId, errId, msg) => {
    const el = document.getElementById(fieldId);
    if (!el.value.trim()) {
      el.classList.add('error');
      document.getElementById(errId).textContent = msg;
      valid = false;
    } else {
      el.classList.remove('error');
      document.getElementById(errId).textContent = '';
    }
  };
  check('fName',     'errName',     'Product name is required');
  check('fCategory', 'errCategory', 'Category is required');
  check('fSku',      'errSku',      'SKU is required');
  if (!fPrice.value || isNaN(Number(fPrice.value)) || Number(fPrice.value) < 0) {
    fPrice.classList.add('error');
    document.getElementById('errPrice').textContent = 'Enter a valid price';
    valid = false;
  } else { fPrice.classList.remove('error'); document.getElementById('errPrice').textContent = ''; }
  if (fQuantity.value === '' || isNaN(Number(fQuantity.value)) || Number(fQuantity.value) < 0) {
    fQuantity.classList.add('error');
    document.getElementById('errQuantity').textContent = 'Enter a valid quantity';
    valid = false;
  } else { fQuantity.classList.remove('error'); document.getElementById('errQuantity').textContent = ''; }
  return valid;
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    name: fName.value.trim(),
    category: fCategory.value.trim(),
    sku: fSku.value.trim(),
    price: Number(fPrice.value),
    quantity: Number(fQuantity.value),
    description: fDescription.value.trim(),
  };

  const isEdit = !!editId.value;
  submitBtn.disabled = true;
  submitBtn.textContent = isEdit ? 'Saving…' : 'Adding…';

  try {
    if (isEdit) {
      await api(`/api/products/${editId.value}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Product updated!', 'success');
    } else {
      await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Product added!', 'success');
    }
    closeProductModal();
    await loadCategories();
    await loadProducts();
  } catch (err) {
    if (err.message.includes('SKU')) {
      fSku.classList.add('error');
      document.getElementById('errSku').textContent = err.message;
    } else {
      showToast(err.message, 'error');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? 'Save Changes' : 'Add Product';
  }
});

/* ── Delete Modal ───────────────────────────────────────── */
document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
document.getElementById('cancelDelete').addEventListener('click',     closeDeleteModal);
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });

function openDeleteModal(id, name) {
  deleteTargetId = id;
  deleteProductName.textContent = name;
  deleteModal.classList.remove('hidden');
}
function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  deleteTargetId = null;
}

document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (!deleteTargetId) return;
  try {
    await api(`/api/products/${deleteTargetId}`, { method: 'DELETE' });
    showToast('Product deleted', 'success');
    closeDeleteModal();
    await loadCategories();
    await loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

/* ── Search & filter ────────────────────────────────────── */
let searchTimer;
searchInput.addEventListener('input', () => {
  clearSearch.classList.toggle('hidden', !searchInput.value);
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 300);
});
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch.classList.add('hidden');
  loadProducts();
});
categoryFilter.addEventListener('change', loadProducts);

/* ── View toggle ────────────────────────────────────────── */
document.getElementById('btnGrid').addEventListener('click', () => {
  viewMode = 'grid';
  productGrid.classList.remove('list-view');
  document.getElementById('btnGrid').classList.add('active');
  document.getElementById('btnList').classList.remove('active');
  renderProducts(allProducts);
});
document.getElementById('btnList').addEventListener('click', () => {
  viewMode = 'list';
  productGrid.classList.add('list-view');
  document.getElementById('btnList').classList.add('active');
  document.getElementById('btnGrid').classList.remove('active');
  renderProducts(allProducts);
});

/* ── Utility ────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Bootstrap ──────────────────────────────────────────── */
(async () => {
  await loadCategories();
  await loadProducts();
})();
