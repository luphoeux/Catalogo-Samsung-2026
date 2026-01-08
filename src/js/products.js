import { initLayout } from './layout.js';
import { initialProducts } from './initial_db.js';

console.log('📦 Products Viewer Initialized');

let localDB = null;
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 50;
let currentSelectedGifts = []; 
let currentSelectedTags = [];  
let currentDBKey = null;

document.addEventListener('DOMContentLoaded', async () => {
    initLayout();
    
    // Determine View Mode
    const params = new URLSearchParams(window.location.search);
    const dbParam = params.get('db');

    if (!dbParam) {
        // FOLDER MODE
        const tableView = document.getElementById('table-view');
        const foldersView = document.getElementById('folders-view');
        
        if (tableView && foldersView) {
            tableView.classList.add('d-none');
            foldersView.classList.remove('d-none');
            document.querySelector('h2').textContent = 'Mis Carpetas de Productos';
            
            // Safe selector for description p
            const descP = document.querySelector('p.text-muted');
            if(descP) descP.textContent = 'Selecciona una base de datos o crea una nueva.';
            
            loadFolders();
        } else {
             console.error("DOM Elements missing for Folder Mode: table-view or folders-view not found.");
        }
    } else {
        // TABLE MODE
        currentDBKey = dbParam === 'main' ? 'samsung_products_db' : 
                       (dbParam === '2026' ? 'samsung_products_db_2026' : dbParam);
        
        const tableView = document.getElementById('table-view');
        const foldersView = document.getElementById('folders-view');
        const backBtn = document.getElementById('back-to-folders');

        if (tableView && foldersView) {
            tableView.classList.remove('d-none');
            foldersView.classList.add('d-none');
            if(backBtn) backBtn.classList.remove('d-none');

            // Set titles based on folder info if available
            const folders = JSON.parse(localStorage.getItem('samsung_product_folders') || '[]');
            const folder = folders.find(f => f.id === currentDBKey);
            
            const h2 = document.querySelector('h2');
            const p = document.querySelector('p.text-muted');

            if (folder) {
                if(h2) h2.textContent = folder.name;
                if(p) p.textContent = folder.desc || 'Listado de productos.';
            } else if (dbParam === '2026') {
                if(h2) h2.textContent = 'Catálogo B2B 2026';
            }
        }

        // Listeners for Table View
        document.getElementById('back-to-folders')?.addEventListener('click', () => {
            window.location.href = 'products.html'; 
        });

        document.getElementById('btn-reset-db')?.addEventListener('click', () => {
            if (!currentDBKey) return;
            if (confirm('PELIGRO: Esto borrará todos los cambios realizados en esta carpeta y recargará los datos originales del archivo importado.\n\n¿Estás seguro de continuar?')) {
                localStorage.removeItem(currentDBKey);
                location.reload();
            }
        });

        document.getElementById('btn-export-selected')?.addEventListener('click', () => {
            exportToExcel();
        });

        await loadLocalDatabase();
        initFilters();
    }
});

