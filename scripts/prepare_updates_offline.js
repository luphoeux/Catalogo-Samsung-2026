const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load local color data by parsing the JS file
const colorVariablesPath = path.join(__dirname, '..', 'src', 'data', 'color-variables.js');
const colorVarsContent = fs.readFileSync(colorVariablesPath, 'utf8');
// Extract the JSON object from the file
const jsonMatch = colorVarsContent.match(/var colorVariables = ({[\s\S]*?});/);
const colorVariables = jsonMatch ? JSON.parse(jsonMatch[1].replace(/(\w+):/g, '"$1":')) : {};

// Color mapping for common SKU patterns
const colorPatterns = {
    'WH': 'Blanco',
    'BK': 'Negro', 
    'SL': 'Plateado',
    'GR': 'Gris',
    'BL': 'Azul',
    'RD': 'Rojo',
    'GD': 'Oro Rosa',
    'VT': 'Violeta',
    'GN': 'Verde',
    'PK': 'Rosa'
};

function detectColorFromSKU(sku, productName) {
    if (!sku) return 'Blanco';
    
    const skuUpper = sku.toUpperCase();
    const nameUpper = productName ? productName.toUpperCase() : '';
    
    // Check for color patterns in SKU
    for (const [pattern, color] of Object.entries(colorPatterns)) {
        if (skuUpper.includes(pattern)) {
            return color;
        }
    }
    
    // Check product name for color hints
    if (nameUpper.includes('NEGRO') || nameUpper.includes('BLACK')) return 'Negro';
    if (nameUpper.includes('BLANCO') || nameUpper.includes('WHITE')) return 'Blanco';
    if (nameUpper.includes('GRIS') || nameUpper.includes('GRAY')) return 'Gris';
    if (nameUpper.includes('PLATEADO') || nameUpper.includes('SILVER')) return 'Plateado';
    
    // Default to Blanco
    return 'Blanco';
}

function normalizeProductName(name) {
    return name.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .trim();
}

async function prepareUpdatesOffline() {
    try {
        console.log('📥 Step 1: Loading Excel data...');
        const wb = XLSX.readFile('Productos-de-la-Familia2025-12-01.xlsx');
        const ws = wb.Sheets[wb.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(ws);
        console.log(`   Found ${excelData.length} products in Excel`);

        console.log('\n🎨 Step 2: Processing color data...');
        const colorMap = {};
        for (const [colorName, colorData] of Object.entries(colorVariables)) {
            colorMap[colorName] = {
                id: colorData.id,
                hex: colorData.hex,
                name: colorName
            };
        }
        console.log(`   Found ${Object.keys(colorMap).length} colors`);

        console.log('\n🔄 Step 3: Preparing updates for all Excel products...');
        const updates = [];
        const stats = {
            total: 0,
            withImage: 0,
            withoutImage: 0,
            colorDistribution: {}
        };

        for (const excelProduct of excelData) {
            if (!excelProduct['Nombre de Pantalla'] || !excelProduct.SKU) {
                continue;
            }

            stats.total++;

            // Detect color from SKU
            const detectedColor = detectColorFromSKU(excelProduct.SKU, excelProduct['Nombre de Pantalla']);
            const colorData = colorMap[detectedColor] || colorMap['Blanco'];

            // Track color distribution
            stats.colorDistribution[detectedColor] = (stats.colorDistribution[detectedColor] || 0) + 1;

            if (excelProduct.Imagen) {
                stats.withImage++;
            } else {
                stats.withoutImage++;
            }

            // Generate product ID (same logic as migration script)
            const productId = excelProduct.SKU.replace(/\//g, '-');

            // Prepare color data
            const colorInfo = {
                id: colorData.id,
                colorId: colorData.id,
                name: colorData.name,
                hex: colorData.hex,
                sku: excelProduct.SKU,
                images: excelProduct.Imagen ? [excelProduct.Imagen] : [],
                image: excelProduct.Imagen || ''
            };

            updates.push({
                productId: productId,
                productName: excelProduct['Nombre de Pantalla'],
                sku: excelProduct.SKU,
                detectedColor: detectedColor,
                imageUrl: excelProduct.Imagen || null,
                shopUrl: excelProduct['Shop URL'] || null,
                colorData: colorInfo
            });

            if (stats.total <= 5) {
                console.log(`   ✅ ${excelProduct['Nombre de Pantalla']}`);
                console.log(`      ID: ${productId}`);
                console.log(`      SKU: ${excelProduct.SKU}`);
                console.log(`      Color: ${detectedColor}`);
                console.log(`      Image: ${excelProduct.Imagen ? 'Yes' : 'No'}`);
            }
        }

        console.log(`\n📊 Step 4: Statistics`);
        console.log(`   Total products: ${stats.total}`);
        console.log(`   With images: ${stats.withImage}`);
        console.log(`   Without images: ${stats.withoutImage}`);
        console.log(`\n   Color distribution:`);
        Object.entries(stats.colorDistribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([color, count]) => {
                console.log(`      ${color}: ${count}`);
            });

        // Save to JSON file
        const outputPath = path.join(__dirname, 'product_updates_offline.json');
        fs.writeFileSync(outputPath, JSON.stringify(updates, null, 2));
        console.log(`\n💾 Updates saved to: ${outputPath}`);

        // Create detailed report
        const reportPath = path.join(__dirname, 'update_report_offline.txt');
        let report = `Product Update Report (Offline Mode)\n`;
        report += `Generated: ${new Date().toISOString()}\n`;
        report += `${'='.repeat(80)}\n\n`;
        report += `SUMMARY\n`;
        report += `${'='.repeat(80)}\n`;
        report += `Total products: ${stats.total}\n`;
        report += `Products with images: ${stats.withImage}\n`;
        report += `Products without images: ${stats.withoutImage}\n\n`;
        
        report += `COLOR DISTRIBUTION\n`;
        report += `${'='.repeat(80)}\n`;
        Object.entries(stats.colorDistribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([color, count]) => {
                const percentage = ((count / stats.total) * 100).toFixed(1);
                report += `${color.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)\n`;
            });

        report += `\n\nSAMPLE UPDATES (First 20)\n`;
        report += `${'='.repeat(80)}\n`;
        
        updates.slice(0, 20).forEach((u, i) => {
            report += `\n${(i + 1).toString().padStart(2)}. ${u.productName}\n`;
            report += `    Product ID: ${u.productId}\n`;
            report += `    SKU: ${u.sku}\n`;
            report += `    Color: ${u.detectedColor} (${u.colorData.hex})\n`;
            report += `    Image: ${u.imageUrl ? 'Yes' : 'No'}\n`;
            if (u.imageUrl) {
                report += `    Image URL: ${u.imageUrl.substring(0, 60)}...\n`;
            }
        });

        fs.writeFileSync(reportPath, report);
        console.log(`📄 Report saved to: ${reportPath}`);

        console.log(`\n✅ Done! Review the files and use them when Firestore quota is available.`);
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Review: scripts/update_report_offline.txt`);
        console.log(`   2. When quota is available, run: node scripts/apply_product_updates.js`);

    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
    }
}

prepareUpdatesOffline();
