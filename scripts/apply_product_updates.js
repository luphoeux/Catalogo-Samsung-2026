const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function applyProductUpdates() {
    try {
        console.log('📥 Loading prepared updates...');
        const updatesPath = path.join(__dirname, 'product_updates_offline.json');
        const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
        console.log(`   Found ${updates.length} updates to apply`);

        console.log('\n🔄 Applying updates to Firestore...');
        console.log('   This will update products in batches of 500');

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Process in batches of 500 (Firestore batch limit)
        const batchSize = 500;
        for (let i = 0; i < updates.length; i += batchSize) {
            const batch = db.batch();
            const batchUpdates = updates.slice(i, i + batchSize);
            
            console.log(`\n   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}...`);

            for (const update of batchUpdates) {
                try {
                    const productRef = db.collection('products').doc(update.productId);
                    
                    // Get existing product data
                    const doc = await productRef.get();
                    
                    if (!doc.exists) {
                        console.log(`   ⚠️  Product not found: ${update.productName} (${update.productId})`);
                        errorCount++;
                        errors.push({
                            productId: update.productId,
                            error: 'Product not found in Firestore'
                        });
                        continue;
                    }

                    const existingData = doc.data();
                    const existingColors = existingData.colors || [];

                    // Check if this color already exists
                    const colorExists = existingColors.some(c => 
                        c.id === update.colorData.id || c.colorId === update.colorData.id
                    );

                    let updatedColors;
                    if (colorExists) {
                        // Update existing color
                        updatedColors = existingColors.map(c => {
                            if (c.id === update.colorData.id || c.colorId === update.colorData.id) {
                                return {
                                    ...c,
                                    ...update.colorData,
                                    // Merge images if there are existing ones
                                    images: [...new Set([...(c.images || []), ...(update.colorData.images || [])])]
                                };
                            }
                            return c;
                        });
                    } else {
                        // Add new color
                        updatedColors = [...existingColors, update.colorData];
                    }

                    // Update the product
                    batch.update(productRef, { colors: updatedColors });
                    successCount++;

                } catch (error) {
                    console.error(`   ❌ Error processing ${update.productName}:`, error.message);
                    errorCount++;
                    errors.push({
                        productId: update.productId,
                        error: error.message
                    });
                }
            }

            // Commit the batch
            try {
                await batch.commit();
                console.log(`   ✅ Batch committed successfully`);
            } catch (error) {
                console.error(`   ❌ Error committing batch:`, error.message);
                // If we hit quota limits, stop and report
                if (error.code === 8 || error.message.includes('Quota')) {
                    console.error('\n❌ Firestore quota exceeded. Please try again later.');
                    console.log(`\n📊 Progress: ${successCount}/${updates.length} products updated`);
                    process.exit(1);
                }
            }

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < updates.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`\n📊 Final Summary:`);
        console.log(`   ✅ Successfully updated: ${successCount} products`);
        console.log(`   ❌ Errors: ${errorCount} products`);

        if (errors.length > 0) {
            const errorLogPath = path.join(__dirname, 'update_errors.json');
            fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
            console.log(`\n   Error log saved to: ${errorLogPath}`);
        }

        console.log(`\n✅ Update process completed!`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

applyProductUpdates();
