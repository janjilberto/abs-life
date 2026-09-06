const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const effectLogic = `

// --- HACKER LOGIN EFFECTS ---
function initHackerEffects() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    
    // Useless API
    setTimeout(() => {
        const terminalLog = document.getElementById('terminalLog');
        if(!terminalLog) return;
        
        terminalLog.innerHTML += '<div>> REPERIMENTO IP PUBBLICO TRAMITE API...</div>';
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                terminalLog.innerHTML += '<div>> IP ESTERNO CONFERMATO: <span class="text-white">' + data.ip + '</span></div>';
                terminalLog.innerHTML += '<div class="text-green-300">> CALCOLO LATENZA SERVER DI NODO C... [OK]</div>';
                terminalLog.innerHTML += '<div>> IN ATTESA DI CHIAVE...</div>';
            })
            .catch(() => {
                terminalLog.innerHTML += '<div class="text-red-500">> ERRORE RILEVAMENTO NODO. CONNESSIONE PROXY ANONIMA.</div>';
                terminalLog.innerHTML += '<div>> IN ATTESA DI CHIAVE...</div>';
            });
    }, 1500);

    // Matrix Rain
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    for(let x = 0; x < columns; x++) {
        drops[x] = 1; 
    }
    
    function drawMatrix() {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0'; // Green text
        ctx.font = fontSize + 'px monospace';
        
        for(let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Randomly reset drop to top
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
        if(document.getElementById('loginModal').classList.contains('hidden')) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    setInterval(drawMatrix, 33);
}

// Start hacker effects if modal is visible
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    initHackerEffects();
}
`;

file += effectLogic;

fs.writeFileSync('src/app.js', file);
console.log("Hacker effects added to app.js");
