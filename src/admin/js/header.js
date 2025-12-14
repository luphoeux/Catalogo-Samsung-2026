// Header management for admin panel
// Updates header title and subtitle based on current view

document.addEventListener('DOMContentLoaded', () => {
    const headerTitle = document.getElementById('headerTitle');
    const headerSubtitle = document.getElementById('headerSubtitle');

    // View titles and subtitles
    const viewInfo = {
        products: {
            title: 'Base de Datos de Productos',
            subtitle: 'Gestiona todos tus productos'
        },
        catalogs: {
            title: 'Catálogos',
            subtitle: 'Gestiona tus catálogos por categoría'
        },
        categories: {
            title: 'Gestión de Categorías',
            subtitle: 'Administra las categorías de productos del catálogo'
        },
        config: {
            title: 'Variables de Color',
            subtitle: 'Gestiona los colores disponibles para los productos'
        },
        colors: {
            title: 'Variables de Color',
            subtitle: 'Gestiona los colores disponibles para los productos'
        },
        variables: {
            title: 'Variables Personalizadas',
            subtitle: 'Gestiona variables de precio y texto personalizadas'
        },
        tags: {
            title: 'Gestión de Etiquetas',
            subtitle: 'Administra las etiquetas de productos'
        },
        promotions: {
            title: 'Promociones',
            subtitle: 'Gestiona las promociones activas'
        }
    };

    // Function to update header
    window.updateHeader = function (view) {
        const info = viewInfo[view];
        if (info && headerTitle && headerSubtitle) {
            headerTitle.textContent = info.title;
            headerSubtitle.textContent = info.subtitle;
        }
    };

    // Listen for hash changes to update header
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            window.updateHeader(hash);
        }
    });

    // Update header on page load
    window.addEventListener('load', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            window.updateHeader(hash);
        } else {
            window.updateHeader('products');
        }
    });
});
