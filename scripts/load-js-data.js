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

        // Find the start of the variable assignment
        const varMatch = content.match(/var\s+(\w+)\s*=\s*/);

        if (varMatch) {
            try {
                let potentialJson = content.substring(varMatch.index + varMatch[0].length).trim();

                // Determine if Array or Object
                const firstChar = potentialJson[0];
                let lastCharIndex = -1;

                if (firstChar === '[') {
                    lastCharIndex = potentialJson.lastIndexOf(']');
                } else if (firstChar === '{') {
                    lastCharIndex = potentialJson.lastIndexOf('}');
                }

                if (lastCharIndex !== -1) {
                    potentialJson = potentialJson.substring(0, lastCharIndex + 1);
                } else if (potentialJson.endsWith(';')) {
                    // Fallback for simple cases if bracket search fails (unlikely)
                    potentialJson = potentialJson.slice(0, -1).trim();
                }

                // Parse the JSON data
                return JSON.parse(potentialJson);
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
