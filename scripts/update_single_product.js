const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateSingleProduct() {
    try {
        console.log('🔍 Loading Excel data...');
        const wb = XLSX.readFile('Productos-de-la-Familia2025-12-01.xlsx');
        const ws = wb.Sheets[wb.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(ws);

        // Find the specific product in Excel
        const excelProduct = excelData.find(p => 
            p['Nombre de Pantalla'] && 
            p['Nombre de Pantalla'].toLowerCase().includes('9000 btu')
        );

        if (!excelProduct) {
            console.error('❌ Product not found in Excel');
            return;
        }

        console.log('📦 Found product in Excel:', excelProduct['Nombre de Pantalla']);
        console.log('   SKU:', excelProduct.SKU);
        console.log('   Image:', excelProduct.Imagen);

        // Find the product in Firestore by name
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        
        let firestoreProduct = null;
        let productId = null;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.name && data.name.toLowerCase().includes('9000 btu')) {
                firestoreProduct = data;
                productId = doc.id;
            }
        });

        if (!firestoreProduct) {
            console.error('❌ Product not found in Firestore');
            return;
        }

        console.log('🔥 Found product in Firestore:', firestoreProduct.name);
        console.log('   ID:', productId);

        // Get the Blanco color ID
        const colorsSnapshot = await db.collection('colors').get();
        let blancoColorId = null;
        
        colorsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.name && data.name.toLowerCase() === 'blanco') {
                blancoColorId = data.id;
            }
        });

        if (!blancoColorId) {
            console.error('❌ Blanco color not found in Firestore');
            return;
        }

        console.log('🎨 Found Blanco color ID:', blancoColorId);

        // Prepare the updated product data
        const updatedProduct = {
            ...firestoreProduct,
            colors: [
                {
                    id: blancoColorId,
                    colorId: blancoColorId,
                    name: 'Blanco',
                    hex: '#f5f7f6', // Blanco hex from color-variables.js
                    sku: excelProduct.SKU,
                    images: [excelProduct.Imagen],
                    image: excelProduct.Imagen
                }
            ]
        };

        // Update in Firestore
        await db.collection('products').doc(productId).update(updatedProduct);

        console.log('✅ Product updated successfully!');
        console.log('📋 Summary:');
        console.log('   - SKU added:', excelProduct.SKU);
        console.log('   - Color assigned: Blanco');
        console.log('   - Image added:', excelProduct.Imagen);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

updateSingleProduct();
