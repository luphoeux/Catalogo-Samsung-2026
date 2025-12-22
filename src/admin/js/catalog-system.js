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
                <span class="material-icons" style="font-size: 48px; opacity: 0.3;">folder_open</span>
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
                    <div style="width: 32px; height: 32px; background: #e3f2fd; color: #1565c0; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <span class="material-icons" style="font-size: 18px;">folder</span>
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
                        <span class="material-icons" style="font-size: 18px;">inventory_2</span>
                    </button>
                    <button class="btn-icon" onclick="previewCatalog('${catalog.id}')" title="Previsualizar" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #666; cursor: pointer;">
                        <span class="material-icons" style="font-size: 18px;">visibility</span>
                    </button>
                    <button class="btn-icon" onclick="editCatalog('${catalog.id}')" title="Editar Metadatos" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #666; cursor: pointer;">
                        <span class="material-icons" style="font-size: 18px;">edit</span>
                    </button>
                    <button class="btn-icon" onclick="duplicateCatalog('${catalog.id}')" title="Duplicar Catálogo" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #666; cursor: pointer;">
                        <span class="material-icons" style="font-size: 18px;">content_copy</span>
                    </button>
                    <button class="btn-icon" onclick="exportCatalog('${catalog.id}')" title="Exportar Excel" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #2e7d32; cursor: pointer;">
                        <span class="material-icons" style="font-size: 18px;">download</span>
                    </button>
                    <button class="btn-icon" onclick="importCatalog('${catalog.id}')" title="Importar Excel" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #f57c00; cursor: pointer;">
                        <span class="material-icons" style="font-size: 18px;">upload</span>
                    </button>
                    <button class="btn-icon" onclick="deleteCatalog('${catalog.id}')" title="Eliminar" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #fee2e2; border-radius: 4px; color: #ef4444; cursor: pointer;">
                        <span class="material-icons" style="font-size: 18px;">delete</span>
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
        btn.innerHTML = '<span class="material-icons" style="font-size: 16px;">add</span> Crear Catálogo';
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
        btn.innerHTML = '<span class="material-icons" style="font-size: 16px;">save</span> Agregar Seleccionados';
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
        btn.innerHTML = '<span class="material-icons" style="font-size: 16px;">save</span> Guardar Cambios';
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
                                    <div style="display: flex; gap: 4px;">
                                        <button class="btn-icon" style="color: #666;" title="Editar Producto en Catálogo" onclick="window.location.href='products.html?catalogId=${catalogId}&edit=${p.id || p.ID}'">
                                            <span class="material-icons" style="font-size: 18px;">edit</span>
                                        </button>
                                        <button class="btn-icon delete" style="color: #dc2626;" title="Quitar del Catálogo" onclick="removeProductFromCatalog('${currentCatalogId}', '${p.id || p.ID}')">
                                            <span class="material-icons" style="font-size: 18px;">remove_circle</span>
                                        </button>
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
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeCreateCatalogModal();
        });
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
