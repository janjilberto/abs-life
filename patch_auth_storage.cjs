const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace(/localStorage\.setItem\('isLoggedIn'/g, "sessionStorage.setItem('isLoggedIn'");
file = file.replace(/localStorage\.removeItem\('isLoggedIn'/g, "sessionStorage.removeItem('isLoggedIn'");
file = file.replace(/localStorage\.getItem\('isLoggedIn'/g, "sessionStorage.getItem('isLoggedIn'");

fs.writeFileSync('src/app.js', file);
console.log("Auth storage patched to sessionStorage");
