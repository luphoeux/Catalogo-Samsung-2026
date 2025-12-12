// Nueva función saveProduct para estructura separada de colores y variantes de precio
// Esta es la versión actualizada que reemplazará la función actual

function saveProduct() {
    const idStr = document.getElementById('editProductId').value;
    const name = document.getElementById('prodName').value;
    const category = document.getElementById('prodCategory').value;
    const badge = document.getElementById('prodBadge').value;

    // Base pricing (optional - when no price variants)
    const basePrice = Number(document.getElementById('prodBasePrice')?.value) || 0;
    const basePromo = Number(document.getElementById('prodBasePromo')?.value) || 0;
    const baseLink = document.getElementById('prodBaseLink')?.value?.trim() || '';

    // 1. Collect Colors (visual only)
    const colors = [];
    document.querySelectorAll('#colorsContainer .variant-card').forEach(card => {
        const colorSelect = card.querySelector('.color-select');
        const skuInput = card.querySelector('.color-sku');

        if (!colorSelect || !colorSelect.value) return; // Skip if no color selected

        const colorId = colorSelect.value;

        // Get color name and hex from colorVariables
        let colorName = '';
        let hex = '';
        if (colorVariables) {
            for (const [name, data] of Object.entries(colorVariables)) {
                if (data.id === colorId) {
                    colorName = name;
                    hex = data.hex || '';
                    break;
                }
            }
        }

        const sku = skuInput ? skuInput.value.trim() : '';

        // Collect images
        const images = [];
        const imageInputs = card.querySelectorAll('.color-images-list .color-image-input');
        imageInputs.forEach(input => {
            const url = input.value.trim();
            if (url) images.push(url);
        });

        colors.push({
            colorId,
            colorName,
            hex,
            sku,
            images
        });
    });

    // 2. Collect Price Variants (pricing only)
    const priceVariants = [];
    document.querySelectorAll('#priceVariantsContainer .variant-card').forEach(card => {
        const variableSelect = card.querySelector('.price-variable-select');
        const priceInput = card.querySelector('.price-price');
        const promoInput = card.querySelector('.price-promo');
        const linkInput = card.querySelector('.price-link');
        const activeCheckbox = card.querySelector('.price-active');

        const variableId = variableSelect ? variableSelect.value : '';

        // Get variable text if selected
        let variableText = '';
        if (variableId && textVariables) {
            const varData = Object.values(textVariables).find(v => v.id === variableId);
            if (varData) variableText = varData.text || '';
        }

        const price = priceInput ? Number(priceInput.value) || 0 : 0;
        const promoPrice = promoInput ? Number(promoInput.value) || 0 : 0;
        const link = linkInput ? linkInput.value.trim() : '';
        const active = activeCheckbox ? activeCheckbox.checked : true;

        // Only add if has price or link
        if (price > 0 || link) {
            priceVariants.push({
                variableId,
                variableText,
                price,
                promoPrice,
                link,
                active
            });
        }
    });

    // 3. Construct Product Object with new structure
    const productData = {
        id: idStr ? Number(idStr) : generateId(),
        name,
        category,
        badge,

        // New structure
        colors,              // Array of color objects
        priceVariants,       // Array of price variant objects

        // Base pricing (used when no price variants)
        basePrice,
        basePromo,
        baseLink,

        // Legacy compatibility fields (for backward compatibility)
        price: priceVariants.length > 0 ? priceVariants[0].price : basePrice,
        originalPrice: priceVariants.length > 0 ? priceVariants[0].promoPrice : basePromo,
        link: priceVariants.length > 0 ? priceVariants[0].link : baseLink,
        image: colors.length > 0 && colors[0].images.length > 0 ? colors[0].images[0] : '',
        sku: colors.length > 0 ? colors[0].sku : '',

        // For display purposes
        storage: priceVariants.map(v => v.variableText).filter(t => t),
        variants: {} // Will be populated for compatibility if needed
    };

    // Save to products array
    if (idStr) {
        const index = products.findIndex(p => p.id === Number(idStr));
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        products.unshift(productData);
    }

    closeModal();
    handleFilter(); // Re-render table
    autoSave();

    // Persist to server
    fetch('/api/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
    }).then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log('Product saved to server');
            }
        })
        .catch(err => console.error('Error saving to server:', err));
}
