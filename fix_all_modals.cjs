const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// For openDetailsModal
file = file.replace(/modal\.classList\.remove\('hidden'\);/g, "modal.classList.remove('hidden'); modal.style.display = 'flex';");

// For closeModal
file = file.replace(/document\.getElementById\(id\)\.classList\.add\('hidden'\);/g, "document.getElementById(id).classList.add('hidden'); document.getElementById(id).style.display = 'none';");

// For promptQtyUnlock
file = file.replace(/prompt\.classList\.remove\('hidden'\);\s*prompt\.classList\.add\('flex'\);/g, "prompt.classList.remove('hidden'); prompt.classList.add('flex'); prompt.style.display = 'flex';");

// For cancelQtyUnlock
file = file.replace(/prompt\.classList\.remove\('flex'\);\s*prompt\.classList\.add\('hidden'\);/g, "prompt.classList.remove('flex'); prompt.classList.add('hidden'); prompt.style.display = 'none';");

fs.writeFileSync('src/app.js', file);
console.log("All modals patched with inline styles");
