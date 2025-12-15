/**
 * Layout Manager
 * Injects Sidebar and Header common components
 */

document.addEventListener('DOMContentLoaded', () => {
    injectSidebar();
    injectHeader();
    highlightCurrentPage();
});

function injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-logo">
            <img src="../../image/gnb-desktop-120x32.png" alt="Samsung" style="height: 30px; display: block; margin-top:5px;">
        </div>
        
        <div class="nav-header">Gestión</div>
        <a href="catalogs.html" class="nav-item" data-page="catalogs.html">
            <span class="material-icons-outlined">menu_book</span> Catálogos
        </a>

        <div class="nav-header">Configuración</div>
        <a href="products.html" class="nav-item" data-page="products.html">
            <span class="material-icons-outlined">inventory_2</span> Productos Master
        </a>
        <a href="categories.html" class="nav-item" data-page="categories.html">
            <span class="material-icons-outlined">category</span> Categorías
        </a>
        <a href="colors.html" class="nav-item" data-page="colors.html">
            <span class="material-icons-outlined">palette</span> Colores
        </a>
        <a href="variables.html" class="nav-item" data-page="variables.html">
            <span class="material-icons-outlined">tune</span> Variables
        </a>
        <a href="tags.html" class="nav-item" data-page="tags.html">
            <span class="material-icons-outlined">label</span> Etiquetas
        </a>
        <a href="promotions.html" class="nav-item" data-page="promotions.html">
            <span class="material-icons-outlined">campaign</span> Promociones
        </a>
        <a href="combos.html" class="nav-item" data-page="combos.html">
            <span class="material-icons-outlined">layers</span> Combos
        </a>

        <div class="sidebar-footer">
            <div class="history-controls" style="display: flex; gap: 8px; padding: 0 1.5rem; margin-bottom: 0.5rem;">
                <button id="undoBtn" class="history-btn" title="Deshacer (Ctrl+Z)" disabled>
                    <span class="material-icons">undo</span>
                </button>
                <button id="redoBtn" class="history-btn" title="Rehacer (Ctrl+Shift+Z)" disabled>
                    <span class="material-icons">redo</span>
                </button>
            </div>
            <div id="lastSaveTime" style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 6px;">
                <span class="material-icons-outlined" style="font-size: 14px; color: var(--primary-color);">cloud_done</span>
                <span>Guardado: -</span>
            </div>
        </div>

    `;

    document.body.prepend(sidebar);
}

function injectHeader() {
    // Header is usually injected or exists in HTML. 
    // If we want it dynamic:
    const header = document.createElement('header');
    header.className = 'admin-header';
    header.innerHTML = `
        <div class="header-left">
            <h1 class="header-title" id="headerTitle">Samsung Catalog Admin</h1>
            <p class="header-subtitle" id="headerSubtitle">Panel de Control</p>
        </div>
        <div class="header-right" id="headerActions">
            <button class="btn-secondary" id="previewShopBtn" style="gap:5px; margin-right:10px;">
                <span class="material-icons" style="font-size:18px;">visibility</span>
                Previsualizar Tienda
            </button>
            <!-- Dynamic Actions -->
        </div>
    `;

    // Insert after sidebar, before main content
    // Assuming body structure: body > sidebar > main-content
    // We'll prepend it to main-content or body if main-content exists
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.prepend(header);
    } else {
        document.body.appendChild(header);
    }

    // Attach functionality
    const btn = header.querySelector('#previewShopBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            if (typeof window.products === 'undefined') {
                // Try to fallback to localStorage if global vars aren't ready (rare)
                const stored = localStorage.getItem('samsung_catalog_products');
                if (stored) {
                    window.products = JSON.parse(stored);
                } else {
                    alert('No hay productos cargados para previsualizar');
                    return;
                }
            }
            
            // Save to Session Storage for the main page to pick up
            sessionStorage.setItem('samsung_catalog_preview_active', 'true');
            sessionStorage.setItem('samsung_catalog_preview_data', JSON.stringify(window.products));
            
            // Open index.html in new tab
            // We use absolute path from root relative to current location
            // Since admin is at /src/admin/, root is ../../
            window.open('../../index.html', '_blank');
        });
    }
}

function highlightCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'catalogs.html'; // Default to catalogs

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });

    // Update Header Titles based on page
    const titles = {
        'products.html': ['Productos Master', 'Gestión de inventario global'],
        'catalogs.html': ['Catálogos', 'Gestión de catálogos digitales'],
        'categories.html': ['Categorías', 'Clasificación de productos'],
        'colors.html': ['Colores', 'Paleta de colores del sistema'],
        'variables.html': ['Variables', 'Configuración de textos dinámicos'],
        'tags.html': ['Etiquetas', 'Distintivos de productos'],
        'promotions.html': ['Promociones', 'Banners y ofertas visuales'],
        'combos.html': ['Combos', 'Paquetes de productos'],
    };

    const strings = titles[page];
    if (strings) {
        const t = document.getElementById('headerTitle');
        const s = document.getElementById('headerSubtitle');
        if (t) t.textContent = strings[0];
        if (s) s.textContent = strings[1];
    }
}
