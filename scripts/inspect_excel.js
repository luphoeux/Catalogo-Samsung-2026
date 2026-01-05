const xlsx = require('xlsx');
const filePath = 'd:\\Repositorios\\Samsung Catalogo\\Productos-de-la-Familia2025-12-01.xlsx';
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet); // Objects

if (data.length > 0) {
    console.log('Available Columns:', Object.keys(data[0]));
    console.log('First Record Sample:', data[0]);
} else {
    console.log('No data found');
}
