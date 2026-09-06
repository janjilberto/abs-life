const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// Remove inactivity logic
const inactivityRegex = /\/\/ --- GESTIONE INATTIVITÀ ---[\s\S]*?\/\/ ---------------------------/;
file = file.replace(inactivityRegex, '');

// Clean up injected checkAuth / checkPassword
file = file.replace(/initApp\(\);\s*resetInactivityTimer\(\);/g, 'initApp();');

fs.writeFileSync('src/app.js', file);
console.log("Inactivity timer removed");
