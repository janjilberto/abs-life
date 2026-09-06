const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const startIdx = file.indexOf('<script>\nwindow.addEventListener(\'error\'');
if (startIdx !== -1) {
    const endIdx = file.indexOf('</script>', startIdx) + 9;
    file = file.substring(0, startIdx) + file.substring(endIdx);
    fs.writeFileSync('index.html', file);
}
