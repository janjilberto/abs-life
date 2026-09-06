const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace(/document\.getElementById\('editModal'\)\.classList\.remove\('hidden'\);/g, "document.getElementById('editModal').classList.remove('hidden'); document.getElementById('editModal').style.display = 'flex';");
file = file.replace(/document\.getElementById\('editModal'\)\.classList\.add\('hidden'\);/g, "document.getElementById('editModal').classList.add('hidden'); document.getElementById('editModal').style.display = 'none';");

fs.writeFileSync('src/app.js', file);
