// Script de diagnóstico y reparación de colores
// Ejecutar en la consola del navegador en /admin/

console.log('🔧 DIAGNÓSTICO DE SISTEMA DE COLORES');
console.log('=====================================\n');

// 1. Verificar colorVariables
console.log('1️⃣ Verificando colorVariables globales:');
console.log('   Total de colores:', Object.keys(window.colorVariables || {}).length);
console.log('   Colores disponibles:', Object.keys(window.colorVariables || {}));

// 2. Verificar productos
console.log('\n2️⃣ Verificando productos:');
console.log('   Total de productos:', window.products ? window.products.length : 0);

if (window.products && window.products.length > 0) {
    window.products.forEach((p, i) => {
        console.log(`\n   Producto ${i + 1}: "${p.name}"`);
        console.log('   - ID:', p.id);
        console.log('   - Tiene colors array:', !!p.colors);
        console.log('   - Tiene variants array:', !!p.variants);

        if (p.colors && p.colors.length > 0) {
            console.log('   - Colors:');
            p.colors.forEach(c => {
                console.log(`     * ${c.name || 'SIN NOMBRE'} (id: ${c.id || c.colorId || 'SIN ID'}, hex: ${c.hex})`);
            });
        }

        if (p.variants && p.variants.length > 0) {
            console.log('   - Variants:');
            p.variants.forEach(v => {
                console.log(`     * ${v.color || 'SIN COLOR'} (colorId: ${v.colorId || 'SIN ID'}, hex: ${v.hex})`);
            });
        }
    });
}

// 3. Función de reparación
console.log('\n\n3️⃣ FUNCIÓN DE REPARACIÓN DISPONIBLE:');
console.log('   Ejecuta: fixColorIds()');

window.fixColorIds = function () {
    console.log('\n🔧 Iniciando reparación de IDs de colores...\n');

    let fixed = 0;

    window.products.forEach(p => {
        if (p.colors && Array.isArray(p.colors)) {
            p.colors.forEach(c => {
                // Si tiene 'id' pero no 'colorId', copiar
                if (c.id && !c.colorId) {
                    c.colorId = c.id;
                    fixed++;
                    console.log(`✅ Reparado: ${c.name} - agregado colorId: ${c.colorId}`);
                }
                // Si tiene 'colorId' pero no 'id', copiar
                if (c.colorId && !c.id) {
                    c.id = c.colorId;
                    fixed++;
                    console.log(`✅ Reparado: ${c.name} - agregado id: ${c.id}`);
                }
            });
        }
    });

    console.log(`\n✅ Reparación completada. ${fixed} campos corregidos.`);
    console.log('💾 Guardando cambios...');

    // Guardar en localStorage
    localStorage.setItem('samsung_catalog_products', JSON.stringify(window.products));

    // Guardar en servidor
    fetch('/api/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(window.products)
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Cambios guardados en el servidor');
                console.log('🔄 Recarga la página para ver los cambios');
            } else {
                console.error('❌ Error al guardar:', data.message);
            }
        })
        .catch(err => console.error('❌ Error de red:', err));
};

console.log('\n=====================================');
console.log('Diagnóstico completado. Revisa los resultados arriba.');
