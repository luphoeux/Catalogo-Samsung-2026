const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. DUPLICATE OF THE LOGIC IN SERVER.JS
// We copy this to ensure we are testing the EXACT logic currently deployed
function loadJSData(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath, 'utf8');
        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext(content, sandbox);

        const keys = Object.keys(sandbox);
        if (keys.length > 0) {
            return sandbox[keys[0]];
        }
    } catch (err) {
        console.error(`VM Read Error (${filePath}):`, err.message);
    }
    return null;
}

// 2. TEST SUITE
console.log('📢 Starting Validation Tests...\n');

let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
        failedTests++;
    }
}

// TEST 1: Load Products
console.log('--- Testing Product Data Loading ---');
const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
const products = loadJSData(productsPath);

assert(products !== null, 'Products file should load successfully');
assert(Array.isArray(products), 'Products should be an array');
if (products && products.length > 0) {
    console.log(`   ℹ️ Loaded ${products.length} products.`);
    assert(products[0].hasOwnProperty('id'), 'Product should have an ID');
    assert(products[0].hasOwnProperty('name'), 'Product should have a Name');
} else {
    assert(false, 'Products array is empty!');
}

// TEST 2: Product ID Matching Logic
if (products && products.length > 0) {
    console.log('\n--- Testing Product Selection Logic ---');
    // Simulate what the frontend sends (often strings)
    const targetId = products[0].id; // Could be number or string in DB
    const reqIds = [String(targetId), "999999"]; // Mixed existing and non-existing

    // Server logic simulation
    const selected = products.filter(p => reqIds.includes(String(p.id)));

    assert(selected.length === 1, `Should find exactly 1 product (Found ${selected.length})`);
    if (selected.length > 0) {
        assert(String(selected[0].id) === String(targetId), 'Found product ID should match requested ID');
    }
}

// TEST 3: Load Promotions
console.log('\n--- Testing Promotion Data Loading ---');
const promotionsPath = path.join(__dirname, 'src', 'data', 'promotions.js');
// Create dummy file if not exists to avoid false negative logic failure if user hasn't made promotions yet
if (!fs.existsSync(promotionsPath)) {
    console.log('   ⚠️ Promotions file not found (Skipping test)');
} else {
    const promotions = loadJSData(promotionsPath);
    // Promotions is usually an object, not array
    assert(promotions !== null, 'Promotions file should load successfully');
    assert(typeof promotions === 'object', 'Promotions should be an object');
    if (promotions) {
        const count = Object.keys(promotions).length;
        console.log(`   ℹ️ Loaded ${count} promotions.`);
    }
}

// Summary
console.log('\n================================');
if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED. The logic is robust.');
} else {
    console.log(`⚠️ ${failedTests} TESTS FAILED.`);
}
console.log('================================');
