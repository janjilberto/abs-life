// Gestione Magazzino Pro - Logic Core
const PASSWORD_CORRETTA = "fiat16"; 
const db = supabase.createClient('https://igiajxipprtbqsogxhjm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaWFqeGlwcHJ0YnFzb2d4aGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzQ1NDMsImV4cCI6MjA5MDgxMDU0M30.nfP3mpJ4cXzSONNIs2gxlJXJiWnbhgcYEMICMttVr6Q');

let articoliData = []; 
let currentEditingId = null;
let currentTab = 'inventory';
let highlightedId = null;
let pinnedFields = {
    marca: false,
    modello: false,
    scaffale: false
};

let modelPhotos = {};
try {
    modelPhotos = JSON.parse(localStorage.getItem('modelli_foto') || '{}');
} catch (e) {
    modelPhotos = {};
}

function getModelPhoto(modello) {
    return (modello && modelPhotos[modello]) ? modelPhotos[modello] : '';
}

// AUTHENTICATION
function checkPassword() {
    const input = document.getElementById('passInput');
    if (input.value === PASSWORD_CORRETTA) { 
        localStorage.setItem('isLoggedIn', 'true'); 
        document.getElementById('loginModal').classList.add('hidden'); 
        initApp();
    } else { 
        document.getElementById('errorMsg').classList.remove('hidden'); 
    }
}

function logout() { 
    localStorage.removeItem('isLoggedIn'); 
    window.location.reload(); 
}

function checkAuth() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginModal').classList.add('hidden');
        initApp();
    }
}

// APP INITIALIZATION
async function initApp() {
    await fetchArticoli();
    switchTab('inventory');
}

async function fetchArticoli() {
    try {
        const [articoliRes, fotoRes] = await Promise.all([
            db.from('articoli').select('*'),
            db.from('modelli_foto').select('*')
        ]);

        if (articoliRes.error) {
            console.error("Errore recupero dati articoli:", articoliRes.error);
            return;
        }

        if (fotoRes.error) {
            console.error("Errore recupero foto modelli:", fotoRes.error);
        } else if (fotoRes.data) {
            modelPhotos = {};
            fotoRes.data.forEach(item => {
                if (item.modello && item.url_foto) {
                    modelPhotos[item.modello] = item.url_foto;
                }
            });
            localStorage.setItem('modelli_foto', JSON.stringify(modelPhotos));
        }

        articoliData = (articoliRes.data || []).sort((a, b) => {
            const posA = String(a.posizione_scaffale || "0:0").split(':').map(Number);
            const posB = String(b.posizione_scaffale || "0:0").split(':').map(Number);
            if (posA[0] !== posB[0]) return (posA[0] || 0) - (posB[0] || 0);
            if (posA[1] !== posB[1]) return (posA[1] || 0) - (posB[1] || 0);
            return a.numero_centralina.localeCompare(b.numero_centralina);
        });

        populateFilters();
        renderInventory();
        if (currentTab === 'stats') renderStats();
    } catch (err) {
        console.error("Errore durante fetchArticoli:", err);
    }
}

function populateFilters() {
    const brands = [...new Set(articoliData.map(i => i.marca_auto))].sort();
    const positions = [...new Set(articoliData.map(i => i.posizione_scaffale))].sort((a, b) => {
        const partsA = a.split(':').map(Number);
        const partsB = b.split(':').map(Number);
        if (partsA[0] !== partsB[0]) return (partsA[0] || 0) - (partsB[0] || 0);
        return (partsA[1] || 0) - (partsB[1] || 0);
    });
    const models = [...new Set(articoliData.map(i => i.modello))].sort();

    const fMarca = document.getElementById('filterMarca');
    const fPos = document.getElementById('filterPosizione');
    const fMod = document.getElementById('filterModello');

    const curMarca = fMarca.value;
    const curPos = fPos.value;
    const curMod = fMod.value;

    fMarca.innerHTML = '<option value="">Tutte le marche</option>' + 
        brands.map(b => `<option value="${b}" ${b === curMarca ? 'selected' : ''}>${b}</option>`).join('');
    
    fPos.innerHTML = '<option value="">Tutte le posizioni</option>' + 
        positions.map(p => `<option value="${p}" ${p === curPos ? 'selected' : ''}>${p}</option>`).join('');

    fMod.innerHTML = '<option value="">Tutti i modelli</option>' + 
        models.map(m => `<option value="${m}" ${m === curMod ? 'selected' : ''}>${m}</option>`).join('');

    populateModelSelector();
}

function populateModelSelector() {
    const selector = document.getElementById('selettore-modello');
    if (!selector) return;

    const models = [...new Set(articoliData.map(i => i.modello).filter(Boolean))].sort();
    const curMod = selector.value;

    selector.innerHTML = '<option value="" disabled ' + (!curMod ? 'selected' : '') + '>Seleziona un modello...</option>' +
        models.map(m => `<option value="${m}" ${m === curMod ? 'selected' : ''}>${m}</option>`).join('');

    if (curMod) {
        handleModelChange(curMod);
    }
}

