// ========================================
// CATALOG SYSTEM - REBUILT
// ========================================

let catalogs = [];
let currentCatalogId = null;
let currentCatalogProducts = [];
let editModeId = null; // Track if we are editing an existing catalog

// Initialize catalog system
function initCatalogSystem() {
    console.log('Initializing catalog system...');
    loadCatalogs();
}

// Load catalogs from server
async function loadCatalogs() {
    try {
        const response = await fetch('/api/catalogs');
        const data = await response.json();

        if (data.success) {
            catalogs = data.catalogs || [];
            renderCatalogsGrid();
        }
    } catch (error) {
        console.error('Error loading catalogs:', error);
        catalogs = [];
        renderCatalogsGrid();
    }
}

// Render catalogs grid
function renderCatalogsGrid() {
    const grid = document.getElementById('catalogsGrid');
    if (!grid) return;

    if (catalogs.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999;">
                <svg class="icon-svg" style="width:48px;height:48px;opacity:0.3;margin:0 auto;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 7-1.116-2.231c-.32-.642-.481-.963-.72-1.198a2 2 0 0 0-.748-.462C10.1 3 9.74 3 9.022 3H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 4.52 2 5.08 2 6.2V7m0 0h15.2c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C22 9.28 22 10.12 22 11.8v4.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C19.72 21 18.88 21 17.2 21H6.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C2 18.72 2 17.88 2 16.2V7Z"></path></svg>
                <p style="margin-top: 1rem;">No hay catálogos creados</p>
                <p style="font-size: 0.875rem;">Crea tu primer catálogo haciendo clic en el botón "Crear Catálogo"</p>
            </div>
        `;
        return;
    }

    grid.style.display = 'block';
    grid.style.background = '#fff';
    grid.style.borderRadius = '8px';
    grid.style.border = '1px solid #e0e0e0';
    grid.style.overflow = 'hidden';

    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #eee;">
                    <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #666; width: 50%;">Nombre del Catálogo</th>
                    <th style="padding: 1rem; text-align: center; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #666; width: 20%;">Items</th>
                    <th style="padding: 1rem; text-align: right; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #666; width: 30%;">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    tableHtml += catalogs.map(catalog => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 1rem; vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div ondblclick="manageCatalog('${catalog.id}')" title="Doble clic para entrar" style="width: 32px; height: 32px; background: #e3f2fd; color: #1565c0; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 7-1.116-2.231c-.32-.642-.481-.963-.72-1.198a2 2 0 0 0-.748-.462C10.1 3 9.74 3 9.022 3H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 4.52 2 5.08 2 6.2V7m0 0h15.2c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C22 9.28 22 10.12 22 11.8v4.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C19.72 21 18.88 21 17.2 21H6.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C2 18.72 2 17.88 2 16.2V7Z"></path></svg>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #2c3e50; font-size: 0.9rem;">${catalog.name}</div>
                        <div style="font-size: 0.75rem; color: #999;">ID: ${catalog.id || '-'}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 1rem; text-align: center; vertical-align: middle;">
                <span style="background: #f5f5f5; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500; color: #666;">
                    ${catalog.products?.length || 0} productos
                </span>
            </td>
            <td style="padding: 1rem; text-align: right; vertical-align: middle;">
                <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="btn-icon" onclick="manageCatalog('${catalog.id}')" title="Gestionar Productos" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #1565c0; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 7.278 12 12m0 0L3.5 7.278M12 12v9.5m9-5.441V7.942c0-.343 0-.514-.05-.667a1 1 0 0 0-.215-.364c-.109-.119-.258-.202-.558-.368l-7.4-4.111c-.284-.158-.425-.237-.575-.267a1 1 0 0 0-.403 0c-.15.03-.292.11-.576.267l-7.4 4.11c-.3.167-.45.25-.558.369a1 1 0 0 0-.215.364C3 7.428 3 7.599 3 7.942v8.117c0 .342 0 .514.05.666a1 1 0 0 0 .215.364c.109.119.258.202.558.368l7.4 4.111c.284.158.425.237.576.268.133.027.27.027.402 0 .15-.031.292-.11.576-.268l7.4-4.11c.3-.167.45-.25.558-.369a.999.999 0 0 0 .215-.364c.05-.152.05-.324.05-.666ZM16.5 9.5l-9-5"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="previewCatalog('${catalog.id}')" title="Previsualizar" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #666; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.42 12.713c-.136-.215-.204-.323-.242-.49a1.173 1.173 0 0 1 0-.446c.038-.167.106-.274.242-.49C3.546 9.505 6.895 5 12 5s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.322 0 .446-.038.167-.106.274-.242.49C20.455 14.495 17.105 19 12 19c-5.106 0-8.455-4.505-9.58-6.287Z"></path><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="editCatalog('${catalog.id}')" title="Editar Metadatos" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #666; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.876 18.116c.046-.414.069-.62.131-.814a2 2 0 0 1 .234-.485c.111-.17.259-.317.553-.61L17 3a2.828 2.828 0 1 1 4 4L7.794 20.206c-.294.294-.442.442-.611.553a2 2 0 0 1-.485.233c-.193.063-.4.086-.814.132L2.5 21.5l.376-3.384Z"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="duplicateCatalog('${catalog.id}')" title="Duplicar Catálogo" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #666; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C2 13.398 2 12.932 2 12V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2H12c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 3.602 15 4.068 15 5m-2.8 17h6.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C22 20.48 22 19.92 22 18.8v-6.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C20.48 9 19.92 9 18.8 9h-6.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C9 10.52 9 11.08 9 12.2v6.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C10.52 22 11.08 22 12.2 22Z"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="exportCatalog('${catalog.id}')" title="Exportar Excel" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #2e7d32; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V15m14-5-5 5m0 0-5-5m5 5V3"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="importCatalog('${catalog.id}')" title="Importar Excel" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #f57c00; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V15m14-7-5-5m0 0L7 8m5-5v12"></path></svg>
                    </button>
                    <button class="btn-icon" onclick="deleteCatalog('${catalog.id}')" title="Eliminar" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #fee2e2; border-radius: 4px; color: #ef4444; cursor: pointer;">
                        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 2 13.92 2 12.8 2h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C8 3.52 8 4.08 8 5.2V6m2 5.5v5m4-5v5M3 6h18m-2 0v11.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C16.72 22 15.88 22 14.2 22H9.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C5 19.72 5 18.88 5 17.2V6"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tableHtml += `</tbody></table>`;
    grid.innerHTML = tableHtml;
}

// Preview Catalog Function
window.previewCatalog = function (catalogId) {
    const url = `/catalog/${catalogId}`;
    window.open(url, '_blank');
};

// Back to Catalogs List
window.backToCatalogs = function () {
    if (typeof showSection === 'function') {
        showSection('catalogsView');
    } else {
        document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
        document.getElementById('catalogsView').style.display = 'block';
    }
    // Clear current catalog context
    currentCatalogId = null;
};

// Open create catalog modal
window.openCreateCatalogModal = function () {
    const modal = document.getElementById('createCatalogModal');
    if (!modal) return;

    editModeId = null; // Important: Clear edit mode

    // Show all fields (In case they were hidden by Add Mode)
    document.querySelectorAll('.catalog-meta-field').forEach(el => el.style.display = 'block');

    const title = modal.querySelector('.modal-title');
    const btn = modal.querySelector('.modal-footer .btn-primary');
    if (title) title.textContent = 'Crear Nuevo Catálogo';
    if (btn) {
        btn.innerHTML = '<svg class="icon-svg" style="width:16px;height:16px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"></path></svg> Crear Catálogo';
        btn.onclick = null; // Rely on form submit
    }

    // Reset inputs
    document.getElementById('catalogName').value = '';
    document.getElementById('catalogCustomTitle').value = '';
    document.getElementById('catalogTitleColor').value = 'black';
    document.getElementById('catalogCustomText').value = '2026';
    document.getElementById('catalogTextColor').value = 'black';
    document.getElementById('catalogTextOpacity').value = '50';
    document.getElementById('catalogBannerImage').value = '';

    loadProductsIntoModal();
    modal.classList.add('active');
};

// Open Add To Catalog Modal
window.openAddToCatalogModal = function () {
    const modal = document.getElementById('createCatalogModal');
    if (!modal) return;

    // Hide Meta fields
    document.querySelectorAll('.catalog-meta-field').forEach(el => el.style.display = 'none');

    const title = modal.querySelector('.modal-title');
    const btn = modal.querySelector('.modal-footer .btn-primary');
    if (title) title.textContent = 'Agregar Productos al Catálogo';
    if (btn) {
        btn.innerHTML = '<svg class="icon-svg" style="width:16px;height:16px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v3.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C7.76 8 8.04 8 8.6 8h6.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C17 7.24 17 6.96 17 6.4V4m0 17v-6.4c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C16.24 13 15.96 13 15.4 13H8.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C7 13.76 7 14.04 7 14.6V21M21 9.325V16.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h6.875c.489 0 .733 0 .963.055.204.05.4.13.579.24.201.123.374.296.72.642l3.126 3.126c.346.346.519.519.642.72.11.18.19.374.24.579.055.23.055.474.055.963Z"></path></svg> Agregar Seleccionados';
        btn.onclick = addToCatalog;
    }

    // Load ALL products (or filter? For now load all)
    // We could visually mark those already in catalog?
    loadProductsIntoModal();

    // Mark existing as checked and disabled?
    const existingIds = currentCatalogProducts.map(p => String(p.id !== undefined ? p.id : p.ID));
    setTimeout(() => {
        document.querySelectorAll('.product-checkbox').forEach(cb => {
            if (existingIds.includes(cb.value)) {
                cb.checked = true;
                cb.disabled = true;
                cb.closest('.product-checkbox-item').style.opacity = '0.6';
            }
        });
    }, 100);

    modal.classList.add('active');
};

// Add to Catalog
async function addToCatalog(e) {
    if (e) e.preventDefault();

    // Get checked but NOT disabled (new ones)
    const selectedProducts = Array.from(document.querySelectorAll('.product-checkbox:checked'))
        .filter(cb => !cb.disabled)
        .map(cb => cb.value);

    if (selectedProducts.length === 0) {
        window.showToast('No has seleccionado nuevos productos', 'info');
        return;
    }

    try {
        const response = await fetch(`/api/catalogs/${currentCatalogId}/add-products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: selectedProducts })
        });
        const result = await response.json();

        if (result.success) {
            window.showToast(result.message, 'success');
            closeCreateCatalogModal();
            manageCatalog(currentCatalogId); // Reload
        } else {
            window.showToast('Error: ' + result.message, 'error');
        }
    } catch (err) {
        window.showToast('Error conectando al servidor', 'error');
    }
}


