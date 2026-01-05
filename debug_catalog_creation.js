const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Robust Data Loader using VM (Executes the JS file in a sandbox)
function loadJSData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log('File does not exist:', filePath);
            return null;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext(content, sandbox);

        // Find the variable that was defined
        const keys = Object.keys(sandbox);
        if (keys.length > 0) {
            return sandbox[keys[0]]; // Return the first variable defined (e.g., 'products' or 'promotions')
        }
    } catch (err) {
        console.error(`VM Read Error (${filePath}):`, err.message);
    }
    return null;
}

const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
console.log('Loading products from:', productsPath);

const allProducts = loadJSData(productsPath);

if (allProducts && Array.isArray(allProducts)) {
    console.log(`SUCCESS: Loaded ${allProducts.length} products.`);

    // Test filtering with string IDs (like the screenshot shown previously)
    const testIds = ["1", "2", "3", "5", "7"];
    console.log(`Testing filter with IDs: ${JSON.stringify(testIds)}`);

    const selected = allProducts.filter(p => testIds.includes(String(p.id)));
    console.log(`MATCHED: ${selected.length} products.`);

    if (selected.length > 0) {
        console.log('Sample Match:', selected[0].name);
    } else {
        console.error('FAILED: No products matched independent of ID type.');
        console.log('First Product ID type:', typeof allProducts[0].id, 'Value:', allProducts[0].id);
    }

} else {
    console.error('FAILED: Could not load products array.');
}