function exportToExcel() {
    if (filteredProducts.length === 0) {
        alert("No hay productos para exportar.");
        return;
    }

    const data = filteredProducts.map(p => ({
        'Nombre': p.name,
        'SKU': p.sku,
        'Categoría Principal': p.mainCategory || '',
        'Categoría Detalle': p.category || '',
        'Descripción': p.description || '',
        'Color': p.color || '',
        'Color Hex': p.colorHex || '',
        'Variables': (p.specs && Array.isArray(p.specs)) ? p.specs.join(', ') : '',
        'Precio (Bs)': p.price || 0,
        'Oferta (Bs)': p.salePrice || 0,
        'Link': p.link || '',
        'Imagen': p.image || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    // File name: current DB name + date
    const h2 = document.querySelector('h2');
    const folderName = (h2 ? h2.textContent : 'Export').replace(/\s+/g, '_');
    const fileName = `${folderName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}

function loadFolders() {
    let folders = JSON.parse(localStorage.getItem('samsung_product_folders'));

    // Init Defaults if empty
    if (!folders) {
        folders = [
            { id: 'samsung_products_db', name: 'Inventario General', desc: 'Base de datos principal del sistema.', icon: 'bi-box-seam', count: 'Auto' },
            { id: 'samsung_products_db_2026', name: 'Catálogo B2B 2026', desc: 'Productos importados desde TSV.', icon: 'bi-file-earmark-spreadsheet', count: 'Auto' }
        ];
        localStorage.setItem('samsung_product_folders', JSON.stringify(folders));
    }

    renderFolders(folders);
}

function renderFolders(folders) {
    const container = document.getElementById('folders-container');
    container.innerHTML = '';

    folders.forEach(folder => {
        // Get count logic (optional, requires reading all DBs which might be heavy)
        // Let's just mock or read if simple
        const dbData = JSON.parse(localStorage.getItem(folder.id) || '{"products":[]}');
        const count = dbData.products ? dbData.products.length : 0;

        const col = document.createElement('div');
        col.className = 'col-md-4 col-xl-3';
        col.innerHTML = `
            <div class="card-samsung h-100 p-4 d-flex flex-column align-items-center justify-content-center text-center model-folder-card cursor-pointer" 
                 onclick="window.location.href='products.html?db=${folder.id}'"
                 style="transition: transform 0.2s; border: 1px solid #eee;">
                <div class="mb-3 p-3 rounded-circle bg-light text-primary">
                    <i class="bi ${folder.icon || 'bi-folder'} fs-2"></i>
                </div>
                <h5 class="fw-bold mb-2">${folder.name}</h5>
                <p class="text-muted small mb-3">${folder.desc}</p>
                <span class="badge bg-light text-dark border">${count} Productos</span>
            </div>
        `;
        
        // Hover effect helper
        col.querySelector('.model-folder-card').onmouseover = function() { this.style.transform = 'translateY(-5px)'; this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'; };
        col.querySelector('.model-folder-card').onmouseout = function() { this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none'; };
        
        container.appendChild(col);
    });
}

window.createNewFolder = () => {
    const name = prompt("Nombre de la nueva carpeta de productos:");
    if (!name) return;

    const id = 'db_' + Date.now(); // Simple ID generation
    const folders = JSON.parse(localStorage.getItem('samsung_product_folders') || '[]');
    
    folders.push({
        id: id,
        name: name,
        desc: 'Carpeta creada por el usuario',
        icon: 'bi-folder2-open'
    });

    localStorage.setItem('samsung_product_folders', JSON.stringify(folders));
    // Init empty DB
    localStorage.setItem(id, JSON.stringify({ products: [] }));
    
    loadFolders(); // Refresh
};

// ... keep existing loadLocalDatabase ...

async function loadLocalDatabase() {
    try {
        const persisted = localStorage.getItem(currentDBKey);
        if (persisted) {
            localDB = JSON.parse(persisted);
        } else {
            // DB not initialized
            if (currentDBKey === 'samsung_products_db_2026') {
                console.log("⚠️ DB 2026 vacía. Cargando datos iniciales del TSV...");
                localDB = { products: initialProducts }; 
                localStorage.setItem(currentDBKey, JSON.stringify(localDB));
            } else {
                const response = await fetch('/src/data/db.json');
                localDB = await response.json();
                localStorage.setItem(currentDBKey, JSON.stringify(localDB));
            }
        }
        filteredProducts = localDB.products || [];
        
        // Fill technical family filter
        // Fill technical family filter
        const catSelect = document.getElementById('categoryFilter');
        let categoriesToRender = [];

        if (localDB.categories && Array.isArray(localDB.categories)) {
            categoriesToRender = localDB.categories.map(c => c.name);
        } else {
            // Fallback: Extract unique 'category' or 'mainCategory' from products
            const uniqueCats = new Set(localDB.products.map(p => p.category || p.mainCategory).filter(c => c));
            categoriesToRender = Array.from(uniqueCats);
        }

        // Clear existing options except first
        if(catSelect) {
            catSelect.innerHTML = '<option value="">Todas</option>';
            categoriesToRender.sort().forEach(catName => {
                const opt = document.createElement('option');
                opt.value = catName;
                opt.textContent = catName;
                catSelect.appendChild(opt);
            });
        }

        // Fill color filter
        const colorSelect = document.getElementById('colorFilter');
        const colors = [...new Set(localDB.products.map(p => p.color).filter(c => c))].sort();
        if(colorSelect) {
             colorSelect.innerHTML = '<option value="">Todos</option>';
             colors.forEach(color => {
                const opt = document.createElement('option');
                opt.value = color;
                opt.textContent = color;
                colorSelect.appendChild(opt);
            });
        }

        renderProducts();
        initPagination();
    } catch (e) {
        console.error("Error loading local DB:", e);
    }
}

function initFilters() {
    const searchInput = document.getElementById('productSearch');
    const mainCatFilter = document.getElementById('mainCatFilter');
    const catFilter = document.getElementById('categoryFilter');
    const colorFilter = document.getElementById('colorFilter');

    const updateFilters = () => {
        const query = searchInput.value.toLowerCase();
        const mainCat = mainCatFilter.value;
        const cat = catFilter.value;
        const color = colorFilter.value;

        filteredProducts = localDB.products.filter(p => {
            const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
            const matchesMainCat = !mainCat || p.mainCategory === mainCat;
            const matchesCat = !cat || p.category === cat;
            const matchesColor = !color || p.color === color;
            
            return matchesQuery && matchesMainCat && matchesCat && matchesColor;
        });

        currentPage = 1;
        renderProducts();
    };

    [searchInput, mainCatFilter, catFilter, colorFilter].forEach(el => {
        el?.addEventListener('input', updateFilters);
        el?.addEventListener('change', updateFilters);
    });
}

function initPagination() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const maxPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < maxPages) {
            currentPage++;
            renderProducts();
        }
    });
}

function renderProducts() {
    const tableBody = document.getElementById('productsTable');
    const filteredCount = document.getElementById('filteredCount');
    if (filteredCount) filteredCount.textContent = filteredProducts.length;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredProducts.slice(start, end);
    const total = filteredProducts.length;
    
    // Update pagination info immediately
    const paginationEl = document.getElementById('paginationInfo');
    if (paginationEl) {
        if (total === 0) {
            paginationEl.textContent = 'Mostrando 0 de 0 productos';
        } else {
            paginationEl.textContent = `Mostrando ${start + 1} a ${Math.min(end, total)} de ${total}`;
        }
    }

    document.getElementById('filteredCount').textContent = filteredProducts.length;

    // Update buttons state
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (currentPage >= Math.ceil(filteredProducts.length / itemsPerPage) || total === 0);

    if (pageItems.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No se encontraron productos con estos filtros.</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    pageItems.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="ps-4">
                <div class="d-flex align-items-center">
                    <img src="${p.image || 'https://via.placeholder.com/40'}" class="product-img me-3" 
                         onerror="this.src='https://via.placeholder.com/40?text=No+Img'">
                    <div class="flex-grow-1">
                        <div class="text-truncate-2" style="font-weight: 600;" title="${p.name}">${p.name}</div>
                        ${p.link ? `<a href="${p.link}" target="_blank" class="text-primary x-small d-flex align-items-center mt-1" style="text-decoration:none; font-size: 0.65rem;">
                            <i class="bi bi-box-arrow-up-right me-1"></i> Ver en Shop
                        </a>` : '<span class="text-danger x-small" style="font-size: 0.65rem;">Sin link</span>'}
                    </div>
                </div>
            </td>
            <td class="text-muted small" style="font-family: monospace;">${p.sku}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="color-circle me-2" style="background-color: ${p.colorHex || '#ccc'}; border: 1px solid #ddd; width: 12px; height: 12px; border-radius: 50%;"></div>
                    <span class="badge bg-light text-dark border-0">${p.color || 'N/A'}</span>
                </div>
            </td>
            <td><span class="badge bg-primary-light text-primary border-0 small" style="font-size: 0.7rem;">${p.mainCategory || 'Otros'}</span></td>
            <td><div class="text-truncate-2 small text-muted" style="max-width: 200px;" title="${p.description || ''}">${p.description || '-'}</div></td>
            <td>
                ${(p.specs && Array.isArray(p.specs)) ? p.specs.map(s => `<span class="badge bg-light text-dark border me-1">${s}</span>`).join('') : '-'}
            </td>
            <td class="fw-bold text-nowrap">Bs. ${p.price || 0}</td>
            <td class="text-danger fw-bold text-nowrap">${p.salePrice > 0 ? 'Bs. ' + p.salePrice : '-'}</td>
            <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-light btn-pill border btn-edit" data-sku="${p.sku}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger btn-pill border-0" onclick="deleteProduct('${p.sku}')" title="Eliminar Producto">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Event listeners to Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.sku));
    });


}

function openEditModal(sku) {
    const product = localDB.products.find(p => p.sku === sku);
    if (!product) return;

    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-description').value = product.description || '';
    document.getElementById('edit-specs').value = (product.specs && Array.isArray(product.specs)) ? product.specs.join(', ') : '';
    document.getElementById('edit-sku').value = product.sku;
    document.getElementById('edit-color').value = product.color || '';
    document.getElementById('edit-color-hex').value = product.colorHex || '#E0E0E0';
    document.getElementById('edit-color-preview').style.backgroundColor = product.colorHex || '#E0E0E0';
    document.getElementById('edit-main-category').value = product.mainCategory || 'Otros';
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-product-url').value = product.link || '';
    document.getElementById('edit-image-url').value = product.image || '';
    document.getElementById('edit-price').value = product.price || 0;
    document.getElementById('edit-sale-price').value = product.salePrice || 0;
    document.getElementById('edit-img-preview').src = product.image || 'https://via.placeholder.com/40?text=No+Img';

    // Load Gifts Logic
    const allGifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');
    const giftSelect = document.getElementById('select-gifts');
    giftSelect.innerHTML = '<option value="">Añadir un regalo/item...</option>';
    allGifts.forEach((g, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = g.name;
        giftSelect.appendChild(opt);
    });

    currentSelectedGifts = product.gifts || [];
    renderSelectedGifts();

    // Load Tags Logic
    const allTags = JSON.parse(localStorage.getItem('samsung_tags') || '[]');
    const tagsContainer = document.getElementById('available-tags-list');
    tagsContainer.innerHTML = '';
    currentSelectedTags = product.tags || [];

    allTags.forEach(tag => {
        const isSelected = currentSelectedTags.some(t => t.text === tag.text);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-sm btn-pill border ${isSelected ? 'btn-primary-samsung' : 'btn-light'}`;
        btn.textContent = tag.text;
        btn.style.fontSize = '0.7rem';
        btn.onclick = () => {
            const idx = currentSelectedTags.findIndex(t => t.text === tag.text);
            if (idx === -1) {
                currentSelectedTags.push(tag);
                btn.className = 'btn btn-sm btn-pill btn-primary-samsung';
            } else {
                currentSelectedTags.splice(idx, 1);
                btn.className = 'btn btn-sm btn-pill btn-light border';
            }
        };
        tagsContainer.appendChild(btn);
    });

    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

function renderSelectedGifts() {
    const container = document.getElementById('product-gifts-container');
    container.innerHTML = '';
    currentSelectedGifts.forEach((gift, index) => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-white text-dark border p-2 px-3 rounded-pill d-flex align-items-center';
        badge.innerHTML = `
            <img src="${gift.image}" style="width: 20px; height: 20px; object-fit: contain;" class="me-2">
            ${gift.name}
            <i class="bi bi-x ms-2 cursor-pointer text-danger" onclick="removeGiftFromProduct(${index})"></i>
        `;
        container.appendChild(badge);
    });
}

window.removeGiftFromProduct = (index) => {
    currentSelectedGifts.splice(index, 1);
    renderSelectedGifts();
};

document.getElementById('select-gifts')?.addEventListener('change', (e) => {
    if (e.target.value === "") return;
    const allGifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');
    const gift = allGifts[e.target.value];
    if (gift && !currentSelectedGifts.find(g => g.name === gift.name)) {
        currentSelectedGifts.push(gift);
        renderSelectedGifts();
    }
    e.target.value = "";
});

// Save Logic (Local only for now)
document.getElementById('btn-save-product')?.addEventListener('click', () => {
    const sku = document.getElementById('edit-sku').value;
    const name = document.getElementById('edit-name').value;
    const description = document.getElementById('edit-description').value;
    const specsRaw = document.getElementById('edit-specs').value;
    const color = document.getElementById('edit-color').value;
    const colorHex = document.getElementById('edit-color-hex').value;
    const mainCategory = document.getElementById('edit-main-category').value;
    const link = document.getElementById('edit-product-url').value;
    const image = document.getElementById('edit-image-url').value;
    const price = parseFloat(document.getElementById('edit-price').value) || 0;
    const salePrice = parseFloat(document.getElementById('edit-sale-price').value) || 0;

    const index = localDB.products.findIndex(p => p.sku === sku);
    if (index !== -1) {
        localDB.products[index].name = name;
        localDB.products[index].description = description;
        localDB.products[index].specs = specsRaw.split(',').map(s => s.trim()).filter(s => s);
        localDB.products[index].link = link;
        localDB.products[index].color = color;
        localDB.products[index].colorHex = colorHex;
        localDB.products[index].mainCategory = mainCategory;
        localDB.products[index].image = image;
        localDB.products[index].price = price;
        localDB.products[index].salePrice = salePrice;
        localDB.products[index].gifts = currentSelectedGifts;
        localDB.products[index].tags = currentSelectedTags;
        
        // Persist change
        localStorage.setItem(currentDBKey, JSON.stringify(localDB));
        
        alert('✅ Producto actualizado correctamente.');
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        renderProducts();
    }
});

window.deleteProduct = (sku) => {
    if (confirm(`¿Estás seguro de que deseas eliminar este producto (${sku}) permanentemente de la base de datos?`)) {
        const index = localDB.products.findIndex(p => p.sku === sku);
        if (index !== -1) {
            localDB.products.splice(index, 1);
            // Save to persistence
            localStorage.setItem(currentDBKey, JSON.stringify(localDB));
            
            // Re-filter and render
            initFilters(); // Re-sync filtered list
            renderProducts();
        }
    }
};

// Real-time color preview
document.getElementById('edit-color-hex')?.addEventListener('input', (e) => {
    const val = e.target.value;
    const preview = document.getElementById('edit-color-preview');
    if (preview && (val.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) || val === '')) {
        preview.style.backgroundColor = val || 'transparent';
    }
});
