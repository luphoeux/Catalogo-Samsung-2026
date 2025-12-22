// Export functionality for admin panel
// Add this script to enable Excel export buttons

document.addEventListener('DOMContentLoaded', () => {
    // Create export buttons for each view
    const exportButtons = {
        products: { text: 'Exportar Productos', type: 'products' },
        colors: { text: 'Exportar Colores', type: 'colors' },
        categories: { text: 'Exportar Categorías', type: 'categories' },
        variables: { text: 'Exportar Variables', type: 'variables' },
        tags: { text: 'Exportar Etiquetas', type: 'tags' },
        promotions: { text: 'Exportar Promociones', type: 'promotions' }
    };

    // Get header actions container
    const headerActions = document.getElementById('headerActions');

    // Add "Export All" button to header
    const exportAllBtn = document.createElement('button');
    exportAllBtn.className = 'btn-secondary';
    exportAllBtn.innerHTML = `
        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
        Exportar Todo
    `;
    exportAllBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    exportAllBtn.addEventListener('click', () => exportData('all'));
    headerActions.appendChild(exportAllBtn);

    // Add "Import" button to header
    const importBtn = document.createElement('button');
    importBtn.className = 'btn-secondary';
    importBtn.innerHTML = `
        <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>
        Importar Excel
    `;
    importBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #4caf50;
        color: white;
        border-color: #4caf50;
    `;

    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('¿Estás seguro de importar este archivo? Esto sobrescribirá todos los datos actuales.')) {
            fileInput.value = '';
            return;
        }

        try {
            showNotification('Importando datos...', 'info');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/import', {
                method: 'POST',
                body: file
            });

            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Importación exitosa!\n${result.results.products} productos, ${result.results.colors} colores, ${result.results.categories} categorías`, 'success');

                // Reload page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                showNotification(`❌ Error: ${result.message}`, 'error');
            }
        } catch (err) {
            showNotification(`❌ Error al importar: ${err.message}`, 'error');
        }

        fileInput.value = '';
    });

    headerActions.appendChild(importBtn);

    // Function to export data
    window.exportData = function (type) {
        const url = `/api/export?type=${type}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = type === 'all' ? 'Samsung_Catalogo_Completo.xlsx' : `Samsung_${type}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show notification
        showNotification(`Exportando ${type === 'all' ? 'catálogo completo' : type}...`, 'success');
    };

    // Function to show notification
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3'
        };

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            white-space: pre-line;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
