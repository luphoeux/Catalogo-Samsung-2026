const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');

// Check for service account
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!require('fs').existsSync(serviceAccountPath)) {
    console.error('❌ Error: No se encontró service-account.json en la carpeta scripts/');
    console.error('Por favor descarga tu clave privada desde Firebase Console -> Project Settings -> Service Accounts');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const excelPath = 'd:\\Repositorios\\Samsung Catalogo\\Productos-de-la-Familia2025-12-01.xlsx';

async function migrateExcel() {
    console.log('📖 Leyendo Excel:', excelPath);
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log(`🔍 Encontradas ${rows.length} filas.`);
    
    const batchSize = 400;
    let batch = db.batch();
    let count = 0;
    let totalCount = 0;

    for (const row of rows) {
        if (!row['SKU']) continue;

        // Sanitize SKU to be a valid Document ID (no slashes)
        const safeId = String(row['SKU']).replace(/\//g, '_');
        const docRef = db.collection('products').doc(safeId);
        
        // Map Excel columns to Firestore Schema
        const productData = {
            id: String(row['SKU']),
            name: row['Nombre de Pantalla'] || row['Familia'] || 'Sin Nombre',
            category: row['Familia'] || 'General', // Using Familia as category/group for now
            image: row['Imagen'] || '',
            basePrice: 0, // PRICE IS MISSING IN EXCEL
            baseLink: row['Shop URL'] || row['URL'] || '',
            active: row['¿Activo?'] === 'Si',
            description: '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Legacy/Compatibility fields
            variants: [], 
            colors: []
        };

        batch.set(docRef, productData);
        count++;
        totalCount++;

        if (count >= batchSize) {
            console.log(`💾 Guardando lote de ${count} productos...`);
            await batch.commit();
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) {
        console.log(`💾 Guardando lote final de ${count} productos...`);
        await batch.commit();
    }

    console.log(`✅ Migración completada. Total: ${totalCount} productos.`);
    console.log('⚠️ NOTA: El Excel no tenía columna de PRECIO, se estableció en 0.');
}

migrateExcel().catch(console.error);
