import { initLayout } from './layout.js';

let tags = [];
let linkedSkus = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    loadData();

    document.getElementById('btn-save-tag').addEventListener('click', saveTag);
    document.getElementById('btn-add-sku').addEventListener('click', addSkuToTag);
    document.getElementById('catalog-selector').addEventListener('change', loadCatalogProducts);
    
    // Live Preview Listeners
    document.getElementById('tag-text').addEventListener('input', updatePreview);
    document.getElementById('tag-bg').addEventListener('input', updatePreview);
    document.getElementById('tag-color').addEventListener('input', updatePreview);
});

function loadData() {
    tags = JSON.parse(localStorage.getItem('samsung_tags') || '[]');
    
    // Default tags if empty
    if (tags.length === 0) {
        tags = [
            { text: 'NUEVO', bg: '#DC3545', color: '#FFFFFF', productSkus: [] },
            { text: 'OFERTA', bg: '#FFC107', color: '#212529', productSkus: [] }
        ];
        localStorage.setItem('samsung_tags', JSON.stringify(tags));
    }
    
    const db = JSON.parse(localStorage.getItem('samsung_products_db') || '{"products":[]}');
    allProducts = db.products;
    
    loadCatalogs();
    renderTags();
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

function loadCatalogProducts() {
    const selector = document.getElementById('catalog-selector');
    const catalogIndex = selector.value;
    const container = document.getElementById('catalog-products-container');
    const productsList = document.getElementById('catalog-products-list');
    
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
        div.className = 'form-check';
        div.innerHTML = `
            <input class="form-check-input catalog-product-check" type="checkbox" value="${product.sku}" id="product-${product.sku}" ${isSelected ? 'checked' : ''}>
            <label class="form-check-label d-flex align-items-center gap-2" for="product-${product.sku}" style="cursor: pointer;">
                <img src="${product.image}" style="width: 30px; height: 30px; object-fit: contain; border-radius: 4px; background: #f8f8f8;">
                <div>
                    <div class="fw-bold" style="font-size: 0.8rem;">${product.name}</div>
                    <div class="text-muted" style="font-size: 0.7rem;">${product.sku}</div>
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
                    renderLinkedProducts();
                }
            } else {
                const index = linkedSkus.indexOf(sku);
                if (index > -1) {
                    linkedSkus.splice(index, 1);
                    renderLinkedProducts();
                }
            }
        });
    });
}

function updatePreview() {
    const text = document.getElementById('tag-text').value || 'TEXTO';
    const bg = document.getElementById('tag-bg').value;
    const color = document.getElementById('tag-color').value;
    
    const badge = document.getElementById('tag-preview');
    badge.textContent = text;
    badge.style.backgroundColor = bg;
    badge.style.color = color;
}

function renderTags() {
    const tbody = document.getElementById('tagsTable');
    tbody.innerHTML = '';

    tags.forEach((t, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4"><span class="badge rounded-pill" style="background-color: ${t.bg}; color: ${t.color};">${t.text}</span></td>
            <td class="fw-bold">${t.text}</td>
            <td><code>${t.bg}</code></td>
            <td><code>${t.color}</code></td>
            <td><span class="badge bg-light text-primary border">${(t.productSkus || []).length} Productos</span></td>
            <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-light border p-2 rounded-circle" onclick="editTag(${index})"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-outline-danger border p-2 rounded-circle" onclick="deleteTag(${index})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function addSkuToTag() {
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
        if(checkbox) checkbox.checked = true;
    } else {
        alert('Producto no encontrado');
    }
}

function renderLinkedProducts() {
    const container = document.getElementById('linked-products-list');
    
    if (linkedSkus.length === 0) {
        container.innerHTML = '<div class="text-center text-muted small mt-2 w-100">Selecciona productos para aplicar esta etiqueta.</div>';
        return;
    }
    
    container.innerHTML = '';
    linkedSkus.forEach(sku => {
        const product = allProducts.find(p => p.sku === sku) || { name: 'Producto Desconocido', sku: sku, image: '' };
        
        const div = document.createElement('div');
        div.className = 'badge bg-light text-dark border p-2 d-flex align-items-center gap-2';
        div.innerHTML = `
            ${product.image ? `<img src="${product.image}" style="width: 20px; height: 20px; object-fit: contain;">` : ''}
            <div>
                <div class="fw-bold small text-truncate" style="max-width: 150px;">${product.name}</div>
                <div style="font-size: 0.6rem;" class="text-muted">${sku}</div>
            </div>
            <button type="button" class="btn-close ms-2" aria-label="Close" style="font-size: 0.5rem;" onclick="removeSku('${sku}')"></button>
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
        if(checkbox) checkbox.checked = false;
    }
};

function saveTag() {
    const indexField = document.getElementById('tag-index');
    const text = document.getElementById('tag-text').value;
    const bg = document.getElementById('tag-bg').value;
    const color = document.getElementById('tag-color').value;

    if (!text) {
        alert('El texto es obligatorio');
        return;
    }

    const tagData = { 
        text, 
        bg, 
        color,
        productSkus: linkedSkus
    };
    
    const index = parseInt(indexField.value);

    if (index > -1) {
        tags[index] = tagData;
    } else {
        tags.push(tagData);
    }

    localStorage.setItem('samsung_tags', JSON.stringify(tags));
    bootstrap.Modal.getInstance(document.getElementById('tagModal')).hide();
    resetForm();
    renderTags();
}

window.editTag = (index) => {
    const t = tags[index];
    
    document.getElementById('tag-index').value = index;
    document.getElementById('tag-text').value = t.text;
    document.getElementById('tag-bg').value = t.bg;
    document.getElementById('tag-color').value = t.color;
    
    linkedSkus = [...(t.productSkus || [])];
    renderLinkedProducts();
    updatePreview();
    
    // Reset catalog selector
    document.getElementById('catalog-selector').value = '';
    document.getElementById('catalog-products-container').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('tagModal'));
    modal.show();
};

window.deleteTag = (index) => {
    if (confirm('¿Eliminar esta etiqueta?')) {
        tags.splice(index, 1);
        localStorage.setItem('samsung_tags', JSON.stringify(tags));
        renderTags();
    }
};

function resetForm() {
    document.getElementById('tagForm').reset();
    document.getElementById('tag-index').value = "-1";
    linkedSkus = [];
    renderLinkedProducts();
    updatePreview();
    document.getElementById('catalog-products-container').style.display = 'none';
}
