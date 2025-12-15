const fs = require('fs');

function loadJSData(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath, 'utf8');
        // Match "var variableName = " ... ";"
        // We match explicitly var \w+ = 
        // We look for the start of the object/array and assume it ends at the last semi-colon or end of file
        const match = content.match(/var\s+\w+\s*=\s*([\s\S]*?);?\s*$/);
        if (match && match[1]) {
            return JSON.parse(match[1]);
        }
    } catch (e) {
        console.error(`Error loading JS data from ${filePath}:`, e);
    }
    return null;
}

module.exports = { loadJSData };
