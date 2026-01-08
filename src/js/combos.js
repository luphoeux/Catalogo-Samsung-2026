import { initLayout } from './layout.js';

let gifts = [];
let linkedSkus = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    loadData();

    // File Upload Logic
    document.getElementById('gift-file-input').addEventListener('change', handleImageUpload);
    document.getElementById('btn-save-gift').addEventListener('click', saveGift);
    
    // Product Linking Logic
    document.getElementById('btn-add-sku').addEventListener('click', addSkuToGift);
    document.getElementById('catalog-selector').addEventListener('change', loadCatalogProducts);
    document.getElementById('select-all-catalog').addEventListener('change', toggleAllCatalogProducts);
});

function loadData() {
    gifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');
    const db = JSON.parse(localStorage.getItem('samsung_products_db') || '{"products":[]}');
    allProducts = db.products;
    
    loadCatalogs();
    renderGifts();
}

function loadCatalogs() {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const selector = document.getElementById('catalog-selector');
    
    selector.innerHTML = '<option value="">-- Selecciona un catálogo --</option>';
    
    catalogs.forEach((catalog, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${catalog.name} (${catalog.productCount} productos)`;
        selector.appendChild(option);
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Resize image to max 200px width (enough for thumbs/icons)
            const maxWidth = 200;
            const scaleSize = maxWidth / img.width;
            const canvas = document.createElement("canvas");
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const base64String = canvas.toDataURL("image/webp", 0.7); // Use WebP for better compression
            
            // Set values
            document.getElementById('gift-image').value = base64String;
            
            // Update preview
            const preview = document.getElementById('gift-preview');
            const placeholder = document.getElementById('gift-preview-placeholder');
            
            preview.src = base64String;
            preview.style.display = 'inline-block';
            placeholder.style.display = 'none';
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

function loadCatalogProducts() {
    const selector = document.getElementById('catalog-selector');
    const catalogIndex = selector.value;
    const container = document.getElementById('catalog-products-container');
    const productsList = document.getElementById('catalog-products-list');
    
    // Reset select all check
    document.getElementById('select-all-catalog').checked = false;
    
    if (!catalogIndex) {
        container.style.display = 'none';
        return;
    }
    
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const catalog = catalogs[catalogIndex];
    
    if (!catalog || !catalog.products) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    productsList.innerHTML = '';
    
    catalog.products.forEach(product => {
        const isSelected = linkedSkus.includes(product.sku);
        const div = document.createElement('div');
        div.className = 'form-check border-bottom pb-2 mb-2';
        div.innerHTML = `
            <input class="form-check-input catalog-product-check" type="checkbox" value="${product.sku}" id="product-${product.sku}" ${isSelected ? 'checked' : ''}>
            <label class="form-check-label d-flex align-items-center gap-2" for="product-${product.sku}" style="cursor: pointer; width: 100%;">
                <img src="${product.image}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; background: #fff; border: 1px solid #eee;">
                <div style="flex-grow: 1; overflow: hidden;">
                    <div class="fw-bold text-truncate" style="font-size: 0.85rem;">${product.name}</div>
                    <div class="text-muted d-flex justify-content-between" style="font-size: 0.75rem;">
                        <span>${product.sku}</span>
                    </div>
                </div>
            </label>
        `;
        productsList.appendChild(div);
    });
    
    document.querySelectorAll('.catalog-product-check').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const sku = this.value;
            const product = allProducts.find(p => p.sku === sku) || catalog.products.find(p => p.sku === sku);
            
            if (this.checked) {
                if (!linkedSkus.includes(sku) && product) {
                    linkedSkus.push(sku);
                }
            } else {
                const index = linkedSkus.indexOf(sku);
                if (index > -1) {
                    linkedSkus.splice(index, 1);
                }
            }
            renderLinkedProducts();
            updateSelectAllState();
        });
    });
    
    updateSelectAllState();
}

function toggleAllCatalogProducts() {
    const isChecked = document.getElementById('select-all-catalog').checked;
    const checkboxes = document.querySelectorAll('.catalog-product-check');
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        // Trigger change event logic manually since setting property doesn't trigger it
        const sku = cb.value;
        
        if (isChecked) {
             if (!linkedSkus.includes(sku)) linkedSkus.push(sku);
        } else {
             const index = linkedSkus.indexOf(sku);
             if (index > -1) linkedSkus.splice(index, 1);
        }
    });
    renderLinkedProducts();
}

function updateSelectAllState() {
    const checkboxes = Array.from(document.querySelectorAll('.catalog-product-check'));
    if(checkboxes.length === 0) return;
    
    const allChecked = checkboxes.every(cb => cb.checked);
    document.getElementById('select-all-catalog').checked = allChecked;
}

function addSkuToGift() {
    const input = document.getElementById('sku-search');
    const searchValue = input.value.toLowerCase();
    
    if (!searchValue) return;
    
    const product = allProducts.find(p => p.sku.toLowerCase() === searchValue || p.name.toLowerCase().includes(searchValue));
    
    if (product) {
        if (!linkedSkus.includes(product.sku)) {
            linkedSkus.push(product.sku);
            renderLinkedProducts();
        }
        input.value = '';
        
        // Update checkbox if visible
        const checkbox = document.getElementById(`product-${product.sku}`);
        if(checkbox) {
            checkbox.checked = true;
            updateSelectAllState();
        }
    } else {
        alert('Producto no encontrado');
    }
}

function renderLinkedProducts() {
    const container = document.getElementById('linked-products-list');
    const badge = document.getElementById('linked-count-badge');
    
    // Update Badge
    if (badge) {
        badge.textContent = `${linkedSkus.length} seleccionados`;
        badge.className = linkedSkus.length > 0 
            ? 'badge bg-primary-subtle text-primary border border-primary-subtle' 
            : 'badge bg-light text-muted border';
    }

    if (linkedSkus.length === 0) {
        container.innerHTML = `
            <div class="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-4">
                <i class="bi bi-diagram-2 fs-1 mb-2"></i>
                <p class="small mb-0">No hay productos vinculados</p>
            </div>`;
        return;
    }
    
    container.innerHTML = '';
    linkedSkus.forEach(sku => {
        const product = allProducts.find(p => p.sku === sku) || { name: 'Producto Desconocido', sku: sku, image: '' };
        
        const div = document.createElement('div');
        div.className = 'card mb-2 border-0 shadow-sm';
        div.innerHTML = `
            <div class="card-body p-2 d-flex align-items-center gap-2">
                <img src="${product.image || 'https://via.placeholder.com/40'}" style="width: 36px; height: 36px; object-fit: contain; background: #f8f9fa; border-radius: 6px;" onerror="this.src='https://via.placeholder.com/40'">
                <div class="flex-grow-1 overflow-hidden">
                    <div class="fw-bold text-truncate" style="font-size: 0.8rem;">${product.name}</div>
                    <div class="text-muted d-flex align-items-center" style="font-size: 0.7rem;">
                        <i class="bi bi-upc-scan me-1"></i>${sku}
                    </div>
                </div>
                <button type="button" class="btn btn-icon btn-sm text-danger" onclick="removeSku('${sku}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.removeSku = (sku) => {
    const index = linkedSkus.indexOf(sku);
    if (index > -1) {
        linkedSkus.splice(index, 1);
        renderLinkedProducts();
        
        // Update checkbox if visible
        const checkbox = document.getElementById(`product-${sku}`);
        if(checkbox) {
            checkbox.checked = false;
            updateSelectAllState();
        }
    }
};

function renderGifts() {
    const tbody = document.getElementById('giftsTable');
    if(gifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No hay regalos registrados. Añade el primero.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    gifts.forEach((g, index) => {
        const productCount = (g.productSkus || []).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">
                <div class="d-flex align-items-center">
                    <img src="${g.image}" class="me-3 rounded-3" style="width: 40px; height: 40px; object-fit: contain; background: #fff; border: 1px solid #eee;">
                    <div class="fw-bold">${g.name}</div>
                </div>
            </td>
            <td><span class="badge bg-light text-primary border">${productCount} Productos</span></td>
            <td><div class="text-muted small text-truncate" style="max-width: 200px;">${g.desc || '-'}</div></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light border p-2 rounded-circle me-1" onclick="editGift(${index})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger border p-2 rounded-circle" onclick="deleteGift(${index})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveGift() {
    const id = document.getElementById('gift-id').value;
    const name = document.getElementById('gift-name').value;
    const image = document.getElementById('gift-image').value;
    const desc = document.getElementById('gift-desc').value;

    if(!name || !image) {
        alert('Nombre e imagen son obligatorios');
        return;
    }

    const giftData = { 
        name, 
        image, 
        desc,
        productSkus: linkedSkus 
    };

    if(id !== "") {
        gifts[parseInt(id)] = giftData;
    } else {
        gifts.push(giftData);
    }

    localStorage.setItem('samsung_gifts', JSON.stringify(gifts));
    bootstrap.Modal.getInstance(document.getElementById('giftModal')).hide();
    resetForm();
    renderGifts();
}

window.editGift = (index) => {
    const g = gifts[index];
    document.getElementById('gift-id').value = index;
    document.getElementById('gift-name').value = g.name;
    document.getElementById('gift-image').value = g.image;
    document.getElementById('gift-desc').value = g.desc || '';
    
    // Load Linked SKUs
    linkedSkus = [...(g.productSkus || [])];
    renderLinkedProducts();
    
    // Set preview manually
    const img = document.getElementById('gift-preview');
    const placeholder = document.getElementById('gift-preview-placeholder');
    
    if(g.image) {
        img.src = g.image;
        img.style.display = 'inline-block';
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'block';
    }
    
    // Reset catalog selector
    document.getElementById('catalog-selector').value = '';
    document.getElementById('catalog-products-container').style.display = 'none';
    
    new bootstrap.Modal(document.getElementById('giftModal')).show();
};

window.deleteGift = (index) => {
    if(confirm('¿Eliminar este item?')) {
        gifts.splice(index, 1);
        localStorage.setItem('samsung_gifts', JSON.stringify(gifts));
        renderGifts();
    }
};

function resetForm() {
    document.getElementById('giftForm').reset();
    document.getElementById('gift-id').value = "";
    document.getElementById('gift-file-input').value = ""; // Clear file input
    document.getElementById('gift-image').value = ""; // Clear hidden input
    document.getElementById('gift-preview').style.display = 'none';
    document.getElementById('gift-preview-placeholder').style.display = 'block';
    
    linkedSkus = [];
    renderLinkedProducts();
    document.getElementById('catalog-products-container').style.display = 'none';
}
