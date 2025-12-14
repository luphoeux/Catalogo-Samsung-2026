// Script para limpiar localStorage y forzar recarga de productos
// Ejecutar en la consola del admin: http://localhost:3000/admin/

console.log('🧹 Limpiando localStorage y forzando recarga...\n');

// 1. Limpiar localStorage de productos
localStorage.removeItem('samsung_catalog_products');
console.log('✅ localStorage limpiado');

// 2. Forzar recarga de la página
console.log('🔄 Recargando página...');
window.location.reload(true);
