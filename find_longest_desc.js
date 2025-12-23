const fs = require('fs');
const content = fs.readFileSync('./src/data/products.js', 'utf8');
// Naive extraction: find "description": "..." and count length. 
// Note: Descriptions might contain escaped quotes.

// Better approach: simulate the environment
const vm = require('vm');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(content, sandbox);

const products = sandbox.products;
let max = { len: 0, name: '' };
products.forEach(p => {
    if (p.description && p.description.length > max.len) {
        max = { len: p.description.length, name: p.name, desc: p.description };
    }
});
console.log('Longest description found:');
console.log('Product:', max.name);
console.log('Length:', max.len);
console.log('Description:', max.desc);
