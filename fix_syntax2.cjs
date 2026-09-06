const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace('-e \nwindow.scrollModelsChart', 'window.scrollModelsChart');
file = file.replace('-e \r\nwindow.scrollModelsChart', 'window.scrollModelsChart');
// Just in case it has extra spaces
file = file.replace(/^-e\s*$/gm, '');

fs.writeFileSync('src/app.js', file);
