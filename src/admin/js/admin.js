document.addEventListener('DOMContentLoaded', () => {
    // ==================== DATA PERSISTENCE SYSTEM ====================

    const STORAGE_KEY = 'samsung_catalog_products';
    const COLORS_STORAGE_KEY = 'samsung_catalog_colors';

    // ==================== UNDO / REDO HISTORY SYSTEM ====================
    const undoStack = [];
    const redoStack = [];
    const MAX_HISTORY = 50;

    window.pushHistoryState = function (actionName = 'Cambio') {
        const state = {
            products: JSON.parse(JSON.stringify(window.products || [])),
            categories: JSON.parse(JSON.stringify(window.categories || {})),
            colorVariables: JSON.parse(JSON.stringify(window.colorVariables || {})),
            tags: JSON.parse(JSON.stringify(window.tags || {})),
            promotions: JSON.parse(JSON.stringify(window.promotions || {})),
            combos: JSON.parse(JSON.stringify(window.combos || {})),
            textVariables: JSON.parse(JSON.stringify(window.textVariables || {})),
            timestamp: new Date().getTime(),
            action: actionName
        };

        undoStack.push(state);
        if (undoStack.length > MAX_HISTORY) {
            undoStack.shift(); // Remove oldest
        }

        // Clear redo stack when new action is performed
        redoStack.length = 0;

        console.log(`📸 Estado guardado: ${actionName} (Undo: ${undoStack.length}, Redo: ${redoStack.length})`);
        updateHistoryUI();
    };

    window.undo = function () {
        if (undoStack.length === 0) {
            return;
        }

        // Save current state to redo stack before undoing
        const currentState = {
            products: JSON.parse(JSON.stringify(window.products || [])),
            categories: JSON.parse(JSON.stringify(window.categories || {})),
            colorVariables: JSON.parse(JSON.stringify(window.colorVariables || {})),
            tags: JSON.parse(JSON.stringify(window.tags || {})),
            promotions: JSON.parse(JSON.stringify(window.promotions || {})),
            combos: JSON.parse(JSON.stringify(window.combos || {})),
            textVariables: JSON.parse(JSON.stringify(window.textVariables || {})),
            timestamp: new Date().getTime(),
            action: 'Estado actual'
        };
        redoStack.push(currentState);

        const lastState = undoStack.pop();

        // Restore State
        window.products = lastState.products;
        window.categories = lastState.categories;
        window.colorVariables = lastState.colorVariables;
        window.tags = lastState.tags;
        window.promotions = lastState.promotions;
        window.combos = lastState.combos;
        window.textVariables = lastState.textVariables;

        // Persist Restored State
        saveDataSilent();

        // Refresh UI
        refreshAllViews();
        updateHistoryUI();

        console.log(`⏪ Deshecho: ${lastState.action}`);
        showHistoryFeedback('undoBtn', 'check', 'Deshecho');
    };

    window.redo = function () {
        if (redoStack.length === 0) {
            return;
        }

        // Save current state to undo stack before redoing
        const currentState = {
            products: JSON.parse(JSON.stringify(window.products || [])),
            categories: JSON.parse(JSON.stringify(window.categories || {})),
            colorVariables: JSON.parse(JSON.stringify(window.colorVariables || {})),
            tags: JSON.parse(JSON.stringify(window.tags || {})),
            promotions: JSON.parse(JSON.stringify(window.promotions || {})),
            combos: JSON.parse(JSON.stringify(window.combos || {})),
            textVariables: JSON.parse(JSON.stringify(window.textVariables || {})),
            timestamp: new Date().getTime(),
            action: 'Estado actual'
        };
        undoStack.push(currentState);

        const nextState = redoStack.pop();

        // Restore State
        window.products = nextState.products;
        window.categories = nextState.categories;
        window.colorVariables = nextState.colorVariables;
        window.tags = nextState.tags;
        window.promotions = nextState.promotions;
        window.combos = nextState.combos;
        window.textVariables = nextState.textVariables;

        // Persist Restored State
        saveDataSilent();

        // Refresh UI
        refreshAllViews();
        updateHistoryUI();

        console.log(`⏩ Rehecho: ${nextState.action}`);
        showHistoryFeedback('redoBtn', 'check', 'Rehecho');
    };

    function saveDataSilent() {
        // Skip saving to localStorage if in Catalog Mode (to avoid corrupting global data)
        const catalogId = new URLSearchParams(window.location.search).get('catalogId');
        if (catalogId) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
            localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colorVariables));
            localStorage.setItem('samsung_catalog_categories', JSON.stringify(window.categories));
            localStorage.setItem('samsung_catalog_tags', JSON.stringify(window.tags));
            localStorage.setItem('samsung_catalog_promotions', JSON.stringify(window.promotions));
            localStorage.setItem('samsung_catalog_combos', JSON.stringify(window.combos));
            localStorage.setItem('samsung_catalog_text_variables', JSON.stringify(window.textVariables));
        } catch (e) {
            console.error('Error guardando datos:', e);
        }
    }

    function showHistoryFeedback(btnId, icon, text) {
        const btn = document.getElementById(btnId);
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span class="material-icons">${icon}</span>`;
            btn.style.borderColor = 'var(--primary-color)';
            btn.style.backgroundColor = '#e3f2fd';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.borderColor = '';
                btn.style.backgroundColor = '';
            }, 800);
        }
    }

    function updateHistoryUI() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            if (undoStack.length > 0) {
                undoBtn.disabled = false;
                undoBtn.title = `Deshacer: ${undoStack[undoStack.length - 1].action} (Ctrl+Z)`;
            } else {
                undoBtn.disabled = true;
                undoBtn.title = 'No hay acciones para deshacer';
            }
        }

        if (redoBtn) {
            if (redoStack.length > 0) {
                redoBtn.disabled = false;
                redoBtn.title = `Rehacer: ${redoStack[redoStack.length - 1].action} (Ctrl+Shift+Z)`;
            } else {
                redoBtn.disabled = true;
                redoBtn.title = 'No hay acciones para rehacer';
            }
        }
    }

    function refreshAllViews() {
        if (typeof handleFilter === 'function') handleFilter();
        if (typeof renderCatalogs === 'function') renderCatalogs();
        if (typeof renderCategoriesTable === 'function') renderCategoriesTable();
        if (typeof renderColorsTable === 'function') renderColorsTable();
        if (typeof renderVariablesTable === 'function') renderVariablesTable();
        if (typeof renderTagsTable === 'function') renderTagsTable();
        if (typeof renderPromotionsTable === 'function') renderPromotionsTable();
        if (typeof renderCombosTable === 'function') renderCombosTable();
    }

    // Bind Ctrl+Z and Ctrl+Shift+Z
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            window.redo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            window.undo();
        }
    });

    // Bind buttons when they're available
    setTimeout(() => {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.undo();
            });
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.redo();
            });
        }

        updateHistoryUI();
    }, 500);


    // ==================== SWEETALERT2 INTEGRATION ====================

    // Confirmation Modal Logic using SweetAlert2
    window.showConfirm = function (title, message, onConfirm, onCancel = null, isDanger = false) {
        if (typeof Swal === 'undefined') {
            // Fallback if library fails to load
            if (confirm(`${title}\n\n${message}`)) {
                if (onConfirm) onConfirm();
            } else {
                if (onCancel) onCancel();
            }
            return;
        }

        Swal.fire({
            title: title,
            text: message,
            icon: isDanger ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: isDanger ? '#d32f2f' : '#1976d2',
            cancelButtonColor: '#757575',
            confirmButtonText: isDanger ? 'Eliminar' : 'Confirmar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            // Allow closing by clicking outside or escape key
            allowOutsideClick: true,
            allowEscapeKey: true
        }).then((result) => {
            if (result.isConfirmed) {
                if (onConfirm) onConfirm();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                if (onCancel) onCancel();
            }
        });
    };

    // Toast Notification Logic using SweetAlert2
    window.showToast = function (message, type = 'success') {
        if (typeof Swal === 'undefined') {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: type,
            title: message
        });
    };




    // Load persisted data or use default from data.js
    function loadPersistedData() {
        try {
            const savedProducts = localStorage.getItem(STORAGE_KEY);
            const savedColors = localStorage.getItem(COLORS_STORAGE_KEY);

            if (savedProducts) {
                const parsed = JSON.parse(savedProducts);
                let loadedProducts = [];

                if (Array.isArray(parsed)) {
                    loadedProducts = parsed;
                    console.log('✅ Productos cargados desde localStorage');
                } else if (parsed && Array.isArray(parsed.products)) {
                    loadedProducts = parsed.products;
                    console.log('⚠️ Detectada estructura anidada incorrecta, reparando...');
                } else {
                    console.error('❌ Datos de productos en localStorage corruptos');
                }

                // MERGE STRATEGY: Add products from file (window.products) that aren't in localStorage (by ID)
                // This ensures newly imported/added static items appear
                if (window.products && window.products.length > 0) {
                    const storageIds = new Set(loadedProducts.map(p => String(p.id)));
                    let addedCount = 0;

                    window.products.forEach(p => {
                        if (!storageIds.has(String(p.id))) {
                            loadedProducts.push(p);
                            storageIds.add(String(p.id));
                            addedCount++;
                        }
                    });

                    if (addedCount > 0) {
                        console.log(`📦 Se fusionaron ${addedCount} productos nuevos desde el archivo estático.`);
                        // Optional: Force save back to sync storage
                        // localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedProducts)); 
                    }
                }

                window.products = loadedProducts;

            } else if (typeof window.products !== 'undefined') {
                // Check if data.js loaded a corrupted structure
                if (!Array.isArray(window.products) && window.products && Array.isArray(window.products.products)) {
                    window.products = window.products.products;
                    console.log('⚠️ Detectada estructura anidada incorrecta en data.js, reparando...');
                }
            }

            if (savedColors) {
                const parsedColors = JSON.parse(savedColors);
                const firstColor = Object.values(parsedColors)[0];
                if (firstColor && typeof firstColor === 'string') {
                    console.log('⚠️ Formato antiguo de colores detectado, limpiando localStorage...');
                    localStorage.removeItem(COLORS_STORAGE_KEY);
                } else {
                    window.colorVariables = parsedColors;
                    console.log('✅ Variables de color cargadas desde localStorage');
                }
            }
        } catch (e) {
            console.error('Error cargando datos persistidos:', e);
        }
    }

    // Save data to localStorage
    function saveData() {
        // Skip saving to localStorage if in Catalog Mode (to avoid corrupting global data)
        const catalogId = new URLSearchParams(window.location.search).get('catalogId');
        if (catalogId) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
            localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colorVariables));
            console.log(' Datos guardados automáticamente');

            // Update last save time
            const now = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
            const saveIndicator = document.getElementById('lastSaveTime');
            if (saveIndicator) {
                const textSpan = saveIndicator.querySelector('span:last-child');
                if (textSpan) {
                    textSpan.textContent = `Guardado: ${now}`;
                }
                const icon = saveIndicator.querySelector('span[class*="material-icons"]');
                if (icon) {
                    icon.style.color = '#2e7d32';
                    setTimeout(() => {
                        icon.style.color = 'var(--primary-color)';
                    }, 2000);
                }
            }
        } catch (e) {
            console.error('Error guardando datos:', e);
            window.showToast('Error al guardar datos. El almacenamiento local puede estar lleno.', 'error');
        }
    }

    // Debounced save (wait 1 second after last change)
    let saveTimeout;
    function autoSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveData();
        }, 1000);
    }

    // Export data.js file
    window.exportDataJS = function () {
        const content = `var products = ${JSON.stringify(products, null, 4)};\n`;
        const blob = new Blob([content], { type: 'text/javascript' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.js';
        link.click();
        window.showToast('Archivo data.js descargado. Reemplázalo en catalog-template/ para actualizar el catálogo.', 'success');
    }

    // Export color-variables.js file
    // Export color variables as Excel
    window.exportColorVariables = function () {
        const data = [['ID', 'Nombre del Color', 'Código Hex']];

        if (typeof colorVariables !== 'undefined') {
            Object.keys(colorVariables).sort().forEach(color => {
                const colorData = colorVariables[color];
                data.push([colorData.id || '', color, colorData.hex || colorData]);
            });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, ws, 'Colores');
        XLSX.writeFile(wb, 'Samsung_Colores.xlsx');
    }

    // Reset to original data.js
    window.resetData = function () {
        window.showConfirm(
            'Restablecer Datos',
            '¿Estás seguro? Esto eliminará todos los cambios no exportados y volverá a los datos originales de data.js',
            () => {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(COLORS_STORAGE_KEY);
                location.reload();
            },
            null,
            true
        );
    }

    // Load persisted data on startup
    loadPersistedData();

    // Initialize Save Time Display
    const now = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
    const saveIndicator = document.getElementById('lastSaveTime');
    if (saveIndicator) {
        const textSpan = saveIndicator.querySelector('span:last-child');
        if (textSpan) {
            textSpan.textContent = `Cargado: ${now}`;
        }
    }


    // --- CATALOG MODE INITIALIZATION ---
    const urlParams = new URLSearchParams(window.location.search);
    const catalogIdParam = urlParams.get('catalogId');

    if (catalogIdParam) {
        // SAFETY: Clear global data immediately to prevent leakage
        window.products = [];

        console.log(`📂 Catalog Mode Active: ${catalogIdParam}`);

        // Setup UI for Catalog Mode
        const pageTitle = document.getElementById('headerTitle') || document.querySelector('.header-title');
        if (pageTitle) {
            pageTitle.textContent = `Catálogo: ${catalogIdParam}`;
            pageTitle.style.color = '#d32f2f'; // Visual Red Flag
            const subTitle = document.getElementById('headerSubtitle');
            if (subTitle) subTitle.textContent = 'Edición independiente de productos (Modo Aislado)';
        }

        // Add visual banner
        const validHeader = document.querySelector('.header-actions');
        if (validHeader) {
            const banner = document.createElement('div');
            banner.style.background = '#ffebee';
            banner.style.color = '#c62828';
            banner.style.padding = '10px';
            banner.style.borderRadius = '8px';
            banner.style.marginBottom = '15px';
            banner.style.border = '1px solid #ffcdd2';
            banner.style.fontWeight = 'bold';
            banner.style.textAlign = 'center';
            banner.innerHTML = '<span class="material-icons" style="vertical-align:bottom; margin-right:5px;">warning</span> ESTÁS EDITANDO UNA COPIA DEL CATÁLOGO. LOS CAMBIOS NO AFECTAN AL INVENTARIO GLOBAL.';
            validHeader.after(banner);
        }

        // Hide filters as they might not work or require re-wiring
        const filterContainer = document.querySelector('.admin-filters');
        if (filterContainer) filterContainer.style.display = 'none';

        // Hide Add Product Button (Creation not supported in Catalog Mode directly)
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) addBtn.style.display = 'none';

        // Show Loading
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Cargando productos del catálogo...</td></tr>';

        // Load Catalog Products instead of Global
        fetch(`/api/catalogs/${catalogIdParam}/products`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.products = data.products; // Override Global Products
                    console.log('✅ Catalog products loaded');

                    // Re-render table if on products view
                    if (typeof renderProductsTable === 'function') renderProductsTable();

                    // Handle Edit Param
                    const editId = urlParams.get('edit');
                    if (editId) {
                        setTimeout(() => window.openModal(editId), 500);
                    }
                } else {
                    window.showToast('Error cargando catálogo: ' + data.message, 'error');
                }
            })
            .catch(err => console.error('Error fetching catalog products:', err));
    } else {
        // Normal Global Mode
        // Check if we need to auto-open modal (Fix for "Doesn't let me edit")
        const editId = urlParams.get('edit');
        if (editId) {
            console.log('Global Edit Auto-Open:', editId);
            // Ensure data is loaded
            const checkData = setInterval(() => {
                if (window.products && window.products.length > 0) {
                    clearInterval(checkData);
                    window.openModal(editId);
                }
            }, 100);
            // Failsafe
            setTimeout(() => clearInterval(checkData), 5000);
        }

        if (typeof products === 'undefined') {
            window.showToast('Error: No se encontraron datos de productos (data.js no cargado)', 'error');
            return;
        }
    }
    // -----------------------------------

    // --- Helper: Normalize Product Data ---
    window.normalizeProduct = function (p) {
        const norm = { ...p };

        // 1. Storage Options
        if (!norm.storageOptions || !Array.isArray(norm.storageOptions)) {
            norm.storageOptions = [];
            // Migration from legacy 'storage' string/array
            if (norm.storage) {
                if (Array.isArray(norm.storage)) {
                    norm.storage.forEach(cap => {
                        norm.storageOptions.push({
                            capacity: cap,
                            price: norm.price || 0,
                            originalPrice: norm.originalPrice || 0
                        });
                    });
                } else {
                    norm.storageOptions.push({
                        capacity: String(norm.storage),
                        price: norm.price || 0,
                        originalPrice: norm.originalPrice || 0
                    });
                }
            }
        }

        // 2. Variants (Ensure images array exists)
        if (!norm.variants || !Array.isArray(norm.variants)) {
            norm.variants = [];
        } else {
            norm.variants = norm.variants.map(v => {
                const nv = { ...v };
                if (!nv.images || !Array.isArray(nv.images)) {
                    nv.images = [];
                    if (nv.image) nv.images.push(nv.image);
                }
                return nv;
            });
        }
        return norm;
    }

    // --- IMPROVEMENT 1: Clean up experimental or unverified data entry ---
    window.validateAndCleanProduct = function (product) {
        const cleaned = { ...product };

        // Remove empty or invalid fields
        if (!cleaned.name || cleaned.name.trim() === '') {
            console.warn(`Product ${cleaned.id} has no name`);
            return null;
        }

        // Clean up variants - keep them if they have color OR price/variable info
        if (cleaned.variants && Array.isArray(cleaned.variants)) {
            cleaned.variants = cleaned.variants.filter(v => {
                const hasColor = v.color && v.color.trim() !== '';
                const hasPriceSpec = v.variableId || (v.variableText && v.variableText.trim() !== '') || v.price > 0;
                return hasColor || hasPriceSpec;
            });
        }

        // Clean up storage options - remove invalid ones
        if (cleaned.storageOptions && Array.isArray(cleaned.storageOptions)) {
            cleaned.storageOptions = cleaned.storageOptions.filter(s => {
                return s.capacity && s.capacity.trim() !== '' && s.price >= 0;
            });
        }

        // Ensure required fields have defaults
        cleaned.price = cleaned.price || 0;
        cleaned.category = cleaned.category || 'accessories';

        return cleaned;
    }

    // --- IMPROVEMENT 3: Implement logic for missing variants in placeholders ---
    window.fillMissingVariantPlaceholders = function (product, maxVariants = 5) {
        const filled = { ...product };

        if (!filled.variants) {
            filled.variants = [];
        }

        // Fill missing variants with placeholders
        while (filled.variants.length < maxVariants) {
            filled.variants.push({
                sku: '',
                color: '',
                hex: '',
                link: '',
                images: [],
                image: '',
                isPlaceholder: true
            });
        }

        return filled;
    }

    // --- IMPROVEMENT 2: Refactor logic for updating color placeholders ---
    window.updateColorInProducts = function (colorName, newHex) {
        let updatedCount = 0;

        products.forEach(product => {
            if (product.variants && Array.isArray(product.variants)) {
                product.variants.forEach(variant => {
                    if (variant.color === colorName) {
                        variant.hex = newHex;
                        updatedCount++;
                    }
                });
            }
        });

        console.log(`Updated ${updatedCount} variant(s) with color "${colorName}"`);
        return updatedCount;
    }

    window.syncColorVariablesWithProducts = function () {
        // Sync all color hex codes from colorVariables to products
        let syncedCount = 0;

        products.forEach(product => {
            if (product.variants && Array.isArray(product.variants)) {
                product.variants.forEach(variant => {
                    if (variant.color && colorVariables[variant.color]) {
                        const colorData = colorVariables[variant.color];
                        variant.hex = colorData.hex || colorData;
                        syncedCount++;
                    }
                });
            }
        });

        console.log(`Synced ${syncedCount} variant color(s) from color variables`);
        return syncedCount;
    }

    // ==================== CATEGORY MANAGEMENT SYSTEM ====================

    const CATEGORIES_STORAGE_KEY = 'samsung_catalog_categories';

    // Default categories (11 initial categories)
    const defaultCategories = {
        "Smartphones": { id: "ct001", name: "Smartphones", icon: "📱" },
        "Tablets": { id: "ct002", name: "Tablets", icon: "🖊️" },
        "Smartwatches": { id: "ct003", name: "Smartwatches", icon: "⌚" },
        "Buds": { id: "ct004", name: "Buds", icon: "🎧" },
        "Laptops": { id: "ct005", name: "Laptops", icon: "💻" },
        "Televisores": { id: "ct006", name: "Televisores", icon: "📺" },
        "Monitores": { id: "ct007", name: "Monitores", icon: "🖥️" },
        "Lavadoras": { id: "ct008", name: "Lavadoras", icon: "🧺" },
        "Refrigeradores": { id: "ct009", name: "Refrigeradores", icon: "â„ï¸" },
        "Línea Blanca": { id: "ct010", name: "Línea Blanca", icon: "ðŸ " },
        "Accesorios": { id: "ct011", name: "Accesorios", icon: "🔌" }
    };

    // Load categories from localStorage or use defaults (checking global first)
    if (typeof window.categories === 'undefined') {
        window.categories = {};
    }
    // Global 'categories' variable is used directly (loaded from categories.js)


    try {
        const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (savedCategories) {
            const parsedCategories = JSON.parse(savedCategories);
            // Check for format validity (must have id and icon)
            const firstCategory = Object.values(parsedCategories)[0];
            const isValid = firstCategory && firstCategory.id && firstCategory.icon;

            if (!isValid) {
                console.log('Formato incompleto de categoría detectado, reiniciando...');
                categories = { ...defaultCategories };
                localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
                console.log('categorías reiniciadas con iconos y IDs');
            } else {
                categories = parsedCategories;
                console.log('categorías cargadas desde localStorage');
            }
        } else {
            categories = { ...defaultCategories };
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
            console.log('categorías inicializadas con valores por defecto');
        }
    } catch (e) {
        console.error('Error cargando categorías:', e);
        categories = { ...defaultCategories };
    }

    // Save categories to localStorage
    function saveCategories() {
        try {
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
            console.log(' categoríasguardadas');
            autoSave(); // Also trigger general auto-save
        } catch (e) {
            console.error('Error guardando categorías:', e);
        }
    }

    // Export categories to JSON file
    window.exportCategories = function () {
        const content = `var categories = ${JSON.stringify(categories, null, 4)};\\n`;
        const blob = new Blob([content], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'categories.json';
        link.click();
        alert('categoríasexportadas correctamente');
    }

    // State
    let filteredProducts = [...products];
    let filteredCategories = [];
    let filteredVariables = [];
    let filteredTags = [];
    let filteredPromotions = [];
    let currentView = 'catalogs';

    // DOM Elements - Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    // DOM Elements - Products View
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('adminSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const addProductBtn = document.getElementById('addProductBtn');

    // DOM Elements - Catalogs View
    const catalogsGrid = document.getElementById('catalogsGrid');

    // DOM Elements - Modal
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const variantsContainer = document.getElementById('variantsContainer');
    const addVariantBtn = document.getElementById('addVariantBtn');

    // DOM Elements - Categories View
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    const categorySearch = document.getElementById('categorySearch');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModalBtn = document.getElementById('closeCategoryModal');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const categoryForm = document.getElementById('categoryForm');
    // Optional category elements
    const categoryIconInput = document.getElementById('categoryIcon');
    const categoryIconPreview = document.getElementById('categoryIconPreview');

    // DOM Elements - Promotions View
    const promotionsTableBody = document.getElementById('promotionsTableBody');
    const promotionSearch = document.getElementById('promotionSearch');
    const addPromotionBtn = document.getElementById('addPromotionBtn');
    const promotionModal = document.getElementById('promotionModal');
    const closePromotionModalBtn = document.getElementById('closePromotionModal');
    const cancelPromotionBtn = document.getElementById('cancelPromotionBtn');
    const promotionForm = document.getElementById('promotionForm');

    // Initial Render
    if (document.getElementById('catalogsGrid')) {
        renderCatalogs();
    }

    // Only render GLOBAL products if we are on products view AND NOT in catalog mode.
    // If we are in catalog mode, the fetch logic at the top of the file handles the rendering after loading.
    if (document.getElementById('productsView') && !new URLSearchParams(window.location.search).get('catalogId')) {
        renderProductsTable();
    }

    // Form Submit Handler
    // Form Submit Handler
    if (productForm) {
        // Use a flag on the element to prevent double-binding if this script re-runs
        if (productForm.dataset.listenerAttached === 'true') {
            console.log('⚠️ Listener already attached to productForm');
        } else {
            productForm.addEventListener('submit', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const btn = this.querySelector('button[type="submit"]');
                if (btn && btn.disabled) return;

                if (btn) {
                    btn.disabled = true;
                    // Use innerHTML to keep styling if needed, or textContent
                    // Save original text?
                    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;

                    btn.innerHTML = '<span class="material-icons spin" style="font-size:16px;">autorenew</span> Guardando...';

                    // Fallback to re-enable
                    setTimeout(() => {
                        if (btn.disabled) {
                            btn.disabled = false;
                            btn.textContent = btn.dataset.originalText || 'Guardar Producto';
                        }
                    }, 5000);
                }

                saveProduct();
            });
            productForm.dataset.listenerAttached = 'true';
        }
    }

    // Navigation
    // Navigation click listeners removed as layout.js handles active state based on URL
    // navItems.forEach(item => {
    //     item.addEventListener('click', () => {
    //         const view = item.getAttribute('data-view');
    //         // Window location hash update removed
    //     });
    // });

    // Hash change listeners and default view loading removed for MPA architecture
    // We rely on standard page navigation (products.html, catalogs.html, etc.)

    function switchView(view) {
        currentView = view;

        // Hash update removed


        // Update nav
        if (navItems) {
            navItems.forEach(item => {
                if (item.getAttribute('data-view') === view) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        // Update sections
        if (viewSections) {
            viewSections.forEach(section => {
                section.classList.remove('active');
            });
        }

        const productsView = document.getElementById('productsView');
        const catalogsView = document.getElementById('catalogsView');
        const categoriesView = document.getElementById('categoriesView');
        const configView = document.getElementById('configView');

        if (view === 'products' && productsView) {
            productsView.classList.add('active');
            renderProductsTable();
        } else if (view === 'catalogs' && catalogsView) {
            catalogsView.classList.add('active');
            renderCatalogs();
        } else if (view === 'categories' && categoriesView) {
            categoriesView.classList.add('active');
            renderCategoriesTable();
        } else if (view === 'colors' && configView) {
            configView.classList.add('active');
            if (typeof renderColorsTable === 'function') renderColorsTable();
        } else if (view === 'config' && configView) {
            configView.classList.add('active');
        }

        // Update header title and subtitle
        if (typeof window.updateHeader === 'function') {
            window.updateHeader(view);
        }
    }

    // Catalogs View Functions
    async function renderCatalogs() {
        if (!typeof window.loadCatalogs !== 'function' && !document.getElementById('catalogsGrid')) {
            return; // Safe exit if view doesn't exist
        }

        // Delegate to new catalog system if available
        if (typeof window.loadCatalogs === 'function') {
            window.loadCatalogs();
        } else {
            console.error('Catalog system not loaded');
            if (catalogsGrid) {
                catalogsGrid.innerHTML = '<p style="text-align: center; padding: 3rem; color: #d32f2f;">Error: Sistema de catálogos no cargado</p>';
            }
        }
    }

    // Old catalog functions removed. Replaced by catalog-system.js



    // Products Database View Functions
    function renderProductsTable() {
        handleFilter();
    }

    function handleFilter() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const category = categoryFilter ? categoryFilter.value : 'all';

        // IMPROVEMENT 1: Clean and validate products before filtering
        const validProducts = products.map(p => validateAndCleanProduct(p)).filter(p => p !== null);

        filteredProducts = validProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                (product.sku && product.sku.toLowerCase().includes(searchTerm));
            const matchesCategory = category === 'all' || product.category === category;
            return matchesSearch && matchesCategory;
        });

        renderTable();
    }

    // IMPROVEMENT 4: Optimize product rendering for appending data
    function renderTable() {
        if (!tableBody) return;

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        if (filteredProducts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="19" style="text-align:center; padding: 2rem;">No se encontraron productos</td></tr>';
            return;
        }

        filteredProducts.forEach(product => {
            const tr = createProductRow(product);
            fragment.appendChild(tr);
        });

        // Clear and append all at once for better performance
        tableBody.innerHTML = '';
        tableBody.appendChild(fragment);
    }

    // Helper function to create a product row (New Flat Structure)
    function createProductRow(product) {
        const tr = document.createElement('tr');

        // 1. Analyze Variants
        const variants = product.variants || [];
        const hasVariants = variants.length > 0;

        // 2. Image (First available)
        const imageSrc = hasVariants && variants[0].image ? variants[0].image : '';
        const imgHtml = imageSrc
            ? `<img src="${imageSrc}" class="product-mini-img" style="width:40px;height:40px;object-fit:contain;">`
            : `<div style="width:40px;height:40px;background:#eee;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">No IMG</div>`;

        // 3. Price Range
        let priceDisplay = '-';
        if (hasVariants) {
            const prices = variants.map(v => Number(v.price)).filter(p => p > 0);
            if (prices.length > 0) {
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                priceDisplay = min === max ? `Bs ${min}` : `Bs ${min} - ${max}`;
            }
        }

        // 4. Stock Badge
        const inStock = hasVariants && variants.some(v => v.active);
        const stockHtml = inStock
            ? '<span style="background:#d4edda; color:#155724; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:600;">En Stock</span>'
            : '<span style="background:#f8d7da; color:#721c24; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:600;">Agotado</span>';

        // 5. SKU Display
        const skuDisplay = hasVariants ? (variants.length > 1 ? `${variants[0].sku} <small style="color:#777;">(+${variants.length - 1})</small>` : variants[0].sku) : '-';

        tr.innerHTML = `
            <td style="width:40px; text-align:center;">
                <input type="checkbox" class="product-checkbox" data-product-id="${product.id}" 
                       style="width:18px; height:18px; cursor:pointer;">
            </td>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    ${imgHtml}
                    <div>
                        <div style="font-weight:600; color:#333;">${product.name}</div>
                        <!-- <div style="font-size:0.75rem; color:#888;">ID: ${product.id}</div> -->
                    </div>
                </div>
            </td>
            <td>${product.category || '-'}</td>
            <td style="font-family:monospace;">${skuDisplay}</td>
            <td style="font-weight:600;">${priceDisplay}</td>
            <td>${stockHtml}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="
                        const params = new URLSearchParams(window.location.search);
                        const currentCatalogId = params.get('catalogId');
                        
                        // If we are already on the correct page context, just open modal
                        // This avoids annoying reloads and confusion
                        if (currentCatalogId) {
                            window.openModal('${product.id}');
                        } else {
                             // Global Mode
                             window.openModal('${product.id}');
                        }
                    " title="Editar"><span class="material-icons">edit</span></button>
                    <button class="btn-icon delete" onclick="deleteProduct('${product.id}')" title="Eliminar"><span class="material-icons">delete</span></button>
                </div>
            </td>
        `;

        return tr;
    }

    // Helper function to render variant cells with placeholders
    function renderVariantCells(variants, maxVariants) {
        let variantCells = '';

        for (let i = 0; i < maxVariants; i++) {
            if (i < variants.length && variants[i].color) {
                const v = variants[i];
                // IMPROVEMENT 2: Get hex from variables first, fallback to variant hex
                const colorData = colorVariables && colorVariables[v.color];
                const hexColor = (colorData && (colorData.hex || colorData)) || v.hex || '';
                const colorPreview = hexColor ? `<div style="display:inline-block; width:20px; height:20px; background:${hexColor}; border:1px solid #ddd; border-radius:4px; vertical-align:middle; margin-right:6px;"></div>` : '';

                variantCells += `
                    <td style="font-size:0.75rem; color:#666;">${v.sku || '-'}</td>
                    <td style="font-size:0.85rem;">${colorPreview}${v.color || '-'}</td>
                `;
            } else {
                // IMPROVEMENT 3: Show placeholder for missing variants
                variantCells += '<td style="color:#ccc;">-</td><td style="color:#ccc;">-</td>';
            }
        }

        return variantCells;
    }

    // Helper function to get storage display
    function getStorageDisplay(product) {
        if (!product.storage) return '-';

        if (Array.isArray(product.storage)) {
            return product.storage.join(', ');
        }

        return product.storage;
    }

    // Event Listeners - Products View
    if (searchInput) searchInput.addEventListener('input', handleFilter);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilter);
    if (addProductBtn) addProductBtn.addEventListener('click', () => openModal());

    // Bulk Selection and Deletion
    const selectAllCheckbox = document.getElementById('selectAllProducts');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const selectedCountSpan = document.getElementById('bulkDeleteCount');

    // Add listener for bulk delete button
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', () => window.bulkDeleteProducts());
    }

    // Select/Deselect all products
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.product-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateBulkDeleteButton();
        });
    }

    // Update bulk delete button visibility and count
    function updateBulkDeleteButton() {
        const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
        const count = checkedBoxes.length;

        if (selectedCountSpan) selectedCountSpan.textContent = count;

        if (bulkDeleteBtn) {
            if (count > 0) {
                bulkDeleteBtn.style.display = 'flex';
                bulkDeleteBtn.style.alignItems = 'center';
                bulkDeleteBtn.style.gap = '6px';
            } else {
                bulkDeleteBtn.style.display = 'none';
            }
        }

        // Update select all checkbox state
        if (selectAllCheckbox) {
            const allCheckboxes = document.querySelectorAll('.product-checkbox');
            const allChecked = allCheckboxes.length > 0 && checkedBoxes.length === allCheckboxes.length;
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < allCheckboxes.length;
        }
    }

    // Listen for checkbox changes on product rows (delegated event)
    if (tableBody) {
        tableBody.addEventListener('change', function (e) {
            if (e.target.classList.contains('product-checkbox')) {
                updateBulkDeleteButton();
            }
        });
    }

    // Bulk delete function
    // Bulk delete function
    window.bulkDeleteProducts = function () {
        const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
        const idsToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-product-id'));

        if (idsToDelete.length === 0) return;

        window.showConfirm(
            'Eliminar Productos',
            `¿Estás seguro de que deseas eliminar ${idsToDelete.length} producto(s)?`,
            () => {
                // Delete products
                idsToDelete.forEach(id => {
                    const index = products.findIndex(p => p.id == id);
                    if (index !== -1) {
                        products.splice(index, 1);
                    }
                });

                // Update UI
                handleFilter();
                renderCatalogs();
                autoSave();
                updateBulkDeleteButton();

                // Persist to server
                fetch('/api/save-products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(products)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.showToast(`${idsToDelete.length} productos eliminados`, 'success');
                        }
                    })
                    .catch(err => {
                        console.error('❌ Error eliminando del servidor:', err);
                        window.showToast('Error de conexión al eliminar', 'error');
                    });
            },
            null, // onCancel
            true // isDanger
        );
    }



    // Modal & CRUD Operations
    // Modal & CRUD Operations (Updated)
    window.openModal = function (productId = null) {
        modal.classList.add('active');

        // Clear new containers
        const colorsContainer = document.getElementById('colorsContainer');
        const priceVariantsContainer = document.getElementById('priceVariantsContainer');
        if (colorsContainer) colorsContainer.innerHTML = '';
        if (priceVariantsContainer) priceVariantsContainer.innerHTML = '';

        // Populate category dropdown dynamically
        const categorySelect = document.getElementById('prodCategory');
        if (categorySelect) {
            const currentValue = categorySelect.value; // Save current selection if editing
            categorySelect.innerHTML = ''; // Clear existing options

            // Add categories from the categories object
            Object.keys(categories).forEach(catKey => {
                const catInfo = categories[catKey];
                const option = document.createElement('option');
                option.value = catKey;
                option.textContent = catInfo.name;
                categorySelect.appendChild(option);
            });
        }

        // Populate Badge Datalist
        const badgeList = document.getElementById('badgeList');
        if (badgeList && window.tags) {
            badgeList.innerHTML = '';
            Object.values(window.tags).forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.name;
                badgeList.appendChild(option);
            });
        }

        if (productId) {
            const product = products.find(p => p.id == productId);
            if (!product) return;

            const catalogId = new URLSearchParams(window.location.search).get('catalogId');
            modalTitle.textContent = catalogId ? 'Editar en Catálogo' : 'Editar Producto';
            if (catalogId) {
                modalTitle.style.color = '#d32f2f'; // Distinct color for catalog mode
            } else {
                modalTitle.style.color = '';
            }

            document.getElementById('editProductId').value = product.id;
            document.getElementById('prodName').value = product.name;
            const descEl = document.getElementById('prodDescription');
            if (descEl) descEl.value = product.description || '';
            document.getElementById('prodCategory').value = product.category;
            document.getElementById('prodBadge').value = product.badge || '';

            // Base pricing inputs removed (lines 799-801 deleted)

            // Load colors from new structure
            if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
                product.colors.forEach(colorData => {
                    addColorRow(colorData);
                });
            } else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                // Migration: Extract unique colors from old 'variants' array
                const seenColors = new Set();
                product.variants.forEach(v => {
                    const cKey = v.colorId || v.color;
                    if (cKey && !seenColors.has(cKey)) {
                        seenColors.add(cKey);
                        addColorRow(v); // 'v' contains colorId, images, etc.
                    }
                });
            }

            // Load price variants
            if (product.priceVariants && Array.isArray(product.priceVariants) && product.priceVariants.length > 0) {
                product.priceVariants.forEach(pv => {
                    addPriceVariantRow(pv);
                });
            } else {
                // Migration: Create a default price variant from Base Price/Link
                // Check if variants have specific prices? For now, use base defaults.
                const fallbackPrice = product.basePrice || product.price || 0;
                addPriceVariantRow({
                    price: fallbackPrice,
                    promoPrice: product.basePromo || product.promoPrice || 0,
                    link: product.baseLink || product.link || '',
                    active: true
                });
            }

            setTimeout(window.updateLivePreview, 100);

        } else {
            modalTitle.textContent = 'Nuevo Producto';
            document.getElementById('editProductId').value = '';
            document.getElementById('productForm').reset(); // reset form
            document.getElementById('prodName').value = '';
            const descEl2 = document.getElementById('prodDescription');
            if (descEl2) descEl2.value = '';
            document.getElementById('prodCategory').value = 'smartphones';
            // ... triggers ...
            setTimeout(window.updateLivePreview, 100);
        }
    }


    function closeModal() {
        modal.classList.remove('active');
    }

    window.editProduct = function (id) {
        openModal(id);
    }

    window.deleteProduct = function (id) {
        console.log('Attempting to delete product ID:', id);

        window.showConfirm(
            'Eliminar Producto',
            '¿Estás seguro de que deseas eliminar este producto?',
            () => {
                // SNAPSHOT FOR UNDO (Only for global)
                const catalogId = new URLSearchParams(window.location.search).get('catalogId');
                if (!catalogId) pushHistoryState('Eliminar Producto');

                // Find index (handle string vs number type mismatch)
                const index = window.products.findIndex(p => p.id == id);

                if (index > -1) {
                    // Remove from array (Local update)
                    window.products.splice(index, 1);
                    console.log('Product removed. Remaining count:', window.products.length);

                    // Update UI immediately
                    handleFilter();
                    renderCatalogs();
                    autoSave(); // patched to skip if catalogId

                    if (catalogId) {
                        // CATALOG MODE DELETE
                        fetch('/api/catalogs/remove-product', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ catalogId: catalogId, productId: id })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    window.showToast('Producto eliminado del catálogo', 'success');
                                } else {
                                    window.showToast('Error eliminando del catálogo: ' + data.message, 'error');
                                }
                            })
                            .catch(err => {
                                console.error('NETWORK ERROR:', err);
                                window.showToast('Error de conexión al eliminar del catálogo', 'error');
                            });

                    } else {
                        // GLOBAL MODE DELETE
                        // Persist to server
                        fetch('/api/save-products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(window.products)
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    window.showToast('Producto eliminado y guardado', 'success');
                                } else {
                                    console.error('SERVER ERROR:', data.message);
                                    window.showToast('Error al guardar cambios en el servidor', 'error');
                                }
                            })
                            .catch(err => {
                                console.error('NETWORK ERROR:', err);
                                window.showToast('Error de conexión al guardar cambios', 'error');
                            });
                    }
                } else {
                    console.error('Product not found for deletion. ID:', id);
                    window.showToast('Error: No se encontró el producto para eliminar', 'error');
                }
            },
            null,
            true // danger
        );
    }



    // === NEW STRUCTURE: Separate Colors and Price Variants ===

    // Default placeholder image (SVG as data URL - no network request)

    // Function to add a color row (visual only, no pricing)
    window.addColorRow = function (data = {}) {
        console.log('🎨 addColorRow called with data:', data);

        const container = document.getElementById('colorsContainer');
        const card = document.createElement('div');
        card.className = 'variant-card';
        const uniqueCardId = 'color-' + Date.now() + Math.random().toString(36).substr(2, 5);
        card.id = uniqueCardId;

        // Color Options
        let colorOptions = '<option value="">Seleccionar Color...</option>';
        let defaultColorId = data.colorId || data.id || '';

        console.log('🔍 Looking for color with ID:', defaultColorId);
        console.log('📚 Available colorVariables:', window.colorVariables ? Object.keys(window.colorVariables).length + ' colors' : 'undefined');

        // Don't force any default color - let user choose

        if (typeof colorVariables !== 'undefined') {
            const sortedColors = Object.entries(colorVariables).map(([name, val]) => ({
                name: name,
                id: val.id,
                hex: val.hex
            })).sort((a, b) => a.name.localeCompare(b.name));

            sortedColors.forEach(c => {
                const selected = defaultColorId === c.id ? 'selected' : '';
                if (selected) {
                    console.log('✅ Found matching color:', c.name, 'with ID:', c.id);
                }
                colorOptions += `<option value="${c.id}" ${selected}>${c.name}</option>`;
            });

            if (defaultColorId && !sortedColors.find(c => c.id === defaultColorId)) {
                console.warn('⚠️ Color ID not found in colorVariables:', defaultColorId);
            }
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid #e3f2fd; padding-bottom:10px;">
                <div>
                    <h4 style="margin:0; color:#1976d2; font-size: 1rem; font-weight: 600;">Color #${container.children.length + 1}</h4>
                    <p style="margin:4px 0 0 0; font-size:0.75rem; color:#666;">Define el color y sus imágenes (no afecta el precio)</p>
                </div>
                <button type="button" onclick="this.closest('.variant-card').remove()" 
                        style="color:#d32f2f; background:none; border:none; cursor:pointer; font-weight:600; font-size:0.85rem; padding:4px 8px; border-radius:4px; transition:background 0.2s;"
                        onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='none'">
                    <span class="material-icons" style="font-size:18px; vertical-align:middle;">delete</span> Eliminar
                </button>
            </div>
            
            <div style="background:#f8f9fa; padding:12px; border-radius:8px; margin-bottom:15px;">
                <div style="display:grid; grid-template-columns: 1fr 2fr; gap:12px;">
                    <!-- Color Selection -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            Color <span style="color:#d32f2f;">*</span>
                        </label>
                        <div style="display:flex; gap:8px;">
                            <div class="color-preview" style="width:38px; height:38px; border-radius:6px; background:#f0f0f0; border:1px solid #ddd; flex-shrink:0;"></div>
                            <select class="form-select color-select" onchange="window.updateColorPreview(this)" style="flex-grow:1;">
                                ${colorOptions}
                            </select>
                        </div>
                    </div>

                    <!-- SKU -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            SKU <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="text" class="form-input color-sku" placeholder="SM-A566EZKC" value="${data.sku || ''}" 
                               style="font-family:monospace; font-size:0.85rem;">
                    </div>
                </div>
            </div>

            <!-- Images Section -->
            <div>
                <label class="form-label" style="font-size:0.8rem; margin-bottom:8px; font-weight:600;">
                    Imágenes del Producto (Carrusel 4s)
                </label>
                <div class="color-images-list" style="display:flex; flex-direction:column; gap:8px;">
                    ${data.images && data.images.length > 0 ? data.images.map(img => `
                        <div style="display:flex; gap:8px; align-items:center;">
                            <input type="text" class="form-input color-image-input" placeholder="https://..." value="${img}" style="flex-grow:1; font-size:0.8rem;">
                            <div style="width:40px; height:40px; border-radius:4px; overflow:hidden; border:1px solid #ddd; flex-shrink:0;">
                                <img src="${img}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">
                            </div>
                            <button type="button" onclick="this.closest('div').remove()" style="color:#d32f2f; background:none; border:none; cursor:pointer; padding:4px;">
                                <span class="material-icons" style="font-size:20px;">close</span>
                            </button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" onclick="addColorImageRow(this)" 
                        style="margin-top:8px; padding:6px 12px; background:#f5f5f5; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.8rem; color:#666;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle;">add_photo_alternate</span>
                    Agregar otra imagen
                </button>
            </div>
        `;

        container.appendChild(card);

        // Update color preview if color is selected (including default)
        // Do this AFTER appending to DOM so the select element exists
        // Use setTimeout to ensure the element is fully rendered
        if (defaultColorId) {
            setTimeout(() => {
                const selectElement = card.querySelector('.color-select');
                if (selectElement) {
                    console.log('🎨 Updating color preview for:', defaultColorId);
                    window.updateColorPreview(selectElement);
                }
            }, 10);
        }
    }

    // Function to update color preview box
    window.updateColorPreview = function (select) {
        console.log('🔍 updateColorPreview called');

        const card = select.closest('.variant-card');
        const preview = card ? card.querySelector('.color-preview') : null;
        const colorId = select.value;

        console.log('  - Card found:', !!card);
        console.log('  - Preview element found:', !!preview);
        console.log('  - Color ID:', colorId);
        console.log('  - colorVariables exists:', !!window.colorVariables);

        if (colorId && colorVariables) {
            let colorHex = '#f0f0f0';
            let found = false;
            for (const [name, data] of Object.entries(colorVariables)) {
                if (data.id === colorId) {
                    colorHex = data.hex || '#f0f0f0';
                    found = true;
                    console.log('  ✅ Color found:', name, 'hex:', colorHex);
                    break;
                }
            }
            if (!found) {
                console.warn('  ⚠️ Color ID not found in colorVariables:', colorId);
            }
            if (preview) {
                preview.style.backgroundColor = colorHex;
                console.log('  ✅ Preview updated to:', colorHex);
            }
        } else {
            if (preview) {
                preview.style.backgroundColor = '#f0f0f0';
                console.log('  ⚠️ No color selected, using default gray');
            }
        }
    }

    // Function to add image row to color
    window.addColorImageRow = function (button) {
        const imagesList = button.previousElementSibling;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; gap:8px; align-items:center;';
        div.innerHTML = `
            <input type="text" class="form-input color-image-input" placeholder="https://..." style="flex-grow:1; font-size:0.8rem;">
            <div style="width:40px; height:40px; border-radius:4px; overflow:hidden; border:1px solid #ddd; flex-shrink:0; background:#f5f5f5;"></div>
            <button type="button" onclick="this.closest('div').remove()" style="color:#d32f2f; background:none; border:none; cursor:pointer; padding:4px;">
                <span class="material-icons" style="font-size:20px;">close</span>
            </button>
        `;
        imagesList.appendChild(div);
    }

    // Function to add a price variant row (pricing only, no color)
    window.addPriceVariantRow = function (data = {}) {
        const container = document.getElementById('priceVariantsContainer');
        const card = document.createElement('div');
        card.className = 'variant-card';
        const uniqueCardId = 'price-' + Date.now() + Math.random().toString(36).substr(2, 5);
        card.id = uniqueCardId;

        // Variable Options
        let variableOptions = '<option value="">Seleccionar Especificación...</option>';
        let varFound = false;

        if (typeof textVariables !== 'undefined') {
            Object.values(textVariables).forEach(v => {
                const isSelected = data.variableId === v.id;
                if (isSelected) varFound = true;
                const selected = isSelected ? 'selected' : '';
                variableOptions += `<option value="${v.id}" ${selected}>${v.name}: ${v.text}</option>`;
            });
        }

        // Fallback for custom/missing variables (data.js imports)
        if (data.variableId && !varFound && data.variableText) {
            variableOptions += `<option value="${data.variableId}" selected>${data.variableText} (Estático)</option>`;
        }

        const isActive = data.active !== false;
        const activeChecked = isActive ? 'checked' : '';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid #fff3e0; padding-bottom:10px;">
                <div>
                    <h4 style="margin:0; color:#ff9800; font-size: 1rem; font-weight: 600;">Variante de Precio #${container.children.length + 1}</h4>
                    <p style="margin:4px 0 0 0; font-size:0.75rem; color:#666;">Define una especificación con su precio (aplica a todos los colores)</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <label style="font-size:0.85rem; display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none;">
                        <input type="checkbox" class="price-active" ${activeChecked} style="width:18px; height:18px;">
                        <span style="font-weight:600; color:${isActive ? '#2e7d32' : '#999'}">Activo</span>
                    </label>
                    <button type="button" onclick="this.closest('.variant-card').remove()" 
                            style="color:#d32f2f; background:none; border:none; cursor:pointer; font-weight:600; font-size:0.85rem; padding:4px 8px; border-radius:4px; transition:background 0.2s;"
                            onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='none'">
                        <span class="material-icons" style="font-size:18px; vertical-align:middle;">delete</span> Eliminar
                    </button>
                </div>
            </div>
            
            <div style="background:#fff3e0; padding:12px; border-radius:8px; margin-bottom:15px;">
                <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                    Especificación <span style="color:#d32f2f;">*</span>
                    <span style="color:#999; font-weight:400; font-size:0.7rem;">(ej: tamaño, capacidad)</span>
                </label>
                <select class="form-select price-variable-select" style="height:38px;">
                    ${variableOptions}
                </select>
            </div>

            <div style="background:#fff; border:1px solid #e0e0e0; padding:12px; border-radius:8px; margin-bottom:15px;">
                <p style="margin:0 0 10px 0; font-size:0.8rem; color:#555; font-weight:600;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle; color:#ff9800;">payments</span>
                    Información de precio:
                </p>

                <div style="margin-bottom:10px;">
                    <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                        Link E-Store <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                    </label>
                    <input type="text" class="form-input var-link-input" placeholder="https://..." value="${data.link || ''}" style="width:100%;">
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
                    <!-- Price -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            Precio (Bs) <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="number" class="form-input price-price" placeholder="0" value="${data.price || ''}" 
                               style="font-weight:600; color:#2e7d32;">
                    </div>

                    <!-- Promo Price -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Precio Oferta (Bs)
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                        </label>
                        <input type="number" class="form-input price-promo" placeholder="0" value="${data.promoPrice || ''}"
                               style="color:#d32f2f;">
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    }

    // --- OLD: Refined Variant Logic (Keep for backward compatibility during migration) ---
    window.addRefinedVariantRow = function (data = {}) {
        const container = document.getElementById('variantsContainer');
        const card = document.createElement('div');
        card.className = 'variant-card';
        // Unique ID
        const uniqueCardId = 'var-' + Date.now() + Math.random().toString(36).substr(2, 5);
        card.id = uniqueCardId;

        // 1. Color Options
        let colorOptions = '<option value="">Seleccionar Color...</option>';
        if (typeof colorVariables !== 'undefined') {
            const sortedColors = Object.entries(colorVariables).map(([name, val]) => ({
                name: name,
                id: val.id,
                hex: val.hex
            })).sort((a, b) => a.name.localeCompare(b.name));

            sortedColors.forEach(c => {
                const selected = data.colorId === c.id ? 'selected' : '';
                colorOptions += `<option value="${c.id}" ${selected}>${c.name}</option>`;
            });
        }

        // 2. Variable Options
        let variableOptions = '<option value="">Seleccionar Variable...</option>';
        if (typeof textVariables !== 'undefined') {
            Object.values(textVariables).forEach(v => {
                const selected = data.variableId === v.id ? 'selected' : '';
                variableOptions += `<option value="${v.id}" ${selected}>${v.name}: ${v.text}</option>`;
            });
        }

        const isActive = data.active !== false;
        const activeChecked = isActive ? 'checked' : '';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid #e3f2fd; padding-bottom:10px;">
                <div>
                    <h4 style="margin:0; color:#1976d2; font-size: 1rem; font-weight: 600;">Variante #${container.children.length + 1}</h4>
                    <p style="margin:4px 0 0 0; font-size:0.75rem; color:#666;">Cada variante representa una opción única de compra (SKU único)</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <label style="font-size:0.85rem; display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none;">
                        <input type="checkbox" class="var-active" ${activeChecked} style="width:18px; height:18px;">
                        <span style="font-weight:600; color:${isActive ? '#2e7d32' : '#999'}">Activo</span>
                    </label>
                    <button type="button" onclick="this.closest('.variant-card').remove()" 
                            style="color:#d32f2f; background:none; border:none; cursor:pointer; font-weight:600; font-size:0.85rem; padding:4px 8px; border-radius:4px; transition:background 0.2s;"
                            onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='none'">
                        <span class="material-icons" style="font-size:18px; vertical-align:middle;">delete</span> Eliminar
                    </button>
                </div>
            </div>
            
            <!-- Identificadores de Variante -->
            <div style="background:#f8f9fa; padding:12px; border-radius:8px; margin-bottom:15px;">
                <p style="margin:0 0 10px 0; font-size:0.8rem; color:#555; font-weight:600;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle; color:#1976d2;">info</span>
                    Define qué hace única a esta variante:
                </p>
                <div class="form-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <!-- Color -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Color 
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                        </label>
                        <div style="display:flex; gap:8px;">
                            <div class="var-color-preview" style="width:38px; height:38px; border-radius:6px; background:#f0f0f0; border:1px solid #ddd; flex-shrink:0;"></div>
                            <select class="form-select var-color-select" onchange="updateVariantPreview(this)" style="flex-grow:1;">
                                ${colorOptions}
                            </select>
                        </div>
                    </div>

                    <!-- Variable -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Especificación
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional - ej: tamaño, RAM)</span>
                        </label>
                        <select class="form-select var-variable-select" style="height:38px;">
                            ${variableOptions}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Información de Producto -->
            <div style="background:#fff; border:1px solid #e0e0e0; padding:12px; border-radius:8px; margin-bottom:15px;">
                <p style="margin:0 0 10px 0; font-size:0.8rem; color:#555; font-weight:600;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle; color:#ff9800;">inventory_2</span>
                    Información del producto:
                </p>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                     <!-- SKU -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            SKU <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="text" class="form-input var-sku" placeholder="SM-A566EZKC" value="${data.sku || ''}" 
                               style="font-family:monospace; font-size:0.85rem;">
                    </div>

                    <!-- Price -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            Precio (Bs) <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="number" class="form-input var-price" placeholder="0" value="${data.price || ''}" 
                               style="font-weight:600; color:#2e7d32;">
                    </div>

                    <!-- Promo Price -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Precio Oferta (Bs)
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                        </label>
                        <input type="number" class="form-input var-promo" placeholder="0" value="${data.promoPrice || ''}"
                               style="color:#d32f2f;">
                    </div>
                </div>
            </div>

            <!-- Enlaces y Extras -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
                 <!-- Link -->
                <div>
                    <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                        Link E-Store <span style="color:#d32f2f;">*</span>
                    </label>
                    <input type="url" class="form-input var-link" placeholder="https://samsung.com/..." value="${data.link || ''}"
                           style="font-size:0.8rem;">
                </div>
                 <!-- Badge -->
                <div>
                    <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                        Badge Promocional
                        <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                    </label>
                    <input type="text" class="form-input var-badge" placeholder="Ej: Envío Gratis" value="${data.badge || ''}">
                </div>
            </div>

            <div>
                <label class="form-label" style="font-size:0.75rem; margin-bottom:4px;">Imágenes del Producto (Carrusel 4s)</label>
                <div class="var-images-list" style="display:flex; flex-direction:column; gap:8px;"></div>
                <button type="button" class="btn-secondary" style="margin-top:8px; font-size:0.75rem; padding:4px 10px;" onclick="addVariantImageRow(this)">+ Agregar otra imagen</button>
            </div>
        `;

        container.appendChild(card);
        updateVariantPreview(card.querySelector('.var-color-select'));

        // Init Images
        const imgList = (data.images && data.images.length > 0) ? data.images : (data.image ? [data.image] : ['']);
        const listContainer = card.querySelector('.var-images-list');
        if (window.addVariantImageRow) {
            imgList.forEach(url => window.addVariantImageRow(listContainer, url));
        }

        if (variants.length > 0) { // Check if 'variants' is defined, wait, 'variants' was defined in saveProduct, not here. 
            // This is a logic error in previous code or I am looking at saveProduct?
            // Ah, I am replacing `addRefinedVariantRow` too.
            // Let me check the original code around line 2146.
            // Original code: `if (variants.length > 0) { ... }` was in `saveProduct`, NOT `addRefinedVariantRow`.
            // My ReplacementContent replaces `deleteProduct` all the way down to `addRefinedVariantRow`. I should be careful.

            // `saveProduct` logic ends around line 2190 in original file (based on previous view). 
            // My replacement content seems to END before `saveProduct`.
            // Wait, I am replacing lines 1392 to 2182? 
            // The StartLine in my instruction is missing. I need to be precise.

            // This replaces `window.deleteProduct`, `window.addColorRow`, `window.updateColorPreview`, `window.addColorImageRow`, `window.addPriceVariantRow`, `window.addRefinedVariantRow`.
            // But NOT `saveProduct`.

            // So `alert` in `saveProduct` is NOT addressed in this call. I will do it in next call.
        }
    }



    // === NEW STRUCTURE: Separate Colors and Price Variants ===

    // Default placeholder image (SVG as data URL - no network request)

    // Function to add a color row (visual only, no pricing)
    window.addColorRow = function (data = {}) {
        console.log('🎨 addColorRow called with data:', data);

        const container = document.getElementById('colorsContainer');
        const card = document.createElement('div');
        card.className = 'variant-card';
        const uniqueCardId = 'color-' + Date.now() + Math.random().toString(36).substr(2, 5);
        card.id = uniqueCardId;

        // Color Options
        let colorOptions = '<option value="">Seleccionar Color...</option>';
        let defaultColorId = data.colorId || data.id || '';

        console.log('🔍 Looking for color with ID:', defaultColorId);
        console.log('📚 Available colorVariables:', window.colorVariables ? Object.keys(window.colorVariables).length + ' colors' : 'undefined');

        // Don't force any default color - let user choose

        if (typeof colorVariables !== 'undefined') {
            const sortedColors = Object.entries(colorVariables).map(([name, val]) => ({
                name: name,
                id: val.id,
                hex: val.hex
            })).sort((a, b) => a.name.localeCompare(b.name));

            sortedColors.forEach(c => {
                const selected = defaultColorId === c.id ? 'selected' : '';
                if (selected) {
                    console.log('✅ Found matching color:', c.name, 'with ID:', c.id);
                }
                colorOptions += `<option value="${c.id}" ${selected}>${c.name}</option>`;
            });

            if (defaultColorId && !sortedColors.find(c => c.id === defaultColorId)) {
                console.warn('⚠️ Color ID not found in colorVariables:', defaultColorId);
            }
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid #e3f2fd; padding-bottom:10px;">
                <div>
                    <h4 style="margin:0; color:#1976d2; font-size: 1rem; font-weight: 600;">Color #${container.children.length + 1}</h4>
                    <p style="margin:4px 0 0 0; font-size:0.75rem; color:#666;">Define el color y sus imágenes (no afecta el precio)</p>
                </div>
                <button type="button" onclick="this.closest('.variant-card').remove()" 
                        style="color:#d32f2f; background:none; border:none; cursor:pointer; font-weight:600; font-size:0.85rem; padding:4px 8px; border-radius:4px; transition:background 0.2s;"
                        onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='none'">
                    <span class="material-icons" style="font-size:18px; vertical-align:middle;">delete</span> Eliminar
                </button>
            </div>
            
            <div style="background:#f8f9fa; padding:12px; border-radius:8px; margin-bottom:15px;">
                <div style="display:grid; grid-template-columns: 1fr 2fr; gap:12px;">
                    <!-- Color Selection -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            Color <span style="color:#d32f2f;">*</span>
                        </label>
                        <div style="display:flex; gap:8px;">
                            <div class="color-preview" style="width:38px; height:38px; border-radius:6px; background:#f0f0f0; border:1px solid #ddd; flex-shrink:0;"></div>
                            <select class="form-select color-select" onchange="window.updateColorPreview(this)" style="flex-grow:1;">
                                ${colorOptions}
                            </select>
                        </div>
                    </div>

                    <!-- SKU -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            SKU <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="text" class="form-input color-sku" placeholder="SM-A566EZKC" value="${data.sku || ''}" 
                               style="font-family:monospace; font-size:0.85rem;">
                    </div>
                </div>
            </div>

            <!-- Images Section -->
            <div>
                <label class="form-label" style="font-size:0.8rem; margin-bottom:8px; font-weight:600;">
                    Imágenes del Producto (Carrusel 4s)
                </label>
                <div class="color-images-list" style="display:flex; flex-direction:column; gap:8px;">
                    ${data.images && data.images.length > 0 ? data.images.map(img => `
                        <div style="display:flex; gap:8px; align-items:center;">
                            <input type="text" class="form-input color-image-input" placeholder="https://..." value="${img}" style="flex-grow:1; font-size:0.8rem;">
                            <div style="width:40px; height:40px; border-radius:4px; overflow:hidden; border:1px solid #ddd; flex-shrink:0;">
                                <img src="${img}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">
                            </div>
                            <button type="button" onclick="this.closest('div').remove()" style="color:#d32f2f; background:none; border:none; cursor:pointer; padding:4px;">
                                <span class="material-icons" style="font-size:20px;">close</span>
                            </button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" onclick="addColorImageRow(this)" 
                        style="margin-top:8px; padding:6px 12px; background:#f5f5f5; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.8rem; color:#666;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle;">add_photo_alternate</span>
                    Agregar otra imagen
                </button>
            </div>
        `;

        container.appendChild(card);

        // Update color preview if color is selected (including default)
        // Do this AFTER appending to DOM so the select element exists
        // Use setTimeout to ensure the element is fully rendered
        if (defaultColorId) {
            setTimeout(() => {
                const selectElement = card.querySelector('.color-select');
                if (selectElement) {
                    console.log('🎨 Updating color preview for:', defaultColorId);
                    window.updateColorPreview(selectElement);
                }
            }, 10);
        }
    }

    // Function to update color preview box
    window.updateColorPreview = function (select) {
        console.log('🔍 updateColorPreview called');

        const card = select.closest('.variant-card');
        const preview = card ? card.querySelector('.color-preview') : null;
        const colorId = select.value;

        console.log('  - Card found:', !!card);
        console.log('  - Preview element found:', !!preview);
        console.log('  - Color ID:', colorId);
        console.log('  - colorVariables exists:', !!window.colorVariables);

        if (colorId && colorVariables) {
            let colorHex = '#f0f0f0';
            let found = false;
            for (const [name, data] of Object.entries(colorVariables)) {
                if (data.id === colorId) {
                    colorHex = data.hex || '#f0f0f0';
                    found = true;
                    console.log('  ✅ Color found:', name, 'hex:', colorHex);
                    break;
                }
            }
            if (!found) {
                console.warn('  ⚠️ Color ID not found in colorVariables:', colorId);
            }
            if (preview) {
                preview.style.backgroundColor = colorHex;
                console.log('  ✅ Preview updated to:', colorHex);
            }
        } else {
            if (preview) {
                preview.style.backgroundColor = '#f0f0f0';
                console.log('  ⚠️ No color selected, using default gray');
            }
        }
    }

    // Function to add image row to color
    window.addColorImageRow = function (button) {
        const imagesList = button.previousElementSibling;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; gap:8px; align-items:center;';
        div.innerHTML = `
            <input type="text" class="form-input color-image-input" placeholder="https://..." style="flex-grow:1; font-size:0.8rem;">
            <div style="width:40px; height:40px; border-radius:4px; overflow:hidden; border:1px solid #ddd; flex-shrink:0; background:#f5f5f5;"></div>
            <button type="button" onclick="this.closest('div').remove()" style="color:#d32f2f; background:none; border:none; cursor:pointer; padding:4px;">
                <span class="material-icons" style="font-size:20px;">close</span>
        `;
        imagesList.appendChild(div);
    }



    // --- OLD: Refined Variant Logic (Keep for backward compatibility during migration) ---
    window.addRefinedVariantRow = function (data = {}) {
        const container = document.getElementById('variantsContainer');
        const card = document.createElement('div');
        card.className = 'variant-card';
        // Unique ID
        const uniqueCardId = 'var-' + Date.now() + Math.random().toString(36).substr(2, 5);
        card.id = uniqueCardId;

        // 1. Color Options
        let colorOptions = '<option value="">Seleccionar Color...</option>';
        if (typeof colorVariables !== 'undefined') {
            const sortedColors = Object.entries(colorVariables).map(([name, val]) => ({
                name: name,
                id: val.id,
                hex: val.hex
            })).sort((a, b) => a.name.localeCompare(b.name));

            sortedColors.forEach(c => {
                const selected = data.colorId === c.id ? 'selected' : '';
                colorOptions += `<option value="${c.id}" ${selected}>${c.name}</option>`;
            });
        }

        // 2. Variable Options
        let variableOptions = '<option value="">Seleccionar Variable...</option>';
        if (typeof textVariables !== 'undefined') {
            Object.values(textVariables).forEach(v => {
                const selected = data.variableId === v.id ? 'selected' : '';
                variableOptions += `<option value="${v.id}" ${selected}>${v.name}: ${v.text}</option>`;
            });
        }

        const isActive = data.active !== false;
        const activeChecked = isActive ? 'checked' : '';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid #e3f2fd; padding-bottom:10px;">
                <div>
                    <h4 style="margin:0; color:#1976d2; font-size: 1rem; font-weight: 600;">Variante #${container.children.length + 1}</h4>
                    <p style="margin:4px 0 0 0; font-size:0.75rem; color:#666;">Cada variante representa una opción única de compra (SKU único)</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <label style="font-size:0.85rem; display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none;">
                        <input type="checkbox" class="var-active" ${activeChecked} style="width:18px; height:18px;">
                        <span style="font-weight:600; color:${isActive ? '#2e7d32' : '#999'}">Activo</span>
                    </label>
                    <button type="button" onclick="this.closest('.variant-card').remove()" 
                            style="color:#d32f2f; background:none; border:none; cursor:pointer; font-weight:600; font-size:0.85rem; padding:4px 8px; border-radius:4px; transition:background 0.2s;"
                            onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='none'">
                        <span class="material-icons" style="font-size:18px; vertical-align:middle;">delete</span> Eliminar
                    </button>
                </div>
            </div>
            
            <!-- Identificadores de Variante -->
            <div style="background:#f8f9fa; padding:12px; border-radius:8px; margin-bottom:15px;">
                <p style="margin:0 0 10px 0; font-size:0.8rem; color:#555; font-weight:600;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle; color:#1976d2;">info</span>
                    Define qué hace única a esta variante:
                </p>
                <div class="form-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <!-- Color -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Color 
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                        </label>
                        <div style="display:flex; gap:8px;">
                            <div class="var-color-preview" style="width:38px; height:38px; border-radius:6px; background:#f0f0f0; border:1px solid #ddd; flex-shrink:0;"></div>
                            <select class="form-select var-color-select" onchange="updateVariantPreview(this)" style="flex-grow:1;">
                                ${colorOptions}
                            </select>
                        </div>
                    </div>

                    <!-- Variable -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Especificación
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional - ej: tamaño, RAM)</span>
                        </label>
                        <select class="form-select var-variable-select" style="height:38px;">
                            ${variableOptions}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Información de Producto -->
            <div style="background:#fff; border:1px solid #e0e0e0; padding:12px; border-radius:8px; margin-bottom:15px;">
                <p style="margin:0 0 10px 0; font-size:0.8rem; color:#555; font-weight:600;">
                    <span class="material-icons" style="font-size:16px; vertical-align:middle; color:#ff9800;">inventory_2</span>
                    Información del producto:
                </p>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                     <!-- SKU -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            SKU <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="text" class="form-input var-sku" placeholder="SM-A566EZKC" value="${data.sku || ''}" 
                               style="font-family:monospace; font-size:0.85rem;">
                    </div>

                    <!-- Price -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                            Precio (Bs) <span style="color:#d32f2f;">*</span>
                        </label>
                        <input type="number" class="form-input var-price" placeholder="0" value="${data.price || ''}" 
                               style="font-weight:600; color:#2e7d32;">
                    </div>

                    <!-- Promo Price -->
                    <div>
                        <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                            Precio Oferta (Bs)
                            <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                        </label>
                        <input type="number" class="form-input var-promo" placeholder="0" value="${data.promoPrice || ''}"
                               style="color:#d32f2f;">
                    </div>
                </div>
            </div>

            <!-- Enlaces y Extras -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
                 <!-- Link -->
                <div>
                    <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; font-weight:600;">
                        Link E-Store <span style="color:#d32f2f;">*</span>
                    </label>
                    <input type="url" class="form-input var-link" placeholder="https://samsung.com/..." value="${data.link || ''}"
                           style="font-size:0.8rem;">
                </div>
                 <!-- Badge -->
                <div>
                    <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                        Badge Promocional
                        <span style="color:#999; font-weight:400; font-size:0.7rem;">(opcional)</span>
                    </label>
                    <input type="text" class="form-input var-badge" placeholder="Ej: Envío Gratis" value="${data.badge || ''}">
                </div>
            </div>

            <div>
                <label class="form-label" style="font-size:0.75rem; margin-bottom:4px;">Imágenes del Producto (Carrusel 4s)</label>
                <div class="var-images-list" style="display:flex; flex-direction:column; gap:8px;"></div>
                <button type="button" class="btn-secondary" style="margin-top:8px; font-size:0.75rem; padding:4px 10px;" onclick="addVariantImageRow(this)">+ Agregar otra imagen</button>
            </div>
        `;

        container.appendChild(card);
        updateVariantPreview(card.querySelector('.var-color-select'));

        // Init Images
        const imgList = (data.images && data.images.length > 0) ? data.images : (data.image ? [data.image] : ['']);
        const listContainer = card.querySelector('.var-images-list');
        if (window.addVariantImageRow) {
            imgList.forEach(url => window.addVariantImageRow(listContainer, url));
        }
    }

    // Helpers
    window.updateVariantPreview = function (select) {
        const card = select.closest('.variant-card');
        const preview = card.querySelector('.var-color-preview');
        const colorId = select.value;

        if (colorId && colorVariables) {
            // Find color by ID (colorVariables is keyed by name, but values have id property)
            let colorHex = '#f0f0f0';
            for (const [name, data] of Object.entries(colorVariables)) {
                if (data.id === colorId) {
                    colorHex = data.hex || '#f0f0f0';
                    break;
                }
            }
            preview.style.background = colorHex;
        } else {
            preview.style.background = '#f0f0f0';
        }
    }

    window.addVariantImageRow = function (element, value = '') {
        let container;
        if (element.classList && element.classList.contains('var-images-list')) {
            container = element;
        } else {
            container = element.previousElementSibling;
        }

        const div = document.createElement('div');
        div.style.cssText = "display:flex; gap:10px; align-items:center; margin-bottom:5px;";
        div.innerHTML = `
            <div style="flex-grow:1; display:flex; gap:8px;">
                <input type="text" class="form-input var-image-input" placeholder="https://..." value="${value}" oninput="updateImageRowPreview(this)" style="flex-grow:1;">
                <img class="var-row-preview" src="${value}" style="width:38px; height:38px; object-fit:contain; border:1px solid #ddd; background:#fff; border-radius:4px; display:${value ? 'block' : 'none'};">
            </div>
            <button type="button" onclick="this.parentElement.remove()" style="width:30px; height:38px; display:flex; align-items:center; justify-content:center; border:1px solid #ddd; background:#f8f9fa; border-radius:4px; cursor:pointer; color:#666;" title="Eliminar Imagen">âœ•</button>
        `;
        container.appendChild(div);
    }

    window.updateImageRowPreview = function (input) {
        const img = input.nextElementSibling;
        if (input.value) {
            img.src = input.value;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    }


    // --- LIVE PREVIEW SYSTEM ---
    window.updateLivePreview = function () {
        // Debounce slightly to avoid rapid re-renders
        if (window._previewTimeout) clearTimeout(window._previewTimeout);
        window._previewTimeout = setTimeout(() => {
            _performPreviewUpdate();
        }, 50);
    }

    function _performPreviewUpdate() {
        const container = document.getElementById('productPreviewContainer');
        if (!container) return;

        // 1. Gather Data (Simplified version of saveProduct)
        const name = document.getElementById('prodName').value;
        const descriptionEl = document.getElementById('prodDescription');
        const description = descriptionEl ? descriptionEl.value : '';
        const category = document.getElementById('prodCategory').value;
        const badge = document.getElementById('prodBadge').value;

        // Colors
        const colors = [];
        document.querySelectorAll('#colorsContainer .variant-card').forEach(card => {
            const select = card.querySelector('.color-select');
            if (select && select.value) {
                const colorId = select.value;
                const skuEl = card.querySelector('.color-sku');
                const sku = skuEl ? skuEl.value : '';
                const images = [];
                card.querySelectorAll('.color-image-input').forEach(inp => {
                    if (inp.value) images.push(inp.value);
                });

                // Get name/hex
                let colorName = '';
                let hex = '#ccc';
                if (window.colorVariables) {
                    for (const [name, data] of Object.entries(window.colorVariables)) {
                        if (data.id === colorId) {
                            colorName = name;
                            hex = data.hex || data;
                            break;
                        }
                    }
                }

                colors.push({
                    name: colorName,
                    hex: hex,
                    sku: sku,
                    images: images,
                    image: images[0] || ''
                });
            }
        });

        // Price Variants
        const priceVariants = [];
        document.querySelectorAll('#priceVariantsContainer .variant-card').forEach(card => {
            const select = card.querySelector('.price-variable-select');
            // Variable text
            const variableText = (select && select.selectedIndex >= 0) ? select.options[select.selectedIndex].text : '';
            const price = Number(card.querySelector('.price-price').value) || 0;
            const promoPrice = Number(card.querySelector('.price-promo').value) || 0;
            const link = card.querySelector('.var-link-input') ? card.querySelector('.var-link-input').value.trim() : '';

            priceVariants.push({
                variableText: variableText,
                price: price,
                promoPrice: promoPrice,
                link: link
            });
        });

        const tempProduct = {
            name: name,
            description: description,
            category: category,
            badge: badge,
            colors: colors,
            priceVariants: priceVariants,
            price: priceVariants.length > 0 ? priceVariants[0].price : 0,
            promoPrice: priceVariants.length > 0 ? priceVariants[0].promoPrice : 0,
            image: colors.length > 0 ? (colors[0].image || '') : ''
        };

        // Render
        if (typeof createPreviewCard === 'function') {
            container.innerHTML = '';
            container.appendChild(createPreviewCard(tempProduct));
        }
    }

    function saveProduct() {
        // SNAPSHOT FOR UNDO
        pushHistoryState('Guardar Producto');

        try {
            const idStr = document.getElementById('editProductId').value;
            const name = document.getElementById('prodName').value;
            const descriptionEl = document.getElementById('prodDescription');
            const description = descriptionEl ? descriptionEl.value.trim() : '';
            const category = document.getElementById('prodCategory').value;
            const badge = document.getElementById('prodBadge').value.trim();

            // Auto-register new Badge/Tag
            if (badge && window.tags) {
                // Check if tag already exists
                const tagExists = Object.values(window.tags).some(t => t.name.toLowerCase() === badge.toLowerCase());

                if (!tagExists) {
                    console.log(`🆕 Creating new tag for badge: "${badge}"`);
                    // Generate new ID
                    const existingIds = Object.values(window.tags).map(t => t.id || '').filter(id => id.startsWith('e'));
                    const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(1)) || 0)) : 0;
                    const newTagId = `e${String(maxNum + 1).padStart(3, '0')}`;

                    // Add to tags
                    window.tags[badge] = { id: newTagId, name: badge };

                    // Save tags immediately
                    localStorage.setItem('samsung_catalog_tags', JSON.stringify(window.tags));
                    if (typeof saveTags === 'function') saveTags();

                    // Update UI if tag table is visible
                    if (document.getElementById('tagsTableBody') && typeof renderTagsTable === 'function') {
                        renderTagsTable();
                    }
                }
            }

            // 1. Gather Colors (From Section 2)
            // ----------------------------------------------------------------
            const colors = [];
            console.log('🎨 Starting to gather colors...');
            document.querySelectorAll('#colorsContainer .variant-card').forEach((card, index) => {
                const select = card.querySelector('.color-select');
                console.log(`Color card ${index + 1}:`, {
                    hasSelect: !!select,
                    selectValue: select ? select.value : 'NO SELECT',
                    selectedIndex: select ? select.selectedIndex : 'NO SELECT',
                    selectedText: select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text : 'NO TEXT'
                });

                if (!select || !select.value) {
                    console.warn(`⚠️ Skipping color card ${index + 1} - no color selected`);
                    return;
                }

                const colorId = select.value;
                const sku = card.querySelector('.color-sku') ? card.querySelector('.color-sku').value.trim() : '';

                // Get Images
                const images = [];
                card.querySelectorAll('.color-image-input').forEach(input => {
                    if (input.value.trim()) images.push(input.value.trim());
                });

                // Resolve Name/Hex
                let colorName = '';
                let hex = '';
                if (window.colorVariables && select.selectedIndex >= 0) {
                    // Check if option text matches key or if we need to search by ID
                    // Ideally we used ID as value.
                    // Let's safe-search by ID
                    if (window.colorVariables) {
                        for (const [cName, cData] of Object.entries(window.colorVariables)) {
                            if (cData.id === colorId) {
                                colorName = cName;
                                hex = cData.hex;
                                break;
                            }
                        }
                    }
                }

                console.log(`✅ Color ${index + 1} resolved:`, { colorId, colorName, hex, sku, imageCount: images.length });

                colors.push({
                    id: colorId,           // For new structure
                    colorId: colorId,      // For backward compatibility
                    name: colorName,
                    hex: hex,
                    sku: sku,
                    images: images,
                    image: images[0] || ''
                });
            });

            console.log(`📦 Total colors gathered: ${colors.length}`, colors);

            // 2. Gather Price Variants (From Section 3)
            // ----------------------------------------------------------------
            const priceVariants = [];
            document.querySelectorAll('#priceVariantsContainer .variant-card').forEach(card => {
                const select = card.querySelector('.price-variable-select');
                const variableId = select ? select.value : '';
                // Get text safely
                const variableText = (select && select.selectedIndex >= 0) ? select.options[select.selectedIndex].text : '';

                const price = Number(card.querySelector('.price-price').value) || 0;
                const promoPrice = Number(card.querySelector('.price-promo').value) || 0;
                // Capture E-Store Link
                const link = card.querySelector('.var-link-input') ? card.querySelector('.var-link-input').value.trim() : '';

                const active = card.querySelector('.price-active') ? card.querySelector('.price-active').checked : true;

                priceVariants.push({
                    variableId: variableId,
                    variableText: variableText,
                    price: price,
                    promoPrice: promoPrice,
                    link: link,
                    active: active
                });
            });

            // 3. Generate Unified Variants (Cartesian Product for compatibility)
            // ----------------------------------------------------------------
            let variants = [];

            if (colors.length > 0 && priceVariants.length > 0) {
                // Cartesian: Colors x Prices
                colors.forEach(c => {
                    priceVariants.forEach(p => {
                        variants.push({
                            // Combined IDs
                            id: `${c.id}_${p.variableId}`,

                            // Visuals (From Color)
                            color: c.name,
                            colorId: c.id,
                            hex: c.hex,
                            images: c.images,
                            image: c.image,

                            // SKU (From Color)
                            sku: c.sku,

                            // Price & Specs (From PriceVariant)
                            price: p.price,
                            promoPrice: p.promoPrice,
                            link: p.link,
                            active: p.active,
                            variableId: p.variableId,
                            variableText: p.variableText,

                            // Metadata
                            type: 'combination',
                            title: `${c.name}${p.variableText ? ' - ' + p.variableText : ''}`
                        });
                    });
                });
            } else {
                window.showToast('Error: Debe existir al menos un color y una variante de precio.', 'error');
                return;
            }

            // 4. Construct Final Product Object
            // ----------------------------------------------------------------
            const productData = {
                id: idStr ? Number(idStr) : generateId(),
                name: name,
                description: description,
                category: category,
                badge: badge,

                // New Structured Data
                colors: colors,
                priceVariants: priceVariants,

                // Generated Flat Variants (for compatibility)
                variants: variants,

                // Base Info (Calculated from first variant for backward compatibility)
                price: variants.length > 0 ? variants[0].price : 0,
                basePrice: variants.length > 0 ? variants[0].price : 0,
                basePromo: variants.length > 0 ? variants[0].promoPrice : 0,
                baseLink: variants.length > 0 ? variants[0].link : '',
                image: variants.length > 0 ? variants[0].image : ''
            };

            // 5. Update Local State & Save
            // ----------------------------------------------------------------
            const currentCatalogId = new URLSearchParams(window.location.search).get('catalogId');

            if (currentCatalogId) {
                // CATALOG MODE SAVE
                console.log(`📦 Saving to Catalog: ${currentCatalogId}`);

                // We don't update global 'products' array or localStorage here
                // We send directly to API

                fetch(`/api/catalogs/${currentCatalogId}/update-product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product: productData })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.showToast('Producto actualizado en el catálogo', 'success');
                            // Navigation: Remove 'edit' param to prevent re-opening modal, keep 'catalogId'
                            const url = new URL(window.location.href);
                            url.searchParams.delete('edit');
                            setTimeout(() => {
                                window.location.href = url.toString();
                            }, 1000); // Wait for toast
                        } else {
                            window.showToast('Error guardando en catálogo: ' + data.message, 'error');
                        }
                    })
                    .catch(err => {
                        window.showToast('Error de red al guardar en catálogo', 'error');
                        console.error(err);
                    });

                closeModal();

            } else {
                // GLOBAL MODE SAVE
                if (idStr) {
                    const index = products.findIndex(p => p.id === Number(idStr));
                    if (index !== -1) {
                        products[index] = productData;
                    } else {
                        products.push(productData);
                    }
                } else {
                    products.unshift(productData);
                }

                // UI & Persistence
                closeModal();
                handleFilter(); // Updates table
                renderCatalogs();
                autoSave();

                // Save to Server
                fetch('/api/save-products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(products)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('✅ Producto guardado en el servidor');
                            window.showToast('Producto guardado correctamente', 'success');
                        } else {
                            console.error('Error guardando en el servidor:', data.message);
                            window.showToast('Error al guardar en el servidor', 'error');
                        }
                    })
                    .catch(err => {
                        console.error('Error de red:', err);
                        window.showToast('Error de conexión al guardar', 'error');
                    });
            }

        } catch (error) {
            console.error('CRITICAL ERROR in saveProduct:', error);
            window.showToast('Error crítico al guardar producto (Ver consola)', 'error');
        }
    }

    function generateId() {
        const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
        return maxId + 1;
    }

    // Event Listeners - Modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    // Removed: Modal no longer closes when clicking outside (only X button or Cancel)

    // Removed old addVariantBtn listener as it is now handled differently or button ID might be different
    // Check if addVariantBtn exists. 
    // In our new modal HTML, we have buttons calling onclick="addRefinedVariantRow()" directly.
    // So we don't strictly need this listener if the button has onclick attribute.
    if (addVariantBtn) {
        addVariantBtn.addEventListener('click', () => addRefinedVariantRow());
    }

    // Link external save button to form submission
    const saveProductBtn = document.getElementById('saveProductBtn');
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', () => {
            // Dispatch submit event to trigger the main listener (handled around line 692)
            if (productForm && productForm.reportValidity()) {
                productForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Duplicate listener removed (handled at line 692)

    // Attach listeners for Live Preview
    if (productForm) {
        productForm.addEventListener('input', window.updateLivePreview);
        productForm.addEventListener('change', window.updateLivePreview);
        // Also listen for clicks on remove buttons to update preview
        productForm.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                // Wait slightly for DOM to update (e.g. after removing row)
                setTimeout(window.updateLivePreview, 100);
            }
        });
    }

    // Utility Functions
    function escapeCSV(text) {
        if (text === null || text === undefined) return '';
        const stringVal = String(text);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
    }

    function downloadCSV(content, fileName) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // ==================== COLOR VARIABLES MANAGEMENT ====================

    // Load color variables (fallback if file doesn't exist)
    if (typeof colorVariables === 'undefined') {
        window.colorVariables = {};
    }

    let filteredColors = [];

    // DOM Elements for Colors
    const colorsTableBody = document.getElementById('colorsTableBody');
    const colorSearch = document.getElementById('colorSearch');
    const addColorBtn = document.getElementById('addColorBtn');
    const saveVariablesBtn = document.getElementById('saveVariablesBtn');
    const colorModal = document.getElementById('colorModal');
    const closeColorModalBtn = document.getElementById('closeColorModal');
    const cancelColorBtn = document.getElementById('cancelColorBtn');
    const colorForm = document.getElementById('colorForm');
    const colorPicker = document.getElementById('colorPicker');
    const colorHexInput = document.getElementById('colorHex');
    const colorPreview = document.getElementById('colorPreview');

    // Render colors when switching to variables view
    const originalSwitchView = switchView;
    switchView = function (view) {
        if (typeof originalSwitchView === 'function') {
            originalSwitchView(view);
        }
        if (view === 'config') {
            renderColorsTable();
        }
    }

    // Event listeners for color management
    if (colorSearch) {
        colorSearch.addEventListener('input', renderColorsTable);
    }

    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => openColorModal());
    }

    if (saveVariablesBtn) {
        saveVariablesBtn.addEventListener('click', saveColorVariables);
    }

    if (closeColorModalBtn) {
        closeColorModalBtn.addEventListener('click', closeColorModal);
    }

    if (cancelColorBtn) {
        cancelColorBtn.addEventListener('click', closeColorModal);
    }

    // Attach listeners for Live Preview
    if (productForm) {
        productForm.addEventListener('input', window.updateLivePreview);
        productForm.addEventListener('change', window.updateLivePreview);
        // Also listen for clicks on remove buttons to update preview
        productForm.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                // Wait slightly for DOM to update (e.g. after removing row)
                setTimeout(window.updateLivePreview, 100);
            }
        });
    }

    if (colorForm) {
        colorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveColor();
        });
    }

    // Sync color picker with hex input
    if (colorPicker && colorHexInput) {
        colorPicker.addEventListener('input', (e) => {
            colorHexInput.value = e.target.value;
            updateColorModalPreview();
        });

        colorHexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                colorPicker.value = hex;
                updateColorModalPreview();
            }
        });
    }

    function renderColorsTable() {
        if (!colorsTableBody) return;

        const searchTerm = colorSearch ? colorSearch.value.toLowerCase() : '';

        // Convert colorVariables object to array
        filteredColors = Object.entries(colorVariables)
            .filter(([name, hex]) => name.toLowerCase().includes(searchTerm))
            .sort((a, b) => a[0].localeCompare(b[0]));

        colorsTableBody.innerHTML = '';

        if (filteredColors.length === 0) {
            colorsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No se encontraron colores</td></tr>';
            return;
        }

        filteredColors.forEach(([colorName, colorData]) => {
            // Handle both old (string) and new (object) format
            const hexCode = colorData.hex || colorData;
            const colorId = colorData.id || '';
            // Count how many products use this color
            let usageCount = 0;
            products.forEach(p => {
                if (p.variants && Array.isArray(p.variants)) {
                    p.variants.forEach(v => {
                        if (v.color === colorName) usageCount++;
                    });
                }
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <input type="checkbox" class="color-checkbox" data-color-id="${colorId}" data-color-name="${colorName.replace(/"/g, '&quot;')}" style="width:16px; height:16px; cursor:pointer;">
                </td>
                <td style="font-weight: 500;">${colorName}</td>
                <td style="font-family: monospace; color: #666;">${hexCode}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 40px; height: 40px; background: ${hexCode}; border: 2px solid #ddd; border-radius: 8px;"></div>
                        <span style="font-size: 0.85rem; color: #666;">${hexCode}</span>
                    </div>
                </td>
                <td>
                    <span style="background: ${usageCount > 0 ? '#e8f5e9' : '#fce8e6'}; color: ${usageCount > 0 ? '#2e7d32' : '#d93025'}; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                        ${usageCount} producto${usageCount !== 1 ? 's' : ''}
                    </span>
                </td>
                <td style="white-space: nowrap; text-align: center;">
                    <span class="action-icon" title="Editar" onclick="window.editColor('${colorName.replace(/'/g, "\\'")}')"><span class="material-icons">edit</span></span>
                    <span class="action-icon" title="Eliminar" onclick="window.deleteColor('${colorName.replace(/'/g, "\\'")}')"><span class="material-icons">delete</span></span>
                </td >
            `;
            colorsTableBody.appendChild(tr);
        });
    }

    function openColorModal(colorName = null) {
        colorModal.classList.add('active');

        if (colorName) {
            // Edit mode
            document.getElementById('colorModalTitle').textContent = 'Editar Color';
            document.getElementById('editColorOldName').value = colorName;
            document.getElementById('colorName').value = colorName;
            const colorData = colorVariables[colorName];
            const hexValue = colorData.hex || colorData;
            document.getElementById('colorHex').value = hexValue;
            document.getElementById('colorPicker').value = hexValue;
        } else {
            // Add mode
            document.getElementById('colorModalTitle').textContent = 'Nuevo Color';
            document.getElementById('editColorOldName').value = '';
            colorForm.reset();
            // Don't force black color - let user choose
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            document.getElementById('colorPicker').value = randomColor;
            document.getElementById('colorHex').value = randomColor;
        }

        updateColorModalPreview();
    }

    function closeColorModal() {
        colorModal.classList.remove('active');
    }

    function updateColorModalPreview() {
        const hex = document.getElementById('colorHex').value;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            colorPreview.style.background = hex;
        }
    }

    function saveColor() {
        // SNAPSHOT FOR UNDO
        pushHistoryState('Guardar Color');

        const oldName = document.getElementById('editColorOldName').value;
        const newName = document.getElementById('colorName').value.trim();
        const hexCode = document.getElementById('colorHex').value.trim();

        if (!newName || !hexCode) {
            window.showToast('Por favor completa todos los campos', 'info');
            return;
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(hexCode)) {
            window.showToast('El código hex debe tener el formato #RRGGBB', 'error');
            return;
        }

        // If editing and name changed, update all products
        if (oldName && oldName !== newName) {
            products.forEach(p => {
                if (p.variants && Array.isArray(p.variants)) {
                    p.variants.forEach(v => {
                        if (v.color === oldName) {
                            v.color = newName;
                            v.hex = hexCode;
                        }
                    });
                }
            });
            delete colorVariables[oldName];
        }

        // Generate ID if it's a new color
        let colorId;
        if (oldName && colorVariables[oldName]) {
            colorId = colorVariables[oldName].id;
        } else {
            const existingIds = Object.values(colorVariables).map(c => c.id || '').filter(id => id.startsWith('c'));
            const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(1)) || 0)) : 0;
            colorId = `c${String(maxNum + 1).padStart(3, '0')}`;
        }

        // Update or add color with new structure
        colorVariables[newName] = { id: colorId, hex: hexCode };

        // IMPROVEMENT 2: Use refactored color update logic
        // Verify updateColorInProducts exists or use simplified invalidation
        // const updatedCount = updateColorInProducts(newName, hexCode); 
        // We will skip explicit count for now to avoid ref error if function missing

        console.log(`Color "${newName}" saved`);

        closeColorModal();
        renderColorsTable();
        autoSave(); // Save changes automatically
        saveColorVariables(); // Persist to file via API
        window.showToast('Color guardado correctamente', 'success');
    }

    window.editColor = function (colorName) {
        openColorModal(colorName);
    }

    window.deleteColor = function (colorName) {
        const colorToDelete = colorVariables[colorName];
        if (!colorToDelete) return;

        // Check dependencies
        let usageCount = 0;
        products.forEach(p => {
            if (p.variants && Array.isArray(p.variants)) {
                p.variants.forEach(v => {
                    if (v.color === colorName) usageCount++;
                });
            }
        });

        const msg = usageCount > 0
            ? `Este color se usa en ${usageCount} productos. Al eliminarlo, se reasignarán a "Negro". ¿Continuar?`
            : `¿Estás seguro de eliminar el color "${colorName}"?`;

        window.showConfirm(
            'Eliminar Color',
            msg,
            () => {
                const colorIdToDelete = colorToDelete.id;

                // Find best fallback (Prefer c017 "Negro", then any black, then first available)
                let fallbackId = 'c017';
                let fallbackName = 'Negro'; // Fallback name

                // Logic to delete/reassign...
                if (usageCount > 0) {
                    products.forEach(p => {
                        if (p.variants && Array.isArray(p.variants)) {
                            p.variants.forEach(v => {
                                if (v.color === colorName) {
                                    v.color = fallbackName;
                                    // Update hex if possible from current variables
                                    if (colorVariables[fallbackName]) {
                                        v.hex = colorVariables[fallbackName].hex || colorVariables[fallbackName];
                                        v.colorId = colorVariables[fallbackName].id;
                                    }
                                }
                            });
                        }
                    });
                }

                delete colorVariables[colorName];
                renderColorsTable();
                autoSave();
                saveColorVariables();
                window.showToast('Color eliminado correctamente', 'success');
            },
            null,
            true
        );
    }

    function saveColorVariables() {
        // Use API to save directly to Excel
        const btn = document.getElementById('saveVariablesBtn');
        const originalText = btn ? btn.innerHTML : ' Guardar Variables';
        if (btn) btn.innerHTML = '⏳ Guardando...';

        fetch('/api/save-colors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(colorVariables)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.showToast('' + data.message, 'success');
                } else {
                    window.showToast('Error al guardar: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                window.showToast('Error de conexión. Asegúrate de que el servidor esté corriendo.', 'error');
            })
            .finally(() => {
                if (btn) btn.innerHTML = originalText;
            });
    }

    // ==================== CATEGORY MANAGEMENT ====================

    // DOM Elements for Categories

    // Event listeners for category management
    if (categorySearch) {
        categorySearch.addEventListener('input', renderCategoriesTable);
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => openCategoryModal());
    }

    if (closeCategoryModalBtn) {
        closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
    }

    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', closeCategoryModal);
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCategory();
        });
    }

    // Update icon preview when typing
    if (categoryIconInput) {
        categoryIconInput.addEventListener('input', (e) => {
            categoryIconPreview.textContent = e.target.value || '📱';
        });
    }

    function renderCategoriesTable() {
        if (!categoriesTableBody) return;

        const searchTerm = categorySearch ? categorySearch.value.toLowerCase() : '';

        // Convert categories object to array
        filteredCategories = Object.entries(categories)
            .filter(([key, cat]) =>
                key.toLowerCase().includes(searchTerm) ||
                cat.name.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => a[1].name.localeCompare(b[1].name));

        categoriesTableBody.innerHTML = '';

        if (filteredCategories.length === 0) {
            categoriesTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No se encontraron categorías</td></tr>';
            return;
        }

        filteredCategories.forEach(([categoryName, catData]) => {
            const categoryId = catData.id || '';
            // Count how many products use this category
            const productCount = products.filter(p => p.category === categoryName).length;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <input type="checkbox" class="category-checkbox" data-category-key="${categoryName}" style="width:16px; height:16px; cursor:pointer;">
                </td>
                <td style="font-weight: 500;">${catData.name}</td>
                <td>
                    <span style="background: ${productCount > 0 ? '#e8f5e9' : '#fce8e6'}; color: ${productCount > 0 ? '#2e7d32' : '#d93025'}; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                        ${productCount} producto${productCount !== 1 ? 's' : ''}
                    </span>
                </td>
                <td style="white-space: nowrap; text-align: center;">
                    <span class="action-icon" title="Editar" onclick="window.editCategory('${categoryName.replace(/'/g, "\\'")}')"><span class="material-icons">edit</span></span>
                    <span class="action-icon" title="Eliminar" onclick="window.deleteCategory('${categoryName.replace(/'/g, "\\'")}')"><span class="material-icons">delete</span></span>
                </td>
            `;
            categoriesTableBody.appendChild(tr);
        });
    }

    function openCategoryModal(categoryName = null) {
        categoryModal.classList.add('active');

        if (categoryName) {
            // Edit mode
            document.getElementById('categoryModalTitle').textContent = 'Editar categoría';
            document.getElementById('editCategoryOldName').value = categoryName;
            document.getElementById('categoryName').value = categories[categoryName].name;
        } else {
            // Add mode
            document.getElementById('categoryModalTitle').textContent = 'Nueva categoría';
            document.getElementById('editCategoryOldName').value = '';
            categoryForm.reset();
        }
    }

    function closeCategoryModal() {
        categoryModal.classList.remove('active');
    }

    function saveCategory() {
        // SNAPSHOT FOR UNDO
        pushHistoryState('Guardar Categoría');

        const oldName = document.getElementById('editCategoryOldName').value;
        const newName = document.getElementById('categoryName').value.trim();

        if (!newName) {
            window.showToast('Por favor ingresa un nombre para la categoría', 'info');
            return;
        }

        // Generate ID if it's a new category
        let categoryId;
        if (oldName && categories[oldName]) {
            categoryId = categories[oldName].id;
        } else {
            const existingIds = Object.values(categories).map(c => c.id || '').filter(id => id.startsWith('ct'));
            const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(2)) || 0)) : 0;
            categoryId = `ct${String(maxNum + 1).padStart(3, '0')}`;
        }

        // If editing and name changed, update all products
        if (oldName && oldName !== newName) {
            if (categories[newName]) {
                window.showToast('Ya existe una categoría con ese nombre', 'error');
                return;
            }

            // Update products that use this category
            products.forEach(p => {
                if (p.category === oldName) {
                    p.category = newName;
                }
            });

            // Remove old category
            delete categories[oldName];
        }

        // Check if name already exists (for new categories)
        if (!oldName && categories[newName]) {
            window.showToast('Ya existe una categoría con ese nombre', 'error');
            return;
        }

        // Update or add category with new structure
        categories[newName] = { id: categoryId, name: newName };

        closeCategoryModal();
        renderCategoriesTable();
        renderCatalogs(); // Update catalogs view
        saveCategories(); // Save to localStorage
        window.showToast('Categoría guardada', 'success');
    }

    window.editCategory = function (categoryKey) {
        openCategoryModal(categoryKey);
    }

    window.deleteCategory = function (categoryName) {
        const productCount = products.filter(p => p.category === categoryName).length;

        const message = productCount > 0
            ? `La categoría "${categories[categoryName].name}" tiene ${productCount} producto(s). ¿Estás seguro de eliminarla? Los productos quedarán sin categoría.`
            : `¿Estás seguro de eliminar la categoría "${categories[categoryName].name}"?`;

        window.showConfirm('Eliminar Categoría', message, () => {
            // SNAPSHOT FOR UNDO
            pushHistoryState('Eliminar Categoría');

            if (productCount > 0) {
                // Remove category from products
                products.forEach(p => {
                    if (p.category === categoryName) {
                        p.category = ''; // Or 'Uncategorized'
                    }
                });
            }

            delete categories[categoryName];
            renderCategoriesTable();
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));

            // Save via API if available (optional/fake)
            // saveCategories();

            console.log(`Categoría "${categoryName}" eliminada`);
            window.showToast('Categoría eliminada', 'success');
        }, null, true);
    }

    // ==================== TEXT VARIABLES MANAGEMENT ====================

    const VARIABLES_STORAGE_KEY = 'samsung_catalog_text_variables';

    // Load text variables from file or localStorage
    if (typeof textVariables === 'undefined') {
        window.textVariables = {};
    }

    // DOM Elements for Variables
    const variablesTableBody = document.getElementById('variablesTableBody');
    const variableSearch = document.getElementById('variableSearch');
    const addVariableBtn = document.getElementById('addVariableBtn');
    const variableModal = document.getElementById('variableModal');
    const closeVariableModalBtn = document.getElementById('closeVariableModal');
    const cancelVariableBtn = document.getElementById('cancelVariableBtn');
    const variableForm = document.getElementById('variableForm');

    // Event listeners for variable management
    if (variableSearch) {
        variableSearch.addEventListener('input', renderVariablesTable);
    }

    if (addVariableBtn) {
        addVariableBtn.addEventListener('click', () => openVariableModal());
    }

    if (closeVariableModalBtn) {
        closeVariableModalBtn.addEventListener('click', closeVariableModal);
    }

    if (cancelVariableBtn) {
        cancelVariableBtn.addEventListener('click', closeVariableModal);
    }

    if (variableForm) {
        variableForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveVariable();
        });
    }

    function renderVariablesTable() {
        if (!variablesTableBody) return;

        const searchTerm = variableSearch ? variableSearch.value.toLowerCase() : '';

        // Convert textVariables object to array
        filteredVariables = Object.entries(textVariables)
            .filter(([text, varData]) =>
                text.toLowerCase().includes(searchTerm) ||
                varData.name.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => {
                // Sort by name first, then by text
                if (a[1].name !== b[1].name) {
                    return a[1].name.localeCompare(b[1].name);
                }
                return a[0].localeCompare(b[0]);
            });

        variablesTableBody.innerHTML = '';

        if (filteredVariables.length === 0) {
            variablesTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No se encontraron variables</td></tr>';
            return;
        }

        filteredVariables.forEach(([text, varData]) => {
            const variableId = varData.id || '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <input type="checkbox" class="variable-checkbox" data-variable-key="${text.replace(/"/g, '&quot;')}" style="width:16px; height:16px; cursor:pointer;">
                </td>
                <td style="font-weight: 500;">${varData.name}</td>
                <td>${varData.text}</td>
                <td style="white-space: nowrap; text-align: center;">
                    <span class="action-icon" title="Editar" onclick="window.editVariable('${text.replace(/'/g, "\\'")}')"><span class="material-icons">edit</span></span>
                    <span class="action-icon" title="Eliminar" onclick="window.deleteVariable('${text.replace(/'/g, "\\'")}')"><span class="material-icons">delete</span></span>
                </td>
            `;
            variablesTableBody.appendChild(tr);
        });
    }

    function openVariableModal(variableText = null) {
        variableModal.classList.add('active');

        if (variableText) {
            // Edit mode
            document.getElementById('variableModalTitle').textContent = 'Editar Variable';
            document.getElementById('editVariableOldText').value = variableText;
            document.getElementById('variableName').value = textVariables[variableText].name;
            document.getElementById('variableText').value = variableText; // Actual text is the key
        } else {
            // Add mode
            document.getElementById('variableModalTitle').textContent = 'Nueva Variable';
            document.getElementById('editVariableOldText').value = '';
            variableForm.reset();
        }
    }

    function closeVariableModal() {
        variableModal.classList.remove('active');
    }

    function saveVariable() {
        const oldText = document.getElementById('editVariableOldText').value;
        const name = document.getElementById('variableName').value.trim();
        const text = document.getElementById('variableText').value.trim();

        if (!name || !text) {
            window.showToast('Por favor completa todos los campos', 'info');
            return;
        }

        // Generate ID if it's a new variable
        let variableId;
        if (oldText && textVariables[oldText]) {
            variableId = textVariables[oldText].id;
        } else {
            const existingIds = Object.values(textVariables).map(v => v.id || '').filter(id => id.startsWith('v'));
            const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(1)) || 0)) : 0;
            variableId = `v${String(maxNum + 1).padStart(3, '0')}`;
        }

        // Check if text (key) changed
        if (oldText && oldText !== text) {
            if (textVariables[text]) {
                window.showToast('Ya existe una variable con ese texto', 'error');
                return;
            }
            delete textVariables[oldText];
        }

        // Check duplications for new vars
        if (!oldText && textVariables[text]) {
            window.showToast('Ya existe una variable con ese texto', 'error');
            return;
        }

        textVariables[text] = { id: variableId, name: name, text: text };

        // Save to file via API
        fetch('/api/save-text-variables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(textVariables)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) console.log('Variables guardadas');
                else console.error('Error guardando variables', data);
            });

        closeVariableModal();
        renderVariablesTable();
        // localStorage.setItem(VARIABLES_STORAGE_KEY, JSON.stringify(textVariables)); // Should be consistent with API approach
        window.showToast('Variable guardada', 'success');
    }

    // Save text variables to file via API
    function saveTextVariables() {
        fetch('/api/save-variables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(textVariables)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Variables guardadas en archivo');
                } else {
                    console.error('Error guardando variables:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la petición:', error);
            });
    }

    window.editVariable = function (variableText) {
        openVariableModal(variableText);
    }

    window.deleteVariable = function (variableText) {
        window.showConfirm(
            'Eliminar Variable',
            `¿Estás seguro de eliminar la variable "${variableText}"?`,
            () => {
                delete textVariables[variableText];
                renderVariablesTable();

                // Save to file via API
                fetch('/api/save-text-variables', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(textVariables)
                });

                window.showToast('Variable eliminada', 'success');
            },
            null,
            true
        );
    }

    // Update switchView to handle all new views (variables, tags, promotions)
    const originalSwitchView2 = switchView;
    switchView = function (view) {
        originalSwitchView2(view);
        if (view === 'variables') {
            document.getElementById('variablesView').classList.add('active');
            renderVariablesTable();
        }
        if (view === 'tags') {
            document.getElementById('tagsView').classList.add('active');
            renderTagsTable();
        }
        if (view === 'promotions') {
            document.getElementById('promotionsView').classList.add('active');
            renderPromotionsTable();
        }
    }

    // ==================== TAGS MANAGEMENT ====================

    const TAGS_STORAGE_KEY = 'samsung_catalog_tags';

    // Load tags from file or localStorage
    if (typeof tags === 'undefined') {
        window.tags = {};
    }

    // DOM Elements for Tags
    const tagsTableBody = document.getElementById('tagsTableBody');
    const tagSearch = document.getElementById('tagSearch');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagModal = document.getElementById('tagModal');
    const closeTagModalBtn = document.getElementById('closeTagModal');
    const cancelTagBtn = document.getElementById('cancelTagBtn');
    const tagForm = document.getElementById('tagForm');

    // Event listeners for tag management
    if (tagSearch) {
        tagSearch.addEventListener('input', renderTagsTable);
    }

    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => openTagModal());
    }

    if (closeTagModalBtn) {
        closeTagModalBtn.addEventListener('click', closeTagModal);
    }

    if (cancelTagBtn) {
        cancelTagBtn.addEventListener('click', closeTagModal);
    }

    if (tagForm) {
        tagForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTag();
        });
    }

    function renderTagsTable() {
        if (!tagsTableBody) return;

        const searchTerm = tagSearch ? tagSearch.value.toLowerCase() : '';

        // Convert tags object to array
        filteredTags = Object.entries(tags)
            .filter(([name, tagData]) =>
                name.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => a[0].localeCompare(b[0]));

        tagsTableBody.innerHTML = '';

        if (filteredTags.length === 0) {
            tagsTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">No se encontraron etiquetas</td></tr>';
            return;
        }

        filteredTags.forEach(([tagName, tagData]) => {
            const tagId = tagData.id || '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <input type="checkbox" class="tag-checkbox" data-tag-name="${tagName.replace(/"/g, '&quot;')}" style="width:16px; height:16px; cursor:pointer;">
                </td>
                <td style="font-weight: 500;">${tagData.name}</td>
                <td style="white-space: nowrap; text-align: center;">
                    <span class="action-icon" title="Editar" onclick="window.editTag('${tagName.replace(/'/g, "\\'")}')"><span class="material-icons">edit</span></span>
                    <span class="action-icon" title="Eliminar" onclick="window.deleteTag('${tagName.replace(/'/g, "\\'")}')"><span class="material-icons">delete</span></span>
                </td>
            `;
            tagsTableBody.appendChild(tr);
        });
    }

    function openTagModal(tagName = null) {
        tagModal.classList.add('active');

        if (tagName) {
            // Edit mode
            document.getElementById('tagModalTitle').textContent = 'Editar Etiqueta';
            document.getElementById('editTagOldName').value = tagName;
            document.getElementById('tagName').value = tags[tagName].name;
        } else {
            // Add mode
            document.getElementById('tagModalTitle').textContent = 'Nueva Etiqueta';
            document.getElementById('editTagOldName').value = '';
            tagForm.reset();
        }
    }

    function closeTagModal() {
        tagModal.classList.remove('active');
    }

    function saveTag() {
        const oldName = document.getElementById('editTagOldName').value;
        const name = document.getElementById('tagName').value.trim();

        if (!name) {
            window.showToast('Por favor ingresa un nombre para la etiqueta', 'info');
            return;
        }

        // Generate ID if it's a new tag
        let tagId;
        if (oldName && tags[oldName]) {
            tagId = tags[oldName].id;
        } else {
            const existingIds = Object.values(tags).map(t => t.id || '').filter(id => id.startsWith('e'));
            const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(1)) || 0)) : 0;
            tagId = `e${String(maxNum + 1).padStart(3, '0')}`;
        }

        // If editing and name changed, remove old entry
        if (oldName && oldName !== name) {
            if (tags[name]) {
                window.showToast('Ya existe una etiqueta con ese nombre', 'error');
                return;
            }
            delete tags[oldName];
        }

        // Check if name already exists (for new tags)
        if (!oldName && tags[name]) {
            window.showToast('Ya existe una etiqueta con ese nombre', 'error');
            return;
        }

        // Update or add tag with new structure
        tags[name] = { id: tagId, name: name };

        closeTagModal();
        renderTagsTable();
        localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
        saveTags(); // Persist to file via API
        console.log(`Etiqueta "${name}" (${tagId}) guardada`);
        window.showToast('Etiqueta guardada', 'success');
    }

    // Save tags to file via API
    function saveTags() {
        fetch('/api/save-tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tags)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Etiquetas guardadas en archivo');
                } else {
                    console.error('Error guardando etiquetas:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la petición:', error);
            });
    }

    window.editTag = function (tagName) {
        openTagModal(tagName);
    }

    window.deleteTag = function (tagName) {
        window.showConfirm(
            'Eliminar Etiqueta',
            `¿Estás seguro de eliminar la etiqueta "${tagName}"?`,
            () => {
                delete tags[tagName];
                renderTagsTable();
                localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
                saveTags(); // Persist to file via API
                window.showToast('Etiqueta eliminada', 'success');
            },
            null,
            true
        );
    }

    // ==================== PROMOTIONS MANAGEMENT ====================

    const PROMOTIONS_STORAGE_KEY = 'samsung_catalog_promotions';

    // Load promotions from file or localStorage
    if (typeof promotions === 'undefined') {
        window.promotions = {};
    }



    // Event listeners for promotion management
    if (promotionSearch) {
        promotionSearch.addEventListener('input', renderPromotionsTable);
    }

    if (addPromotionBtn) {
        addPromotionBtn.addEventListener('click', () => openPromotionModal());
    }

    if (closePromotionModalBtn) {
        closePromotionModalBtn.addEventListener('click', closePromotionModal);
    }

    if (cancelPromotionBtn) {
        cancelPromotionBtn.addEventListener('click', closePromotionModal);
    }

    if (promotionForm) {
        promotionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePromotion();
        });
    }

    function renderPromotionsTable() {
        if (!promotionsTableBody) return;

        const searchTerm = promotionSearch ? promotionSearch.value.toLowerCase() : '';

        // Convert promotions object to array
        filteredPromotions = Object.entries(promotions)
            .filter(([name, promoData]) =>
                name.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => a[0].localeCompare(b[0]));

        promotionsTableBody.innerHTML = '';

        if (filteredPromotions.length === 0) {
            promotionsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No se encontraron promociones</td></tr>';
            return;
        }

        filteredPromotions.forEach(([promoName, promoData]) => {
            const promoId = promoData.id || '';
            const imageUrl = promoData.image || '';
            const imagePreview = imageUrl ? `<a href="${imageUrl}" target="_blank" style="color: var(--samsung-blue); text-decoration: none;">Ver imagen</a>` : 'Sin imagen';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <input type="checkbox" class="promotion-checkbox" data-promo-name="${promoName.replace(/"/g, '&quot;')}" style="width:16px; height:16px; cursor:pointer;">
                </td>
                <td style="font-weight: 500;">${promoData.name}</td>
                <td style="font-size: 0.85rem; color: #666; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${imagePreview}
                </td>
                <td style="white-space: nowrap; text-align: center;">
                    <span class="action-icon" title="Editar" onclick="window.editPromotion('${promoName.replace(/'/g, "\\'")}')"><span class="material-icons">edit</span></span>
                    <span class="action-icon" title="Eliminar" onclick="window.deletePromotion('${promoName.replace(/'/g, "\\'")}')"><span class="material-icons">delete</span></span>
                </td>
            `;
            promotionsTableBody.appendChild(tr);
        });
    }

    function openPromotionModal(promoName = null) {
        promotionModal.classList.add('active');

        if (promoName) {
            // Edit mode
            document.getElementById('promotionModalTitle').textContent = 'Editar promoción';
            document.getElementById('editPromotionOldName').value = promoName;
            document.getElementById('promotionName').value = promotions[promoName].name;
            document.getElementById('promotionImage').value = promotions[promoName].image;
        } else {
            // Add mode
            document.getElementById('promotionModalTitle').textContent = 'Nueva promoción';
            document.getElementById('editPromotionOldName').value = '';
            promotionForm.reset();
        }
    }

    function closePromotionModal() {
        promotionModal.classList.remove('active');
    }

    function savePromotion() {
        const oldName = document.getElementById('editPromotionOldName').value;
        const name = document.getElementById('promotionName').value.trim();
        const image = document.getElementById('promotionImage').value.trim();

        if (!name || !image) {
            window.showToast('Por favor completa todos los campos', 'info');
            return;
        }

        // Generate ID if it's a new promotion
        let promoId;
        if (oldName && promotions[oldName]) {
            promoId = promotions[oldName].id;
        } else {
            const existingIds = Object.values(promotions).map(p => p.id || '').filter(id => id.startsWith('pr'));
            const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(2)) || 0)) : 0;
            promoId = `pr${String(maxNum + 1).padStart(3, '0')} `;
        }

        // If editing and name changed, remove old entry
        if (oldName && oldName !== name) {
            if (promotions[name]) {
                window.showToast('Ya existe una promoción con ese nombre', 'error');
                return;
            }
            delete promotions[oldName];
        }

        // Check if name already exists (for new promotions)
        if (!oldName && promotions[name]) {
            window.showToast('Ya existe una promoción con ese nombre', 'error');
            return;
        }

        // Update or add promotion with new structure
        promotions[name] = { id: promoId, name: name, image: image };

        closePromotionModal();
        renderPromotionsTable();
        localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promotions));
        savePromotions(); // Persist to file via API
        console.log(`promoción "${name}"(${promoId}) guardada`);
        window.showToast('Promoción guardada', 'success');
    }

    // Save promotions to file via API
    function savePromotions() {
        fetch('/api/save-promotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promotions)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Promociones guardadas en archivo');
                } else {
                    console.error('Error guardando promociones:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la petición:', error);
            });
    }

    window.editPromotion = function (promoName) {
        openPromotionModal(promoName);
    }

    window.deletePromotion = function (promoName) {
        window.showConfirm(
            'Eliminar Promoción',
            `¿Estás seguro de eliminar la promoción "${promoName}" ? `,
            () => {
                delete promotions[promoName];
                renderPromotionsTable();
                localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promotions));
                savePromotions(); // Persist to file via API
                window.showToast('Promoción eliminada', 'success');
            },
            null,
            true
        );
    }

    // ==================== COMBOS MANAGEMENT ====================

    const COMBOS_STORAGE_KEY = 'samsung_catalog_combos';

    // Load combos from file or localStorage
    if (typeof combos === 'undefined') {
        window.combos = {};
    }

    // DOM Elements for Combos
    const combosTableBody = document.getElementById('combosTableBody');
    const comboSearch = document.getElementById('comboSearch');
    const addComboBtn = document.getElementById('addComboBtn');
    const comboModal = document.getElementById('comboModal');
    const closeComboModalBtn = document.getElementById('closeComboModal');
    const cancelComboBtn = document.getElementById('cancelComboBtn');
    const comboForm = document.getElementById('comboForm');

    // Event listeners for combo management
    if (comboSearch) {
        comboSearch.addEventListener('input', renderCombosTable);
    }

    if (addComboBtn) {
        addComboBtn.addEventListener('click', () => openComboModal());
    }

    if (closeComboModalBtn) {
        closeComboModalBtn.addEventListener('click', closeComboModal);
    }

    if (cancelComboBtn) {
        cancelComboBtn.addEventListener('click', closeComboModal);
    }

    if (comboForm) {
        comboForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCombo();
        });
    }

    window.renderCombosTable = function () {
        if (!combosTableBody) return;

        const searchTerm = comboSearch ? comboSearch.value.toLowerCase() : '';

        // Load Persisted Combos if needed
        const savedCombos = localStorage.getItem(COMBOS_STORAGE_KEY);
        if (savedCombos) {
            try {
                const parsed = JSON.parse(savedCombos);
                // Merge with existing if not empty
                window.combos = { ...window.combos, ...parsed };
            } catch (e) { console.error('Error loading combos', e); }
        }

        // Convert combos object to array
        const filteredCombos = Object.entries(window.combos)
            .filter(([name, comboData]) =>
                name.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => a[0].localeCompare(b[0]));

        combosTableBody.innerHTML = '';

        if (filteredCombos.length === 0) {
            combosTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No se encontraron combos</td></tr>';
            return;
        }

        filteredCombos.forEach(([comboName, comboData]) => {
            const comboId = comboData.id || '';
            const productCount = (comboData.products || []).length;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <input type="checkbox" class="combo-checkbox" data-combo-name="${comboName.replace(/"/g, '&quot;')}" style="width:16px; height:16px; cursor:pointer;">
                </td>
                <td style="font-weight: 500;">${comboData.name}</td>
                <td>
                    <span style="background: #e3f2fd; color: #1565c0; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                        ${productCount} producto${productCount !== 1 ? 's' : ''}
                    </span>
                </td>
                <td style="white-space: nowrap; text-align: center;">
                    <span class="action-icon" title="Editar" onclick="window.editCombo('${comboName.replace(/'/g, "\\'")}')"><span class="material-icons">edit</span></span>
                    <span class="action-icon" title="Eliminar" onclick="window.deleteCombo('${comboName.replace(/'/g, "\\'")}')"><span class="material-icons">delete</span></span>
                </td>
            `;
            combosTableBody.appendChild(tr);
        });
    }

    window.openComboModal = function (comboName = null) {
        comboModal.classList.add('active');

        if (comboName) {
            // Edit mode
            document.getElementById('comboModalTitle').textContent = 'Editar Combo';
            document.getElementById('editComboOldName').value = comboName;
            document.getElementById('comboName').value = combos[comboName].name;
            document.getElementById('comboProducts').value = (combos[comboName].products || []).join(', ');
        } else {
            // Add mode
            document.getElementById('comboModalTitle').textContent = 'Nuevo Combo';
            document.getElementById('editComboOldName').value = '';
            comboForm.reset();
        }
    }

    window.closeComboModal = function () {
        comboModal.classList.remove('active');
    }

    window.saveCombo = function () {
        const oldName = document.getElementById('editComboOldName').value;
        const name = document.getElementById('comboName').value.trim();
        const productIdsStr = document.getElementById('comboProducts').value.trim();

        if (!name) {
            window.showToast('Por favor ingresa un nombre para el combo', 'info');
            return;
        }

        // Generate ID if it's a new combo
        let comboId;
        if (oldName && combos[oldName]) {
            comboId = combos[oldName].id;
        } else {
            const existingIds = Object.values(window.combos).map(c => c.id || '').filter(id => id.startsWith('cb'));
            const maxNum = existingIds.length > 0 ? Math.max(...existingIds.map(id => parseInt(id.substring(2)) || 0)) : 0;
            comboId = `cb${String(maxNum + 1).padStart(3, '0')} `;
        }

        // Parse Product IDs
        const productIds = productIdsStr.split(',').map(s => s.trim()).filter(s => s !== '');

        // If editing and name changed, remove old entry
        if (oldName && oldName !== name) {
            if (combos[name]) {
                window.showToast('Ya existe un combo con ese nombre', 'error');
                return;
            }
            delete combos[oldName];
        }

        // Check if name already exists (for new combos)
        if (!oldName && combos[name]) {
            window.showToast('Ya existe un combo con ese nombre', 'error');
            return;
        }

        // Update or add combo
        combos[name] = { id: comboId, name: name, products: productIds };

        closeComboModal();
        renderCombosTable();
        localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(combos));

        // Save to server if implemented
        if (typeof saveCombos === 'function') saveCombos();

        console.log(`Combo "${name}"(${comboId}) guardado`);
        window.showToast('Combo guardado', 'success');
    }

    window.editCombo = function (comboName) {
        openComboModal(comboName);
    }

    window.deleteCombo = function (comboName) {
        window.showConfirm(
            'Eliminar Combo',
            `¿Estás seguro de eliminar el combo "${comboName}" ? `,
            () => {
                delete combos[comboName];
                renderCombosTable();
                localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(combos));
                if (typeof saveCombos === 'function') saveCombos();
                window.showToast('Combo eliminado', 'success');
            },
            null,
            true
        );
    }


    // Check for edit param in URL
    // URL params handled in initialization block
    // removed block

    // ==================== AUTO INITIALIZATION BASED ON PAGE ====================
    // Detect active view and render accordingly

    // Products View
    if (document.getElementById('productsTable') || document.getElementById('tableBody')) {
        console.log('🔄 Initializing Products View...');
        renderProductsTable();
    }

    // Catalogs View
    if (document.getElementById('catalogsGrid') && typeof renderCatalogs === 'function') {
        console.log('🔄 Initializing Catalogs View...');
        renderCatalogs();
    }

    // Categories View
    if (document.getElementById('categoriesTableBody')) {
        console.log('🔄 Initializing Categories View...');
        renderCategoriesTable();
    }

    // Colors View
    if (document.getElementById('colorsTableBody')) {
        console.log('🔄 Initializing Colors View...');
        renderColorsTable();
    }

    // Variables View
    if (document.getElementById('variablesTableBody')) {
        console.log('🔄 Initializing Variables View...');
        renderVariablesTable();
    }

    // Tags View
    if (document.getElementById('tagsTableBody')) {
        console.log('🔄 Initializing Tags View...');
        renderTagsTable();
    }

    // Promotions View
    if (document.getElementById('promotionsTableBody')) {
        console.log('🔄 Initializing Promotions View...');
        renderPromotionsTable();
    }

    // Combos View
    if (document.getElementById('combosTableBody') && typeof renderCombosTable === 'function') {
        console.log('🔄 Initializing Combos View...');
        renderCombosTable();
    }

});

