
console.log('🖼️ Samsung Premium Renderer Initialized');

let currentProducts = [];
let activeCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const catalogId = params.get('id');

    if (!catalogId) {
        document.getElementById('catalog-grid').innerHTML = '<div class="col-12 text-center py-5"><h3>ID de catálogo no proporcionado.</h3></div>';
        return;
    }

    loadCatalog(parseInt(catalogId));
});

function loadCatalog(id) {
    const catalogs = JSON.parse(localStorage.getItem('samsung_catalogs') || '[]');
    const cat = catalogs.find(c => c.id === id);

    if (!cat) {
        document.getElementById('catalog-grid').innerHTML = '<div class="col-12 text-center py-5"><h3>Catálogo no encontrado.</h3></div>';
        return;
    }

    currentProducts = cat.products;

    // 1. Update Hero / Cover
    const config = cat.config || {};
    document.title = `${cat.name} | Samsung Official Catalog`;
    
    const titleEl = document.getElementById('view-title');
    titleEl.textContent = config.customTitle || 'Catálogo Samsung';
    titleEl.style.color = config.titleColor || '#000000';

    document.getElementById('view-client').textContent = cat.client || 'Propuesta Exclusiva';
    
    // Header Banner Image
    const heroSection = document.querySelector('.hero-section');
    if (config.banner) {
        heroSection.style.backgroundImage = `url('${config.banner}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
    }

    // Watermark logic
    const watermarkEl = document.getElementById('view-watermark');
    watermarkEl.textContent = config.watermark || '2026';
    watermarkEl.style.opacity = (config.opacity || 15) / 100;



    // 2. Setup Category Filters
    setupFilters();

    // 3. Setup Promotions (pass config to use selected promotions)
    renderPromotions(config);

    // 4. Render Initial Grid
    renderGrid(currentProducts);
}

function renderPromotions(config) {
    const allPromos = JSON.parse(localStorage.getItem('samsung_promotions') || '[]');
    const sidebar = document.getElementById('promotions-sidebar');
    
    console.log('🔍 DEBUG Promociones:');
    console.log('- Config recibido:', config);
    console.log('- Todas las promociones en localStorage:', allPromos);
    console.log('- Índices seleccionados:', config?.promotions);
    
    // Get selected promotion indices from config
    const selectedPromoIndices = config?.promotions || [];
    
    // Filter to show only selected promotions
    let activePromos = [];
    if (selectedPromoIndices.length > 0) {
        activePromos = selectedPromoIndices
            .map(index => {
                console.log(`- Buscando promoción en índice ${index}:`, allPromos[index]);
                return allPromos[index];
            })
            .filter(promo => promo !== undefined);
        console.log('✅ Promociones seleccionadas encontradas:', activePromos);
    } else {
        // Fallback: show promos that apply to products in this catalog
        activePromos = allPromos.filter(promo => {
            return promo.productSkus?.some(sku => currentProducts.some(p => p.sku === sku));
        });
        console.log('⚠️ No hay promociones seleccionadas, usando fallback:', activePromos);
    }

    if (activePromos.length === 0) {
        console.log('❌ No se encontraron promociones para mostrar');
        sidebar.innerHTML = '<div class="text-muted small text-center py-4">Sin promociones bancarias vigentes.</div>';
        return;
    }

    console.log('✅ Mostrando', activePromos.length, 'promociones');
    sidebar.innerHTML = '';
    activePromos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'promo-card';
        div.style.cursor = 'default'; // Remove pointer cursor since we have buttons
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: auto; object-fit: cover;">
            <div class="promo-card-body">
                <h5 class="promo-card-title mb-3">${p.name}</h5>
                <div class="d-grid gap-2">
                    ${p.link ? `
                    <button class="btn btn-sm btn-primary w-100" onclick="window.open('${p.link}', '_blank')" style="font-size: 0.7rem; padding: 0.4rem; border-radius: 8px;">
                        <i class="bi bi-box-arrow-up-right"></i> Ver Promoción
                    </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-primary w-100 filter-promo-products" data-promo-skus='${JSON.stringify(p.productSkus || [])}' style="font-size: 0.7rem; padding: 0.4rem; border-radius: 8px;">
                        <i class="bi bi-filter"></i> Ver Productos (${(p.productSkus || []).length})
                    </button>
                </div>
            </div>
        `;
        sidebar.appendChild(div);
    });
    
    // Add event listeners for filter buttons
    document.querySelectorAll('.filter-promo-products').forEach(btn => {
        btn.addEventListener('click', function() {
            const isActive = this.classList.contains('active-filter');
            
            // Reset all buttons first
            document.querySelectorAll('.filter-promo-products').forEach(b => {
                b.classList.remove('active-filter', 'btn-primary');
                b.classList.add('btn-outline-primary');
                b.innerHTML = `<i class="bi bi-filter"></i> Ver Productos (${JSON.parse(b.getAttribute('data-promo-skus')).length})`;
            });

            if (isActive) {
                // Deactivate: Show all products
                console.log('🔄 Desactivando filtro de promoción');
                renderGrid(currentProducts);
                
                // Restore "all" filter
                document.querySelectorAll('.filter-link').forEach(link => {
                    if(link.getAttribute('data-category') === 'all') link.classList.add('active');
                    else link.classList.remove('active');
                });
                
                // Hide clear filters button
                const clearContainer = document.getElementById('clear-filters-container');
                if (clearContainer) clearContainer.style.display = 'none';
            } else {
                // Activate: Filter products
                const skus = JSON.parse(this.getAttribute('data-promo-skus'));
                console.log('🔍 Activando filtro de promoción:', skus);
                
                // Update button style
                this.classList.add('active-filter', 'btn-primary');
                this.classList.remove('btn-outline-primary');
                this.innerHTML = `<i class="bi bi-check-lg"></i> Filtrado (${skus.length})`;

                // Filter products
                const filteredProducts = currentProducts.filter(p => skus.includes(p.sku));
                renderGrid(filteredProducts);
                
                // Update category filters
                document.querySelectorAll('.filter-link').forEach(link => link.classList.remove('active'));
                
                // Show clear filters button
                const clearContainer = document.getElementById('clear-filters-container');
                if (clearContainer) clearContainer.style.display = 'block';
                
                // Scroll to products
                document.getElementById('catalog-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Clear filters button
    const clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            // Restore all products
            renderGrid(currentProducts);
            
            // Restore "all" filter as active
            document.querySelectorAll('.filter-link').forEach(link => {
                if (link.getAttribute('data-category') === 'all') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            // Reset promo buttons
            document.querySelectorAll('.filter-promo-products').forEach(b => {
                b.classList.remove('active-filter', 'btn-primary');
                b.classList.add('btn-outline-primary');
                b.innerHTML = `<i class="bi bi-filter"></i> Ver Productos (${JSON.parse(b.getAttribute('data-promo-skus')).length})`;
            });
            
            // Hide clear filters button
            document.getElementById('clear-filters-container').style.display = 'none';
            
            // Clear search
            const searchInput = document.getElementById('smart-search');
            if (searchInput) searchInput.value = '';
            searchQuery = '';
        });
    }
}

function setupFilters() {
    const filterContainer = document.getElementById('category-filters');
    const categories = [...new Set(currentProducts.map(p => p.mainCategory || 'Otros'))].sort();

    categories.forEach(cat => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'filter-link';
        link.textContent = cat;
        link.dataset.category = cat;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Update active state
            document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            activeCategory = cat;
            filterAndRender();
        });
        
        filterContainer.appendChild(link);
    });

    // Reset filter
    document.querySelector('.filter-link[data-category="all"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = 'all';
        filterAndRender();
    });

    // Smart Search Event Listener
    const searchInput = document.getElementById('smart-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterAndRender();
        });
    }
}

function filterAndRender() {
    let filtered = currentProducts;
    
    // Apply category filter
    if (activeCategory !== 'all') {
        filtered = filtered.filter(p => p.mainCategory === activeCategory);
    }

    // Apply Highlight Filters (OR Logic between highlights)
    const activeHighlights = Array.from(document.querySelectorAll('.highlight-filter:checked'));
    if (activeHighlights.length > 0) {
        let allowedSkus = [];
        activeHighlights.forEach(cb => {
            const skus = JSON.parse(cb.getAttribute('data-skus') || '[]');
            allowedSkus = [...allowedSkus, ...skus];
        });
        // Use Set to remove duplicates
        const uniqueAllowedSkus = [...new Set(allowedSkus)];
        filtered = filtered.filter(p => uniqueAllowedSkus.includes(p.sku));
    }

    // Apply Tag Filter (Single selection logic based on UI)
    const activeTag = document.querySelector('.tag-filter-btn.active-tag');
    if (activeTag) {
        const tagSkus = JSON.parse(activeTag.getAttribute('data-tag-skus') || '[]');
        filtered = filtered.filter(p => tagSkus.includes(p.sku));
    }
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(p => {
            const matchName = p.name.toLowerCase().includes(searchQuery);
            const matchSku = p.sku.toLowerCase().includes(searchQuery);
            return matchName || matchSku;
        });
    }
    
    // Update UI for Clear Filters
    const clearContainer = document.getElementById('clear-filters-container');
    if (clearContainer) {
        const hasFilters = activeCategory !== 'all' || activeHighlights.length > 0 || activeTag || searchQuery;
        clearContainer.style.display = hasFilters ? 'block' : 'none';
    }
    
    renderGrid(filtered);
}

function renderGrid(products) {
    const grid = document.getElementById('catalog-grid');
    const countEl = document.getElementById('product-count');
    if (countEl) countEl.textContent = products.length;
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">No se encontraron productos en esta categoría.</div>';
        return;
    }

    // Load Gifts for Badge Logic
    const allGifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');

    products.forEach(p => {
        try {
            const col = document.createElement('div');
            col.className = 'col-md-3'; // 4 cards per row for optimal density
            
            // Promotion Override Logic
            const allPromos = JSON.parse(localStorage.getItem('samsung_promotions') || '[]');
            const activePromo = allPromos.find(promo => promo.productSkus?.includes(p.sku));
            const accentColor = activePromo ? activePromo.accentColor : null;
            const promoDataAttr = accentColor ? `data-promo-color="${accentColor}"` : '';

            // Gift Badge Logic (New)
            // Normalize SKU for comparison
            const productSku = String(p.sku || '').trim();
            const activeGift = allGifts.find(g => g.productSkus && g.productSkus.some(sku => String(sku).trim() === productSku));
            let giftHtml = '';
            
            if (activeGift) {
                giftHtml = `
                <div class="gift-plus-badge">+</div>
                <div class="gift-badge-overlay shadow-sm">
                    <span class="gift-tooltip">Incluye: ${activeGift.name}</span>
                    <img src="${activeGift.image}" alt="${activeGift.name}">
                </div>`;
            }

            // Tags Logic
            const allTags = JSON.parse(localStorage.getItem('samsung_tags') || '[]');
            const productTags = allTags.filter(t => t.productSkus && t.productSkus.includes(p.sku));
            
            let tagsHtml = '';
            if (productTags.length > 0) {
                tagsHtml = '<div class="tags-container-overlay">';
                productTags.forEach(tag => {
                    tagsHtml += `<span class="badge rounded-pill shadow-sm" style="background-color: ${tag.bg}; color: ${tag.color}; font-size: 0.65rem; padding: 4px 8px; font-weight: 700; letter-spacing: 0.5px;">${tag.text}</span>`;
                });
                tagsHtml += '</div>';
            }

            col.innerHTML = `
                <div class="product-card" ${promoDataAttr}>
                    <div class="img-container">
                        ${tagsHtml}
                        <img src="${p.image || ''}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=No+Img'">
                        ${giftHtml}
                    </div>

                    <div class="product-info text-center">
                        <!-- SKU -->
                        <div class="text-muted mb-2" style="font-size: 0.7rem; font-weight: 400; letter-spacing: 0.3px;">
                            ${p.sku}
                        </div>
                        
                        <!-- Product Name -->
                        <h3 class="product-name m-0" style="font-size: 1.5rem; line-height: 1.2; font-weight: 400; color: #000;">
                            ${p.name}
                        </h3>

                        <!-- Gift Text Label -->
                        ${activeGift ? `<div class="gift-text-label">+ ${activeGift.name}</div>` : '<div class="mb-3"></div>'}
                        
                        <!-- Color -->
                        <div class="d-flex align-items-center justify-content-center mb-3" style="font-size: 0.85rem; color: #000;">
                            <span class="me-2" style="font-weight: 400;">Color:</span>
                            <div class="d-flex align-items-center">
                                <div class="me-2" style="background-color: ${p.colorHex || '#ccc'}; border: 2px solid #333; width: 24px; height: 24px; border-radius: 50%;"></div>
                                <span style="font-weight: 400; color: #000;">${p.color || 'N/A'}</span>
                            </div>
                        </div>

                        <!-- Description (Moved) -->
                        ${p.description ? `<p class="mb-3 description-clamp" style="font-size: 0.8rem; line-height: 1.4; color: #1428a0;">${p.description}</p>` : '<div class="mb-3 description-clamp"></div>'}
                        
                        <!-- Specifications (Variables) -->
                        ${(p.specs && p.specs.length > 0) ? `
                        <div class="d-flex justify-content-center gap-2 mb-4">
                            ${p.specs.map(spec => `<span class="badge border-0 px-3 py-2 text-dark fw-bold" style="background-color: #f2f2f2; font-size: 0.7rem; border-radius: 6px; letter-spacing: 0.3px;">${spec}</span>`).join('')}
                        </div>
                        ` : ''}
                        
                        <!-- Price -->
                        <div class="product-price-box mb-3">
                            <div class="price-main mb-0" style="font-size: 1.8rem; font-weight: 700; color: #000;">Bs ${(p.price || 0).toLocaleString('es-BO')}</div>
                            ${p.salePrice > 0 ? `<div class="price-old small text-decoration-line-through opacity-50">Antes: Bs ${p.salePrice.toLocaleString('es-BO')}</div>` : ''}
                        </div>

                        <!-- Button -->
                        <div class="mt-auto">
                            <a href="${p.link || '#'}" target="_blank" class="btn btn-outline-dark w-100 py-2 rounded-pill text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; border-width: 2px; font-weight: 700;">
                                Más información
                            </a>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(col);
            
            // Add hover listeners for promo border
            const card = col.querySelector('.product-card[data-promo-color]');
            if (card) {
                const promoColor = card.getAttribute('data-promo-color');
                card.addEventListener('mouseenter', function() {
                    this.style.borderColor = promoColor;
                    this.style.borderWidth = '2px';
                    this.style.boxShadow = `0 4px 15px ${promoColor}22, var(--card-shadow)`;
                });
                card.addEventListener('mouseleave', function() {
                    this.style.borderColor = '';
                    this.style.borderWidth = '';
                    this.style.boxShadow = '';
                });
            }
        } catch (err) {
            console.error('❌ Error rendering product:', p.sku, err);
        }
    });
    
    // Setup Secondary Filters (only if not already setup to avoid loop, but checking DOM is safe)
    setupTagFilters();
    setupHighlightsFilters();
}