// Close create catalog modal
window.closeCreateCatalogModal = function () {
    const modal = document.getElementById('createCatalogModal');
    if (modal) {
        modal.classList.remove('active');
        // Reset styles
        document.querySelectorAll('.catalog-meta-field').forEach(el => el.style.display = 'block');
    }
};


// Load products into modal
function loadProductsIntoModal() {
    const container = document.getElementById('catalogProductsList');
    if (!container) return;

    const products = window.products || [];
    container.innerHTML = products.map(product => {
        const image = product.image || (product.variants?.[0]?.image) || '';
        const price = product.basePrice || product.price || 0;
        return `
            <label class="product-checkbox-item">
                <input type="checkbox" value="${product.id}" class="product-checkbox">
                <img src="${image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect fill=%22%23ddd%22 width=%2250%22 height=%2250%22/%3E%3C/svg%3E'">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-meta">${product.category || 'Sin categoría'} • Bs ${price}</div>
                </div>
            </label>
        `;
    }).join('');
    updateSelectedCount();
}

// Filter and Toggle functions
window.filterCatalogProducts = function () {
    const searchTerm = document.getElementById('catalogProductSearch').value.toLowerCase();
    document.querySelectorAll('.product-checkbox-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(searchTerm) ? 'flex' : 'none';
    });
};