function handleModelChange(modello) {
    const urlInput = document.getElementById('url-foto');
    const photoUrl = getModelPhoto(modello);
    if (urlInput) {
        urlInput.value = photoUrl;
    }
    updatePhotoPreview(photoUrl);
}

function handleUrlInput(url) {
    updatePhotoPreview((url || '').trim());
}

function updatePhotoPreview(url) {
    const previewContainer = document.getElementById('fotoPreviewContainer');
    const previewImg = document.getElementById('fotoPreviewImg');
    if (!previewContainer || !previewImg) return;

    if (url) {
        previewImg.src = url;
        previewContainer.classList.remove('hidden');
        previewImg.onerror = () => {
            previewContainer.classList.add('hidden');
        };
    } else {
        previewContainer.classList.add('hidden');
    }
}

async function handleSavePhoto(event) {
    if (event) event.preventDefault();
    const selector = document.getElementById('selettore-modello');
    const urlInput = document.getElementById('url-foto');
    const submitBtn = event?.target?.querySelector('button[type="submit"]') || document.querySelector('#fotoForm button[type="submit"]');

    if (!selector || !selector.value) {
        toast("⚠️ Seleziona prima un modello", "error");
        return;
    }

    const modello = selector.value;
    const url = urlInput ? urlInput.value.trim() : '';

    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-70');
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Salvataggio...';
    }

    try {
        if (url) {
            const { error } = await db.from('modelli_foto').upsert({
                modello: modello,
                url_foto: url
            }, { onConflict: 'modello' });

            if (error) throw error;

            modelPhotos[modello] = url;
            toast(`📷 Foto associata a "${modello}"`);
        } else {
            const { error } = await db.from('modelli_foto').delete().eq('modello', modello);
            if (error) throw error;

            delete modelPhotos[modello];
            toast(`🗑️ Foto rimossa per "${modello}"`);
        }

        localStorage.setItem('modelli_foto', JSON.stringify(modelPhotos));
        updatePhotoPreview(url);
        renderInventory();
    } catch (err) {
        console.error("Errore salvataggio foto su Supabase:", err);
        toast("❌ Errore salvataggio su Supabase", "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70');
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// TAB NAVIGATION
function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.app-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-orange-600', 'text-white');
        item.classList.add('text-slate-400');
    });
    document.querySelector(`aside [data-tab="${tabId}"]`)?.classList.add('bg-orange-600', 'text-white');
    document.querySelector(`aside [data-tab="${tabId}"]`)?.classList.remove('text-slate-400');

    // Update active state in mobile bottom nav
    document.querySelectorAll('nav.md\\:hidden button').forEach(item => {
        item.classList.remove('text-orange-500');
        item.classList.add('text-slate-500');
    });
    const mobileBtn = Array.from(document.querySelectorAll('nav.md\\:hidden button')).find(btn => btn.getAttribute('onclick')?.includes(`'${tabId}'`));
    if (mobileBtn) {
        mobileBtn.classList.add('text-orange-500');
        mobileBtn.classList.remove('text-slate-500');
    }

    if (tabId === 'inventory') {
        populateFilters();
        renderInventory();
    }
    if (tabId === 'stats') renderStats();
    if (tabId === 'foto') populateModelSelector();
}

