const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const xlsx = require('xlsx');
const { loadJSData } = require('./load-js-data');

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);

    // API Endpoint: Save Colors
    if (req.method === 'POST' && req.url === '/api/save-colors') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const colors = JSON.parse(body);
                const excelPath = path.join(__dirname, 'database', 'Samsung_Colores.xlsx');
                const jsPath = path.join(__dirname, 'src', 'data', 'color-variables.js');

                // 1. Update Excel (Optional - Don't block if fails)
                try {
                    let workbook;
                    if (fs.existsSync(excelPath)) {
                        try {
                            workbook = xlsx.readFile(excelPath);
                        } catch (e) { workbook = xlsx.utils.book_new(); }
                    } else {
                        workbook = xlsx.utils.book_new();
                    }

                    // Convert object to array of arrays for Excel
                    const data = [['ID', 'Nombre del Color', 'Código Hex']];
                    const sortedColors = Object.keys(colors).sort();
                    sortedColors.forEach((key, index) => {
                        const colorData = colors[key];
                        const id = colorData.id ? String(colorData.id) : `c${String(index + 1).padStart(3, '0')}`;
                        let hex = colorData.hex || colorData;
                        if (typeof hex !== 'string') hex = '';

                        data.push([id, String(key), hex]);
                    });

                    const newSheet = xlsx.utils.aoa_to_sheet(data);
                    newSheet['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 15 }];

                    if (!workbook.Sheets['Colores']) {
                        xlsx.utils.book_append_sheet(workbook, newSheet, 'Colores');
                    } else {
                        workbook.Sheets['Colores'] = newSheet;
                    }

                    xlsx.writeFile(workbook, excelPath);
                } catch (excelErr) {
                    console.error('⚠️ Error actualizando Excel:', excelErr.message);
                }

                // 2. Update color-variables.js (Client "Database")
                const jsContent = `// Color Variables\n// Auto-generated from Admin Panel\nvar colorVariables = ${JSON.stringify(colors, null, 4)};\n`;
                fs.writeFileSync(jsPath, jsContent);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Colores guardados en Excel y actualizados.' }));
            } catch (err) {
                console.error('Error saving colors:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // API Endpoint: Save Text Variables
    if (req.method === 'POST' && req.url === '/api/save-variables') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const variables = JSON.parse(body);
                const jsPath = path.join(__dirname, 'src', 'data', 'text-variables.js');

                // Update text-variables.js
                const jsContent = `// Text Variables\n// Auto-generated from Admin Panel\nvar textVariables = ${JSON.stringify(variables, null, 4)};\n`;
                fs.writeFileSync(jsPath, jsContent);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Variables guardadas correctamente.' }));
            } catch (err) {
                console.error('Error saving variables:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // API Endpoint: Save Tags
    if (req.method === 'POST' && req.url === '/api/save-tags') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const tagsData = JSON.parse(body);
                const jsPath = path.join(__dirname, 'src', 'data', 'tags.js');

                // Update tags.js
                const jsContent = `// Tags (Etiquetas)\n// Auto-generated from Admin Panel\nvar tags = ${JSON.stringify(tagsData, null, 4)};\n`;
                fs.writeFileSync(jsPath, jsContent);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Etiquetas guardadas correctamente.' }));
            } catch (err) {
                console.error('Error saving tags:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // API Endpoint: Save Promotions
    if (req.method === 'POST' && req.url === '/api/save-promotions') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const promotionsData = JSON.parse(body);
                const jsPath = path.join(__dirname, 'src', 'data', 'promotions.js');

                // Update promotions.js
                const jsContent = `// Promotions (Promociones)\n// Auto-generated from Admin Panel\nvar promotions = ${JSON.stringify(promotionsData, null, 4)};\n`;
                fs.writeFileSync(jsPath, jsContent);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Promociones guardadas correctamente.' }));
            } catch (err) {
                console.error('Error saving promotions:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // API Endpoint: Save Products
    if (req.method === 'POST' && req.url === '/api/save-products') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const productsData = JSON.parse(body);
                const jsPath = path.join(__dirname, 'src', 'data', 'products.js');

                // Update products.js
                const jsContent = `// Product Database - Auto Generated\nvar products = ${JSON.stringify(productsData, null, 4)};\n`;
                fs.writeFileSync(jsPath, jsContent);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Productos guardados correctamente.' }));
            } catch (err) {
                console.error('Error saving products:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // ========================================
    // CATALOG ENDPOINTS
    // ========================================

    // API Endpoint: Get Catalogs (alias for /api/catalogs/list)
    if (req.method === 'GET' && req.url === '/api/catalogs') {
        try {
            const catalogsDir = path.join(__dirname, 'database', 'catalogs');

            // Create directory if it doesn't exist
            if (!fs.existsSync(catalogsDir)) {
                fs.mkdirSync(catalogsDir, { recursive: true });
            }

            const files = fs.readdirSync(catalogsDir);
            const catalogFiles = files.filter(f => f.startsWith('Catalogo_') && f.endsWith('.xlsx'));

            const catalogs = catalogFiles.map(fileName => {
                const catalogPath = path.join(catalogsDir, fileName);
                const workbook = xlsx.readFile(catalogPath);
                const sheet = workbook.Sheets['Productos'];
                const data = xlsx.utils.sheet_to_json(sheet);

                // Extract catalog name and ID from filename
                const nameWithUnderscore = fileName.replace('Catalogo_', '').replace('.xlsx', '');
                const name = nameWithUnderscore.replace(/_/g, ' ');

                return {
                    id: nameWithUnderscore,
                    name: name,
                    products: data,
                    fileName: fileName
                };
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, catalogs: catalogs }));
        } catch (err) {
            console.error('Error listing catalogs:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
    }

    // API Endpoint: List Catalogs
    if (req.method === 'GET' && req.url === '/api/catalogs/list') {
        try {
            const catalogsDir = path.join(__dirname, 'database', 'catalogs');

            // Create directory if it doesn't exist
            if (!fs.existsSync(catalogsDir)) {
                fs.mkdirSync(catalogsDir, { recursive: true });
            }

            const files = fs.readdirSync(catalogsDir);
            const catalogFiles = files.filter(f => f.startsWith('Catalogo_') && f.endsWith('.xlsx'));

            const catalogs = catalogFiles.map(fileName => {
                const catalogPath = path.join(catalogsDir, fileName);
                const workbook = xlsx.readFile(catalogPath);
                const sheet = workbook.Sheets['Productos'];
                const data = xlsx.utils.sheet_to_json(sheet);

                // Extract catalog name from filename
                const name = fileName.replace('Catalogo_', '').replace('.xlsx', '').replace(/_/g, ' ');

                return {
                    name: name,
                    fileName: fileName.replace('Catalogo_', '').replace('.xlsx', ''),
                    productsCount: data.length,
                    filePath: fileName
                };
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, catalogs: catalogs }));
        } catch (err) {
            console.error('Error listing catalogs:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
    }

    // API Endpoint: Create Catalog
    if (req.method === 'POST' && req.url === '/api/catalogs/create') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { catalogName, productIds, customTitle, customText, bannerImage } = JSON.parse(body);

                // Handle Banner Image
                let bannerPath = '';
                if (bannerImage && bannerImage.startsWith('data:image')) {
                    try {
                        const matches = bannerImage.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                            const imageBuffer = Buffer.from(matches[2], 'base64');
                            const imageName = `banner_${catalogName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${extension}`;
                            const uploadDir = path.join(__dirname, 'src', 'assets', 'catalogs');

                            if (!fs.existsSync(uploadDir)) {
                                fs.mkdirSync(uploadDir, { recursive: true });
                            }

                            fs.writeFileSync(path.join(uploadDir, imageName), imageBuffer);
                            bannerPath = `/src/assets/catalogs/${imageName}`;
                        }
                    } catch (e) {
                        console.error('Error saving banner image:', e);
                    }
                }

                // Load products from main database
                const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
                const allProducts = loadJSData(productsPath) || [];

                // Filter selected products and create copies (Handle String/Number ID mismatch)
                const selectedProducts = allProducts.filter(p => productIds.includes(String(p.id)));

                // Create catalog file
                const catalogFileName = `Catalogo_${catalogName.replace(/\s+/g, '_')}.xlsx`;
                const catalogPath = path.join(__dirname, 'database', 'catalogs', catalogFileName);

                // Create workbook with products
                const workbook = xlsx.utils.book_new();

                // Convert products to Excel format
                const productsData = selectedProducts.map(p => ({
                    'ID': p.id,
                    'Nombre': p.name,
                    'Categoría': p.category,
                    'Badge': p.badge || '',
                    'Precio Base': p.basePrice || 0,
                    'Precio Promo': p.basePromo || 0,
                    'Link': p.baseLink || '',
                    'Datos Completos': JSON.stringify(p)
                }));

                const ws = xlsx.utils.json_to_sheet(productsData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Productos');

                // Create Info sheet
                const infoData = [
                    { Key: 'Title', Value: customTitle || catalogName },
                    { Key: 'Text', Value: customText || '' },
                    { Key: 'Banner', Value: bannerPath || '' }
                ];
                const wsInfo = xlsx.utils.json_to_sheet(infoData);
                xlsx.utils.book_append_sheet(workbook, wsInfo, 'Info');

                // Save catalog
                xlsx.writeFile(workbook, catalogPath);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Catálogo creado exitosamente',
                    catalogFile: catalogFileName,
                    productsCount: selectedProducts.length
                }));
            } catch (err) {
                console.error('Error creating catalog:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // API Endpoint: Delete Catalog
    if (req.method === 'POST' && req.url === '/api/catalogs/delete') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { catalogId } = JSON.parse(body);
                if (!catalogId) throw new Error('Catalog ID required');

                const catalogFileName = `Catalogo_${catalogId}.xlsx`;
                const catalogPath = path.join(__dirname, 'database', 'catalogs', catalogFileName);

                if (fs.existsSync(catalogPath)) {
                    fs.unlinkSync(catalogPath);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Catálogo no encontrado' }));
                }
            } catch (err) {
                console.error('Error deleting catalog:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // API Endpoint: Get Catalog Products
    if (req.method === 'GET' && req.url.startsWith('/api/catalogs/')) {
        try {
            const urlParts = req.url.split('/');
            const catalogName = decodeURIComponent(urlParts[3]);

            if (urlParts[4] === 'products') {
                const catalogFileName = `Catalogo_${catalogName}.xlsx`;
                const catalogPath = path.join(__dirname, 'database', 'catalogs', catalogFileName);

                if (!fs.existsSync(catalogPath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Catálogo no encontrado' }));
                    return;
                }

                // Read catalog Excel
                const workbook = xlsx.readFile(catalogPath);

                // Read Metadata
                let metadata = { title: catalogName.replace(/_/g, ' '), text: '2026', banner: '' };
                if (workbook.Sheets['Info']) {
                    const info = xlsx.utils.sheet_to_json(workbook.Sheets['Info']);
                    const t = info.find(i => i.Key === 'Title');
                    const txt = info.find(i => i.Key === 'Text');
                    const yr = info.find(i => i.Key === 'Year');
                    const ban = info.find(i => i.Key === 'Banner');

                    if (t) metadata.title = t.Value;
                    if (txt) metadata.text = txt.Value;
                    else if (yr) metadata.text = yr.Value;
                    if (ban) metadata.banner = ban.Value;
                }

                const sheet = workbook.Sheets['Productos'];
                const data = xlsx.utils.sheet_to_json(sheet);

                // Parse products from "Datos Completos" column
                const products = data.map(row => {
                    try {
                        return JSON.parse(row['Datos Completos']);
                    } catch (e) {
                        // Fallback to basic data if JSON parse fails
                        return {
                            id: row.ID,
                            name: row.Nombre,
                            category: row['Categoría'],
                            badge: row.Badge,
                            basePrice: row['Precio Base'],
                            basePromo: row['Precio Promo'],
                            baseLink: row.Link
                        };
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, products: products, metadata: metadata }));
            }
        } catch (err) {
            console.error('Error getting catalog products:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
    }

    // API Endpoint: Save Catalog Products
    if (req.method === 'POST' && req.url.startsWith('/api/catalogs/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const urlParts = req.url.split('/');
                const catalogName = decodeURIComponent(urlParts[3]);

                if (urlParts[4] === 'products') {
                    const { products } = JSON.parse(body);

                    const catalogFileName = `Catalogo_${catalogName}.xlsx`;
                    const catalogPath = path.join(__dirname, 'database', 'catalogs', catalogFileName);

                    // Create workbook with updated products
                    const workbook = xlsx.utils.book_new();

                    const productsData = products.map(p => ({
                        'ID': p.id,
                        'Nombre': p.name,
                        'Categoría': p.category,
                        'Badge': p.badge || '',
                        'Precio Base': p.basePrice || 0,
                        'Precio Promo': p.basePromo || 0,
                        'Link': p.baseLink || '',
                        'Datos Completos': JSON.stringify(p)
                    }));

                    const ws = xlsx.utils.json_to_sheet(productsData);
                    xlsx.utils.book_append_sheet(workbook, ws, 'Productos');

                    xlsx.writeFile(workbook, catalogPath);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Productos guardados correctamente'
                    }));
                }

                // Add Products to Catalog
                else if (urlParts[4] === 'add-products') {
                    const { productIds } = JSON.parse(body);
                    const catalogFileName = `Catalogo_${catalogName}.xlsx`;
                    const catalogPath = path.join(__dirname, 'database', 'catalogs', catalogFileName);

                    if (!fs.existsSync(catalogPath)) {
                        throw new Error('Catálogo no encontrado');
                    }

                    // Load Global Products
                    const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
                    const allProducts = loadJSData(productsPath) || [];
                    const newProducts = allProducts.filter(p => productIds.includes(String(p.id)));

                    if (newProducts.length === 0) {
                        throw new Error('No se encontraron los productos seleccionados');
                    }

                    // Read Catalog
                    const workbook = xlsx.readFile(catalogPath);
                    const sheet = workbook.Sheets['Productos'];
                    const currentData = xlsx.utils.sheet_to_json(sheet);

                    // Check for duplicates
                    const existingIds = currentData.map(row => String(row.ID || row.id));
                    const productsToAdd = newProducts.filter(p => !existingIds.includes(String(p.id)));

                    if (productsToAdd.length === 0) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Los productos ya estaban en el catálogo' }));
                        return;
                    }

                    // Append new rows
                    const rowsToAdd = productsToAdd.map(p => ({
                        'ID': p.id,
                        'Nombre': p.name,
                        'Categoría': p.category,
                        'Badge': p.badge || '',
                        'Precio Base': p.basePrice || 0,
                        'Precio Promo': p.basePromo || 0,
                        'Link': p.baseLink || '',
                        'Datos Completos': JSON.stringify(p)
                    }));

                    xlsx.utils.sheet_add_json(sheet, rowsToAdd, { skipHeader: true, origin: -1 });
                    xlsx.writeFile(workbook, catalogPath);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: `Se agregaron ${productsToAdd.length} productos` }));
                }

                // Update Single Product in Catalog
                else if (urlParts[4] === 'update-product') {
                    const { product } = JSON.parse(body);
                    const catalogFileName = `Catalogo_${catalogName}.xlsx`;
                    const catalogPath = path.join(__dirname, 'database', 'catalogs', catalogFileName);

                    if (!fs.existsSync(catalogPath)) {
                        throw new Error('Catálogo no encontrado');
                    }

                    const workbook = xlsx.readFile(catalogPath);
                    const sheet = workbook.Sheets['Productos'];
                    let data = xlsx.utils.sheet_to_json(sheet);

                    // Find and Update
                    const index = data.findIndex(row => String(row.ID || row.id) === String(product.id));
                    if (index === -1) {
                        throw new Error('Producto no encontrado en este catálogo');
                    }

                    // Update Row Data
                    data[index] = {
                        'ID': product.id,
                        'Nombre': product.name,
                        'Categoría': product.category,
                        'Badge': product.badge || '',
                        'Precio Base': product.basePrice || 0,
                        'Precio Promo': product.basePromo || 0,
                        'Link': product.baseLink || '',
                        'Datos Completos': JSON.stringify(product)
                    };

                    // Re-write Sheet
                    const newSheet = xlsx.utils.json_to_sheet(data);
                    workbook.Sheets['Productos'] = newSheet;
                    xlsx.writeFile(workbook, catalogPath);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Producto actualizado' }));
                }
            } catch (err) {
                console.error('Error saving catalog products:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // Redirect root to admin (with trailing slash for relative paths)
    if (req.url === '/' || req.url === '/admin') {
        res.writeHead(302, { 'Location': '/admin/' });
        res.end();
        return;
    }

    // File Serving Logic
    // API Endpoint: Export to Excel
    if (req.method === 'GET' && req.url.startsWith('/api/export')) {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const type = url.searchParams.get('type') || 'all';

            // Load all data
            const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
            const colorsPath = path.join(__dirname, 'src', 'data', 'color-variables.js');
            const categoriesPath = path.join(__dirname, 'src', 'data', 'categories.js');
            const variablesPath = path.join(__dirname, 'src', 'data', 'text-variables.js');
            const tagsPath = path.join(__dirname, 'src', 'data', 'tags.js');
            const promotionsPath = path.join(__dirname, 'src', 'data', 'promotions.js');

            // Create workbook
            const workbook = xlsx.utils.book_new();

            // Helper to extract data from JS files
            function extractData(filePath, varName) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const match = content.match(new RegExp(`var\\s+${varName}\\s*=\\s*([\\s\\S]+?);\\s*$`, 'm'));
                    if (match) {
                        return JSON.parse(match[1]);
                    }
                } catch (err) {
                    console.error(`Error reading ${filePath}:`, err);
                }
                return null;
            }

            // Export Products
            if (type === 'all' || type === 'products') {
                const products = loadJSData(productsPath) || [];
                const productsData = products.map(p => ({
                    'ID': p.id,
                    'Nombre': p.name,
                    'Categoría': p.category,
                    'Badge': p.badge || '',
                    'Precio Base': p.basePrice || 0,
                    'Precio Promo': p.basePromo || 0,
                    'Link': p.baseLink || '',
                    'Colores': p.colors ? p.colors.map(c => c.name).join(', ') : '',
                    'Variantes': p.priceVariants ? p.priceVariants.length : 0,
                    'Stock': p.variants ? p.variants.filter(v => v.active).length : 0
                }));
                const ws = xlsx.utils.json_to_sheet(productsData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Productos');
            }

            // Export Colors
            if (type === 'all' || type === 'colors') {
                const colors = loadJSData(colorsPath) || {};
                const colorsData = Object.entries(colors).map(([name, data]) => ({
                    'ID': data.id,
                    'Nombre': name,
                    'Hex': data.hex
                }));
                const ws = xlsx.utils.json_to_sheet(colorsData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Colores');
            }

            // Export Categories
            if (type === 'all' || type === 'categories') {
                const categories = loadJSData(categoriesPath) || {};
                const categoriesData = Object.entries(categories).map(([key, data]) => ({
                    'Clave': key,
                    'Nombre': data.name,
                    'Icono': data.icon || ''
                }));
                const ws = xlsx.utils.json_to_sheet(categoriesData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Categorías');
            }

            // Export Variables
            if (type === 'all' || type === 'variables') {
                const variables = loadJSData(variablesPath) || {};
                const variablesData = Object.entries(variables).map(([key, value]) => ({
                    'Variable': key,
                    'Valor': value
                }));
                const ws = xlsx.utils.json_to_sheet(variablesData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Variables');
            }

            // Export Tags
            if (type === 'all' || type === 'tags') {
                const tags = loadJSData(tagsPath) || {};
                const tagsData = Object.entries(tags).map(([key, data]) => ({
                    'ID': data.id,
                    'Nombre': key
                }));
                const ws = xlsx.utils.json_to_sheet(tagsData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Etiquetas');
            }

            // Export Promotions
            if (type === 'all' || type === 'promotions') {
                const promotions = loadJSData(promotionsPath) || {};
                const promotionsData = Object.entries(promotions).map(([key, data]) => ({
                    'ID': data.id,
                    'Nombre': key,
                    'Imagen': data.image || ''
                }));
                const ws = xlsx.utils.json_to_sheet(promotionsData);
                xlsx.utils.book_append_sheet(workbook, ws, 'Promociones');
            }

            // Generate Excel file
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            const filename = type === 'all'
                ? 'Samsung_Catalogo_Completo.xlsx'
                : `Samsung_${type.charAt(0).toUpperCase() + type.slice(1)}.xlsx`;

            res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.length
            });
            res.end(buffer);
        } catch (err) {
            console.error('Error exporting:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
    }

    // API Endpoint: Import from Excel
    if (req.method === 'POST' && req.url === '/api/import') {
        let chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);
                const workbook = xlsx.read(buffer, { type: 'buffer' });

                const results = {
                    products: 0,
                    colors: 0,
                    categories: 0,
                    variables: 0,
                    tags: 0,
                    promotions: 0
                };

                // Helper to write JS file
                function writeJSFile(filePath, varName, data) {
                    const content = `// Auto-generated from Excel import\nvar ${varName} = ${JSON.stringify(data, null, 4)};\n`;
                    fs.writeFileSync(filePath, content, 'utf8');
                }

                // Import Products
                if (workbook.SheetNames.includes('Productos')) {
                    const sheet = workbook.Sheets['Productos'];
                    const data = xlsx.utils.sheet_to_json(sheet);

                    // Transform to product format
                    const products = data.map(row => ({
                        id: row.ID || 0,
                        name: row.Nombre || '',
                        category: row['Categoría'] || '',
                        badge: row.Badge || '',
                        basePrice: row['Precio Base'] || 0,
                        basePromo: row['Precio Promo'] || 0,
                        baseLink: row.Link || '',
                        colors: [],
                        priceVariants: [],
                        variants: [],
                        price: row['Precio Base'] || 0,
                        image: ''
                    }));

                    writeJSFile(
                        path.join(__dirname, 'src', 'data', 'products.js'),
                        'products',
                        products
                    );
                    results.products = products.length;
                }

                // Import Colors
                if (workbook.SheetNames.includes('Colores')) {
                    const sheet = workbook.Sheets['Colores'];
                    const data = xlsx.utils.sheet_to_json(sheet);

                    const colors = {};
                    data.forEach(row => {
                        colors[row.Nombre] = {
                            id: row.ID,
                            hex: row.Hex
                        };
                    });

                    writeJSFile(
                        path.join(__dirname, 'src', 'data', 'color-variables.js'),
                        'colorVariables',
                        colors
                    );
                    results.colors = data.length;
                }

                // Import Categories
                if (workbook.SheetNames.includes('Categorías')) {
                    const sheet = workbook.Sheets['Categorías'];
                    const data = xlsx.utils.sheet_to_json(sheet);

                    const categories = {};
                    data.forEach(row => {
                        categories[row.Clave] = {
                            name: row.Nombre,
                            icon: row.Icono || ''
                        };
                    });

                    writeJSFile(
                        path.join(__dirname, 'src', 'data', 'categories.js'),
                        'categories',
                        categories
                    );
                    results.categories = data.length;
                }

                // Import Variables
                if (workbook.SheetNames.includes('Variables')) {
                    const sheet = workbook.Sheets['Variables'];
                    const data = xlsx.utils.sheet_to_json(sheet);

                    const variables = {};
                    data.forEach(row => {
                        variables[row.Variable] = row.Valor;
                    });

                    writeJSFile(
                        path.join(__dirname, 'src', 'data', 'text-variables.js'),
                        'textVariables',
                        variables
                    );
                    results.variables = data.length;
                }

                // Import Tags
                if (workbook.SheetNames.includes('Etiquetas')) {
                    const sheet = workbook.Sheets['Etiquetas'];
                    const data = xlsx.utils.sheet_to_json(sheet);

                    const tags = {};
                    data.forEach(row => {
                        tags[row.Nombre] = {
                            id: row.ID
                        };
                    });

                    writeJSFile(
                        path.join(__dirname, 'src', 'data', 'tags.js'),
                        'tags',
                        tags
                    );
                    results.tags = data.length;
                }

                // Import Promotions
                if (workbook.SheetNames.includes('Promociones')) {
                    const sheet = workbook.Sheets['Promociones'];
                    const data = xlsx.utils.sheet_to_json(sheet);

                    const promotions = {};
                    data.forEach(row => {
                        promotions[row.Nombre] = {
                            id: row.ID,
                            image: row.Imagen || ''
                        };
                    });

                    writeJSFile(
                        path.join(__dirname, 'src', 'data', 'promotions.js'),
                        'promotions',
                        promotions
                    );
                    results.promotions = data.length;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Datos importados correctamente',
                    results: results
                }));
            } catch (err) {
                console.error('Error importing:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    const urlPath = req.url.split('?')[0];
    let filePath = '.' + urlPath;

    // Map nice URLs to file system paths
    if (urlPath.startsWith('/admin')) {
        if (urlPath === '/admin' || urlPath === '/admin/') {
            filePath = './src/admin/index.html';
        } else {
            filePath = './src' + urlPath; // /admin/js/admin.js -> ./src/admin/js/admin.js
        }
    } else if (urlPath.startsWith('/data')) {
        filePath = './src' + urlPath; // /data/products.js -> ./src/data/products.js
    } else if (urlPath.startsWith('/catalog')) {
        // Check if it's a specific catalog route (e.g. /catalog/my_catalog_id)
        // and serves the index.html logic
        if (urlPath.split('/').length > 2 && !urlPath.includes('.')) {
            filePath = './src/catalog/index.html';
        } else {
            filePath = './src' + urlPath;
        }
    }

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Try looking in root as fallback (for style.css if needed globally)
                fs.readFile('.' + req.url, (errRoot, contentRoot) => {
                    if (errRoot) {
                        fs.readFile('./404.html', (error, content) => {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            res.end(content || '404 Not Found', 'utf-8');
                        });
                    } else {
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(contentRoot, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