window.toggleAllCatalogProducts = function () {
    const selectAll = document.getElementById('selectAllCatalogProducts');
    document.querySelectorAll('.product-checkbox').forEach(cb => {
        if (!cb.disabled && cb.closest('.product-checkbox-item').style.display !== 'none') {
            cb.checked = selectAll.checked;
        }
    });
    updateSelectedCount();
};

function updateSelectedCount() {
    const count = document.querySelectorAll('.product-checkbox:checked').length;
    const countEl = document.getElementById('selectedProductsCount');
    if (countEl) countEl.textContent = `${count} seleccionado(s)`;
}

// Save or Update catalog (Unified)
async function saveCatalog(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('catalogName').value.trim();
    const selectedProducts = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => cb.value);

    if (!name) {
        window.showToast('El nombre es requerido', 'info');
        return;
    }

    if (selectedProducts.length === 0 && !editModeId) {
        window.showToast('Al menos un producto requerido para un catálogo nuevo', 'info');
        return;
    }

    // Banner Logic
    const bannerInput = document.getElementById('catalogBannerImage');
    let bannerImage = null;
    if (bannerInput && bannerInput.files && bannerInput.files[0]) {
        try {
            bannerImage = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(bannerInput.files[0]);
            });
        } catch (e) { }
    }

    const payload = {
        catalogName: name,
        productIds: selectedProducts,
        customTitle: document.getElementById('catalogCustomTitle').value.trim(),
        titleColor: document.getElementById('catalogTitleColor').value,
        customText: document.getElementById('catalogCustomText').value.trim(),
        textColor: document.getElementById('catalogTextColor').value,
        textOpacity: document.getElementById('catalogTextOpacity').value,
        bannerImage: bannerImage
    };

    if (editModeId) {
        payload.oldId = editModeId;
    }

    const endpoint = editModeId ? '/api/catalogs/update' : '/api/catalogs/create';
    console.log(`Saving catalog to ${endpoint}`, payload);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        console.log('Save result:', result);

        if (result.success) {
            window.showToast(editModeId ? 'Catálogo actualizado correctamente' : 'Catálogo creado correctamente', 'success');
            closeCreateCatalogModal();
            loadCatalogs();
        } else {
            window.showToast(result.message || 'Error desconocido al guardar', 'error');
        }
    } catch (e) {
        console.error('Error guardando catálogo:', e);
        window.showToast('Error de conexión o de servidor al guardar', 'error');
    }
}

