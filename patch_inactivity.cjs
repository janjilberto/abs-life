const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const inactivityLogic = `
// --- GESTIONE INATTIVITÀ ---
let inactivityTimer;
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minuti

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        inactivityTimer = setTimeout(() => {
            sessionStorage.removeItem('isLoggedIn');
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('hidden');
            }
            const passInput = document.getElementById('passInput');
            if (passInput) {
                passInput.value = '';
            }
            const errorMsg = document.getElementById('errorMsg');
            if (errorMsg) {
                errorMsg.classList.add('hidden');
            }
        }, INACTIVITY_LIMIT);
    }
}

function setupInactivityListeners() {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);
}

setupInactivityListeners();
resetInactivityTimer();
// ---------------------------
`;

file += "\n" + inactivityLogic;

// Hook into checkPassword and checkAuth to start timer upon login
file = file.replace(/initApp\(\);/g, "initApp(); resetInactivityTimer();");

fs.writeFileSync('src/app.js', file);
console.log("Inactivity timer patched");
