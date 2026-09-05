const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const oldSavePhoto = `    const modello = selector.value;
    const url = urlInput ? urlInput.value.trim() : '';`;

const newSavePhoto = `    const modello = normalizeText(selector.value);
    const url = urlInput ? urlInput.value.trim() : '';`;

file = file.replace(oldSavePhoto, newSavePhoto);
fs.writeFileSync('src/app.js', file);