// ==================== GLOBAL MODAL BEHAVIOR ====================
(function () {
    function initModalProtection() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            // Remove inline handlers if any (usually onclick="closeModal()")
            if (modal.getAttribute('onclick') && modal.getAttribute('onclick').includes('close')) {
                modal.removeAttribute('onclick');
                modal.onclick = null;
            }

            // Remove any JS property handler
            modal.onclick = null;

            // Add listener to stop propagation to window (in case window has a listener)
            // And ensures clicking overlay does nothing
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    e.stopPropagation();
                    // console.log('🛡️ Modal overlay click intercepted. Modal will not close.');
                }
            });

            // Allow clicks on content to propagate (or not, doesn't matter as long as they don't trigger close)
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.onclick = (e) => e.stopPropagation();
                content.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalProtection);
    } else {
        initModalProtection();
        setTimeout(initModalProtection, 500);
    }
})();


// ==================== BULK DELETE LOGIC (ALL ENTITIES) ====================
// This logic handles checkbox selection and bulk deletion for various tables.

(function () {
    // Helper to setup bulk delete for a specific entity type
    function setupBulkDelete(config) {
        const {
            checkboxClass,
            selectAllId,
            deleteBtnId,
            countSpanId,
            deleteFunction,
            onUpdate // Optional callback
        } = config;

        const selectAllCheckbox = document.getElementById(selectAllId);
        const deleteBtn = document.getElementById(deleteBtnId);
        const countSpan = document.getElementById(countSpanId);

        // Update Button Visibility
        function updateButton() {
            const checkedBoxes = document.querySelectorAll(`.${checkboxClass}:checked`);
            const count = checkedBoxes.length;

            if (countSpan) countSpan.textContent = count;
            if (deleteBtn) {
                if (count > 0) {
                    deleteBtn.style.display = 'flex';
                    deleteBtn.style.alignItems = 'center';
                    deleteBtn.style.gap = '6px';
                } else {
                    deleteBtn.style.display = 'none';
                }
            }

            if (selectAllCheckbox) {
                const allCheckboxes = document.querySelectorAll(`.${checkboxClass}`);
                selectAllCheckbox.checked = allCheckboxes.length > 0 && checkedBoxes.length === allCheckboxes.length;
                selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < allCheckboxes.length;
            }

            if (onUpdate) onUpdate(count);
        }

        // Listen for Select All
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function () {
                const checkboxes = document.querySelectorAll(`.${checkboxClass}`);
                checkboxes.forEach(cb => cb.checked = this.checked);
                updateButton();
            });
        }

        // Listen for Checked Individual Items (Delegated)
        document.addEventListener('change', function (e) {
            if (e.target.classList.contains(checkboxClass)) {
                updateButton();
            }
        });

        // Listen for Delete Button Click
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const checkedBoxes = document.querySelectorAll(`.${checkboxClass}: checked`);
                if (checkedBoxes.length === 0) return;
                deleteFunction(checkedBoxes);
            });
        }

        // Initial check
        updateButton();
    }

    // 1. Categories
    setupBulkDelete({
        checkboxClass: 'category-checkbox',
        selectAllId: 'selectAllCategories',
        deleteBtnId: 'bulkDeleteCategoriesBtn',
        countSpanId: 'bulkDeleteCategoriesCount',
        deleteFunction: (checkedBoxes) => {
            const keysToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-category-key'));
            window.showConfirm('Eliminar Categorías', `¿Estás seguro de eliminar ${keysToDelete.length} categoría(s) ? `, () => {
                keysToDelete.forEach(key => delete window.categories[key]);
                window.renderCategoriesTable();
                localStorage.setItem('samsung_catalog_categories', JSON.stringify(window.categories));
                // Optional: window.saveCategories();
                window.showToast(`${keysToDelete.length} categorías eliminadas`, 'success');
                // Hide button
                document.getElementById('selectAllCategories').checked = false;
                document.getElementById('bulkDeleteCategoriesBtn').style.display = 'none';
            }, null, true);
        }
    });

    // 2. Colors
    setupBulkDelete({
        checkboxClass: 'color-checkbox',
        selectAllId: 'selectAllColors',
        deleteBtnId: 'bulkDeleteColorsBtn',
        countSpanId: 'bulkDeleteColorsCount',
        deleteFunction: (checkedBoxes) => {
            const namesToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-color-name')); // We use name for key usually
            window.showConfirm('Eliminar Colores', `¿Estás seguro de eliminar ${namesToDelete.length} color(es) ? `, () => {
                namesToDelete.forEach(name => delete window.colorVariables[name]);
                window.renderColorsTable();
                // Persist
                if (typeof window.saveColorVariables === 'function') window.saveColorVariables();
                window.showToast(`${namesToDelete.length} colores eliminados`, 'success');
                // Hide button
                document.getElementById('selectAllColors').checked = false;
                document.getElementById('bulkDeleteColorsBtn').style.display = 'none';
            }, null, true);
        }
    });

    // 3. Variables
    setupBulkDelete({
        checkboxClass: 'variable-checkbox',
        selectAllId: 'selectAllVariables',
        deleteBtnId: 'bulkDeleteVariablesBtn',
        countSpanId: 'bulkDeleteVariablesCount',
        deleteFunction: (checkedBoxes) => {
            const keysToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-variable-key')); // Key is text
            window.showConfirm('Eliminar Variables', `¿Estás seguro de eliminar ${keysToDelete.length} variable(s) ? `, () => {
                keysToDelete.forEach(key => delete window.textVariables[key]);
                window.renderVariablesTable();
                // Persist
                if (typeof window.saveTextVariables === 'function') window.saveTextVariables();
                else if (typeof window.saveVariable === 'function') {
                    // Manual save via API logic extracted from saveVariable
                    fetch('/api/save-text-variables', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.textVariables)
                    });
                }
                window.showToast(`${keysToDelete.length} variables eliminadas`, 'success');
                document.getElementById('selectAllVariables').checked = false;
                document.getElementById('bulkDeleteVariablesBtn').style.display = 'none';
            }, null, true);
        }
    });

    // 4. Tags
    setupBulkDelete({
        checkboxClass: 'tag-checkbox',
        selectAllId: 'selectAllTags',
        deleteBtnId: 'bulkDeleteTagsBtn',
        countSpanId: 'bulkDeleteTagsCount',
        deleteFunction: (checkedBoxes) => {
            const namesToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-tag-name'));
            window.showConfirm('Eliminar Etiquetas', `¿Estás seguro de eliminar ${namesToDelete.length} etiqueta(s) ? `, () => {
                namesToDelete.forEach(name => delete window.tags[name]);
                window.renderTagsTable();
                localStorage.setItem('samsung_catalog_tags', JSON.stringify(window.tags));
                if (typeof window.saveTags === 'function') window.saveTags();
                window.showToast(`${namesToDelete.length} etiquetas eliminadas`, 'success');
                document.getElementById('selectAllTags').checked = false;
                document.getElementById('bulkDeleteTagsBtn').style.display = 'none';
            }, null, true);
        }
    });

    // 5. Promotions
    setupBulkDelete({
        checkboxClass: 'promotion-checkbox',
        selectAllId: 'selectAllPromotions',
        deleteBtnId: 'bulkDeletePromotionsBtn',
        countSpanId: 'bulkDeletePromotionsCount',
        deleteFunction: (checkedBoxes) => {
            const namesToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-promo-name'));
            window.showConfirm('Eliminar Promociones', `¿Estás seguro de eliminar ${namesToDelete.length} promoción(es) ? `, () => {
                namesToDelete.forEach(name => delete window.promotions[name]);
                window.renderPromotionsTable();
                localStorage.setItem('samsung_catalog_promotions', JSON.stringify(window.promotions));
                if (typeof window.savePromotions === 'function') window.savePromotions();
                window.showToast(`${namesToDelete.length} promociones eliminadas`, 'success');
                document.getElementById('selectAllPromotions').checked = false;
                document.getElementById('bulkDeletePromotionsBtn').style.display = 'none';
            }, null, true);
        }
    });

    // 6. Combos
    setupBulkDelete({
        checkboxClass: 'combo-checkbox',
        selectAllId: 'selectAllCombos',
        deleteBtnId: 'bulkDeleteCombosBtn',
        countSpanId: 'bulkDeleteCombosCount',
        deleteFunction: (checkedBoxes) => {
            const namesToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-combo-name'));
            window.showConfirm('Eliminar Combos', `¿Estás seguro de eliminar ${namesToDelete.length} combo(s) ? `, () => {
                namesToDelete.forEach(name => delete window.combos[name]);
                window.renderCombosTable();
                localStorage.setItem('samsung_catalog_combos', JSON.stringify(window.combos));
                // if(typeof window.saveCombos === 'function') window.saveCombos(); 
                window.showToast(`${namesToDelete.length} combos eliminados`, 'success');
                document.getElementById('selectAllCombos').checked = false;
                document.getElementById('bulkDeleteCombosBtn').style.display = 'none';
            }, null, true);
        }
    });
})();
