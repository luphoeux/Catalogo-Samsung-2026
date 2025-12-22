const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const catalogPath = path.join(__dirname, 'database', 'catalogs', 'Catalogo_Samsung_B2B.xlsx');
if (!fs.existsSync(catalogPath)) {
    console.log('File not found:', catalogPath);
    process.exit(1);
}

const workbook = xlsx.readFile(catalogPath);
const results = {};

if (workbook.Sheets['Productos']) {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets['Productos']);
    results.productsCount = data.length;
    if (data.length > 0) {
        results.firstProduct = JSON.parse(data[0]['Datos Completos'] || '{}');
    }
}

if (workbook.Sheets['Info']) {
    results.metadata = xlsx.utils.sheet_to_json(workbook.Sheets['Info']);
}

fs.writeFileSync('debug_catalog_full.json', JSON.stringify(results, null, 2));
console.log('Dumped full catalog info to debug_catalog_full.json');
