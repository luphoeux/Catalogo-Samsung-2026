const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load color data
const colorVariablesPath = path.join(__dirname, '..', 'src', 'data', 'color-variables.js');
const colorVarsContent = fs.readFileSync(colorVariablesPath, 'utf8');
const jsonMatch = colorVarsContent.match(/var colorVariables = ({[\s\S]*?});/);
const colorVariables = jsonMatch ? JSON.parse(jsonMatch[1].replace(/(\w+):/g, '"$1":')) : {};

// Color detection logic
const colorPatterns = {
    'WH': 'Blanco', 'BK': 'Negro', 'SL': 'Plateado', 'GR': 'Gris',
    'BL': 'Azul', 'RD': 'Rojo', 'GD': 'Oro Rosa', 'VT': 'Violeta',
    'GN': 'Verde', 'PK': 'Rosa'
};

function detectColorFromSKU(sku, productName) {
    if (!sku) return 'Blanco';
    const skuUpper = sku.toUpperCase();
    const nameUpper = productName ? productName.toUpperCase() : '';
    
    for (const [pattern, color] of Object.entries(colorPatterns)) {
        if (skuUpper.includes(pattern)) return color;
    }
    
    if (nameUpper.includes('NEGRO') || nameUpper.includes('BLACK')) return 'Negro';
    if (nameUpper.includes('BLANCO') || nameUpper.includes('WHITE')) return 'Blanco';
    if (nameUpper.includes('GRIS') || nameUpper.includes('GRAY')) return 'Gris';
    if (nameUpper.includes('PLATEADO') || nameUpper.includes('SILVER')) return 'Plateado';
    
    return 'Blanco';
}

function createLocalDatabase() {
    console.log('📖 Leyendo Excel...');
    const wb = xlsx.readFile('Productos-de-la-Familia2025-12-01.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const excelData = xlsx.utils.sheet_to_json(ws);
    console.log(`   Encontrados ${excelData.length} productos\n`);

    const localDB = {
        products: {},
        categories: {},
        colors: {},
        tags: {},
        promotions: {},
        variables: {},
        combos: {}
    };

    // Add colors
    for (const [colorName, colorData] of Object.entries(colorVariables)) {
        localDB.colors[colorData.id] = {
            id: colorData.id,
            name: colorName,
            hex: colorData.hex
        };
    }

    // Process products
    let count = 0;
    for (const row of excelData) {
        if (!row['SKU']) continue;

        const safeId = String(row['SKU']).replace(/\//g, '_');
        const productName = row['Nombre de Pantalla'] || row['Familia'] || 'Sin Nombre';
        const sku = row['SKU'];
        const imageUrl = row['Imagen'] || '';
        
        const detectedColor = detectColorFromSKU(sku, productName);
        const colorData = colorVariables[detectedColor] || colorVariables['Blanco'];
        
        const colorInfo = {
            id: colorData.id,
            colorId: colorData.id,
            name: detectedColor,
            hex: colorData.hex,
            sku: sku,
            images: imageUrl ? [imageUrl] : [],
            image: imageUrl
        };
        
        localDB.products[safeId] = {
            id: String(row['SKU']),
            name: productName,
            category: row['Familia'] || 'General',
            image: imageUrl,
            basePrice: 0,
            price: 0,
            baseLink: row['Shop URL'] || row['URL'] || '',
            active: row['¿Activo?'] === 'Si',
            description: '',
            colors: [colorInfo],
            variants: [],
            priceVariants: []
        };

        count++;
        if (count <= 5) {
            console.log(`✅ ${productName}`);
            console.log(`   SKU: ${sku}`);
            console.log(`   Color: ${detectedColor}`);
        }
    }

    // Save to file
    const outputPath = path.join(__dirname, 'local_database.json');
    fs.writeFileSync(outputPath, JSON.stringify(localDB, null, 2));
    
    console.log(`\n💾 Base de datos local creada: ${outputPath}`);
    console.log(`\n📊 Resumen:`);
    console.log(`   Productos: ${Object.keys(localDB.products).length}`);
    console.log(`   Colores: ${Object.keys(localDB.colors).length}`);
    
    // Create import script
    const importScript = `const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function importLocalDatabase() {
    const localDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'local_database.json'), 'utf8'));
    
    console.log('📤 Importando a Firestore...');
    
    for (const [collection, docs] of Object.entries(localDB)) {
        console.log(\`\\n   Importando \${collection}...\`);
        const batch = db.batch();
        let count = 0;
        
        for (const [docId, data] of Object.entries(docs)) {
            const docRef = db.collection(collection).doc(docId);
            batch.set(docRef, data);
            count++;
            
            if (count >= 500) {
                await batch.commit();
                console.log(\`   ✅ \${count} documentos guardados\`);
                await new Promise(r => setTimeout(r, 1000));
                count = 0;
            }
        }
        
        if (count > 0) {
            await batch.commit();
            console.log(\`   ✅ \${count} documentos guardados\`);
        }
    }
    
    console.log('\\n✅ Importación completada!');
    process.exit(0);
}

importLocalDatabase().catch(console.error);
`;

    fs.writeFileSync(path.join(__dirname, 'import_local_database.js'), importScript);
    console.log(`\n📝 Script de importación creado: scripts/import_local_database.js`);
    console.log(`\n🚀 Cuando la cuota esté disponible, ejecuta:`);
    console.log(`   node scripts/import_local_database.js`);
}

createLocalDatabase();