function setupHighlightsFilters() {
    const allGifts = JSON.parse(localStorage.getItem('samsung_gifts') || '[]');
    const container = document.getElementById('highlights-filter-container');
    const section = document.getElementById('highlights-filter-section');
    
    console.log('🎁 Setup Highlights Filters - Total Gifts:', allGifts.length);

    // Find gifts relevant to current catalog
    const validGifts = allGifts.filter(g => {
        if (!g.productSkus || g.productSkus.length === 0) return false;
        // Check intersection with Normalized SKUs
        return g.productSkus.some(sku => {
            const normalizedSku = String(sku).trim();
            return currentProducts.some(p => String(p.sku).trim() === normalizedSku);
        });
    });
    
    console.log('🎁 Valid Gifts for this catalog:', validGifts);

    if (validGifts.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    
    // Only rebuild if empty (to keep checkbox state) or if hard refresh needed
    if (container.children.length === 0) {
        validGifts.forEach(g => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input highlight-filter" type="checkbox" value="${g.name}" id="highlight-${g.name.replace(/\s+/g, '-')}" data-skus='${JSON.stringify(g.productSkus)}'>
                <label class="form-check-label small text-muted" for="highlight-${g.name.replace(/\s+/g, '-')}">
                    ${g.name}
                </label>
            `;
            container.appendChild(div);
            
            // Add listener
            div.querySelector('input').addEventListener('change', () => {
                filterAndRender();
            });
        });
    }
}

function setupTagFilters() {
    const allTags = JSON.parse(localStorage.getItem('samsung_tags') || '[]');
    const container = document.getElementById('tag-filters');
    const mainContainer = document.getElementById('tags-filter-section'); // Corrected ID
    
    // Find tags that have products in the current catalog
    const validTags = allTags.filter(tag => {
        if (!tag.productSkus || tag.productSkus.length === 0) return false;
        return tag.productSkus.some(sku => currentProducts.some(p => p.sku === sku));
    });
    
    if (validTags.length === 0) {
        if (mainContainer) mainContainer.style.display = 'none';
        return;
    }
    
    if (mainContainer) mainContainer.style.display = 'block';
    
    // Only render if needed to preserve state or avoid flicker
    if(container.children.length > 0) return; // Simple check

    validTags.forEach(tag => {
        const count = tag.productSkus.filter(sku => currentProducts.some(p => p.sku === sku)).length;
        
        const btn = document.createElement('div');
        btn.className = 'tag-filter-btn mb-2 d-flex align-items-center justify-content-between';
        btn.style.cursor = 'pointer';
        btn.style.padding = '8px 12px';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid #eee';
        btn.style.transition = 'all 0.2s';
        btn.setAttribute('data-tag-skus', JSON.stringify(tag.productSkus));
        
        btn.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <span class="badge rounded-pill" style="background-color: ${tag.bg}; color: ${tag.color}; font-size: 0.7rem;">${tag.text}</span>
                <span class="small text-muted tag-name">${tag.text}</span>
            </div>
            <span class="badge bg-light text-muted border rounded-pill">${count}</span>
        `;
        
        btn.addEventListener('click', function() {
            const isActive = this.classList.contains('active-tag');
             // Reset all tags
            document.querySelectorAll('.tag-filter-btn').forEach(b => {
                b.classList.remove('active-tag');
                b.style.backgroundColor = 'transparent';
                b.style.borderColor = '#eee';
            });
            
            if (!isActive) {
                this.classList.add('active-tag');
                this.style.backgroundColor = '#e8f0fe'; 
                this.style.borderColor = '#b3d7ff';
            }
            filterAndRender();
        });
        container.appendChild(btn);
    });
}