// INVENTORY RENDERING
function renderInventory() {
    const body = document.getElementById('articoliBody');
    const searchTerm = document.getElementById('globalSearch').value.toLowerCase();
    
    const filterMarca = document.getElementById('filterMarca').value;
    const filterPos = document.getElementById('filterPosizione').value;
    const filterMod = document.getElementById('filterModello').value;

    const filtered = articoliData.filter(i => {
        const matchesSearch = i.numero_centralina.toLowerCase().includes(searchTerm) ||
                            i.marca_auto.toLowerCase().includes(searchTerm) ||
                            i.modello.toLowerCase().includes(searchTerm) ||
                            i.posizione_scaffale.toLowerCase().includes(searchTerm);
        
        const matchesMarca = !filterMarca || i.marca_auto === filterMarca;
        const matchesPos = !filterPos || i.posizione_scaffale === filterPos;
        const matchesMod = !filterMod || i.modello === filterMod;

        return matchesSearch && matchesMarca && matchesPos && matchesMod;
    });

    body.innerHTML = filtered.map((item, index) => {
        const photoUrl = getModelPhoto(item.modello);
        return `
        <tr onclick="openDetailsModal('${item.numero_centralina.replace(/'/g, "\\'")}')" class="hover:bg-orange-500/5 border-b border-slate-800/50 group cursor-pointer ${highlightedId === item.numero_centralina ? 'flash-red-effect' : ''}" data-id="${item.numero_centralina}" style="transition-delay: ${index * 30}ms">
            <td class="p-4 w-16">
                ${photoUrl ? `
                    <div class="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                        <img src="${photoUrl}" alt="${item.modello}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-slate-600\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\' ry=\\'2\\'/><circle cx=\\'9\\' cy=\\'9\\' r=\\'2\\'/><path d=\\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\\'/></svg></div>'">
                    </div>
                ` : `
                    <div class="w-10 h-10 rounded-xl border border-slate-800/80 bg-slate-950/60 text-slate-600 flex items-center justify-center shrink-0" title="Nessuna foto associata">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-40"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                `}
            </td>
            <td class="p-4">
                <span class="px-2 py-1 bg-slate-950 rounded text-xs font-mono text-orange-400 border border-orange-400/20">
                    ${item.posizione_scaffale}
                </span>
            </td>
            <td class="p-4 font-medium text-slate-200">${item.marca_auto || '-'}</td>
            <td class="p-4 text-slate-300 font-semibold">${item.modello}</td>
            <td class="p-4 font-mono text-xs text-slate-500">${item.numero_centralina}</td>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <button onclick="event.stopPropagation(); updateQty('${item.numero_centralina.replace(/'/g, "\\'")}', -1)" class="w-8 h-8 flex items-center justify-center bg-slate-800/50 hover:bg-red-900/40 rounded-lg transition-all active:scale-95 text-slate-400 hover:text-red-400">-</button>
                    <span class="min-w-[24px] text-center font-bold text-slate-200">${item.quantita}</span>
                    <button onclick="event.stopPropagation(); updateQty('${item.numero_centralina.replace(/'/g, "\\'")}', 1)" class="w-8 h-8 flex items-center justify-center bg-slate-800/50 hover:bg-emerald-900/40 rounded-lg transition-all active:scale-95 text-slate-400 hover:text-emerald-400">+</button>
                </div>
            </td>
            <td class="p-4 text-right">
                <div class="text-slate-600 group-hover:text-orange-500/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
            </td>
        </tr>
        `;
    }).join('');

    // Trigger fade-in immediately to prevent shift bug
    body.querySelectorAll('tr').forEach(r => r.classList.add('loaded'));
}

function toggleLegalPanel() {
    const panel = document.getElementById('legalPanel');
    const text = document.getElementById('legalText');
    const icon = document.getElementById('legalIcon');
    
    const isMinimized = panel.classList.toggle('minimized');
    
    if (isMinimized) {
        text.classList.add('hidden', 'opacity-0');
        icon.classList.remove('hidden');
    } else {
        icon.classList.add('hidden');
        text.classList.remove('hidden');
        setTimeout(() => text.classList.remove('opacity-0'), 100);
    }
}

// LOGIC FOR QTY
async function updateQty(centralina, delta) {
    const item = articoliData.find(a => a.numero_centralina === centralina);
    const newQty = item.quantita + delta;
    
    if (newQty <= 0) {
        if(!confirm('📦 Rimuovere definitivamente questo articolo dal magazzino?')) return;
        await db.from('articoli').delete().eq('numero_centralina', centralina);
    } else {
        await db.from('articoli').update({ quantita: newQty }).eq('numero_centralina', centralina);
        triggerHighlight(centralina);
    }
    await fetchArticoli();
}

function triggerHighlight(id) {
    highlightedId = id;
    renderInventory();
    setTimeout(() => {
        highlightedId = null;
        renderInventory();
    }, 1500);
}

function toggleFiltersMenu() {
    const menu = document.getElementById('filtersMenu');
    const isHidden = menu.classList.toggle('hidden');
    const btn = document.getElementById('btnToggleFilters');
    
    if (!isHidden) {
        btn.classList.add('bg-orange-600/10', 'text-orange-500', 'border-orange-500/50');
        btn.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');
    } else {
        btn.classList.remove('bg-orange-600/10', 'text-orange-500', 'border-orange-500/50');
        btn.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
    }
}

// DELETE
async function deleteItem() {
    const centralina = currentEditingId;
    if(!centralina) return;
    
    if(!confirm('⚠️ Sei sicuro di voler eliminare definitivamente questo articolo?')) return;
    
    try {
        const { error } = await db.from('articoli').delete().eq('numero_centralina', centralina);
        if (error) throw error;
        
        closeModal('editModal');
        await fetchArticoli();
        toast("🗑️ Articolo eliminato correttamente");
    } catch (err) {
        console.error("Errore eliminazione:", err);
        toast("❌ Errore durante l'eliminazione", "error");
    }
}

// FORM SUBMISSION
async function handleAdd(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const centralina = formData.get('centralina').trim();
    
    if (!centralina) return;

    const { data: exist } = await db.from('articoli').select('*').eq('numero_centralina', centralina).maybeSingle();
    
    if(exist) {
        await db.from('articoli').update({ quantita: exist.quantita + 1 }).eq('numero_centralina', centralina);
        triggerHighlight(centralina);
    } else {
        await db.from('articoli').insert([{
            marca_auto: formData.get('marca').trim(),
            modello: formData.get('modello').trim(),
            numero_centralina: centralina,
            posizione_scaffale: formData.get('scaffale').trim(),
            note: formData.get('note').trim(),
            quantita: 1
        }]);
        triggerHighlight(centralina);
    }
    
    // Smart Reset
    if (!pinnedFields.marca) document.getElementById('input-marca').value = '';
    if (!pinnedFields.modello) document.getElementById('input-modello').value = '';
    if (!pinnedFields.scaffale) document.getElementById('input-scaffale').value = '';
    
    // Always clear centralina and notes
    document.getElementById('input-centralina').value = '';
    document.querySelector('textarea[name="note"]').value = '';
    
    // Refocus centralina
    document.getElementById('input-centralina').focus();

    await fetchArticoli();
    toast("Articolo registrato con successo");
}

function togglePin(field) {
    pinnedFields[field] = !pinnedFields[field];
    const btn = document.getElementById(`pin-${field}`);
    if (pinnedFields[field]) {
        btn.classList.remove('text-slate-600');
        btn.classList.add('text-orange-500');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    } else {
        btn.classList.add('text-slate-600');
        btn.classList.remove('text-orange-500');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    }
}

// MODALS
function openDetailsModal(centralina) {
    currentEditingId = centralina;
    const item = articoliData.find(a => a.numero_centralina === centralina);
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');
    const title = modal.querySelector('h2');
    
    if (!item) return;

    title.innerText = "Dettagli Articolo";
    modal.classList.remove('hidden');

    const photoUrl = getModelPhoto(item.modello);

    content.innerHTML = `
        <div class="space-y-6">
            ${photoUrl ? `
                <div class="w-full h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                    <img src="${photoUrl}" alt="${item.modello}" class="max-h-full max-w-full object-contain rounded-lg" onerror="this.parentElement.style.display='none'">
                </div>
            ` : ''}
            <div class="flex items-start justify-between">
                <div>
                    <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Codice Centralina</div>
                    <div class="text-2xl font-mono text-orange-500 font-bold">${item.numero_centralina}</div>
                </div>
                <div class="text-right">
                    <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Posizione</div>
                    <div class="bg-slate-800 px-3 py-1 rounded-lg text-white font-mono border border-slate-700">${item.posizione_scaffale}</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Marca</div>
                    <div class="text-lg font-bold">${item.marca_auto || 'Non specificata'}</div>
                </div>
                <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Modello</div>
                    <div class="text-lg font-bold">${item.modello}</div>
                </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[100px]">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Note</div>
                <div class="text-slate-300 text-sm whitespace-pre-wrap">${item.note || 'Nessuna nota aggiuntiva.'}</div>
            </div>

            <div class="flex gap-3">
                <button onclick="closeModal('editModal')" class="flex-1 bg-slate-800 py-3 rounded-xl font-bold hover:bg-slate-700 transition">Chiudi</button>
                <button onclick="openEditModal('${item.numero_centralina.replace(/'/g, "\\'")}')" class="flex-1 bg-orange-600/10 text-orange-500 border border-orange-500/20 py-3 rounded-xl font-bold hover:bg-orange-600 hover:text-white transition flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    Modifica
                </button>
            </div>
        </div>
    `;
}

function openEditModal(centralina) {
    currentEditingId = centralina;
    const item = articoliData.find(a => a.numero_centralina === centralina);
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');
    const title = modal.querySelector('h2');
    
    if (!item) return;

    title.innerText = "Modifica Articolo";
    modal.classList.remove('hidden');

    content.innerHTML = `
        <form id="editForm" onsubmit="handleEditSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Marca</label>
                    <input type="text" name="marca" value="${item.marca_auto || ''}" class="w-full bg-slate-950 border border-slate-700 rounded p-2 outline-none focus:border-orange-500 text-white">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Modello</label>
                    <input type="text" name="modello" value="${item.modello}" class="w-full bg-slate-950 border border-slate-700 rounded p-2 outline-none focus:border-orange-500 text-white">
                </div>
            </div>
            <div>
                <label class="block text-xs text-slate-400 mb-1">Posizione (Scaffale:Piano)</label>
                <input type="text" name="scaffale" value="${item.posizione_scaffale}" class="w-full bg-slate-950 border border-slate-700 rounded p-2 outline-none focus:border-orange-500 text-white">
            </div>
            <div>
                <label class="block text-xs text-slate-400 mb-1">Note</label>
                <textarea name="note" class="w-full bg-slate-950 border border-slate-700 rounded p-2 outline-none focus:border-orange-500 min-h-[100px] text-white">${item.note || ''}</textarea>
            </div>
            <div class="flex gap-2 pt-4">
                <button type="button" onclick="deleteItem()" class="bg-red-900/40 text-red-100 border border-red-800/50 px-6 rounded-xl font-bold hover:bg-red-700 transition">Elimina</button>
                <button type="button" onclick="openDetailsModal('${item.numero_centralina.replace(/'/g, "\\'")}')" class="flex-1 bg-slate-700 py-3 rounded-xl font-bold hover:bg-slate-600 transition">Annulla</button>
                <button type="submit" class="flex-1 bg-orange-600 py-3 rounded-xl font-bold hover:bg-orange-700 transition">Salva</button>
            </div>
        </form>
    `;
}

async function handleEditSubmit(event) {
    event.preventDefault();
    const centralina = currentEditingId;
    if (!centralina) return;

    const formData = new FormData(event.target);
    const updates = {
        marca_auto: formData.get('marca'),
        modello: formData.get('modello'),
        posizione_scaffale: formData.get('scaffale'),
        note: formData.get('note')
    };
    
    await db.from('articoli').update(updates).eq('numero_centralina', centralina);
    closeModal('editModal');
    await fetchArticoli();
    toast("Articolo aggiornato");
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function toast(msg, type = "success") {
    const t = document.createElement('div');
    const bgColor = type === "error" ? "bg-red-600" : "bg-emerald-600";
    t.className = `fixed bottom-8 right-8 ${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl z-[200] animate-fade-in font-bold flex items-center gap-2`;
    t.innerHTML = `
        ${type === "error" ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'}
        ${msg}
    `;
    document.body.appendChild(t);
    setTimeout(() => {
        t.classList.replace('animate-fade-in', 'opacity-0');
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

// CHARTS LOGIC (D3)
function renderStats() {
    const brandData = d3.rollups(articoliData, v => d3.sum(v, d => d.quantita), d => d.marca_auto)
        .sort((a,b) => b[1] - a[1]);
    
    const modelData = d3.rollups(articoliData, v => d3.sum(v, d => d.quantita), d => d.modello)
        .sort((a,b) => b[1] - a[1]).slice(0, 10);

    const shelfData = articoliData.map(i => {
        const parts = String(i.posizione_scaffale).split(':').map(Number);
        return { height: parts[0] || 0, distance: parts[1] || 0, qty: i.quantita };
    });

    renderPieChart('#chart-brands', brandData);
    renderBarChart('#chart-models', modelData);
    renderShelfGrid('#chart-occupancy', shelfData);
}

function renderPieChart(selector, data) {
    const el = document.querySelector(selector);
    el.innerHTML = '';

    if (!data || data.length === 0) {
        el.innerHTML = '<div class="h-64 flex items-center justify-center text-slate-500 text-sm">Nessun dato disponibile</div>';
        return;
    }

    const totalQty = d3.sum(data, d => d[1]) || 1;
    const width = el.clientWidth || 360;
    const height = 320;
    const radius = Math.min(width * 0.42, height * 0.42);
    const innerRadius = radius * 0.52;
    const outerRadius = radius * 0.78;
    const hoverOuterRadius = radius * 0.92;
    const hoverInnerRadius = radius * 0.48;

    const svg = d3.select(selector)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height)
        .style("overflow", "visible");

    // Glow filter for interactive highlight
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow-filter")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "4")
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const modernPalette = [
        '#f97316', '#38bdf8', '#34d399', '#a78bfa', '#f472b6',
        '#fbbf24', '#2dd4bf', '#818cf8', '#fb7185', '#c084fc'
    ];

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d[0]))
        .range(modernPalette);

    const pie = d3.pie()
        .value(d => d[1])
        .sort(null)
        .padAngle(0.02);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(4);

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(6);

    // Center Display Group
    const centerG = g.append("g")
        .attr("class", "center-info")
        .attr("text-anchor", "middle")
        .attr("pointer-events", "none");

    const centerLabel = centerG.append("text")
        .attr("y", -8)
        .attr("class", "fill-slate-400 font-bold uppercase tracking-widest text-[10px]")
        .text("Totale ABS");

    const centerValue = centerG.append("text")
        .attr("y", 18)
        .attr("class", "fill-white font-mono font-bold text-2xl")
        .text(totalQty);

    const centerSub = centerG.append("text")
        .attr("y", 34)
        .attr("class", "fill-orange-400 font-medium text-[11px]")
        .text(`${data.length} marche`);

    // Dynamic Callout Group (Floating leader line & label on hover)
    const calloutG = g.append("g")
        .attr("class", "callout-layer")
        .attr("pointer-events", "none");

    // Slices
    const pieData = pie(data);
    const slices = g.selectAll('.slice-path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('class', 'slice-path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr('stroke', '#020617')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .style('transition', 'filter 0.25s ease, opacity 0.25s ease');

    // Interactive Hover Events
    slices
        .on('mouseenter', function(event, d) {
            const brand = d.data[0];
            const qty = d.data[1];
            const pct = ((qty / totalQty) * 100).toFixed(1);
            const sliceColor = color(brand);

            // 1. Ingrandisci lo spicchio con animazione fluida
            d3.select(this)
                .transition()
                .duration(280)
                .ease(d3.easeCubicOut)
                .attr('d', arcHover)
                .style('filter', `drop-shadow(0 0 12px ${sliceColor})`);

            // Attenua gli altri spicchi
            slices.filter(s => s !== d)
                .transition()
                .duration(200)
                .style('opacity', 0.35);

            // 2. Aggiorna display centrale
            centerLabel.text(brand).attr("class", "fill-orange-400 font-bold text-xs uppercase tracking-wider");
            centerValue.text(`${qty} pz`).attr("class", "fill-white font-mono font-bold text-2xl");
            centerSub.text(`${pct}% del totale`).attr("class", "fill-slate-300 font-medium text-[11px]");

            // 3. Mostra a fianco dello spicchio il nome della marca con linea guida elegante
            calloutG.selectAll('*').remove();

            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            const isRight = Math.sin(midAngle) >= 0;

            const edgeX = Math.sin(midAngle) * (hoverOuterRadius + 6);
            const edgeY = -Math.cos(midAngle) * (hoverOuterRadius + 6);

            const elbowX = Math.sin(midAngle) * (hoverOuterRadius + 24);
            const elbowY = -Math.cos(midAngle) * (hoverOuterRadius + 24);

            const endX = elbowX + (isRight ? 32 : -32);
            const endY = elbowY;

            // Leader Line
            const line = calloutG.append('polyline')
                .attr('points', `${edgeX},${edgeY} ${elbowX},${elbowY} ${endX},${endY}`)
                .attr('fill', 'none')
                .attr('stroke', sliceColor)
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round')
                .attr('stroke-linejoin', 'round')
                .style('opacity', 0);

            line.transition().duration(250).style('opacity', 1);

            // Floating Label Tag
            const labelGroup = calloutG.append('g')
                .attr('transform', `translate(${endX + (isRight ? 6 : -6)}, ${endY})`)
                .style('opacity', 0);

            const textContent = `${brand} • ${qty} pz (${pct}%)`;
            const estWidth = textContent.length * 7.2 + 20;

            labelGroup.append('rect')
                .attr('x', isRight ? 0 : -estWidth)
                .attr('y', -12)
                .attr('width', estWidth)
                .attr('height', 24)
                .attr('rx', 6)
                .attr('fill', 'rgba(15, 23, 42, 0.95)')
                .attr('stroke', sliceColor)
                .attr('stroke-width', 1.5)
                .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))');

            labelGroup.append('circle')
                .attr('cx', isRight ? 10 : -estWidth + 10)
                .attr('cy', 0)
                .attr('r', 3.5)
                .attr('fill', sliceColor);

            labelGroup.append('text')
                .attr('x', isRight ? 18 : -estWidth + 18)
                .attr('y', 4)
                .attr('fill', '#ffffff')
                .attr('font-size', '11px')
                .attr('font-weight', '700')
                .text(textContent);

            labelGroup.transition().duration(250).style('opacity', 1);

            // Highlight corresponding legend badge
            const safeBrand = brand.replace(/[^a-zA-Z0-9_-]/g, '_');
            d3.selectAll(`.legend-badge-${safeBrand}`)
                .classed('ring-2 ring-orange-500 scale-105 bg-slate-700', true);
        })
        .on('mouseleave', function(event, d) {
            const brand = d.data[0];

            d3.select(this)
                .transition()
                .duration(250)
                .ease(d3.easeCubicOut)
                .attr('d', arc)
                .style('filter', 'none');

            slices.transition().duration(250).style('opacity', 1);

            centerLabel.text("Totale ABS").attr("class", "fill-slate-400 font-bold uppercase tracking-widest text-[10px]");
            centerValue.text(totalQty).attr("class", "fill-white font-mono font-bold text-2xl");
            centerSub.text(`${data.length} marche`).attr("class", "fill-orange-400 font-medium text-[11px]");

            calloutG.selectAll('*')
                .transition()
                .duration(200)
                .style('opacity', 0)
                .remove();

            const safeBrand = brand.replace(/[^a-zA-Z0-9_-]/g, '_');
            d3.selectAll(`.legend-badge-${safeBrand}`)
                .classed('ring-2 ring-orange-500 scale-105 bg-slate-700', false);
        });

    // Modern Interactive Legend
    const legend = d3.select(selector)
        .append('div')
        .attr('class', 'flex flex-wrap gap-2 mt-4 text-[10px] justify-center');

    data.slice(0, 10).forEach(d => {
        const brand = d[0];
        const qty = d[1];
        const sliceColor = color(brand);
        const safeBrand = brand.replace(/[^a-zA-Z0-9_-]/g, '_');

        const badge = legend.append('button')
            .attr('type', 'button')
            .attr('class', `legend-badge-${safeBrand} px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700/60`)
            .html(`<span style="background:${sliceColor}; box-shadow: 0 0 6px ${sliceColor}" class="inline-block w-2.5 h-2.5 rounded-full"></span> <span>${brand}</span> <span class="font-mono text-orange-400 font-bold">(${qty})</span>`);

        badge.on('mouseenter', () => {
            const targetSlice = slices.filter(s => s.data[0] === brand);
            if (!targetSlice.empty()) {
                targetSlice.dispatch('mouseenter');
            }
        }).on('mouseleave', () => {
            const targetSlice = slices.filter(s => s.data[0] === brand);
            if (!targetSlice.empty()) {
                targetSlice.dispatch('mouseleave');
            }
        });
    });
}

function renderBarChart(selector, data) {
    const el = document.querySelector(selector);
    el.innerHTML = '';
    const margin = {top: 20, right: 20, bottom: 60, left: 40};
    const width = el.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).domain(data.map(d => d[0])).padding(0.2);
    const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, d => d[1]) || 1]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");

    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[1]))
        .attr("height", d => height - y(d[1]))
        .attr("fill", "#ea580c");
}

function renderShelfGrid(selector, shelfData) {
    const el = document.querySelector(selector);
    el.innerHTML = '';

    const minHeight = d3.min(shelfData, d => d.height) ?? 1;
    const maxHeight = d3.max(shelfData, d => d.height) ?? 6;
    const minDistance = d3.min(shelfData, d => d.distance) ?? 0;
    const maxDistance = d3.max(shelfData, d => d.distance) ?? 5;

    const container = d3.select(selector)
        .append('div')
        .attr('class', 'flex flex-col-reverse gap-6 p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl relative');

    // Mappa articoli per posizione per mostrare dettagli completi
    const slotItemsMap = new Map();
    articoliData.forEach(item => {
        const key = item.posizione_scaffale || "0:0";
        if (!slotItemsMap.has(key)) slotItemsMap.set(key, []);
        slotItemsMap.get(key).push(item);
    });

    for (let h = minHeight; h <= maxHeight; h++) {
        const row = container.append('div').attr('class', 'flex items-center gap-4');
        
        // Etichetta Piano Scaffale (Altezza)
        row.append('span')
           .attr('class', 'w-12 text-xs text-slate-400 font-bold font-mono text-right shrink-0 flex items-center justify-end gap-1')
           .html(`<span class="text-[9px] text-slate-500 uppercase tracking-wider">P.</span>${h}`);
        
        const shelfFloor = row.append('div')
           .attr('class', 'flex-1 flex gap-3 h-16 border-b-4 border-slate-700/80 items-end pb-1.5 px-2 relative');
        
        // Binario luminoso sotto il piano dello scaffale
        shelfFloor.append('div')
            .attr('class', 'absolute bottom-[-4px] left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 rounded-full');

        for (let d = minDistance; d <= maxDistance; d++) {
            const key = `${h}:${d}`;
            const items = slotItemsMap.get(key) || [];
            const qty = items.reduce((sum, it) => sum + (Number(it.quantita) || 1), 0);

            const slot = shelfFloor.append('div')
                .attr('class', 'flex-1 h-14 rounded-xl relative group/shelf transition-all duration-300 flex items-center justify-center cursor-pointer')
                .style('background', qty > 0 ? 'rgba(234, 88, 12, 0.08)' : 'rgba(15, 23, 42, 0.4)')
                .style('border', qty > 0 ? '1px solid rgba(234, 88, 12, 0.25)' : '1px dashed rgba(51, 65, 85, 0.3)');

            if (qty > 0) {
                // QUADRATO ARANCIONE: presente normalmente, si diffrange e scompare al passaggio del mouse
                slot.append('div')
                    .attr('class', 'shelf-square w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-300/40 shadow-[0_0_12px_rgba(234,88,12,0.4)] flex items-center justify-center font-mono font-bold text-xs text-slate-950 transition-all duration-300 ease-out transform group-hover/shelf:scale-0 group-hover/shelf:opacity-0 group-hover/shelf:rotate-45 select-none')
                    .text(qty);

                // CONTENITORE PALLINI DIFFRATTI:
                // Al passaggio del mouse compaiono esattamente `qty` pallini arancioni
                const dotsContainer = slot.append('div')
                    .attr('class', 'shelf-dots-cluster absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center gap-1.5 p-2 overflow-hidden');

                const dotSizeClass = qty > 16 ? 'w-1.5 h-1.5' : (qty > 8 ? 'w-2 h-2' : 'w-2.5 h-2.5');

                for (let i = 0; i < qty; i++) {
                    const delay = Math.min(i * 25, 400);
                    dotsContainer.append('span')
                        .attr('class', `diffract-dot ${dotSizeClass} rounded-full bg-orange-400 border border-orange-200 shadow-[0_0_8px_#f97316] transition-all duration-300 ease-out transform scale-0 opacity-0 group-hover/shelf:scale-100 group-hover/shelf:opacity-100 dot-pulse`)
                        .style('transition-delay', `${delay}ms`)
                        .style('animation-delay', `${(i * 0.1).toFixed(2)}s`);
                }

                // Tooltip scenico con dettagli del settore
                const tooltip = slot.append('div')
                    .attr('class', 'hidden group-hover/shelf:flex flex-col gap-1 absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-orange-500/40 p-2.5 rounded-xl text-xs whitespace-nowrap z-[120] shadow-[0_10px_25px_rgba(0,0,0,0.8)] pointer-events-none animate-fade-in');

                tooltip.append('div')
                    .attr('class', 'flex items-center gap-2 border-b border-slate-800 pb-1')
                    .html(`<span class="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold text-[10px] border border-orange-500/30">Settore ${h}:${d}</span> <span class="font-bold text-white">${qty} ABS ${qty === 1 ? 'presente' : 'presenti'}</span>`);

                const breakdown = tooltip.append('div')
                    .attr('class', 'text-[10px] text-slate-400 space-y-0.5');

                items.slice(0, 3).forEach(it => {
                    breakdown.append('div')
                        .html(`<span class="text-orange-400 font-bold">${it.marca_auto}</span> ${it.modello} <span class="text-slate-500 font-mono">(qt: ${it.quantita})</span>`);
                });

                if (items.length > 3) {
                    breakdown.append('div')
                        .attr('class', 'text-slate-500 italic text-[9px]')
                        .text(`+ altri ${items.length - 3} articoli...`);
                }

            } else {
                // Slot vuoto
                slot.append('span')
                    .attr('class', 'text-[10px] text-slate-600 font-mono opacity-40')
                    .text(`${h}:${d}`);
            }
        }
    }

    // Footer per colonne (Distanza / Campata)
    const footer = container.append('div').attr('class', 'flex items-center gap-4 pt-2 border-t border-slate-800/60');
    footer.append('div').attr('class', 'w-12 text-[10px] text-slate-500 font-bold text-right').text('COL');
    const distRow = footer.append('div').attr('class', 'flex-1 flex gap-3 px-2');
    for (let d = minDistance; d <= maxDistance; d++) {
        distRow.append('span')
            .attr('class', 'flex-1 text-center text-[11px] text-slate-400 font-bold font-mono')
            .text(`C.${d}`);
    }
}

