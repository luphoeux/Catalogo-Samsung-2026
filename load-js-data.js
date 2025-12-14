// Helper script to load data from JS files
const fs = require('fs');
const path = require('path');

function loadJSData(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Remove comments and execute
        const cleanContent = content;

        // Create a sandbox to execute the code
        const sandbox = { products: null, colorVariables: null, categories: null, textVariables: null, tags: null, promotions: null };
        const vm = require('vm');
        vm.createContext(sandbox);
        vm.runInContext(cleanContent, sandbox);

        // Return the first non-null variable
        for (const key in sandbox) {
            if (sandbox[key] !== null) {
                return sandbox[key];
            }
        }

        return null;
    } catch (err) {
        console.error(`Error loading ${filePath}:`, err.message);
        return null;
    }
}

module.exports = { loadJSData };
