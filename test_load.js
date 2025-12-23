const path = require('path');
const { loadJSData } = require('./scripts/load-js-data.js');

const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
console.log(`Checking products from: ${productsPath}`);

const products = loadJSData(productsPath);

if (!products) {
    console.error('FAILED to load products. Result is null.');
} else if (!Array.isArray(products)) {
    console.error('FAILED. Products is not an array:', typeof products);
} else {
    console.log(`SUCCESS. Loaded ${products.length} products.`);
    if (products.length > 0) {
        console.log('Sample ID:', products[0].id, 'Type:', typeof products[0].id);
    }
}
