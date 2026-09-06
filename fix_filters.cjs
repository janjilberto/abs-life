const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace(/menu\.classList\.remove\('hidden'\);/g, "menu.classList.remove('hidden'); menu.style.display = 'grid';");
file = file.replace(/menu\.classList\.add\('hidden'\);/g, "menu.classList.add('hidden'); menu.style.display = 'none';");

fs.writeFileSync('src/app.js', file);
