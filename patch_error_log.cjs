const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const errorLogger = `
<script>
window.addEventListener('error', function(e) {
    console.log("Global Error:", e.message, e.filename, e.lineno);
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.zIndex = '9999';
    div.style.background = 'red';
    div.style.color = 'white';
    div.style.padding = '10px';
    div.innerText = e.message;
    document.body.appendChild(div);
});
const originalConsoleError = console.error;
console.error = function() {
    originalConsoleError.apply(console, arguments);
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '50px';
    div.style.left = '0';
    div.style.zIndex = '9999';
    div.style.background = 'orange';
    div.style.color = 'black';
    div.style.padding = '10px';
    div.innerText = Array.from(arguments).join(' ');
    document.body.appendChild(div);
};
</script>
</head>`;

if (!file.includes('Global Error:')) {
    file = file.replace('</head>', errorLogger);
    fs.writeFileSync('index.html', file);
}
