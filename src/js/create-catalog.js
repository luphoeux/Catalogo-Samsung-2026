import { initLayout } from './layout.js';

let allProducts = [];
let selectedProducts = [];
let editingProductSku = null; 
let editingId = null; 

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    
    // Initial view: Folders
    initFolders();

    // Event Listeners for Filters
    document.getElementById('product-search').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const category = document.getElementById('category-filter').value;
        filterProducts(term, category);
    });

    document.getElementById('category-filter').addEventListener('change', (e) => {
        const category = e.target.value;
        const term = document.getElementById('product-search').value.toLowerCase();
        filterProducts(term, category);
    });

    // Navigation
    document.getElementById('btn-back-to-folders')?.addEventListener('click', () => {
        document.getElementById('folders-view').classList.remove('d-none');
        document.getElementById('catalog-builder-view').classList.add('d-none');
        document.querySelector('header h2').textContent = editingId ? 'Editar Catálogo' : 'Crear Nuevo Catálogo';
        document.querySelector('header p').textContent = 'Selecciona los productos y genera una vista premium.';
    });

    // Group Actions
    document.getElementById('btn-select-filter')?.addEventListener('click', selectFiltered);
    document.getElementById('btn-deselect-all')?.addEventListener('click', deselectAll);
    document.getElementById('btn-generate-catalog')?.addEventListener('click', initGeneration);
    
    // Load Promotions for Selector
    loadPromotions();

    // Initial check if editing
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
        editingId = editId;
        loadCatalogToEdit(parseInt(editId)); 
    }
});

function initFolders() {
    let folders = JSON.parse(localStorage.getItem('samsung_product_folders'));

    if (!folders) {
        folders = [
            { id: 'samsung_products_db', name: 'Inventario General', desc: 'Base de datos de 700 productos' },
            { id: 'samsung_products_db_2026', name: 'Catálogo B2B 2026', desc: 'Productos importados TSV' }
        ];
        localStorage.setItem('samsung_product_folders', JSON.stringify(folders));
    }

    renderFolders(folders);
}

function renderFolders(folders) {
    const container = document.getElementById('folders-view');
    if (!container) return;
    container.innerHTML = '';

    folders.forEach(folder => {
        const count = JSON.parse(localStorage.getItem(folder.id) || '{"products":[]}').products.length;
        
        const col = document.createElement('div');
        col.className = 'col-md-4 col-xl-3';
        col.innerHTML = `
            <div class="card-samsung h-100 p-4 d-flex flex-column align-items-center justify-content-center text-center catalog-folder-card cursor-pointer" 
                 style="transition: all 0.2s; border: 1px solid #eee; border-radius: 20px;">
                <div class="mb-3 p-3 rounded-circle bg-light text-primary">
                    <i class="bi ${folder.icon || 'bi-folder'} fs-2"></i>
                </div>
                <h5 class="fw-bold mb-2">${folder.name}</h5>
                <p class="text-muted small mb-3">${folder.desc || 'Explorar productos'}</p>
                <span class="badge bg-light text-dark border mb-3">${count} Productos</span>
                <button class="btn btn-sm btn-primary-samsung btn-pill px-4">Seleccionar</button>
            </div>
        `;
        
        col.querySelector('.catalog-folder-card').onclick = () => selectFolder(folder);
        
        container.appendChild(col);
    });
}

function selectFolder(folder) {
    // Show Builder
    document.getElementById('folders-view').classList.add('d-none');
    document.getElementById('catalog-builder-view').classList.remove('d-none');
    
    // Set titles
    document.getElementById('current-db-title').textContent = folder.name;
    document.getElementById('current-db-desc').textContent = folder.desc || 'Selecciona productos de esta carpeta';
    
    document.querySelector('header h2').textContent = editingId ? `Editando Catálogo - ${folder.name}` : `Crear Catálogo - ${folder.name}`;
    
    loadProductsFromDB(folder.id);
}

