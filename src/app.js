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
    const { data, error } = await db.from('articoli').select('*');
    if (error) {
        console.error("Errore recupero dati:", error);
        return;
    }
    
    articoliData = (data || []).sort((a, b) => {
        const posA = String(a.posizione_scaffale || "0:0").split(':').map(Number);
        const posB = String(b.posizione_scaffale || "0:0").split(':').map(Number);
        if (posA[0] !== posB[0]) return (posA[0] || 0) - (posB[0] || 0);
        if (posA[1] !== posB[1]) return (posA[1] || 0) - (posB[1] || 0);
        return a.numero_centralina.localeCompare(b.numero_centralina);
    });
    
    populateFilters();
    renderInventory();
    if (currentTab === 'stats') renderStats();
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

    body.innerHTML = filtered.map((item, index) => `
        <tr onclick="openDetailsModal('${item.numero_centralina.replace(/'/g, "\\'")}')" class="hover:bg-orange-500/5 border-b border-slate-800/50 group cursor-pointer ${highlightedId === item.numero_centralina ? 'flash-red-effect' : ''}" data-id="${item.numero_centralina}" style="transition-delay: ${index * 30}ms">
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
    `).join('');

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

    content.innerHTML = `
        <div class="space-y-6">
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
    const width = el.clientWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d[0]))
        .range(d3.schemeCategory10);

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.8);

    svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr('stroke', '#020617')
        .style('stroke-width', '2px');
    
    // Legend
    const legend = d3.select(selector).append('div').attr('class', 'flex flex-wrap gap-2 mt-4 text-[10px]');
    data.slice(0, 8).forEach(d => {
        legend.append('span').html(`<span style="background:${color(d[0])}" class="inline-block w-2 h-2 rounded-full mr-1"></span> ${d[0]} (${d[1]})`)
            .attr('class', 'px-2 py-1 bg-slate-800 rounded');
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
        .attr('class', 'flex flex-col-reverse gap-6 p-6 bg-slate-800/20 rounded-3xl border border-slate-800/50 relative');

    // Group data by H:D
    const dataMap = new Map();
    shelfData.forEach(d => {
        const key = `${d.height}:${d.distance}`;
        dataMap.set(key, (dataMap.get(key) || 0) + d.qty);
    });

    // Create a robust grid representing a real shelf
    for (let h = minHeight; h <= maxHeight; h++) {
        const row = container.append('div').attr('class', 'flex items-center gap-4');
        
        // Height label
        row.append('span')
           .attr('class', 'w-10 text-[11px] text-slate-500 font-bold font-mono text-right shrink-0')
           .text(`${h}:_`);
        
        const shelfFloor = row.append('div')
           .attr('class', 'flex-1 flex gap-2 h-16 border-b-8 border-slate-700/80 items-end pb-1 px-1 relative');
        
        // Wood effect for the shelf floor
        shelfFloor.append('div')
            .attr('class', 'absolute bottom-[-8px] left-0 right-0 h-1 bg-slate-600/30 rounded-full');

        for (let d = minDistance; d <= maxDistance; d++) {
            const qty = dataMap.get(`${h}:${d}`) || 0;
            const opacity = Math.min(qty / 10, 1);
            const key = `${h}:${d}`;
            
            const slot = shelfRow = shelfFloor.append('div')
                .attr('class', 'flex-1 h-12 rounded-lg relative group transition-all duration-300 hover:scale-105')
                .style('background-color', qty > 0 ? `rgba(234, 88, 12, ${0.15 + opacity * 0.85})` : 'rgba(15, 23, 42, 0.4)')
                .style('border', qty > 0 ? '1px solid rgba(234, 88, 12, 0.3)' : '1px dashed rgba(51, 65, 85, 0.3)');

            // Box icon if occupied
            if (qty > 0) {
                slot.attr('class', slot.attr('class') + ' flex items-center justify-center');
                slot.append('div').attr('class', 'w-4 h-4 bg-orange-950/40 rounded-sm border border-orange-500/20');
            }

            // Info bubble
            slot.append('div')
                .attr('class', 'hidden group-hover:block absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] whitespace-nowrap z-50 shadow-2xl')
                .html(`<span class="text-orange-500 font-bold">${h}:${d}</span><br>Carico: ${qty} unità`);
        }
    }

    // Distance footer labels
    const footer = container.append('div').attr('class', 'flex items-center gap-4');
    footer.append('div').attr('class', 'w-10'); // spacer
    const distRow = footer.append('div').attr('class', 'flex-1 flex gap-2');
    for (let d = minDistance; d <= maxDistance; d++) {
        distRow.append('span')
            .attr('class', 'flex-1 text-center text-[11px] text-slate-500 font-bold font-mono')
            .text(`_:${d}`);
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
window.debouncedSearch = () => { clearTimeout(window.searchTimer); window.searchTimer = setTimeout(renderInventory, 300); };

// Run
checkAuth();
