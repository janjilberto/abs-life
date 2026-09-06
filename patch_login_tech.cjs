const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- Login Modal -->[\s\S]*?(?=<div class="flex h-full">)/;

const newModal = `<!-- Login Modal -->
    <div id="loginModal" class="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center p-4 overflow-hidden">
        <!-- Abstract Tech Background -->
        <div class="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,transparent_50%)]"></div>
        <div class="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        
        <!-- Techy Login Box -->
        <div class="relative z-10 bg-slate-900/60 backdrop-blur-2xl p-8 border border-sky-500/30 rounded-3xl w-full max-w-sm shadow-[0_0_40px_rgba(14,165,233,0.15)] animate-fade-in">
            
            <div class="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-500/30 ring-1 ring-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 class="text-white text-2xl font-bold mb-2 text-center">Autenticazione</h2>
            <p class="text-slate-400 text-sm mb-6 text-center">Inserisci le credenziali di sistema</p>
            
            <div class="relative group mb-6">
                <input type="password" id="passInput" onkeypress="if(event.key === 'Enter') checkPassword()" class="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl p-3.5 text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner placeholder-slate-500" placeholder="Password">
            </div>
            
            <button onclick="checkPassword()" class="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-[0_8px_20px_rgba(14,165,233,0.3)] border border-sky-400/50">
                Accedi al Sistema
            </button>
            <p id="errorMsg" class="text-red-400 text-sm mt-4 hidden text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">Credenziali non valide</p>
            
        </div>
    </div>
    
    `;

file = file.replace(regex, newModal);
fs.writeFileSync('index.html', file);
console.log("Login HTML patched to clean tech look");
