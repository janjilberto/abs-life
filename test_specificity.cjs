const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

// I will just add inline style display:none to all hidden modals initially
file = file.replace(/id="editModal" class="hidden/g, 'id="editModal" style="display: none;" class="hidden');
file = file.replace(/id="loginModal" class="fixed/g, 'id="loginModal" style="display: flex;" class="fixed'); // wait, if not logged in it should be visible

fs.writeFileSync('index.html', file);
