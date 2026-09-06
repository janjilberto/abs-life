const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const oldSpan = '<span class="min-w-[24px] text-center font-bold text-slate-200">${item.quantita}</span>';
const newSpan = '<span class="min-w-[24px] text-center font-bold text-slate-200 relative z-20 pointer-events-none drop-shadow-md">${item.quantita}</span>';

if(file.includes(oldSpan)) {
    file = file.replace(oldSpan, newSpan);
    fs.writeFileSync('src/app.js', file);
    console.log("Success");
} else {
    console.log("Could not find span");
}