async function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').filter(r => r.trim());
        const data = rows.slice(1).map(row => {
            const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            return {
                posizione_scaffale: cols[0],
                marca_auto: cols[1],
                modello: cols[2],
                numero_centralina: cols[3],
                quantita: parseInt(cols[4]) || 1,
                note: cols[5] || ''
            };
        });

        if (data.length === 0) {
            toast("❌ File vuoto o formato non valido");
            return;
        }

        try {
            // Check for duplicates before inserting
            const existingIds = articoliData.map(a => a.numero_centralina);
            const newData = data.filter(d => d.numero_centralina && !existingIds.includes(d.numero_centralina));
            
            if (newData.length === 0) {
                toast("⚠️ Nessun nuovo articolo trovato (già esistenti)");
                return;
            }

            const { error } = await db.from('articoli').insert(newData);
            if (error) throw error;

            await fetchArticoli();
            toast(`✅ Importati ${newData.length} articoli!`);
            event.target.value = ''; // Reset input
        } catch (err) {
            console.error(err);
            toast("❌ Errore durante l'importazione");
        }
    };
    reader.readAsText(file);
}

async function exportToExcel() {
    const headers = ['Posizione', 'Marca', 'Modello', 'N. Centralina', 'Quantita', 'Note'];
    const csvContent = [
        headers.join(','),
        ...articoliData.map(i => [
            `"${i.posizione_scaffale}"`,
            `"${i.marca_auto || ''}"`,
            `"${i.modello}"`,
            `"${i.numero_centralina}"`,
            i.quantita,
            `"${(i.note || '').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_totale_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("📦 Backup database completo scaricato");
}

function downloadTemplate() {
    const headers = ['Posizione', 'Marca', 'Modello', 'N. Centralina', 'Quantita', 'Note'];
    const example = ['12:A', 'Fiat', 'Panda', 'P001X', '1', 'Esempio nota'];
    const csvContent = [headers.join(','), example.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_importazione.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Global scope expose for onclick attributes
window.checkPassword = checkPassword;
window.logout = logout;
window.switchTab = switchTab;
window.updateQty = updateQty;
window.openDetailsModal = openDetailsModal;
window.openEditModal = openEditModal;
window.handleEditSubmit = handleEditSubmit;
window.closeModal = closeModal;
window.downloadTemplate = downloadTemplate;
window.handleAdd = handleAdd;
window.deleteItem = deleteItem;
window.toggleFiltersMenu = toggleFiltersMenu;
window.toggleLegalPanel = toggleLegalPanel;
window.togglePin = togglePin;
window.exportToExcel = exportToExcel;
window.handleCSVImport = handleCSVImport;
window.renderInventory = renderInventory; // Exposed for filter onchange
window.handleModelChange = handleModelChange;
window.handleSavePhoto = handleSavePhoto;
window.handleUrlInput = handleUrlInput;
window.populateModelSelector = populateModelSelector;
window.debouncedSearch = () => { clearTimeout(window.searchTimer); window.searchTimer = setTimeout(renderInventory, 300); };

// Run
checkAuth();
