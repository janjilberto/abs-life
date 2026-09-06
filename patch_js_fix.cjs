const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// The hacky effects were added at the very end of app.js. Let's find it.
const regex = /\/\/ --- HACKER LOGIN EFFECTS ---[\s\S]*/;
file = file.replace(regex, '');

fs.writeFileSync('src/app.js', file);
console.log("Hacker effects removed from app.js");
