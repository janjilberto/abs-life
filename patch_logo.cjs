const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

// Insert keyframes
const cssInjection = `
        @keyframes shine {
            0% { left: -150%; opacity: 0; }
            10% { opacity: 1; }
            30% { left: 150%; opacity: 0; }
            100% { left: 150%; opacity: 0; }
        }
        .animate-shine {
            animation: shine 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
`;

file = file.replace('/* Animations */', '/* Animations */' + cssInjection);

// Wrap logo
const oldLogo = '<img src="logo.png" alt="Logo Aziendale" class="h-10 w-auto">';
const newLogo = `
                <div class="relative overflow-hidden inline-block rounded-md cursor-default">
                    <img src="logo.png" alt="Logo Aziendale" class="h-10 w-auto">
                    <div class="absolute top-0 h-full w-[150%] z-10 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></div>
                </div>`;

file = file.replace(oldLogo, newLogo);

fs.writeFileSync('index.html', file);
