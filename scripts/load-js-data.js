const fs = require('fs');

/**
 * Load and parse data from JavaScript variable files
 * @param {string} filePath - Path to the JS file
 * @returns {any} - Parsed data from the file
 */
function loadJSData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${filePath}`);
            return null;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        // Extract variable name and data
        // Matches patterns like: var products = [...]; or var colorVariables = {...};
        const match = content.match(/var\s+(\w+)\s*=\s*([\s\S]+?);?\s*$/m);

        if (match && match[2]) {
            try {
                // Parse the JSON data
                return JSON.parse(match[2]);
            } catch (parseError) {
                console.error(`❌ Error parsing JSON from ${filePath}:`, parseError.message);
                return null;
            }
        } else {
            console.warn(`⚠️ Could not extract data from ${filePath}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        return null;
    }
}

module.exports = { loadJSData };
