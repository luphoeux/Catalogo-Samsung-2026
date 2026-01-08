const fs = require('fs');
const path = require('path');

const tsvPath = path.join(__dirname, '../Catalogo B2B Samsung - 2026 - Catalogo 2026.tsv');
const outputPath = path.join(__dirname, '../src/js/initial_db.js');

const categoryMap = {
    'smartphones': 'Smartphones',
    'tablets': 'Tablets',
    'smartwatches': 'Smartwatches',
    'televisions': 'Televisores',
    'soundbar': 'Equipos de Audio',
    'washing_machines': 'Lavadoras / Secadoras',
    'refrigerators': 'Refrigeradores',
    'kitchen_cleaning': 'Aspiradoras'
};

try {
    const data = fs.readFileSync(tsvPath, 'utf8');
    const lines = data.split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    
    const products = [];
    
    // Start from index 1 to skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split('\t');
        if (cols.length < 5) continue; // Basic validation

        const baseProduct = {};
        headers.forEach((h, idx) => {
            if (idx < cols.length) baseProduct[h] = cols[idx].trim();
        });

        // Extract Product Data (1 Row = 1 Product, using Index 1 columns strictly)
        // Ignoring SKU2..5 as requested
        
        const sku = baseProduct['SKU1'];
        if (sku) {
            const cleanPrice = (baseProduct['price'] || '0').replace(/[^\d.]/g, ''); 
            const cleanSale = (baseProduct['originalPrice'] || '0').replace(/[^\d.]/g, '');

            const product = {
                sku: sku,
                name: baseProduct['name'],
                description: baseProduct['description'],
                price: parseInt(cleanPrice) || 0,
                salePrice: parseInt(cleanSale) || 0, // 'originalPrice' is the offer/sale price
                
                image: baseProduct['Imagen1'] || baseProduct['link'] || '', 
                mainCategory: categoryMap[baseProduct['category']] || baseProduct['category'] || 'General',
                category: categoryMap[baseProduct['category']] || baseProduct['category'] || 'General', // Keeping both for compatibility
                
                color: baseProduct['Color1'] || baseProduct['Hex1'] || '', // Name of the color
                colorHex: baseProduct['Hex1'] || '#ccc', // Hex code for visual circle
                
                specs: [], 
                link: baseProduct['link'] || '' // Link already includes domain
            };

            // Parse Specs (Storage column)
            const rawSpecs = baseProduct['storage'] || '';
            let parsedSpecs = [];
            if (rawSpecs.startsWith('[')) {
                try {
                     parsedSpecs = JSON.parse(rawSpecs); // e.g. ["512 GB", "RAM 12GB"]
                } catch(e) { parsedSpecs = [rawSpecs]; }
            } else if (rawSpecs) {
                parsedSpecs = rawSpecs.split(',').map(s => s.trim());
            }
            product.specs = parsedSpecs;

            products.push(product);
        }
    }

    const outputContent = `// Auto-generated from TSV
export const initialProducts = ${JSON.stringify(products, null, 4)};
`;

    fs.writeFileSync(outputPath, outputContent);
    console.log(`Successfully converted ${products.length} products to ${outputPath}`);

} catch (err) {
    console.error('Error reading/parsing TSV:', err);
    process.exit(1);
}
