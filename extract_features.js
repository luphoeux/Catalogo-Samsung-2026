const https = require('https');
const fs = require('fs');

https.get('https://samsung.com.bo/landing/catalogo1', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        // Look for features section
        const featuresMatch = data.match(/features-section[\s\S]{0,5000}/i);
        if (featuresMatch) {
            fs.writeFileSync('features_section.html', featuresMatch[0]);
            console.log('Features section saved');
        }

        // Also look for inline SVG definitions
        const svgDefsMatch = data.match(/<defs[\s\S]*?<\/defs>/gi);
        if (svgDefsMatch) {
            fs.writeFileSync('svg_defs.html', svgDefsMatch.join('\n\n'));
            console.log('SVG defs saved');
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
