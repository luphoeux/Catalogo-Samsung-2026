const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '../Productos-de-la-Familia2025-12-01.xlsx');
const outputPath = path.join(__dirname, '../src/data/db.json');

// Ensure directory exists
const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
}

const colorMap = {
    'ZK': 'Negro',
    'ZW': 'Blanco',
    'ZS': 'Plateado',
    'ZG': 'Verde',
    'ZA': 'Gris / Graphite',
    'ZV': 'Violeta',
    'ZP': 'Rosado / Pink Gold',
    'ZD': 'Dorado',
    'ZB': 'Azul',
    'ZN': 'Bronce',
    'ZR': 'Rojo',
    'KA': 'Negro',
    'WA': 'Blanco',
    'WE': 'Blanco',
    'BK': 'Negro',
    'WH': 'Blanco',
    'SL': 'Plateado',
    'GR': 'Verde',
    'GY': 'Gris',
    'PK': 'Rosado',
    'GD': 'Dorado',
    'BL': 'Azul'
};

const hexMap = {
    'Negro': '#111111',
    'Blanco': '#FDFDFD',
    'Plateado': '#C0C0C0',
    'Verde': '#25422D',
    'Gris / Graphite': '#383838',
    'Violeta': '#5E5A80',
    'Rosado / Pink Gold': '#E7C9C0',
    'Dorado': '#D4AF37',
    'Azul': '#0F47AF',
    'Bronce': '#B08D57',
    'Rojo': '#B81D24',
    'Rosado': '#FFC0CB',
    'Gris': '#808080',
    'Titanium Black': '#2F2F2F',
    'Titanium Gray': '#7E7E7E',
    'Titanium Violet': '#5E5A80',
    'Titanium Yellow': '#F4E49F',
    'Cream': '#F5F5DC',
    'Mint': '#98FF98',
    'Indigo': '#4B0082',
    'Peach': '#FFDAB9',
    'Sky Blue': '#87CEEB',
    'Estándar': '#E0E0E0',
    'N/A': '#CCCCCC'
};

function detectColor(sku) {
    if (!sku) return 'N/A';
    const s = sku.toUpperCase();
    
    let lastMatch = null;
    let maxIndex = -1;

    // Buscar todos los patrones y quedarnos con el que esté más a la derecha (más específico)
    for (const [code, name] of Object.entries(colorMap)) {
        const index = s.lastIndexOf(code);
        if (index > maxIndex) {
            maxIndex = index;
            lastMatch = name;
        }
    }

    if (lastMatch) return lastMatch;

    // Fallback por palabras clave si no hay códigos de 2 letras
    if (s.includes('BLACK') || s.includes('NEG')) return 'Negro';
    if (s.includes('WHITE') || s.includes('BLA')) return 'Blanco';
    if (s.includes('SILVER') || s.includes('PLA')) return 'Plateado';
    if (s.includes('GOLD') || s.includes('DOR')) return 'Dorado';
    
    return 'Estándar';
}

function getColorHex(colorName) {
    return hexMap[colorName] || hexMap['Estándar'];
}

function detectMainCategory(row) {
    const family = String(row['Familia'] || '').toUpperCase();
    const name = String(row['Nombre de Pantalla'] || '').toUpperCase();
    const sku = String(row['SKU'] || '').toUpperCase();

    // Mobile & Computing
    if (family.includes('WATCH') || name.includes('WATCH')) return 'Smartwatches';
    if (family.includes('BUDS') || name.includes('BUDS') || name.includes('GALAXY BUDS')) return 'Galaxy Buds';
    if (family.includes('TABLET') || family.includes('TAB') || name.includes('GALAXY TAB')) return 'Tablets';
    if (family.includes('BOOK') || name.includes('GALAXY BOOK')) return 'Galaxy Book';
    if (family.includes('SMARTPHONE') || name.includes('GALAXY S') || name.includes('GALAXY A') || name.includes('GALAXY Z') || name.includes('FOLD') || name.includes('FLIP')) return 'Smartphones';
    if (family.includes('MOBILE')) return 'Mobile';
    
    // TV, Audio & Monitores
    if (family.includes('MONITOR') || name.includes('ODYSSEY') || name.includes('SMART MONITOR')) return 'Monitor';
    if (name.includes('PROYECTOR') || family.includes('PROJECTOR') || name.includes('THE FREESTYLE')) return 'Proyectores';
    if (family.includes('AUDIO') || name.includes('SOUNDBAR') || name.includes('PARLANTE') || family.includes('HOME THEATER')) return 'Equipos de Audio';
    if (family.includes('TV') || name.includes(' QLED') || name.includes(' OLED') || name.includes(' UHD') || name.includes(' CRYSTAL')) return 'Televisores'; // Default fallthrough for TVs
    
    // Línea Blanca (Electrodomésticos)
    if (family.includes('REFRIGERADOR') || family.includes('FREEZER') || name.includes('HELADERA') || name.includes('BESPOKE')) return 'Refrigeradores';
    if (family.includes('LAVADORA') || family.includes('SECADORA') || name.includes('WASHTOWER')) return 'Lavadoras / Secadoras';
    if (family.includes('MICROONDA') || name.includes('MICROONDAS')) return 'Microondas';
    if (family.includes('EMPOTRADO') || family.includes('BUILT-IN')) return 'Empotrados';
    if (family.includes('COCINA') || name.includes('ENCIMERA')) return 'Cocina';
    if (family.includes('HORNO') || name.includes('OVEN')) return 'Hornos';
    if (family.includes('ASPIRADORA') || family.includes('VACUUM') || name.includes('JET')) return 'Aspiradoras';
    if (family.includes('AIRE') || family.includes('AC') || family.includes('AIR CONDITIONER')) return 'Soluciones de Aire';
    
    // Accesorios
    if (family.includes('ACCESSORY') || family.includes('CASE') || family.includes('COVER') || name.includes('ADAPTADOR') || name.includes('FUNDA') || name.includes('ESTUCHE') || name.includes('CABLE')) return 'Accesorios';

    return 'Otros';
}

function convert() {
    console.log('📖 Reading Excel for Local DB...');
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Extract categories
    const categories = Array.from(new Set(rows.map(r => r['Familia']).filter(Boolean)));
    
    const db = {
        meta: {
            totalProducts: rows.length,
            totalCategories: categories.length,
            lastUpdate: new Date().toISOString()
        },
        products: rows.map(row => {
            const sku = String(row['SKU'] || '').trim();
            return {
                sku: sku,
                name: row['Nombre de Pantalla'] || row['Familia'],
                category: row['Familia'] || 'General',
                image: row['Imagen'] || '',
                link: (() => {
                    const rawUrl = row['Shop URL'] || row['URL'] || row['Landing Page'] || row['Link'] || '';
                    if (!rawUrl) return '';
                    if (rawUrl.startsWith('http')) return rawUrl;
                    return `https://samsung.com.bo/${String(rawUrl).replace(/^\//, '').trim()}`;
                })(),
                price: parseFloat(row['Precio']) || 0,
                salePrice: parseFloat(row['Precio Oferta']) || 0,
                color: detectColor(sku),
                colorHex: getColorHex(detectColor(sku)),
                mainCategory: detectMainCategory(row),
                active: row['¿Activo?'] === 'Si'
            };
        }).filter(p => p.sku !== 'undefined' && p.sku !== ''),
        categories: categories.map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name: name
        }))
    };

    fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));
    console.log(`✅ Local DB created at ${outputPath}`);
    console.log(`📊 Stats: ${db.products.length} products, ${db.categories.length} categories.`);
}

convert();
