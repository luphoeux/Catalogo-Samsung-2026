const https = require('https');
const fs = require('fs');

https.get('https://samsung.com.bo/landing/catalogo1', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        // Extract SVGs from features section
        const svgMatches = data.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi);
        if (svgMatches) {
            console.log('Found SVGs:', svgMatches.length);
            fs.writeFileSync('extracted_svgs.json', JSON.stringify(svgMatches, null, 2));
            console.log('SVGs saved to extracted_svgs.json');
        } else {
            console.log('No SVGs found');
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
