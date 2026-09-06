const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace(/prompt\.classList\.add\('hidden'\);\s*prompt\.classList\.remove\('flex'\);/g, "prompt.classList.add('hidden'); prompt.classList.remove('flex'); prompt.style.display = 'none';");

fs.writeFileSync('src/app.js', file);
console.log("cancelQtyUnlock patched");