// Duplicate Catalog
window.duplicateCatalog = async function (catalogId) {
    try {
        window.showToast('Duplicando...', 'info');
        const response = await fetch('/api/catalogs/duplicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ catalogId })
        });
        const result = await response.json();
        if (result.success) {
            window.showToast('Catálogo duplicado', 'success');
            loadCatalogs();
        } else {
            window.showToast(result.message, 'error');
        }
    } catch (e) {
        window.showToast('Error al duplicar catálogo', 'error');
    }
};

// Edit Catalog (Meta)
window.editCatalog = function (catalogId) {
    const catalog = catalogs.find(c => c.id === catalogId);
    if (!catalog) return;

    editModeId = catalogId;

    // Open modal base
    const modal = document.getElementById('createCatalogModal');
    if (!modal) return;

    // Show all fields (In case they were hidden by Add Mode)
    document.querySelectorAll('.catalog-meta-field').forEach(el => el.style.display = 'block');

    // UI Setup for Edit Mode
    const title = modal.querySelector('.modal-title');
    const btn = modal.querySelector('.modal-footer .btn-primary');
    if (title) title.textContent = 'Editar Catálogo';
    if (btn) {
        btn.innerHTML = '<svg class="icon-svg" style="width:16px;height:16px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v3.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C7.76 8 8.04 8 8.6 8h6.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C17 7.24 17 6.96 17 6.4V4m0 17v-6.4c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C16.24 13 15.96 13 15.4 13H8.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C7 13.76 7 14.04 7 14.6V21M21 9.325V16.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h6.875c.489 0 .733 0 .963.055.204.05.4.13.579.24.201.123.374.296.72.642l3.126 3.126c.346.346.519.519.642.72.11.18.19.374.24.579.055.23.055.474.055.963Z"></path></svg> Guardar Cambios';
        btn.onclick = null; // Rely on form submit event listener
    }

    document.getElementById('catalogName').value = catalog.name;

    // Logic for loading catalog-specific metadata and fresh product list
    fetch(`/api/catalogs/${catalogId}/products?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.metadata) {
                    document.getElementById('catalogCustomTitle').value = data.metadata.title || catalog.name;
                    document.getElementById('catalogTitleColor').value = data.metadata.titleColor || 'black';
                    document.getElementById('catalogCustomText').value = data.metadata.text || '2026';
                    document.getElementById('catalogTextColor').value = data.metadata.textColor || 'black';
                    document.getElementById('catalogTextOpacity').value = data.metadata.textOpacity || '50';
                }

                // Use the fresh product list from the server to check checkboxes
                const productIds = (data.products || []).map(p => String(p.id !== undefined ? p.id : p.ID));
                document.querySelectorAll('.product-checkbox').forEach(cb => {
                    cb.checked = productIds.includes(cb.value);
                });
                updateSelectedCount();
            }
        }).catch(err => console.error('Error fetching catalog details:', err));

    loadProductsIntoModal();
    modal.classList.add('active');
};

// Manage Catalog
window.manageCatalog = async function (catalogId) {
    currentCatalogId = catalogId;

    if (typeof showSection === 'function') {
        showSection('catalogDetailView');
    } else {
        document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
        document.getElementById('catalogDetailView').style.display = 'block';
    }

    document.getElementById('catalogDetailTitle').textContent = 'Cargando...';
    const tbody = document.getElementById('catalogDetailTableBody');
    if (tbody) tbody.innerHTML = '';

    try {
        const response = await fetch(`/api/catalogs/${catalogId}/products`);
        const data = await response.json();

        if (data.success) {
            currentCatalogProducts = data.products || [];
            console.log('Catalog data:', data);

            const catalogName = data.metadata?.title || catalogId.replace(/_/g, ' ');
            document.getElementById('catalogDetailTitle').textContent = `Detalle: ${catalogName}`;

            // Render Products
            const tbody = document.getElementById('catalogDetailTableBody');
            if (!tbody) {
                console.error('CRITICAL: tbody catalogDetailTableBody not found!');
                return;
            }

            console.log('Rendering products:', currentCatalogProducts.length);

            if (currentCatalogProducts.length === 0) {
                document.getElementById('catalogDetailEmpty').style.display = 'block';
                tbody.innerHTML = '';
            } else {
                document.getElementById('catalogDetailEmpty').style.display = 'none';
                if (tbody) {
                    try {
                        const rows = currentCatalogProducts.map(p => {
                            if (!p) return '';
                            // Robust Data Extraction
                            const image = p.image || (p.variants && p.variants[0] ? p.variants[0].image : '') || (p.colors && p.colors[0] && p.colors[0].images ? p.colors[0].images[0] : '') || '';
                            const sku = p.sku || p.SKU || (p.colors && p.colors[0] ? p.colors[0].sku : '') || (p.variants && p.variants[0] ? p.variants[0].sku : '') || '-';
                            const price = p.basePrice || p['Precio Base'] || p.price || (p.colors && p.colors[0] ? p.colors[0].price : '') || 0;

                            return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 0.75rem;">
                                    <img src="${image}" width="40" height="40" style="object-fit: cover; border-radius: 4px; background: #f0f0f0;" onerror="this.style.display='none'">
                                </td>
                                <td style="padding: 0.75rem;">
                                    <div style="font-weight: 500;">${p.name || p.Nombre || 'Sin Nombre'}</div>
                                    <div style="font-size: 0.75rem; color: #888;">${p.category || p.Categoría || '-'}</div>
                                </td>
                                <td style="padding: 0.75rem;">${sku}</td>
                                <td style="padding: 0.75rem;">Bs ${price}</td>
                                <td style="padding: 0.75rem;">
                                    <div style="display: flex; gap: 4px; justify-content: center;">
                                        <span class="action-icon" title="Editar Producto en Catálogo" onclick="window.location.href='products.html?catalogId=${catalogId}&edit=${p.id || p.ID}'">
                                            <svg class="icon-svg" style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.876 18.116c.046-.414.069-.62.131-.814a2 2 0 0 1 .234-.485c.111-.17.259-.317.553-.61L17 3a2.828 2.828 0 1 1 4 4L7.794 20.206c-.294.294-.442.442-.611.553a2 2 0 0 1-.485.233c-.193.063-.4.086-.814.132L2.5 21.5l.376-3.384Z"></path></svg>
                                        </span>
                                        <span class="action-icon" title="Quitar del Catálogo" onclick="removeProductFromCatalog('${currentCatalogId}', '${p.id || p.ID}')">
                                            <svg class="icon-svg" style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 2 13.92 2 12.8 2h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C8 3.52 8 4.08 8 5.2V6m2 5.5v5m4-5v5M3 6h18m-2 0v11.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C16.72 22 15.88 22 14.2 22H9.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C5 19.72 5 18.88 5 17.2V6"></path></svg>
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        `}).join('');

                        tbody.innerHTML = rows;
                    } catch (renderError) {
                        console.error('Render Error', renderError);
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
        window.showToast('Error cargando catálogo', 'error');
    }
};

