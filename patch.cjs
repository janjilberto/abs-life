const fs = require('fs');
const file = fs.readFileSync('src/app.js', 'utf8');
const start = file.indexOf('function renderShelfGrid(selector, shelfData) {');
const end = file.indexOf('async function handleCSVImport(event) {');
const newCode = fs.readFileSync('new_code.js', 'utf8');
fs.writeFileSync('src/app.js', file.substring(0, start) + newCode + "\n\n" + file.substring(end));
