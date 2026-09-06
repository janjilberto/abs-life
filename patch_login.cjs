const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const oldModalRegex = /<!-- Login Modal -->[\s\S]*?(?=<div class="flex h-full">)/;

const newModal = `<!-- Login Modal -->
    <div id="loginModal" class="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4 overflow-hidden">
        <!-- Hacker Background Canvas -->
        <canvas id="matrixCanvas" class="absolute inset-0 z-0 opacity-40"></canvas>
        
        <!-- Scanline overlay -->
        <div class="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
        
        <!-- Techy Login Box -->
        <div class="relative z-10 bg-black/60 backdrop-blur-md p-8 border border-green-500/30 rounded-none w-full max-w-lg shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            
            <!-- Useless API / Terminal Header -->
            <div class="font-mono text-green-500 text-xs mb-6 border-b border-green-500/30 pb-4 h-24 overflow-hidden flex flex-col justify-end" id="terminalLog">
                <div class="animate-pulse">> INIZIALIZZAZIONE PROTOCOLLO DI SICUREZZA...</div>
                <div>> RILEVAMENTO CONNESSIONE IN CORSO...</div>
            </div>

            <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 border border-green-500 flex items-center justify-center text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                    <h2 class="text-green-500 text-xl font-mono tracking-widest uppercase">Accesso_Riservato</h2>
                    <p class="text-green-700 text-xs font-mono">Inserisci chiave crittografica</p>
                </div>
            </div>
            
            <div class="relative group mb-6">
                <div class="absolute -inset-0.5 bg-green-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <input type="password" id="passInput" class="relative w-full bg-black border border-green-500/50 p-4 text-green-400 font-mono text-lg outline-none focus:border-green-400 focus:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition" placeholder="[ INPUT REQUIRED ]">
            </div>
            
            <button onclick="checkPassword()" class="w-full bg-green-950 hover:bg-green-900 border border-green-500 text-green-500 hover:text-green-400 font-mono font-bold tracking-widest py-4 transition-all active:scale-95 shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] uppercase">
                > Autenticazione_
            </button>
            <p id="errorMsg" class="text-red-500 text-xs mt-4 hidden font-mono animate-pulse uppercase">> ERRORE: Chiave non valida!</p>
            
            <div class="mt-8 text-[10px] text-green-800 font-mono text-center">
                SYS.V.9.4.2 // PROPRIETA' DI CARLO GIORGETTI
            </div>
        </div>
    </div>
    
    `;

file = file.replace(oldModalRegex, newModal);
fs.writeFileSync('index.html', file);
console.log("Login modal HTML patched");
