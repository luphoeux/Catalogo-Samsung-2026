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

    // Redirect root to admin (with trailing slash for relative paths)
    if (req.url === '/' || req.url === '/admin') {
        res.writeHead(302, { 'Location': '/admin/' });
        res.end();
        return;
    }

    // File Serving Logic
    let filePath = '.' + req.url;

    // Map nice URLs to file system paths
    if (req.url.startsWith('/admin')) {
        if (req.url === '/admin' || req.url === '/admin/') {
            filePath = './src/admin/index.html';
        } else {
            filePath = './src' + req.url; // /admin/js/admin.js -> ./src/admin/js/admin.js
        }
    } else if (req.url.startsWith('/data')) {
        filePath = './src' + req.url; // /data/products.js -> ./src/data/products.js
    } else if (req.url.startsWith('/catalog')) {
        filePath = './src' + req.url;
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
