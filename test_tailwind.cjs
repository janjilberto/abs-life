const file = require('fs').readFileSync('dist/index.html', 'utf8');
console.log(file.includes('class="hidden"'));
