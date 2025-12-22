const fs = require('fs');
const path = require('path');

const inputDir = path.resolve(__dirname, '../node_modules/@untitledui-pro/icons/dist/line');
const outputDir = path.resolve(__dirname, '../src/assets/icons/untitledui/line');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    let count = 0;
    files.forEach(file => {
        if (path.extname(file) === '.js') {
            const content = fs.readFileSync(path.join(inputDir, file), 'utf8');

            // Extract paths
            // We look for d:"..." or d: "..."
            // The compiled output seen previously: o.createElement("path",{d:"..."})
            const pathMatchRegex = /d\s*:\s*"([^"]+)"/g;
            let match;
            let paths = [];
            while ((match = pathMatchRegex.exec(content)) !== null) {
                paths.push(`<path d="${match[1]}"></path>`);
            }

            if (paths.length > 0) {
                const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  ${paths.join('\n  ')}
</svg>`;
                const outputFilename = file.replace('.js', '.svg');
                fs.writeFileSync(path.join(outputDir, outputFilename), svgContent);
                count++;
            } else {
                console.warn(`No paths found in ${file}`);
            }
        }
    });
    console.log(`Extracted ${count} icons to ${outputDir}`);
});
