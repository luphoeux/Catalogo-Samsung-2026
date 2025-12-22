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
            <img src="../../image/samsung-logo.svg" alt="Samsung" style="height: 16px; display: block; margin-top:5px;">
        </div>
        
        <div class="nav-header">Gestión</div>
        <a href="catalogs.html" class="nav-item" data-page="catalogs.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 19v-3H7a3 3 0 0 0-3 3m4.8 3h8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C20 20.48 20 19.92 20 18.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C18.48 2 17.92 2 16.8 2h-8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C4 4.28 4 5.12 4 6.8v10.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 22 7.12 22 8.8 22Z"></path></svg>
            Catálogos
        </a>

        <div class="nav-header">Configuración</div>
        <a href="products.html" class="nav-item" data-page="products.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 7.278 12 12m0 0L3.5 7.278M12 12v9.5m9-5.441V7.942c0-.343 0-.514-.05-.667a1 1 0 0 0-.215-.364c-.109-.119-.258-.202-.558-.368l-7.4-4.111c-.284-.158-.425-.237-.575-.267a1 1 0 0 0-.403 0c-.15.03-.292.11-.576.267l-7.4 4.11c-.3.167-.45.25-.558.369a1 1 0 0 0-.215.364C3 7.428 3 7.599 3 7.942v8.117c0 .342 0 .514.05.666a1 1 0 0 0 .215.364c.109.119.258.202.558.368l7.4 4.111c.284.158.425.237.576.268.133.027.27.027.402 0 .15-.031.292-.11.576-.268l7.4-4.11c.3-.167.45-.25.558-.369a.999.999 0 0 0 .215-.364c.05-.152.05-.324.05-.666ZM16.5 9.5l-9-5"></path></svg>
            Productos
        </a>
        <a href="categories.html" class="nav-item" data-page="categories.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18m-9-9v18M7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3Z"></path></svg>
            Categorías
        </a>
        <a href="colors.html" class="nav-item" data-page="colors.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c0 5.523 4.477 10 10 10a3 3 0 0 0 3-3v-.5c0-.464 0-.697.026-.892a3 3 0 0 1 2.582-2.582c.195-.026.428-.026.892-.026h.5a3 3 0 0 0 3-3c0-5.523-4.477-10-10-10S2 6.477 2 12Z"></path><path d="M7 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM10 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path></svg>
            Colores
        </a>
        <a href="variables.html" class="nav-item" data-page="variables.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21v-7m0-4V3m7 18v-9m0-4V3m7 18v-5m0-4V3M2 14h6m1-6h6m1 8h6"></path></svg>
            Variables
        </a>
        <a href="tags.html" class="nav-item" data-page="tags.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8h.01M2 5.2v4.475c0 .489 0 .733.055.963.05.204.13.4.24.579.123.201.296.374.642.72l7.669 7.669c1.188 1.188 1.782 1.782 2.467 2.004a3 3 0 0 0 1.854 0c.685-.222 1.28-.816 2.467-2.004l2.212-2.212c1.188-1.188 1.782-1.782 2.004-2.467a3 3 0 0 0 0-1.854c-.222-.685-.816-1.28-2.004-2.467l-7.669-7.669c-.346-.346-.519-.519-.72-.642a2.001 2.001 0 0 0-.579-.24C10.409 2 10.165 2 9.676 2H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 3.52 2 4.08 2 5.2ZM8.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"></path></svg>
            Etiquetas
        </a>
        <a href="promotions.html" class="nav-item" data-page="promotions.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8v4M10.25 5.5H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.31C2 7.78 2 8.62 2 10.3v1.2c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083c.367.152.833.152 1.765.152v4.25c0 .232 0 .348.01.446a2 2 0 0 0 1.794 1.794c.098.01.214.01.446.01s.348 0 .446-.01a2 2 0 0 0 1.794-1.794c.01-.098.01-.214.01-.446V14.5h.75c1.766 0 3.927.947 5.594 1.856.973.53 1.46.795 1.778.756a.946.946 0 0 0 .691-.411c.187-.26.187-.783.187-1.827V5.126c0-1.044 0-1.566-.187-1.827a.946.946 0 0 0-.691-.411c-.319-.039-.805.226-1.778.756-1.667.909-3.828 1.856-5.594 1.856Z"></path></svg>
            Promociones
        </a>
        <a href="combos.html" class="nav-item" data-page="combos.html">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 14.5 9.642 4.821c.131.066.197.099.266.111.06.012.123.012.184 0 .069-.012.135-.045.266-.11L22 14.5m-20-5 9.642-4.821c.131-.066.197-.098.266-.111a.5.5 0 0 1 .184 0c.069.013.135.045.266.111L22 9.5l-9.642 4.821c-.131.066-.197.099-.266.111a.501.501 0 0 1-.184 0c-.069-.012-.135-.045-.266-.11L2 9.5Z"></path></svg>
            Combos
        </a>

        <div class="sidebar-footer">
            <div class="history-controls" style="display: flex; gap: 8px; padding: 0 1.5rem; margin-bottom: 0.5rem;">
                <button id="undoBtn" class="history-btn" title="Deshacer (Ctrl+Z)" disabled>
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9m0 0 5-5M4 9h6.4c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C20 13.56 20 15.24 20 18.6V20"></path></svg>
                </button>
                <button id="redoBtn" class="history-btn" title="Rehacer (Ctrl+Shift+Z)" disabled>
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20v-1.4c0-3.36 0-5.04.654-6.324a6 6 0 0 1 2.622-2.622C8.56 9 10.24 9 13.6 9H20m0 0-5 5m5-5-5-5"></path></svg>
                </button>
            </div>
            <div id="lastSaveTime" style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 6px;">
                <svg class="icon-svg" style="font-size: 14px; color: var(--primary-color);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 19a4.5 4.5 0 0 1-.42-8.98 6.002 6.002 0 0 1 11.84 0A4.5 4.5 0 0 1 17.5 19h-11Z"></path></svg>
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
    header.innerHTML = `<div class="header-left" style="display:none">
            <h1 class="header-title" id="headerTitle">Samsung Catalog Admin</h1>
            <p class="header-subtitle" id="headerSubtitle">Panel de Control</p>
        </div>
        <div class="header-right" id="headerActions">
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
        'products.html': ['Productos', 'Gestión de inventario global'],
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

// Disable autocomplete on all modal inputs
document.addEventListener('DOMContentLoaded', () => {
    // Disable autocomplete on all inputs and textareas in modals
    const disableAutocomplete = () => {
        document.querySelectorAll('.modal input, .modal textarea').forEach(input => {
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
        });
    };

    // Run on load
    disableAutocomplete();

    // Run whenever a modal is opened (using MutationObserver)
    const observer = new MutationObserver(() => {
        disableAutocomplete();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
});
