const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace(/const isHidden = menu\.classList\.toggle\('hidden'\);/g, `const isHidden = menu.classList.toggle('hidden'); menu.style.display = isHidden ? 'none' : 'grid';`);

fs.writeFileSync('src/app.js', file);
console.log("Toggle patched");
