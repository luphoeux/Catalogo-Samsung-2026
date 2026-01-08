
/**
 * Shared layout logic for Samsung Catalog Admin
 */

const sidebarHTML = `
<aside class="sidebar">
    <div class="text-center mb-5">
        <img src="https://www.samsung.com/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/gnb-desktop-120x32.png" alt="Samsung" style="width: 130px; filter: grayscale(1) brightness(0);">
    </div>
    
    <nav>
        <ul class="nav-menu">
            <li class="nav-item">
                <a href="index.html" class="nav-link" id="nav-dashboard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Panel General
                </a>
            </li>
            <li class="nav-item">
                <a href="products.html" class="nav-link" id="nav-products">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    Productos
                </a>
            </li>
            <li class="nav-item">
                <a href="categories.html" class="nav-link" id="nav-categories">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    Categorías
                </a>
            </li>
            <li class="nav-item">
                <a href="combos.html" class="nav-link" id="nav-combos">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Combos
                </a>
            </li>
            <li class="nav-item">
                <a href="promotions.html" class="nav-link" id="nav-promotions">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    Promociones
                </a>
            </li>
            <li class="nav-item">
                <a href="tags.html" class="nav-link" id="nav-tags">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    Etiquetas
                </a>
            </li>
            <li class="nav-item">
                <a href="catalogs.html" class="nav-link" id="nav-catalogs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    Mis Catálogos
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <div class="card-samsung p-3 mb-0" style="background: var(--primary-light); border: none; border-radius: 15px;">
            <div class="d-flex align-items-center">
                <div class="avatar-circle">AD</div>
                <div class="user-info">
                    <div class="user-name">Admin Samsung</div>
                    <div class="user-status">Sesión Activa</div>
                </div>
            </div>
        </div>
    </div>
</aside>
`;

export function initLayout() {
    const wrapper = document.querySelector('.app-wrapper');
    if (!wrapper) {
        console.error("No se encontró .app-wrapper para inyectar el sidebar");
        return;
    }

    // Inyectar sidebar si no existe
    if (!wrapper.querySelector('.sidebar')) {
        wrapper.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    // Activar link según URL
    const path = window.location.pathname;
    const search = window.location.search;
    const page = path.split("/").pop();
    
    document.querySelectorAll('.nav-link').forEach(link => {
        // No removemos 'collapsed' aquí porque Bootstrap lo maneja
        if (!link.getAttribute('data-bs-toggle')) {
            link.classList.remove('active');
        }
        
        // Alerta para secciones no implementadas
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`Esta sección (${link.textContent.trim()}) estará disponible próximamente.`);
            });
        }
    });

    if (page === 'index.html' || page === '') {
        document.getElementById('nav-dashboard')?.classList.add('active');
    } else if (page === 'products.html') {
        document.getElementById('nav-products')?.classList.add('active');
    } else if (page === 'categories.html') {
        document.getElementById('nav-categories')?.classList.add('active');
    } else if (page === 'catalogs.html') {
        document.getElementById('nav-catalogs')?.classList.add('active');
    } else if (page === 'combos.html') {
        document.getElementById('nav-combos')?.classList.add('active');
    } else if (page === 'promotions.html') {
        document.getElementById('nav-promotions')?.classList.add('active');
    } else if (page === 'tags.html') {
        document.getElementById('nav-tags')?.classList.add('active');
    }
}

// Inyectar estilos globales necesarios para el layout dinámico
if (!document.getElementById('layout-styles')) {
    const style = document.createElement('style');
    style.id = 'layout-styles';
    style.textContent = `
        .sidebar-footer {
            position: absolute;
            bottom: 2rem;
            width: calc(100% - 2.4rem);
            left: 1.2rem;
        }
        .avatar-circle {
            width: 35px; 
            height: 35px; 
            border-radius: 50%; 
            background: var(--primary); 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 700; 
            font-size: 0.8rem; 
            margin-right: 10px;
            flex-shrink: 0;
        }
        .user-info { overflow: hidden; }
        .user-name { font-size: 0.8rem; font-weight: 700; white-space: nowrap; text-overflow: ellipsis; color: var(--text-main); }
        .user-status { font-size: 0.7rem; color: var(--primary); font-weight: 500; }
        
        /* Asegurar que el contenido principal respete el sidebar fijo */
        .main-content {
            margin-left: 260px;
            width: calc(100% - 260px);
        }
    `;
    document.head.appendChild(style);
}
