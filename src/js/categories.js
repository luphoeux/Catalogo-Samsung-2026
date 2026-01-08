import { initLayout } from './layout.js';

console.log('📂 Categories Viewer Initialized');

document.addEventListener('DOMContentLoaded', async () => {
    initLayout();
    try {
        // Priority to Local Storage (2026 B2B)
        let db = JSON.parse(localStorage.getItem('samsung_products_db_2026'));
        
        if (!db) {
            const response = await fetch('/src/data/db.json');
            db = await response.json();
        }
        
        renderCategories(db);
    } catch (e) {
        console.error("Error loading categories:", e);
        const tbody = document.getElementById('categories-table-body');
        if(tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-danger">Error al cargar datos</td></tr>';
    }
});

function renderCategories(db) {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!db.categories || db.categories.length === 0) {
        // If no explicit categories, extract from products
        const uniqueCats = [...new Set(db.products.map(p => p.category || p.mainCategory).filter(c => c))];
        db.categories = uniqueCats.map(name => ({ name }));
    }

    // Sort categories
    const sorted = db.categories.sort((a,b) => a.name.localeCompare(b.name));

    sorted.forEach(cat => {
        // Count products in this category
        const count = db.products.filter(p => (p.category === cat.name || p.mainCategory === cat.name)).length;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">
                <div class="fw-bold text-dark">${cat.name}</div>
                <div class="small text-muted">Familia de productos Samsung</div>
            </td>
            <td class="text-center">
                <span class="badge rounded-pill bg-primary-light text-primary border-0 px-3">${count} Productos</span>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light border rounded-pill px-3" onclick="window.location.href='products.html?db=2026&search=${encodeURIComponent(cat.name)}'">
                    <i class="bi bi-search small me-1"></i> Ver Productos
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
