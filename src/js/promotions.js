import { initLayout } from './layout.js';

let promotions = [];
let linkedSkus = [];
let currentCatalogData = []; // Global variable for filtering

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    loadData();
    
    // Image Upload Logic
    document.getElementById('promo-file-input').addEventListener('change', handleImageUpload);

    // Color picker sync (optional visual enhancement)
    document.getElementById('promo-color').addEventListener('input', (e) => {
        // Could update preview border or similar 
    });

    document.getElementById('btn-save-promo').addEventListener('click', savePromo);
    document.getElementById('promo-search-table').addEventListener('input', renderPromotions);
    document.getElementById('catalog-selector').addEventListener('change', loadCatalogProducts);
    
    // Catalog Filtering Listeners
    const searchInput = document.getElementById('catalog-search');
    const categoryFilter = document.getElementById('catalog-category-filter');

    if (searchInput) searchInput.addEventListener('input', filterCatalogProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterCatalogProducts);

    // Toggle All Catalog Products
    const toggleAll = document.getElementById('select-all-catalog');
    if (toggleAll) {
        toggleAll.addEventListener('change', toggleAllCatalogProducts);
    }
});

// ... (loadData same as before) 

// ... (handleImageUpload same as before)

function loadCatalogs() {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const selector = document.getElementById('catalog-selector');
    
    selector.innerHTML = '<option value="">📂 Cargar desde Catálogo...</option>';
    
    catalogs.forEach((catalog, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${catalog.name} (${catalog.products?.length || 0} items)`;
        selector.appendChild(option);
    });
}

function loadCatalogProducts() {
    const selector = document.getElementById('catalog-selector');
    const catalogIndex = selector.value;
    const container = document.getElementById('catalog-products-container');
    
    if (catalogIndex === "") {
        container.style.display = 'none';
        currentCatalogData = [];
        return;
    }
    
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const catalog = catalogs[catalogIndex];
    
    if (!catalog || !catalog.products) return;
    
    currentCatalogData = catalog.products; // Store for filtering
    container.style.display = 'block';

    // Populate Category Filter
    const categorySelect = document.getElementById('catalog-category-filter');
    const categories = new Set(currentCatalogData.map(p => p.mainCategory || p.category || 'Otros').filter(c => c));
    
    categorySelect.innerHTML = '<option value="">Todas</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    // Reset filters
    document.getElementById('catalog-search').value = '';
    
    renderCatalogList(currentCatalogData);
    updateSelectedCount(); // Existing helper
}

function filterCatalogProducts() {
    const query = document.getElementById('catalog-search').value.toLowerCase();
    const category = document.getElementById('catalog-category-filter').value;
    
    const filtered = currentCatalogData.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
        const pCat = p.mainCategory || p.category || 'Otros';
        const matchesCategory = category === "" || pCat === category;
        
        return matchesSearch && matchesCategory;
    });
    
    renderCatalogList(filtered);
}

function renderCatalogList(products) {
    const productsList = document.getElementById('catalog-products-list');
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<div class="text-center text-muted small py-3">No se encontraron productos.</div>';
        return;
    }

    products.forEach(product => {
        const isSelected = linkedSkus.includes(product.sku);
        const div = document.createElement('div');
        div.className = 'form-check p-2 border-bottom';
        div.innerHTML = `
            <input class="form-check-input catalog-product-check" type="checkbox" value="${product.sku}" id="prod-${product.sku}" ${isSelected ? 'checked' : ''}>
            <label class="form-check-label d-flex align-items-center gap-2 w-100" for="prod-${product.sku}" style="cursor: pointer;">
                <img src="${product.image || 'https://via.placeholder.com/30'}" style="width: 30px; height: 30px; object-fit: contain;">
                <div class="overflow-hidden">
                    <div class="small fw-bold text-truncate">${product.name}</div>
                    <div class="d-flex justify-content-between">
                         <span class="text-muted" style="font-size: 0.65rem;">${product.sku}</span>
                         <span class="badge bg-light text-dark border ms-2" style="font-size: 0.6rem;">${product.mainCategory || 'Gral'}</span>
                    </div>
                </div>
            </label>
        `;
        productsList.appendChild(div);
    });

    // Re-attach listeners to new checkboxes
    document.querySelectorAll('.catalog-product-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const sku = e.target.value;
            if (e.target.checked) {
                if (!linkedSkus.includes(sku)) linkedSkus.push(sku);
            } else {
                linkedSkus = linkedSkus.filter(s => s !== sku);
            }
            updateSelectedCount();
        });
    });
    
    // Reset "Select All" based on visible list state (optional logic, kept simple for now)
    document.getElementById('select-all-catalog').checked = false;
}

function toggleAllCatalogProducts(e) {
    const isChecked = e.target.checked;
    // Only toggle VISIBLE products (that match filter)
    const checkboxes = document.querySelectorAll('#catalog-products-list .catalog-product-check');
    
    checkboxes.forEach(chk => {
        chk.checked = isChecked;
        const sku = chk.value;
        if (isChecked) {
            if (!linkedSkus.includes(sku)) linkedSkus.push(sku);
        } else {
            // Only remove if unchecking, but proceed with caution if filtered?
            // User expectation on "Select All" with filter usually implies "Select All Visible"
            linkedSkus = linkedSkus.filter(s => s !== sku);
        }
    });
    updateSelectedCount();
}


// --- CRUD Operations ---

function renderPromotions() {
    const tbody = document.getElementById('promotionsTable');
    const query = document.getElementById('promo-search-table').value.toLowerCase();
    
    const filtered = promotions.filter(p => p.name.toLowerCase().includes(query));

    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">No se encontraron promociones.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach((p, index) => {
        const tr = document.createElement('tr');
        tr.className = 'align-middle';
        tr.innerHTML = `
            <td class="ps-4"><input type="checkbox" class="form-check-input"></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="ratio ratio-1x1 me-3 rounded-3 overflow-hidden border" style="width: 48px; border-color: #e3e8ee !important;">
                        <img src="${p.image}" class="img-fluid" style="object-fit: cover;">
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${p.name}</div>
                        ${p.link ? '<a href="#" class="small text-decoration-none text-muted"><i class="bi bi-link-45deg"></i> Link externo</a>' : ''}
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${p.accentColor || '#007aff'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>
                    <span class="small text-muted font-monospace">${p.accentColor || '#007aff'}</span>
                </div>
            </td>
            <td><span class="badge bg-light text-dark border fw-normal shadow-sm px-3 py-2 rounded-pill">${p.productSkus?.length || 0} productos</span></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light border shadow-sm p-2 rounded-3 me-1" onclick="editPromo(${index})"><i class="bi bi-pencil-fill text-muted"></i></button>
                <button class="btn btn-sm btn-light border shadow-sm p-2 rounded-3 text-danger" onclick="deletePromo(${index})"><i class="bi bi-trash-fill"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function savePromo() {
    const id = document.getElementById('promo-id').value;
    const name = document.getElementById('promo-name').value;
    const image = document.getElementById('promo-image').value;
    const link = document.getElementById('promo-link').value;
    const accent = document.getElementById('promo-color').value;

    if (!name || !image) {
        alert('Nombre e Imagen (Banner) son obligatorios');
        return;
    }

    const promoData = {
        name,
        image,
        link,
        accentColor: accent,
        productSkus: linkedSkus
    };

    if (id !== "") {
        promotions[parseInt(id)] = promoData;
    } else {
        promotions.push(promoData);
    }

    localStorage.setItem('samsung_promotions', JSON.stringify(promotions));
    bootstrap.Modal.getInstance(document.getElementById('promoModal')).hide();
    resetForm();
    renderPromotions();
}

window.editPromo = (index) => {
    const p = promotions[index];
    document.getElementById('promo-id').value = index;
    document.getElementById('promo-name').value = p.name;
    document.getElementById('promo-image').value = p.image;
    document.getElementById('promo-link').value = p.link || '';
    document.getElementById('promo-color').value = p.accentColor || '#007aff';
    
    linkedSkus = p.productSkus || [];
    updateSelectedCount();
    
    // Set Preview (Image is already Base64)
    const preview = document.getElementById('promo-preview');
    if (p.image) {
        preview.src = p.image;
        preview.style.display = 'block';
        document.getElementById('promo-preview-placeholder').style.display = 'none';
    } else {
        preview.style.display = 'none';
        document.getElementById('promo-preview-placeholder').style.display = 'block';
    }

    // Reset Catalog View
    document.getElementById('catalog-selector').value = "";
    document.getElementById('catalog-products-container').style.display = 'none';
    
    new bootstrap.Modal(document.getElementById('promoModal')).show();
};

window.deletePromo = (index) => {
    if (confirm('¿Eliminar esta promoción?')) {
        promotions.splice(index, 1);
        localStorage.setItem('samsung_promotions', JSON.stringify(promotions));
        renderPromotions();
    }
};

function resetForm() {
    document.getElementById('promotionForm').reset();
    document.getElementById('promo-id').value = "";
    linkedSkus = [];
    document.getElementById('promo-preview').style.display = 'none';
    document.getElementById('promo-preview-placeholder').style.display = 'block';
    document.getElementById('promo-image').value = "";
    document.getElementById('catalog-products-container').style.display = 'none';
    updateSelectedCount();
}



// Load Data from LocalStorage
function loadData() {
    const storedPromos = localStorage.getItem('samsung_promotions');
    if (storedPromos) {
        promotions = JSON.parse(storedPromos);
    } else {
        promotions = [];
    }
    
    // Also load product DB for linking context if needed, though strictly not required for just listing promos
    const productsDB = localStorage.getItem('samsung_products_db');
    if (productsDB) {
        const db = JSON.parse(productsDB);
        currentCatalogData = db.products || [];
    }

    renderPromotions();
}
