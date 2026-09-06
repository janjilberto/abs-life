const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace("-e window.scrollModelsChart = function", "window.scrollModelsChart = function");
fs.writeFileSync('src/app.js', file);