// Export catalog
window.exportCatalog = function (catalogId) {
    const catalog = catalogs.find(c => c.id === catalogId);
    let catalogName = catalogId; // Fallback
    if (catalog) {
        catalogName = catalog.name;
    }
    window.location.href = `/api/catalogs/${encodeURIComponent(catalogName)}/export`;
};

// Import catalog (Update from Excel)
window.importCatalog = function (catalogId) {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';

    input.onchange = async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (evt) {
            const base64Ref = evt.target.result.split(',')[1]; // Remove data:application/vnd...base64,

            try {
                // Show Loading
                window.showToast('Importando datos...', 'info');

                // Resolve Catalog Name 
                const catalog = catalogs.find(c => c.id === catalogId);
                let catalogName = catalogId;
                if (catalog) catalogName = catalog.name;

                const response = await fetch(`/api/catalogs/${encodeURIComponent(catalogName)}/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileData: base64Ref })
                });

                const result = await response.json();

                if (result.success) {
                    window.showToast(result.message, 'success');
                    // Refresh view
                    if (document.getElementById('catalogDetailView').style.display === 'block') {
                        manageCatalog(catalogId);
                    } else {
                        loadCatalogs();
                    }
                } else {
                    window.showToast('Error: ' + result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                window.showToast('Error de conexión al importar', 'error');
            }
        };
        reader.readAsDataURL(file);
    };

    input.click();
};

// Remove product from catalog
window.removeProductFromCatalog = async function (catalogId, productId) {
    const catalog = catalogs.find(c => c.id === catalogId);
    if (!catalog) {
        window.showToast('Catálogo no encontrado', 'error');
        return;
    }

    const product = currentCatalogProducts.find(p => String(p.id || p.ID) === String(productId));
    const productName = product ? (product.name || product.Nombre || 'este producto') : 'este producto';

    if (typeof window.showConfirm === 'function') {
        window.showConfirm(
            'Quitar Producto',
            `¿Estás seguro de quitar "${productName}" de este catálogo?`,
            async () => {
                try {
                    const response = await fetch('/api/catalogs/remove-product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ catalogId, productId })
                    });

                    const result = await response.json();
                    if (result.success) {
                        if (typeof window.pushHistoryState === 'function') {
                            window.pushHistoryState('Quitar Producto del Catálogo');
                        }
                        await manageCatalog(catalogId);
                        await loadCatalogs();
                        window.showToast('Producto quitado del catálogo', 'success');
                    } else {
                        window.showToast(result.message || 'Error al quitar producto', 'error');
                    }
                } catch (e) {
                    console.error(e);
                    window.showToast('Error al quitar producto del catálogo', 'error');
                }
            },
            null,
            true
        );
    }
};

// Delete catalog
window.deleteCatalog = async function (catalogId) {
    const catalog = catalogs.find(c => c.id === catalogId);
    const name = catalog ? catalog.name : 'este catálogo';

    if (typeof window.showConfirm !== 'function') {
        if (!confirm(`¿Eliminar catálogo "${name}" permanentemente?`)) return;
        try {
            await fetch('/api/catalogs/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catalogId })
            });
            loadCatalogs();
        } catch (e) { }
        return;
    }

    window.showConfirm(
        'Eliminar Catálogo',
        `¿Estás seguro de eliminar el catálogo "${name}"?`,
        async () => {
            try {
                await fetch('/api/catalogs/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ catalogId })
                });
                window.showToast('Catálogo eliminado', 'success');
                loadCatalogs();
            } catch (e) {
                window.showToast('Error eliminando catálogo', 'error');
            }
        },
        null,
        true
    );
};

document.addEventListener('DOMContentLoaded', function () {
    initCatalogSystem();
    const modal = document.getElementById('createCatalogModal');
    if (modal) {
        // Disabled: Modal should only close via X or Cancel button
        // modal.addEventListener('click', function (e) {
        //     if (e.target === modal) closeCreateCatalogModal();
        // });
    }

    const form = document.getElementById('createCatalogForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveCatalog(e);
        });
    }

    // ensure change listener for checks
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('product-checkbox')) updateSelectedCount();
    });
});
