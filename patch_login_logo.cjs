const fs = require('fs');
let file = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="w-16 h-16 bg-gradient-to-br[\s\S]*?<\/svg>\s*<\/div>/;
const newLogoHTML = `
            <div class="flex justify-center mb-6">
                <div class="relative overflow-hidden inline-block rounded-md cursor-default shadow-[0_0_20px_rgba(14,165,233,0.15)] ring-1 ring-white/10 p-3 bg-slate-950/50">
                    <img src="logo.png" alt="Logo ABS" class="h-12 w-auto">
                    <div class="absolute top-0 h-full w-[150%] z-10 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></div>
                </div>
            </div>`;

file = file.replace(regex, newLogoHTML);

const btnRegex = /(<p id="errorMsg"[\s\S]*?<\/p>)/;
const noticeHTML = `
            <div class="mt-6 pt-5 border-t border-slate-700/50">
                <div class="flex items-start gap-2.5 text-slate-400 bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5 text-sky-500/70"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <p class="text-[10.5px] leading-relaxed text-left">
                        <strong class="text-slate-300">AVVISO DI SICUREZZA:</strong><br>
                        Questo sistema è ad uso esclusivo del <strong>Reparto ABS</strong>.<br>
                        Ogni tentativo di accesso non autorizzato sarà tracciato e rigorosamente perseguito.
                    </p>
                </div>
            </div>`;

file = file.replace(btnRegex, '$1' + noticeHTML);

fs.writeFileSync('index.html', file);
console.log('Login patched with ABS logo and notice');
