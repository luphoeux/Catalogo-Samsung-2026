const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');

// Service account will be needed here
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate(filePath) {
    console.log('📖 Reading Excel:', filePath);
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log(`🔍 Found ${rows.length} rows.`);

    // 1. Process Categories
    const categories = new Set();
    rows.forEach(r => { if(r['Familia']) categories.add(r['Familia'].trim()) });

    console.log(`📂 Creating ${categories.size} categories...`);
    for (const cat of categories) {
        const id = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await db.collection('categories').doc(id).set({ name: cat, active: true }, { merge: true });
    }

    // 2. Process Products
    const batch = db.batch();
    rows.forEach(row => {
        if (!row['SKU']) return;
        const sku = String(row['SKU']);
        const id = sku.replace(/\//g, '_');
        const catId = row['Familia']?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'general';

        batch.set(db.collection('products').doc(id), {
            sku: sku,
            name: row['Nombre de Pantalla'] || row['Familia'],
            category: catId,
            image: row['Imagen'] || '',
            link: row['Shop URL'] || row['URL'] || '',
            active: row['¿Activo?'] === 'Si',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });

    await batch.commit();
    console.log('✅ Migration complete');
}

migrate(path.join(__dirname, '../Productos-de-la-Familia2025-12-01.xlsx')).catch(console.error);
