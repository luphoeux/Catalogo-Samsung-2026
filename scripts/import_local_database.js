const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function importLocalDatabase() {
    const localDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'local_database.json'), 'utf8'));
    
    console.log('📤 Importando a Firestore...');
    
    for (const [collection, docs] of Object.entries(localDB)) {
        console.log(`\n   Importando ${collection}...`);
        const batch = db.batch();
        let count = 0;
        
        for (const [docId, data] of Object.entries(docs)) {
            const docRef = db.collection(collection).doc(docId);
            batch.set(docRef, data);
            count++;
            
            if (count >= 500) {
                await batch.commit();
                console.log(`   ✅ ${count} documentos guardados`);
                await new Promise(r => setTimeout(r, 1000));
                count = 0;
            }
        }
        
        if (count > 0) {
            await batch.commit();
            console.log(`   ✅ ${count} documentos guardados`);
        }
    }
    
    console.log('\n✅ Importación completada!');
    process.exit(0);
}

importLocalDatabase().catch(console.error);
