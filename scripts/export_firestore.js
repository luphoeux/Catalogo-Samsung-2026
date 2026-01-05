const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportFirestoreToLocal() {
    try {
        console.log('📥 Descargando datos de Firestore...\n');
        
        const collections = ['products', 'categories', 'colors', 'tags', 'promotions', 'variables', 'combos'];
        const exportData = {};
        
        for (const collectionName of collections) {
            console.log(`   Descargando ${collectionName}...`);
            const snapshot = await db.collection(collectionName).get();
            exportData[collectionName] = {};
            
            snapshot.forEach(doc => {
                exportData[collectionName][doc.id] = doc.data();
            });
            
            console.log(`   ✅ ${Object.keys(exportData[collectionName]).length} documentos`);
        }
        
        // Save to local file
        const outputPath = path.join(__dirname, 'firestore_backup.json');
        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
        
        console.log(`\n💾 Backup guardado en: ${outputPath}`);
        console.log(`\n📊 Resumen:`);
        Object.entries(exportData).forEach(([collection, docs]) => {
            console.log(`   ${collection}: ${Object.keys(docs).length} documentos`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

exportFirestoreToLocal();