function loadProductsFromDB(dbKey) {
    const db = JSON.parse(localStorage.getItem(dbKey) || '{"products":[]}');
    allProducts = (db.products || []).map((p, idx) => ({
        ...p,
        id: `${dbKey}_${p.sku}_${idx}` // Unique ID for selection (even if SKU is duplicated)
    }));
    
    // Refresh UI
    populateCategoryFilter();
    renderTable(allProducts);
    
    // Update count visual
    const countEl = document.getElementById('products-count');
    if(countEl) countEl.textContent = allProducts.length;
}

function loadCatalogToEdit(id) {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const cat = catalogs.find(c => c.id === id);
    if (!cat) return;

    // Load basic info
    const nameEl = document.getElementById('catalog-name');
    const clientEl = document.getElementById('client-name');
    if (nameEl) nameEl.value = cat.name;
    if (clientEl) clientEl.value = cat.client || '';
    
    // Load config
    const config = cat.config || {};
    const titleEl = document.getElementById('cover-title');
    const titleColorEl = document.getElementById('cover-color');
    const watermarkEl = document.getElementById('cover-watermark');
    const opacityEl = document.getElementById('cover-opacity');
    const opacityValEl = document.getElementById('opacity-val');
    
    if (titleEl) titleEl.value = config.customTitle || '';
    if (titleColorEl) titleColorEl.value = config.titleColor || '#000000';
    if (watermarkEl) watermarkEl.value = config.watermark || '';
    if (opacityEl) opacityEl.value = config.opacity || '15';
    if (opacityValEl) opacityValEl.textContent = config.opacity || '15';

    // Load selected promotions (Checkbox Logic)
    if (config.promotions && config.promotions.length > 0) {
        // Wait for checkboxes to populate
        setTimeout(() => {
            const container = document.getElementById('promo-checkbox-container');
            if (container) {
                config.promotions.forEach(promoIndex => {
                    const checkbox = container.querySelector(`input[value="${promoIndex}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }, 200);
    }

    // Load selected products
    selectedProducts = [...cat.products];
    // Will call updateSelectedSidebar and renderTable properly once restored
    if (typeof updateSelectedSidebar === 'function') updateSelectedSidebar();
    renderTable(allProducts);

    // Update button text
    const btnEl = document.getElementById('btn-generate-catalog');
    const h2El = document.querySelector('header h2'); // More specific selector
    if (btnEl) btnEl.textContent = 'ACTUALIZAR CATÁLOGO';
    if (h2El) h2El.textContent = 'Editar Catálogo';
}



function initGeneration() {
    const name = document.getElementById('catalog-name')?.value || '';
    const client = document.getElementById('client-name')?.value || ''; 
    const customTitle = document.getElementById('cover-title')?.value || 'Catálogo Samsung'; 
    const titleColor = document.getElementById('cover-color')?.value || 'Negro'; 
    const watermark = document.getElementById('cover-watermark')?.value || '2026'; 
    const opacity = document.getElementById('cover-opacity')?.value || '15'; 
    
    // Get selected promotions (Checkbox Logic)
    const checkedBoxes = document.querySelectorAll('.promo-check:checked');
    const selectedPromos = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

    if (!name) {
        alert('Por favor, ingresa un nombre para el catálogo.');
        return;
    }

    if (selectedProducts.length === 0) {
        alert('Selecciona al menos un producto.');
        return;
    }

    generateFiles(name, client, { customTitle, titleColor, watermark, opacity, promotions: selectedPromos });
}

function generateFiles(name, client, config) {
    const timestamp = new Date().getTime();
    
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    
    if (editingId) {
        const index = catalogs.findIndex(c => c.id === parseInt(editingId));
        if (index !== -1) {
            catalogs[index] = {
                ...catalogs[index],
                name: name,
                client: client,
                config: config,
                productCount: selectedProducts.length,
                products: selectedProducts
            };
        }
    } else {
        const catalogMeta = {
            id: timestamp,
            name: name,
            client: client,
            config: config,
            date: new Date().toISOString(),
            productCount: selectedProducts.length,
            products: selectedProducts
        };
        catalogs.push(catalogMeta);
    }
    
    localStorage.setItem('samsung_catalogs', JSON.stringify(catalogs));

    alert(`✅ Catálogo "${name}" ${editingId ? 'actualizado' : 'generado'} con éxito.`);
    
    // Redirect to Mis Catalogos
    window.location.href = 'catalogs.html';
}

// --- RESTORED CORE FUNCTIONS ---

function filterProducts(term, category) {
    let filtered = allProducts;

    if (category && category !== 'Todas las Categorías') {
        filtered = filtered.filter(p => p.mainCategory === category);
    }

    if (term) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.sku.toLowerCase().includes(term)
        );
    }

    renderTable(filtered);
}

function renderTable(products) {
    console.log('Rendering table with', products ? products.length : 0, 'products');
    const tbody = document.getElementById('products-table-body');
    if (!tbody) {
        console.error('Tbody products-table-body not found');
        return;
    }

    const db = JSON.parse(localStorage.getItem('samsung_products_db') || '{"products":[]}');
    const fullSource = db.products || [];

    tbody.innerHTML = '';

    const countEl = document.getElementById('products-count');
    if(countEl) countEl.innerText = products.length;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron productos.</td></tr>';
        return;
    }

    products.forEach(p => {
        const selectedVersion = selectedProducts.find(sp => sp.id === p.id);
        const isSelected = !!selectedVersion;
        
        const displayPrice = isSelected ? (selectedVersion.price || 0) : (p.price || 0);
        const displaySalePrice = isSelected ? (selectedVersion.salePrice || 0) : (p.salePrice || 0);
        
        const tr = document.createElement('tr');
        tr.className = isSelected ? 'table-primary' : '';
        
        tr.innerHTML = `
            <td class="ps-4">
                <div class="form-check">
                    <input class="form-check-input product-select-check" type="checkbox" value="${p.id}" ${isSelected ? 'checked' : ''}>
                </div>
            </td>
            <td>
                <div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: #fff; border: 1px solid #eee;">
                    <img src="${p.image || 'https://via.placeholder.com/50?text=No+Img'}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='https://via.placeholder.com/50?text=No+Img'">
                </div>
            </td>
            <td>
                <div class="fw-bold text-dark">${p.name}</div>
                <div class="small text-muted">${p.sku}</div>
                ${p.description ? `<div class="small text-primary text-truncate" style="max-width: 250px;">${p.description}</div>` : ''}
            </td>
            <td><span class="badge bg-light text-dark border">${p.mainCategory || 'General'}</span></td>
            <td>
                <div class="fw-bold ${isSelected && displayPrice !== p.price ? 'text-primary' : ''}">
                    Bs ${displayPrice.toLocaleString()}
                </div>
                ${displaySalePrice > 0 ? `<div class="small text-danger text-decoration-line-through">Bs ${displaySalePrice.toLocaleString()}</div>` : ''}
                ${isSelected && displayPrice !== p.price ? '<div class="small fst-italic text-muted" style="font-size: 0.65rem;">(Personalizado)</div>' : ''}
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light border rounded-pill px-3" onclick="openQuickEdit('${p.sku}')">
                    <i class="bi bi-pencil-fill small me-1"></i> Editar
                </button>
            </td>
        `;

        const checkbox = tr.querySelector('.product-select-check');
        checkbox?.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!selectedProducts.some(sp => sp.id === p.id)) {
                    selectedProducts.push({...p});
                }
                tr.classList.add('table-primary');
            } else {
                selectedProducts = selectedProducts.filter(sp => sp.id !== p.id);
                tr.classList.remove('table-primary');
            }
            updateSelectedSidebar();
        });

        tbody.appendChild(tr);
    });
    
    // "Select All Visible" Listener
    const selectAllCheck = document.getElementById('select-all-visible');
    if (selectAllCheck) {
        const newSelectAll = selectAllCheck.cloneNode(true);
        selectAllCheck.parentNode.replaceChild(newSelectAll, selectAllCheck);
        
        newSelectAll.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const boxes = document.querySelectorAll('.product-select-check');
            boxes.forEach(box => {
                box.checked = isChecked;
                box.dispatchEvent(new Event('change'));
            });
        });
    }
}

// RESTORED MISSING FUNCTIONS

function populateCategoryFilter() {
    const catSelect = document.getElementById('category-filter');
    if (!catSelect) return;

    catSelect.innerHTML = '<option value="">Todas las Categorías</option>';
    
    const mainCategories = [
        "Smartphones", "Tablets", "Smartwatches", "Galaxy Buds", 
        "Galaxy Book", "Mobile", "Monitor", "Televisores",
        "Equipos de Audio", "Proyectores", "Refrigeradores", 
        "Lavadoras / Secadoras", "Microondas", "Empotrados", 
        "Cocina", "Hornos", "Aspiradoras", "Soluciones de Aire", "Accesorios"
    ];

    mainCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
    });
}

function selectFiltered() {
    const currentFilteredProducts = getCurrentFilteredProducts(); 
    currentFilteredProducts.forEach(p => {
        if (!selectedProducts.some(sp => sp.id === p.id)) {
            selectedProducts.push({...p});
        }
    });
    renderTable(currentFilteredProducts); 
    updateSelectedSidebar();
}

function deselectAll() {
    selectedProducts = [];
    renderTable(getCurrentFilteredProducts()); 
    updateSelectedSidebar();
}

function getCurrentFilteredProducts() {
    const searchInput = document.getElementById('product-search');
    const catFilter = document.getElementById('category-filter');
    const query = searchInput?.value.toLowerCase() || '';
    const cat = catFilter?.value || '';

    let filtered = allProducts;

    if (cat && cat !== 'Todas las Categorías') {
        filtered = filtered.filter(p => p.mainCategory === cat);
    }

    if (query) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.sku.toLowerCase().includes(query)
        );
    }
    return filtered;
}

function updateSelectedSidebar() {
    const list = document.getElementById('selected-list');
    const countEl = document.getElementById('selected-count');
    if (!list || !countEl) return;

    countEl.textContent = selectedProducts.length;

    if (selectedProducts.length === 0) {
        list.innerHTML = `<p class="text-muted small text-center mt-4">No has seleccionado productos aún.</p>`;
        return;
    }

    list.innerHTML = '';
    selectedProducts.forEach(p => {
        const item = document.createElement('div');
        item.className = 'selected-product-item';
        item.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/40'}" style="width: 40px; height: 40px; object-fit: contain;" onerror="this.src='https://via.placeholder.com/40'">
            <div class="flex-grow-1 overflow-hidden">
                <div class="small fw-bold text-truncate">${p.name}</div>
                <div class="text-muted" style="font-size: 0.7rem;">${p.sku}</div>
            </div>
            <div class="d-flex gap-1 ms-2">
                <button class="btn btn-sm text-primary border-0 p-1 edit-local-btn" data-id="${p.id}">✏️</button>
                <button class="btn btn-sm text-danger border-0 p-1 remove-btn" data-id="${p.id}">✕</button>
            </div>
        `;
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProduct(p);
        });
        item.querySelector('.edit-local-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openLocalEditModal(p.id);
        });
        list.appendChild(item);
    });
}

function toggleProduct(p) {
    if (selectedProducts.some(sp => sp.id === p.id)) {
        selectedProducts = selectedProducts.filter(sp => sp.id !== p.id);
    } else {
        selectedProducts.push({...p});
    }
    renderTable(getCurrentFilteredProducts());
    updateSelectedSidebar();
}

let currentLocalSelectedGifts = []; // Helper for local edit modal

function openLocalEditModal(id) {
    const product = selectedProducts.find(p => p.id === id);
    if (!product) return;

    // We can reuse the quick edit modal logic but targeted at local instance
    // For simplicity, let's just trigger the Quick Edit modal which now handles both
    window.openQuickEdit(product.sku); // Quick edit usually uses SKU globally
}

function loadPromotions() {
    const list = JSON.parse(localStorage.getItem('samsung_promotions') || '[]');
    const container = document.getElementById('promo-checkbox-container');
    
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<div class="text-center text-muted small py-2">No hay promociones guardadas.</div>';
        return;
    }

    container.innerHTML = '';
    list.forEach((promo, index) => {
        const div = document.createElement('div');
        div.className = 'form-check mb-1 small';
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${index}" id="promo-check-${index}">
            <label class="form-check-label text-truncate w-100" for="promo-check-${index}" title="${promo.name}" style="font-size: 0.8rem; cursor: pointer;">
                ${promo.name}
            </label>
        `;
        container.appendChild(div);
    });
}
