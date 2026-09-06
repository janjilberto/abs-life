const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

file = file.replace('id="passInput" class="relative w-full', 'id="passInput" onkeypress="if(event.key === \'Enter\') checkPassword()" class="relative w-full');

fs.writeFileSync('index.html', file);
