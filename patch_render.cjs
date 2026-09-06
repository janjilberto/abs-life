const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace(/<div id="qty-prompt-\$\{safeId\}" class="hidden/g, '<div id="qty-prompt-${safeId}" style="display: none;" class="hidden');

fs.writeFileSync('src/app.js', file);
console.log("Render patched");
