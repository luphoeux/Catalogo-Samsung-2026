const xlsx = require('xlsx');
const path = require('path');
// Check if file exists
const fs = require('fs');

const catalogId = '1r5124';
const fileName = `Catalogo_${catalogId}.xlsx`;
const filePath = path.join(__dirname, 'database', 'catalogs', fileName);

console.log('Checking file:', filePath);

if (!fs.existsSync(filePath)) {
    console.log('File does not exist!');
    // List diff filenames in directory to see available
    const dir = path.join(__dirname, 'database', 'catalogs');
    console.log('Files in directory:', fs.readdirSync(dir));
    process.exit(1);
}

try {
    const wb = xlsx.readFile(filePath);
    console.log('Sheets:', wb.SheetNames);

    if (wb.SheetNames.includes('Productos')) {
        const sheet = wb.Sheets['Productos'];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log('Row Count in Productos:', data.length);
        if (data.length > 0) {
            console.log('First Row Keys:', Object.keys(data[0]));
            console.log('First Row Datos Completos:', data[0]['Datos Completos'] ? 'Present' : 'Missing');
        }
    } else {
        console.log('Sheet "Productos" NOT found.');
    }
} catch (e) {
    console.error('Error reading excel:', e);
}
