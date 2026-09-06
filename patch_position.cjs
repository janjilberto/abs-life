const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const oldClasses = 'hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20';
const newClasses = 'hidden absolute top-1/2 right-0 -translate-y-1/2 z-20 mr-2'; // mr-2 gives a little margin from the very right edge

if(file.includes(oldClasses)) {
    file = file.replace(oldClasses, newClasses);
    fs.writeFileSync('src/app.js', file);
    console.log("Success");
} else {
    console.log("Could not find classes");
}
