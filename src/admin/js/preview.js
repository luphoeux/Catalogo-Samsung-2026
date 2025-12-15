
// Default placeholder image (SVG as data URL - no network request)
const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect fill="#f0f0f0" width="300" height="300"/><text fill="#999" font-family="Arial" font-size="16" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Sin Imagen</text></svg>';

/**
 * Creates a product preview card DOM element
 * Supports New Data Structure: 
 * - colors: Array of {name, hex, images[]}
 * - priceVariants: Array of {variableText, price}
 * @param {Object} product - Product data object
 * @returns {HTMLElement} - The preview card element
 */
function createPreviewCard(product) {
    const card = document.createElement('div');
    card.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 2rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        text-align: center;
        position: relative;
        box-sizing: border-box;
        border: 1px solid #eee;
    `;

    const uniqueId = 'preview-' + Math.random().toString(36).substr(2, 9);

    // Store in global for interactions
    if (!window.previewDataStore) window.previewDataStore = {};
    window.previewDataStore[uniqueId] = product;

    // 1. Resolve Colors
    const hasColors = product.colors && Array.isArray(product.colors) && product.colors.length > 0;
    const firstColorObj = hasColors ? product.colors[0] : null;
    const firstColorName = firstColorObj ? (firstColorObj.name || 'Color') : '';

    // 2. Resolve Main Image
    // Priority: First color's image -> Product main image -> Placeholder
    let mainImage = product.image;
    if (firstColorObj) {
        if (firstColorObj.image) mainImage = firstColorObj.image;
        else if (firstColorObj.images && firstColorObj.images.length > 0) mainImage = firstColorObj.images[0];
    }

    // Badge
    const badgeHtml = product.badge ? `<div style="position: absolute; top: 20px; left: 20px; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; color: white; text-transform: uppercase; z-index: 10; background-color: #0056b3;">${product.badge}</div>` : '';

    // Colors HTML
    let colorsHtml = '';
    if (hasColors) {
        colorsHtml = `
            <div style="margin-bottom: 1.2rem;">
                <div style="font-size: 0.8rem; color: #333; margin-bottom: 0.5rem; font-weight: 600;">
                    Color: <span class="preview-selected-color" id="color-name-${uniqueId}">${firstColorName}</span>
                </div>
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    ${product.colors.map((colorObj, index) => {
            const hex = colorObj.hex || '#CCCCCC';
            const activeStyle = index === 0 ? 'transform: scale(0.9); box-shadow: 0 0 0 2px white, 0 0 0 4px #000;' : '';
            const colorName = colorObj.name || '';

            return `<div class="preview-color-dot ${index === 0 ? 'active' : ''}" 
                                     style="width: 22px; height: 22px; border-radius: 50%; background-color: ${hex}; cursor: pointer; border: 1px solid rgba(0,0,0,0.1); transition: transform 0.2s; position: relative; ${activeStyle}"
                                     data-index="${index}"
                                     data-card-id="${uniqueId}"
                                     title="${colorName}"
                                     onclick="window.changePreviewColor(this, '${uniqueId}')"
                                     onmouseover="if(!this.classList.contains('active')) this.style.transform='scale(1.15)'"
                                     onmouseout="if(!this.classList.contains('active')) this.style.transform='scale(1)'">
                                </div>`;
        }).join('')}
                </div>
            </div>
        `;
    }

    // Price Variants (or Storage for legacy)
    let variantsHtml = '';
    if (product.priceVariants && product.priceVariants.length > 0) {
        const containerStyle = product.priceVariants.length <= 2
            ? 'display: flex; justify-content: center; gap: 8px; margin-bottom: 1.5rem;'
            : 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1.5rem; padding: 0 10px;';

        variantsHtml = `
            <div style="${containerStyle}">
                ${product.priceVariants.map((v, i) => {
            const isActive = i === 0; // Select first by default
            const activeStyle = isActive ? 'background: #f8f9fa; border: 1px solid #000; color: #000;' : 'background: #fff; border: 1px solid #ddd; color: #333;';
            // Fallback for different data structures (variableText, text, or just the string if array of strings)
            const text = v.variableText || v.text || (typeof v === 'string' ? v : ('Opción ' + (i + 1)));
            return `<div style="${activeStyle} padding: 8px 5px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; line-height: 1; white-space: nowrap;">
                                <span style="font-size: 0.65rem; color: #888; margin-bottom: 3px;">Opción</span>
                                <span>${text}</span>
                            </div>`;
        }).join('')}
            </div>
        `;
    }

    // Price Display
    // Logic: If priceVariants exist, show first one. Else show base price.
    let price = product.price || 0;
    let promoPrice = product.promoPrice || 0;

    if (product.priceVariants && product.priceVariants.length > 0) {
        price = product.priceVariants[0].price || 0;
        promoPrice = product.priceVariants[0].promoPrice || 0;
    }

    let priceHtml = '';
    if (Number(price) > 0) {
        if (Number(promoPrice) > 0) { // Should be price > promoPrice usually, but just check existence
            priceHtml = `
                <div style="margin-bottom: 1.5rem; display: flex; justify-content: center; align-items: baseline; gap: 12px; height: 40px;">
                    <div style="text-decoration: line-through; color: #999; font-size: 1rem; font-weight: 400;">Bs ${Number(price).toLocaleString()}</div>
                    <div style="font-family: 'SamsungSharpSans', sans-serif; font-size: 1.6rem; color: #000; font-weight: bold;">Bs ${Number(promoPrice).toLocaleString()}</div>
                </div>
            `;
        } else {
            priceHtml = `
                <div style="margin-bottom: 1.5rem; display: flex; justify-content: center; align-items: baseline; gap: 12px; height: 40px;">
                    <div style="font-family: 'SamsungSharpSans', sans-serif; font-size: 1.6rem; color: #000; font-weight: bold;">Bs ${Number(price).toLocaleString()}</div>
                </div>
            `;
        }
    }

    card.innerHTML = `
        ${badgeHtml}
        <div style="height: 220px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; margin-top: 1rem; background: #f5f5f5; border-radius: 12px;">
            ${mainImage ? `
                <img src="${mainImage}" alt="${product.name}" 
                     id="img-${uniqueId}"
                     style="max-height: 100%; max-width: 100%; object-fit: contain; transition: opacity 0.3s ease;"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color:#999; font-size:0.9rem;\\'>Sin Imagen</div>'">
            ` : `
                <div style="color:#999; font-size:0.9rem;">Sin Imagen</div>
            `}
        </div>
        <div id="sku-${uniqueId}" style="color: #999; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">${product.sku || (firstColorObj ? firstColorObj.sku : '') || ''}</div>
        <h2 style="font-family: 'SamsungSharpSans', sans-serif; font-size: 1.5rem; line-height: 1.2; color: #000; margin: 0 0 0.5rem 0;">${product.name || 'Nombre del Producto'}</h2>
        ${product.description ? `<p style="color: #666; font-size: 0.8rem; line-height: 1.4; margin: 0 0 1rem 0; min-height: 2.4rem;">${product.description}</p>` : ''}

        ${colorsHtml}
        ${variantsHtml}
        ${priceHtml}
        <a href="#" style="display: block; width: 100%; padding: 14px 0; border: 1px solid #000; background: transparent; color: #000; border-radius: 25px; text-decoration: none; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; transition: all 0.2s; box-sizing: border-box;">MÁS INFORMACIÓN</a>
    `;

    return card;
}

// Global handler for preview color changes
window.changePreviewColor = function (dot, uniqueId) {
    if (!window.previewDataStore || !window.previewDataStore[uniqueId]) return;

    const product = window.previewDataStore[uniqueId];
    const index = parseInt(dot.getAttribute('data-index'));

    if (isNaN(index) || !product.colors || !product.colors[index]) return;

    const colorObj = product.colors[index];

    // Update active state
    const dots = dot.parentElement.querySelectorAll('.preview-color-dot');
    dots.forEach(d => {
        d.classList.remove('active');
        d.style.transform = 'scale(1)';
        d.style.boxShadow = '';
    });

    dot.classList.add('active');
    dot.style.transform = 'scale(0.9)';
    dot.style.boxShadow = '0 0 0 2px white, 0 0 0 4px #000';

    // Update data
    const image = colorObj.image || (colorObj.images && colorObj.images[0]) || product.image || '';
    const sku = colorObj.sku || product.sku || '';

    // Update image
    const imgContainer = document.getElementById(`img-${uniqueId}`)?.parentElement;
    if (imgContainer) {
        if (image) {
            imgContainer.innerHTML = `<img src="${image}" alt="${product.name}" 
                     id="img-${uniqueId}"
                     style="max-height: 100%; max-width: 100%; object-fit: contain; transition: opacity 0.3s ease;"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color:#999; font-size:0.9rem;\\'>Sin Imagen</div>'">`;
        } else {
            imgContainer.innerHTML = `<div style="color:#999; font-size:0.9rem;">Sin Imagen</div>`;
        }
    }

    // Update SKU
    const skuEl = document.getElementById(`sku-${uniqueId}`);
    if (skuEl) skuEl.textContent = sku;

    // Update color name
    const colorNameEl = document.getElementById(`color-name-${uniqueId}`);
    if (colorNameEl) colorNameEl.textContent = colorObj.name || '';
}
