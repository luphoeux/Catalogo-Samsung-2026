
import { initLayout } from './layout.js';

console.log('📂 Catalogs Manager Initialized');
let currentQuickSelectedGifts = [];

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    renderCatalogs();
});

function renderCatalogs() {
    const list = document.getElementById('catalogsList');
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');

    if (catalogs.length === 0) {
        list.innerHTML = `
            <div class="col-12">
                <div class="card-samsung text-center py-5">
                    <div class="mb-4">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#E1E8EF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <h5 class="fw-bold">No tienes catálogos creados</h5>
                    <p class="text-muted">Comienza creando tu primer catálogo personalizado para clientes.</p>
                    <a href="create-catalog.html" class="btn btn-pill btn-primary-samsung mt-3">Empezar ahora</a>
                </div>
            </div>
        `;
        return;
    }

    list.innerHTML = '';
    // Mostrar de más reciente a más antiguo
    catalogs.reverse().forEach(cat => {
        const date = new Date(cat.date).toLocaleDateString();
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        // Calculate total price and total sale price for the catalog
        let totalPrice = 0;
        let totalSalePrice = 0;
        cat.products.forEach(p => {
            totalPrice += parseFloat(p.price || 0);
            totalSalePrice += parseFloat(p.salePrice || 0);
        });

        col.innerHTML = `
            <div class="card-samsung h-100">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="badge bg-primary-light text-primary border-0 rounded-pill small">${date}</span>
                    <button class="btn btn-sm btn-light p-1 rounded-circle" onclick="deleteCatalog(${cat.id})">✕</button>
                </div>
                <h5 class="fw-bold mb-1">${cat.name}</h5>
                <p class="text-muted small mb-4">${cat.client || 'Sin cliente'}</p>
                
                <div class="d-flex align-items-center mb-4 cursor-pointer" onclick="showProducts(${cat.id})" style="cursor: pointer;" title="Ver lista de productos">
                    <div class="text-primary fw-bold h4 m-0 me-2">${cat.productCount}</div>
                    <div class="text-muted small lh-1">Productos<br>seleccionados <i class="bi bi-eye ms-1"></i></div>
                </div>

                <div class="mb-3">
                    <div class="fw-bold h5 mb-0" style="color: var(--samsung-blue)">Total: Bs. ${totalPrice.toFixed(2)}</div>
                    ${totalSalePrice > 0 ? `<div class="text-muted small text-decoration-line-through">Total Oferta: Bs. ${totalSalePrice.toFixed(2)}</div>` : ''}
                </div>

                <div class="d-flex gap-2 mt-auto">
                    <button class="btn btn-pill btn-primary-samsung text-sm flex-grow-1" onclick="viewCatalog(${cat.id})">Ver PDF/Web</button>
                    <button class="btn btn-pill btn-light border text-sm" onclick="editCatalog(${cat.id})" title="Editar Catálogo"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-pill btn-light border text-sm" onclick="exportAgain(${cat.id})" title="Descargar CSV"><i class="bi bi-file-earmark-spreadsheet"></i></button>
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

window.showProducts = (id) => {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const cat = catalogs.find(c => c.id === id);
    if (!cat) return;

    // Toggle UI sections
    document.getElementById('catalogsList').classList.add('d-none');
    document.getElementById('mainHeader').classList.add('d-none');
    document.getElementById('catalogProductsSection').classList.remove('d-none');
    document.getElementById('detailsHeader').classList.remove('d-none');
    
    // Update Header Text
    document.getElementById('detailsTitle').textContent = `Productos: ${cat.name}`;
    document.getElementById('detailsSubtitle').textContent = `Viendo productos seleccionados para ${cat.client || 'Sin cliente'}.`;

    const tbody = document.getElementById('catalogProductsTableBody');
    tbody.innerHTML = '';

    cat.products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="product-img-box" style="width: 60px; height: 60px; background: #fff; border-radius: 12px; padding: 5px; border: 1px solid #eee;">
                    <img src="${p.image || ''}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='/src/assets/no-image.png'">
                </div>
            </td>
            <td>
                <div class="fw-bold m-0" style="font-size: 0.9rem;">${p.sku}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${p.mainCategory || 'S/C'}</div>
            </td>
            <td>
                <div class="fw-medium text-truncate-2" style="max-width: 300px; font-size: 0.9rem;">${p.name}</div>
            </td>
            <td>
                <div class="fw-bold text-primary">Bs. ${parseFloat(p.price || 0).toLocaleString()}</div>
            </td>
            <td>
                <div class="fw-bold text-danger">Bs. ${parseFloat(p.salePrice || 0).toLocaleString()}</div>
            </td>
            <td class="small">
                <div class="d-flex align-items-center">
                    <div style="width: 14px; height: 14px; border-radius: 50%; background: ${p.colorHex || '#ccc'}; border: 1px solid #ddd;" class="me-2 shadow-sm"></div>
                    <span class="small">${p.color || 'N/A'}</span>
                </div>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-light border p-2 px-3 rounded-pill fw-bold" onclick="openQuickEdit(${cat.id}, '${p.sku}')">
                        <i class="bi bi-pencil-fill me-1 text-primary"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0 p-2 rounded-pill" onclick="removeFromCatalog(${cat.id}, '${p.sku}')" title="Quitar de este catálogo">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.removeFromCatalog = (catalogId, sku) => {
    if (confirm(`¿Quitar este producto (${sku}) del catálogo?`)) {
        let catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
        const catIndex = catalogs.findIndex(c => c.id === catalogId);
        
        if (catIndex !== -1) {
            catalogs[catIndex].products = catalogs[catIndex].products.filter(p => p.sku !== sku);
            catalogs[catIndex].productCount = catalogs[catIndex].products.length;
            
            localStorage.setItem('samsung_catalogs', JSON.stringify(catalogs));
            
            // Refresh
            renderCatalogs();
            showProducts(catalogId);
        }
    }
};

window.hideDetails = () => {
    document.getElementById('catalogsList').classList.remove('d-none');
    document.getElementById('mainHeader').classList.remove('d-none');
    document.getElementById('catalogProductsSection').classList.add('d-none');
    document.getElementById('detailsHeader').classList.add('d-none');
};

window.openQuickEdit = (catalogId, sku) => {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const cat = catalogs.find(c => c.id === catalogId);
    if (!cat) return;

    const product = cat.products.find(p => p.sku === sku);
    if (!product) return;

    document.getElementById('quick-edit-id').value = catalogId;
    document.getElementById('quick-edit-sku').value = sku;
    document.getElementById('quick-edit-name').value = product.name;
    document.getElementById('quick-edit-price').value = product.price || 0;
    document.getElementById('quick-edit-sale-price').value = product.salePrice || 0;
    document.getElementById('quick-edit-color').value = product.color || '';
    document.getElementById('quick-edit-color-hex').value = product.colorHex || '#E0E0E0';
    document.getElementById('quick-edit-main-category').value = product.mainCategory || 'Otros';
    document.getElementById('quick-edit-image-url').value = product.image || '';
    
    // Updates UI
    document.getElementById('quick-edit-img-preview').src = product.image || '';
    document.getElementById('quick-edit-color-preview').style.backgroundColor = product.colorHex || '#E0E0E0';

    // Gift Logic
    const allGifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');
    const giftSelect = document.getElementById('select-quick-gifts');
    giftSelect.innerHTML = '<option value="">Añadir un regalo/item...</option>';
    allGifts.forEach((g, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = g.name;
        giftSelect.appendChild(opt);
    });

    currentQuickSelectedGifts = product.gifts || [];
    renderQuickSelectedGifts();

    const modal = new bootstrap.Modal(document.getElementById('quickEditModal'));
    modal.show();
};

function renderQuickSelectedGifts() {
    const container = document.getElementById('quick-product-gifts-container');
    container.innerHTML = '';
    currentQuickSelectedGifts.forEach((gift, index) => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-white text-dark border p-2 px-3 rounded-pill d-flex align-items-center';
        badge.innerHTML = `
            <img src="${gift.image}" style="width: 20px; height: 20px; object-fit: contain;" class="me-2">
            ${gift.name}
            <i class="bi bi-x ms-2 cursor-pointer text-danger" onclick="removeGiftFromQuickProduct(${index})"></i>
        `;
        container.appendChild(badge);
    });
}

window.removeGiftFromQuickProduct = (index) => {
    currentQuickSelectedGifts.splice(index, 1);
    renderQuickSelectedGifts();
};

document.getElementById('select-quick-gifts')?.addEventListener('change', (e) => {
    if (e.target.value === "") return;
    const allGifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');
    const gift = allGifts[e.target.value];
    if (gift && !currentQuickSelectedGifts.find(g => g.name === gift.name)) {
        currentQuickSelectedGifts.push(gift);
        renderQuickSelectedGifts();
    }
    e.target.value = "";
});

// Listeners for real-time preview
document.getElementById('quick-edit-color-hex')?.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        document.getElementById('quick-edit-color-preview').style.backgroundColor = hex;
    }
});

document.getElementById('quick-edit-image-url')?.addEventListener('input', (e) => {
    document.getElementById('quick-edit-img-preview').src = e.target.value;
});

document.getElementById('btn-save-quick-edit')?.addEventListener('click', () => {
    const catalogId = parseInt(document.getElementById('quick-edit-id').value);
    const sku = document.getElementById('quick-edit-sku').value;

    let catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const catIndex = catalogs.findIndex(c => c.id === catalogId);
    
    if (catIndex !== -1) {
        const prodIndex = catalogs[catIndex].products.findIndex(p => p.sku === sku);
        if (prodIndex !== -1) {
            catalogs[catIndex].products[prodIndex].name = document.getElementById('quick-edit-name').value;
            catalogs[catIndex].products[prodIndex].price = parseFloat(document.getElementById('quick-edit-price').value) || 0;
            catalogs[catIndex].products[prodIndex].salePrice = parseFloat(document.getElementById('quick-edit-sale-price').value) || 0;
            catalogs[catIndex].products[prodIndex].color = document.getElementById('quick-edit-color').value;
            catalogs[catIndex].products[prodIndex].colorHex = document.getElementById('quick-edit-color-hex').value;
            catalogs[catIndex].products[prodIndex].image = document.getElementById('quick-edit-image-url').value;
            catalogs[catIndex].products[prodIndex].gifts = currentQuickSelectedGifts;

            localStorage.setItem('samsung_catalogs', JSON.stringify(catalogs));
            
            bootstrap.Modal.getInstance(document.getElementById('quickEditModal')).hide();
            // Refresh main list and possibly the products modal
            renderCatalogs();
            showProducts(catalogId);
        }
    }
});

// Logic for main actions
window.viewCatalog = (id) => {
    window.open(`view-catalog.html?id=${id}`, '_blank');
};

window.editCatalog = (id) => {
    window.location.href = `create-catalog.html?edit=${id}`;
};

window.deleteCatalog = (id) => {
    if (confirm('¿Estás seguro de eliminar este catálogo?')) {
        let catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
        catalogs = catalogs.filter(c => c.id !== id);
        localStorage.setItem('samsung_catalogs', JSON.stringify(catalogs));
        renderCatalogs();
    }
};

window.exportAgain = (id) => {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const cat = catalogs.find(c => c.id === id);
    if (cat) {
        const csvData = cat.products.map(p => ({
            SKU: p.sku,
            Nombre_de_Pantalla: p.name,
            Categoria: p.category,
            Imagen: p.image,
            Precio: p.price || 0,
            Precio_Oferta: p.salePrice || 0,
            URL: p.link
        }));
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
        XLSX.writeFile(workbook, `Recuperado_${cat.name}.csv`);
    }
};

