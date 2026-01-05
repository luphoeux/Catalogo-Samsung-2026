const admin = require('firebase-admin');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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

function detectColorFromSKU(sku) {
    if (!sku) return 'Blanco'; // Default
    
    const skuUpper = sku.toUpperCase();
    
    // Check for color patterns in SKU
    for (const [pattern, color] of Object.entries(colorPatterns)) {
        if (skuUpper.includes(pattern)) {
            return color;
        }
    }
    
    // Default to Blanco for air conditioners and most appliances
    return 'Blanco';
}

async function prepareProductUpdates() {
    try {
        console.log('📥 Step 1: Loading Excel data...');
        const wb = XLSX.readFile('Productos-de-la-Familia2025-12-01.xlsx');
        const ws = wb.Sheets[wb.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(ws);
        console.log(`   Found ${excelData.length} products in Excel`);

        console.log('\n📥 Step 2: Loading Firestore products...');
        const productsSnapshot = await db.collection('products').get();
        const firestoreProducts = {};
        productsSnapshot.forEach(doc => {
            firestoreProducts[doc.id] = doc.data();
        });
        console.log(`   Found ${Object.keys(firestoreProducts).length} products in Firestore`);

        console.log('\n🎨 Step 3: Loading color data...');
        const colorsSnapshot = await db.collection('colors').get();
        const colorMap = {};
        colorsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.name) {
                colorMap[data.name] = {
                    id: data.id,
                    hex: data.hex,
                    name: data.name
                };
            }
        });
        console.log(`   Found ${Object.keys(colorMap).length} colors`);

        console.log('\n🔄 Step 4: Matching and updating products...');
        const updates = [];
        let matched = 0;
        let notMatched = 0;

        for (const [productId, firestoreProduct] of Object.entries(firestoreProducts)) {
            // Try to find matching Excel product by name or SKU
            const excelProduct = excelData.find(ep => {
                const nameMatch = ep['Nombre de Pantalla'] && 
                                 firestoreProduct.name &&
                                 ep['Nombre de Pantalla'].toLowerCase().trim() === firestoreProduct.name.toLowerCase().trim();
                
                const skuMatch = ep.SKU && productId.includes(ep.SKU.replace(/[\/\-]/g, '_'));
                
                return nameMatch || skuMatch;
            });

            if (excelProduct) {
                matched++;
                
                // Detect color from SKU
                const detectedColor = detectColorFromSKU(excelProduct.SKU);
                const colorData = colorMap[detectedColor] || colorMap['Blanco'];

                if (!colorData) {
                    console.warn(`   ⚠️  Color "${detectedColor}" not found for ${firestoreProduct.name}`);
                    continue;
                }

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

                // Check if product already has this color
                const existingColors = firestoreProduct.colors || [];
                const hasColor = existingColors.some(c => c.id === colorData.id || c.colorId === colorData.id);

                let updatedColors;
                if (hasColor) {
                    // Update existing color
                    updatedColors = existingColors.map(c => 
                        (c.id === colorData.id || c.colorId === colorData.id) ? colorInfo : c
                    );
                } else {
                    // Add new color
                    updatedColors = [...existingColors, colorInfo];
                }

                updates.push({
                    id: productId,
                    name: firestoreProduct.name,
                    sku: excelProduct.SKU,
                    detectedColor: detectedColor,
                    image: excelProduct.Imagen,
                    update: {
                        colors: updatedColors
                    }
                });

                if (matched <= 5) {
                    console.log(`   ✅ ${firestoreProduct.name}`);
                    console.log(`      SKU: ${excelProduct.SKU}`);
                    console.log(`      Color: ${detectedColor}`);
                    console.log(`      Image: ${excelProduct.Imagen ? 'Yes' : 'No'}`);
                }
            } else {
                notMatched++;
            }
        }

        console.log(`\n📊 Step 5: Summary`);
        console.log(`   ✅ Matched: ${matched} products`);
        console.log(`   ❌ Not matched: ${notMatched} products`);
        console.log(`   📝 Updates prepared: ${updates.length}`);

        // Save to JSON file
        const outputPath = path.join(__dirname, 'product_updates.json');
        fs.writeFileSync(outputPath, JSON.stringify(updates, null, 2));
        console.log(`\n💾 Updates saved to: ${outputPath}`);

        // Create a summary report
        const reportPath = path.join(__dirname, 'update_report.txt');
        let report = `Product Update Report\n`;
        report += `Generated: ${new Date().toISOString()}\n`;
        report += `=`.repeat(60) + '\n\n';
        report += `Total products in Firestore: ${Object.keys(firestoreProducts).length}\n`;
        report += `Total products in Excel: ${excelData.length}\n`;
        report += `Matched products: ${matched}\n`;
        report += `Not matched: ${notMatched}\n`;
        report += `Updates prepared: ${updates.length}\n\n`;
        report += `Sample updates:\n`;
        report += `=`.repeat(60) + '\n';
        
        updates.slice(0, 10).forEach((u, i) => {
            report += `\n${i + 1}. ${u.name}\n`;
            report += `   ID: ${u.id}\n`;
            report += `   SKU: ${u.sku}\n`;
            report += `   Color: ${u.detectedColor}\n`;
            report += `   Colors count: ${u.update.colors.length}\n`;
        });

        fs.writeFileSync(reportPath, report);
        console.log(`📄 Report saved to: ${reportPath}`);

        console.log(`\n✅ Done! You can now review the updates and apply them when quota is available.`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

prepareProductUpdates();
