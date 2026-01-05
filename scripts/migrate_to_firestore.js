const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const vm = require('vm');

// TODO: Download service-account.json from Firebase Console -> Project Settings -> Service Accounts
// and save it in this directory.
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper to load JS data (same as server.js)
function loadJSData(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath, 'utf8');
        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext(content, sandbox);
        const keys = Object.keys(sandbox);
        if (keys.length > 0) return sandbox[keys[0]];
    } catch (err) {
        console.error(`Error loading ${filePath}:`, err.message);
    }
    return null;
}

async function migrateData() {
    console.log('Starting migration...');

    // 1. Migrate Products (SKIPPED - DONE VIA EXCEL MIGRATION)
    // const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.js');
    // const products = loadJSData(productsPath);
    // if (products) { ... }

    // 2. Migrate Categories
    const catPath = path.join(__dirname, '..', 'src', 'data', 'categories.js');
    const categories = loadJSData(catPath);
    if (categories) {
        console.log('Migrating Categories...');
        const batch = db.batch();
        for (const [key, val] of Object.entries(categories)) {
            // Use ID if available, else key
            const docId = val.id || key;
            batch.set(db.collection('categories').doc(docId), val);
        }
        await batch.commit();
    }

    // 3. Migrate Colors
    const colorsPath = path.join(__dirname, '..', 'src', 'data', 'color-variables.js');
    const colors = loadJSData(colorsPath);
    if (colors) {
        console.log('Migrating Colors...');
        const batch = db.batch();
        for (const [name, val] of Object.entries(colors)) {
            const docId = val.id || name;
            batch.set(db.collection('colors').doc(docId), val);
        }
        await batch.commit();
    }

    // 4. Migrate Text Variables
    const varsPath = path.join(__dirname, '..', 'src', 'data', 'text-variables.js');
    const textVars = loadJSData(varsPath);
    if (textVars) {
        console.log('Migrating Text Variables...');
        const batch = db.batch();
        for (const [key, val] of Object.entries(textVars)) {
            batch.set(db.collection('variables').doc(key), { value: val });
        }
        await batch.commit();
    }

    // 5. Migrate Tags
    const tagsPath = path.join(__dirname, '..', 'src', 'data', 'tags.js');
    const tags = loadJSData(tagsPath);
    if (tags) {
        console.log('Migrating Tags...');
        const batch = db.batch();
        for (const [key, val] of Object.entries(tags)) {
             const docId = val.id || key;
             batch.set(db.collection('tags').doc(docId), val);
        }
        await batch.commit();
    }

    // 6. Migrate Promotions
    const promoPath = path.join(__dirname, '..', 'src', 'data', 'promotions.js');
    const promotions = loadJSData(promoPath);
    if (promotions) {
        console.log('Migrating Promotions...');
        const batch = db.batch();
        for (const [key, val] of Object.entries(promotions)) {
             const docId = val.id || key;
             batch.set(db.collection('promotions').doc(docId), val);
        }
        await batch.commit();
    }

    console.log('Migration Complete! ensure to check Firestore Console.');
}

migrateData().catch(console.error);
