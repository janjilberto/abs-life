const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// robust hiding
file = file.replace(/document\.getElementById\('loginModal'\)\.classList\.add\('hidden'\);/g, "document.getElementById('loginModal').classList.add('hidden'); document.getElementById('loginModal').style.display = 'none';");

// robust showing
file = file.replace(/loginModal\.classList\.remove\('hidden'\);/g, "loginModal.classList.remove('hidden'); loginModal.style.display = 'flex';");

fs.writeFileSync('src/app.js', file);

let htmlFile = fs.readFileSync('index.html', 'utf8');
// add pointer-events-none to backgrounds
htmlFile = htmlFile.replace(/<div class="absolute inset-0 z-0 bg-\[radial-gradient/g, '<div class="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient');
htmlFile = htmlFile.replace(/<div class="absolute inset-0 z-0 bg-\[linear-gradient/g, '<div class="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient');
fs.writeFileSync('index.html', htmlFile);

console.log("Fixes applied");
