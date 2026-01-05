const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Check for service account
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: No se encontró service-account.json en la carpeta scripts/');
    console.error('Por favor descarga tu clave privada desde Firebase Console -> Project Settings -> Service Accounts');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load color data
const colorVariablesPath = path.join(__dirname, '..', 'src', 'data', 'color-variables.js');
const colorVarsContent = fs.readFileSync(colorVariablesPath, 'utf8');
const jsonMatch = colorVarsContent.match(/var colorVariables = ({[\s\S]*?});/);
const colorVariables = jsonMatch ? JSON.parse(jsonMatch[1].replace(/(\w+):/g, '"$1":')) : {};

// Color detection logic
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
    
    return 'Blanco'; // Default
}

const excelPath = path.join(__dirname, '..', 'Productos-de-la-Familia2025-12-01.xlsx');

async function migrateExcelWithColors() {
    console.log('📖 Leyendo Excel:', excelPath);
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log(`🔍 Encontradas ${rows.length} filas.`);
    console.log(`🎨 Cargados ${Object.keys(colorVariables).length} colores.`);
    
    const batchSize = 400;
    let batch = db.batch();
    let count = 0;
    let totalCount = 0;
    const stats = {
        withImage: 0,
        withoutImage: 0,
        colorDistribution: {}
    };

    for (const row of rows) {
        if (!row['SKU']) continue;

        // Sanitize SKU to be a valid Document ID
        const safeId = String(row['SKU']).replace(/\//g, '_');
        const docRef = db.collection('products').doc(safeId);
        
        const productName = row['Nombre de Pantalla'] || row['Familia'] || 'Sin Nombre';
        const sku = row['SKU'];
        const imageUrl = row['Imagen'] || '';
        
        // Detect color
        const detectedColor = detectColorFromSKU(sku, productName);
        const colorData = colorVariables[detectedColor] || colorVariables['Blanco'];
        
        // Track stats
        stats.colorDistribution[detectedColor] = (stats.colorDistribution[detectedColor] || 0) + 1;
        if (imageUrl) {
            stats.withImage++;
        } else {
            stats.withoutImage++;
        }
        
        // Create color object
        const colorInfo = {
            id: colorData.id,
            colorId: colorData.id,
            name: detectedColor,
            hex: colorData.hex,
            sku: sku,
            images: imageUrl ? [imageUrl] : [],
            image: imageUrl
        };
        
        // Map Excel columns to Firestore Schema
        const productData = {
            id: String(row['SKU']),
            name: productName,
            category: row['Familia'] || 'General',
            image: imageUrl,
            basePrice: 0,
            baseLink: row['Shop URL'] || row['URL'] || '',
            active: row['¿Activo?'] === 'Si',
            description: '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // NEW: Add color data automatically
            colors: [colorInfo],
            variants: []
        };

        batch.set(docRef, productData);
        count++;
        totalCount++;

        // Show first 5 products
        if (totalCount <= 5) {
            console.log(`\n✅ ${productName}`);
            console.log(`   SKU: ${sku}`);
            console.log(`   Color: ${detectedColor}`);
            console.log(`   Image: ${imageUrl ? 'Yes' : 'No'}`);
        }

        if (count >= batchSize) {
            console.log(`\n💾 Guardando lote de ${count} productos...`);
            await batch.commit();
            batch = db.batch();
            count = 0;
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    if (count > 0) {
        console.log(`\n💾 Guardando lote final de ${count} productos...`);
        await batch.commit();
    }

    console.log(`\n✅ Migración completada. Total: ${totalCount} productos.`);
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Con imágenes: ${stats.withImage}`);
    console.log(`   Sin imágenes: ${stats.withoutImage}`);
    console.log(`\n   Distribución de colores:`);
    Object.entries(stats.colorDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([color, count]) => {
            console.log(`      ${color}: ${count}`);
        });
}

migrateExcelWithColors().catch(console.error);
