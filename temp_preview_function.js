// Temporary file to hold the updated createPreviewCard function
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

    const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';

    // Badge (top-left, blue background like render_test.html)
    const badgeHtml = product.badge ? `<div style="position: absolute; top: 20px; left: 20px; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; color: white; text-transform: uppercase; z-index: 10; background-color: #0056b3;">${product.badge}</div>` : '';

    // Colors section
    let colorsHtml = '';
    if (product.colors && product.colors.length > 0) {
        colorsHtml = `
            <div style="margin-bottom: 1.2rem;">
                <div style="font-size: 0.8rem; color: #333; margin-bottom: 0.5rem; font-weight: 600;">Color: <span class="preview-selected-color">${firstColor}</span></div>
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    ${product.colors.map((color, index) => {
            const hex = product.colorCodes && product.colorCodes[color] ? product.colorCodes[color] : '#CCCCCC';
            const activeStyle = index === 0 ? 'transform: scale(0.9); box-shadow: 0 0 0 2px white, 0 0 0 4px #000;' : '';
            return `<div class="preview-color-dot ${index === 0 ? 'active' : ''}" 
                                     style="width: 22px; height: 22px; border-radius: 50%; background-color: ${hex}; cursor: pointer; border: 1px solid rgba(0,0,0,0.1); transition: transform 0.2s; position: relative; ${activeStyle}"
                                     data-color="${color}"
                                     data-image="${product.variants[color]?.image || product.image}"
                                     data-sku="${product.variants[color]?.sku || product.sku}"
                                     onclick="changePreviewColor(this, '${color}', '${product.variants[color]?.image || product.image}', '${product.variants[color]?.sku || product.sku}')"
                                     onmouseover="if(!this.classList.contains('active')) this.style.transform='scale(1.15)'"
                                     onmouseout="if(!this.classList.contains('active')) this.style.transform='scale(1)'">
                                </div>`;
        }).join('')}
                </div>
            </div>
        `;
    }

    // Storage badges (variables) - matching render_test.html layout
    let storageHtml = '';
    if (product.storage && product.storage.length > 0) {
        const containerStyle = product.storage.length <= 2
            ? 'display: flex; justify-content: center; gap: 8px; margin-bottom: 1.5rem;'
            : 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1.5rem; padding: 0 10px;';

        storageHtml = `
            <div style="${containerStyle}">
                ${product.storage.map((s, i) => {
            const isActive = i === 0;
            const activeStyle = isActive ? 'background: #f8f9fa; border: 1px solid #000; color: #000;' : 'background: #fff; border: 1px solid #ddd; color: #333;';
            const minWidth = product.storage.length <= 2 ? 'min-width: 90px; max-width: 140px;' : '';
            return `<div style="${activeStyle} padding: 8px 5px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; line-height: 1; white-space: nowrap; ${minWidth}">
                                <span style="font-size: 0.65rem; color: #888; margin-bottom: 3px;">Memoria</span>
                                <span>${s}</span>
                            </div>`;
        }).join('')}
            </div>
        `;
    }

    // Price section - matching render_test.html exactly
    let priceHtml = '';
    if (product.originalPrice && product.originalPrice != 0 && product.price && product.price != 0) {
        // Has both prices (promo)
        priceHtml = `
            <div style="margin-bottom: 1.5rem; display: flex; justify-content: center; align-items: baseline; gap: 12px; height: 40px;">
                <div style="text-decoration: line-through; color: #999; font-size: 1rem; font-weight: 400;">Bs ${Number(product.originalPrice).toLocaleString()}</div>
                <div style="font-family: 'SamsungSharpSans', sans-serif; font-size: 1.6rem; color: #000; font-weight: bold;">Bs ${Number(product.price).toLocaleString()}</div>
            </div>
        `;
    } else if (product.price && product.price != 0) {
        // Only regular price
        priceHtml = `
            <div style="margin-bottom: 1.5rem; display: flex; justify-content: center; align-items: baseline; gap: 12px; height: 40px;">
                <div style="font-family: 'SamsungSharpSans', sans-serif; font-size: 1.6rem; color: #000; font-weight: bold;">Bs ${Number(product.price).toLocaleString()}</div>
            </div>
        `;
    }

    card.innerHTML = `
        ${badgeHtml}
        <div style="height: 220px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; margin-top: 1rem;">
            <img src="${product.image}" alt="${product.name}" 
                 id="preview-product-image"
                 style="max-height: 100%; max-width: 100%; object-fit: contain; transition: opacity 0.3s ease;"
                 onerror="this.src='https://via.placeholder.com/300?text=Sin+Imagen'">
        </div>
        <div id="preview-product-sku" style="color: #999; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">${product.sku || ''}</div>
        <h2 style="font-family: 'SamsungSharpSans', sans-serif; font-size: 1.5rem; line-height: 1.2; color: #000; margin: 0 0 0.8rem 0;">${product.name}</h2>
        <p style="color: #777; font-size: 0.8rem; line-height: 1.4; margin-bottom: 1rem; min-height: 2.8em;">${product.description || ''}</p>
        ${colorsHtml}
        ${storageHtml}
        ${priceHtml}
        <a href="#" style="display: block; width: 100%; padding: 14px 0; border: 1px solid #000; background: transparent; color: #000; border-radius: 25px; text-decoration: none; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; transition: all 0.2s; box-sizing: border-box;">MÁS INFORMACIÓN</a>
    `;

    return card;
}
