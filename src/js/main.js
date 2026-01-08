import { initLayout } from './layout.js';
import { initialProducts } from './initial_db.js';

console.log('🚀 Samsung Catalog Dashboard Initialized (LOCALSTORAGE MODE)');

document.addEventListener('DOMContentLoaded', () => {
    // Auto-update mechanism via URL param
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset_db') === 'true') {
        // Save to 2026 DB specifically
        localStorage.setItem('samsung_products_db_2026', JSON.stringify({products: initialProducts}));
        alert('✅ Base de datos 2026 actualizada con éxito.');
        window.location.href = 'index.html'; // Clear param
        return;
    }

    initLayout();
    updateDateDisplay();
    renderDashboard();
    setupEventListeners();
});

// Expose verification function
window.reloadDatabase = () => {
    if(confirm('¿Cargar/Resetear la base de datos "Catálogo 2026" con los datos del TSV? (No afecta al inventario general)')) {
        localStorage.setItem('samsung_products_db_2026', JSON.stringify({products: initialProducts}));
        alert('Base de datos 2026 lista.');
        // No reload needed really, but let's do it to refresh stats if we add them
        location.reload(); 
    }
};

// --- UI Functions ---
function updateDateDisplay() {
    const el = document.getElementById('current-date');
    if (!el) return;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = new Date().toLocaleDateString('es-ES', options);
}

function renderDashboard() {
    // 1. Cargar Datos desde LocalStorage
    const db = JSON.parse(localStorage.getItem('samsung_products_db') || '{"products":[]}');
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const products = db.products || [];

    // Calcular Estadísticas
    const totalProducts = products.length;
    const uniqueCategories = new Set(products.map(p => p.category)).size;
    const totalCatalogs = catalogs.length;
    // Visitas simuladas o guardadas en catalogs si tuviéramos tracking
    const totalVisits = catalogs.reduce((sum, c) => sum + (c.views || 0), 0); 

    // Renderizar Estadísticas
    updateStat('stat-products', totalProducts);
    updateStat('stat-categories', uniqueCategories);
    updateStat('stat-catalogs', totalCatalogs);
    updateStat('stat-visits', totalVisits); // Necesitas agregar ID en HTML si no existe, o usar querySelector

    // Renderizar Tabla Reciente (Últimos 5)
    // Asumimos que los últimos agregados están al final, así que invertimos. 
    // Si no hay timestamp, simplemente mostramos los primeros 5 o últimos 5 del array.
    const recent = [...products].reverse().slice(0, 5);
    renderRecentTable(recent);
}

function updateStat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
    // Fallback manual para elementos sin ID específico en el HTML original si es necesario
    if (id === 'stat-catalogs') {
         // Buscar el contenedor de catálogos si no tiene ID directo
         const cards = document.querySelectorAll('.stats-value');
         if(cards[2]) cards[2].textContent = value;
    }
    if (id === 'stat-visits') {
         const cards = document.querySelectorAll('.stats-value');
         if(cards[3]) cards[3].textContent = value;
    }
}

function renderRecentTable(products) {
    const tableBody = document.getElementById('recent-products-table');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No hay datos. Sube un Excel para comenzar.</td></tr>';
        return;
    }

    products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${p.image || 'https://via.placeholder.com/40'}" 
                         style="width: 40px; height: 40px; border-radius: 8px; margin-right: 12px; object-fit: contain; background: #fff; border: 1px solid #eee;"
                         onerror="this.src='https://via.placeholder.com/40?text=No+Img'">
                    <div class="fw-bold text-dark">${p.name}</div>
                </div>
            </td>
            <td class="text-muted small" style="font-family: monospace;">${p.sku}</td>
            <td><span class="badge bg-light text-dark border">${p.category || 'General'}</span></td>
            <td><span class="badge bg-success bg-opacity-10 text-success px-3">Activo</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function setupEventListeners() {
    const btnImport = document.getElementById('btn-import');
    if (btnImport) {
        btnImport.addEventListener('click', () => {
            // Redirigir a productos para importar, ya que allí está la lógica heavy
            window.location.href = 'products.html?action=import';
        });
    }
}
