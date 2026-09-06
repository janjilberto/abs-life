const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const oldPrompt = `window.promptQtyUnlock = function(event, id) {
    event.stopPropagation();
    const prompt = document.getElementById('qty-prompt-' + id);
    if(prompt) {
        prompt.classList.remove('hidden');
        prompt.classList.add('flex');
    }
};`;

const newPrompt = `window.promptQtyUnlock = function(event, id) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log("promptQtyUnlock called for id:", id);
    const prompt = document.getElementById('qty-prompt-' + id);
    if(prompt) {
        prompt.classList.remove('hidden');
        prompt.classList.add('flex');
        console.log("Prompt shown");
    } else {
        console.log("Prompt element not found: qty-prompt-" + id);
    }
};`;

file = file.replace(oldPrompt, newPrompt);
fs.writeFileSync('src/app.js', file);
