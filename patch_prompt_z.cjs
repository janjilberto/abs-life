const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

file = file.replace('z-20 mr-2 bg-slate-900/95', 'z-50 mr-2 bg-slate-900'); // Made z-50 and opaque background just in case

fs.writeFileSync('src/app.js', file);
