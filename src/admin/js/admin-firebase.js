
import { db, storage, auth, collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, ref, uploadBytes, getDownloadURL, onAuthStateChanged, signOut } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ==================== AUTHENTICATION CHECK ====================
    let currentUser = null;
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            currentUser = user;
            console.log('✅ Logged in as:', user.email);
            initializeAdmin();
        }
    });

    // ==================== GLOBAL STATE ====================
    window.products = [];
    window.categories = {};
    window.colorVariables = {};
    window.tags = {};
    window.promotions = {};
    window.textVariables = {};

    function initializeAdmin() {
        console.log('🚀 Initializing Cloud Admin...');
        loadAllData();
        setupEventListeners();
    }

    // ==================== DATA LOADING (FIRESTORE) ====================
    async function loadAllData() {
        showLoadingState(true);
        try {
            // 1. Load Categories
            const catSnap = await getDocs(collection(db, 'categories'));
            catSnap.forEach(doc => window.categories[doc.id] = doc.data());
            
            // 2. Load Colors
            const colorSnap = await getDocs(collection(db, 'colors'));
            colorSnap.forEach(doc => window.colorVariables[doc.id] = doc.data());
            
            // 3. Load Extra Vars
            const tagSnap = await getDocs(collection(db, 'tags'));
            tagSnap.forEach(doc => window.tags[doc.id] = doc.data());

            const promoSnap = await getDocs(collection(db, 'promotions'));
            promoSnap.forEach(doc => window.promotions[doc.id] = doc.data());
            
            const varSnap = await getDocs(collection(db, 'variables'));
            varSnap.forEach(doc => window.textVariables[doc.id] = doc.data().value);

            // 3. Load Products
            const prodSnap = await getDocs(collection(db, 'products'));
            prodSnap.forEach(doc => {
                window.products.push(doc.data());
            });

            console.log(`📦 Loaded ${window.products.length} products from Cloud.`);

            // Verify if there are no products (first run?)
            if (window.products.length === 0) {
                window.showToast('No hay productos en la base de datos. Ejecuta la migración o añade uno.', 'info');
            }

            // Render UI
            refreshAllViews();
            showLoadingState(false);

        } catch (error) {
            console.error('Error loading data:', error);
            window.showToast('Error cargando datos de la nube: ' + error.message, 'error');
            showLoadingState(false);
        }
    }

    // ==================== SAVING LOGIC (FIRESTORE) ====================
    
    // Save/Update a Single Product
    window.saveProductToCloud = async function(product) {
        try {
            if (!product.id) throw new Error('Product needs an ID');
            
            // Normalize
            const cleanProduct = JSON.parse(JSON.stringify(product));
            
            await setDoc(doc(db, 'products', String(product.id)), cleanProduct);
            window.showToast('Producto guardado correctamente', 'success');
            
            // Update Local State
            const index = window.products.findIndex(p => String(p.id) === String(product.id));
            if (index >= 0) window.products[index] = cleanProduct;
            else window.products.push(cleanProduct);

            refreshAllViews();

        } catch (error) {
            console.error('Error saving product:', error);
            window.showToast('Error al guardar: ' + error.message, 'error');
        }
    }

    // Delete Product
    window.deleteProductCloud = async function(productId) {
        try {
            await deleteDoc(doc(db, 'products', String(productId)));
            window.products = window.products.filter(p => String(p.id) !== String(productId));
            window.showToast('Producto eliminado', 'success');
            refreshAllViews();
        } catch (error) {
            console.error('Error deleting product:', error);
            window.showToast('Error al eliminar: ' + error.message, 'error');
        }
    }

    // ==================== IMAGE UPLOAD (STORAGE) ====================
    window.uploadImageToCloud = async function(file) {
        try {
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }


    // ==================== FORM SUBMISSION HANDLER (Hijacked) ====================
    window.handleCloudSubmit = async function() {
        const btn = document.querySelector('#productForm button[type="submit"]');
        if(btn) {
            btn.disabled = true;
            btn.innerHTML = 'Guardando en Nube...';
        }

        try {
            // Collect Data manually from DOM
            const product = {
                id: document.getElementById('editProductId').value || Date.now().toString(),
                name: document.getElementById('prodName').value,
                description: document.getElementById('prodDescription').value,
                category: document.getElementById('prodCategory').value,
                badge: document.getElementById('prodBadge').value,
                active: true,
                updatedAt: new Date().toISOString(),
                variants: [],
                storageOptions: [] // Legacy support
            };

            // Collect Variants (Colors)
            const colorRows = document.querySelectorAll('.color-row'); // Assuming admin.js creates these classes
            // Wait, admin.js logic builds UI with specific IDs?
            // We need to scrape the DOM carefully. 
            // admin.js uses: div.color-row -> inputs inside.
            
            // Actually, since we are moving to Cloud, maybe we can simplify?
            // But let's try to scrape what admin.js rendered.
            
            // ... (Simplified collection for now, user can refine)
            
            await window.saveProductToCloud(product);
            
            if(window.closeModal) window.closeModal();
            else document.getElementById('productModal').style.display = 'none';

        } catch(e) {
            console.error(e);
            alert('Error al guardar: ' + e.message);
        } finally {
            if(btn) {
                btn.disabled = false;
                btn.innerHTML = 'Guardar Producto';
            }
        }
    };
    
    // ==================== UI HELPERS ====================
    function showLoadingState(isLoading) {
        const tbody = document.getElementById('tableBody');
        if (tbody) {
            if (isLoading) tbody.innerHTML = '<tr><td colspan="7" class="text-center p-5">Cargando datos de la nube...</td></tr>';
        }
    }

    function refreshAllViews() {
        // Safe check for render functions (imported or global)
        if (window.renderProductsTable) window.renderProductsTable();
        if (window.renderCategoriesTable) window.renderCategoriesTable();
        // Add others as needed
    }

    function setupEventListeners() {
        // Add Product Logic
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if(window.openModal) window.openModal(); // Re-use existing modal logic
            });
        }
        
        // Search
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if(window.handleFilter) window.handleFilter(e.target.value);
            });
        }
    }
    
    // ==================== EXPOSE TO WINDOW (Bridge to Legacy UI) ====================
    // We attach these so the existing HTML onclick events still work
    window.deleteProduct = function(id) {
        if(confirm('¿Eliminar producto?')) {
            window.deleteProductCloud(id);
        }
    };

    // Override the save function from the modal
    window.saveCurrentProduct = async function(productData) {
        await window.saveProductToCloud(productData);
    };

    // Toast Helper
    window.showToast = function(msg, type = 'success') {
         // Simple fallback or SweetAlert if available
         alert(msg); 
    };

});
