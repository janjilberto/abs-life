const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const oldKeyframes = `        @keyframes shine {
            0% { left: -150%; opacity: 0; }
            10% { opacity: 1; }
            30% { left: 150%; opacity: 0; }
            100% { left: 150%; opacity: 0; }
        }
        .animate-shine {
            animation: shine 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }`;

const newKeyframes = `        @keyframes shine {
            0% { left: -150%; opacity: 0; }
            5% { opacity: 1; }
            15% { left: 150%; opacity: 0; }
            100% { left: 150%; opacity: 0; }
        }
        .animate-shine {
            animation: shine 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }`;

if (file.includes('animation: shine 4s')) {
    file = file.replace(oldKeyframes, newKeyframes);
    fs.writeFileSync('index.html', file);
    console.log("Success");
} else {
    console.log("Could not find the animation string.");
}
