const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// 1. Inject normalizeText before fetchArticoli
const normalizeFn = `
function normalizeText(text) {
    if (!text) return "";
    return text.toString().trim().toUpperCase();
}
`;

file = file.replace('async function fetchArticoli() {', normalizeFn + '\nasync function fetchArticoli() {');

// 2. Fix fetchArticoli
const oldFetchSort = `        articoliData = (articoliRes.data || []).sort((a, b) => {
            const posA = String(a.posizione_scaffale || "0:0").split(':').map(Number);
            const posB = String(b.posizione_scaffale || "0:0").split(':').map(Number);
            if (posA[0] !== posB[0]) return (posA[0] || 0) - (posB[0] || 0);
            if (posA[1] !== posB[1]) return (posA[1] || 0) - (posB[1] || 0);
            return a.numero_centralina.localeCompare(b.numero_centralina);
        });`;

const newFetchSort = `        let rawData = articoliRes.data || [];
        rawData = rawData.map(item => ({
            ...item,
            marca_auto: normalizeText(item.marca_auto),
            modello: normalizeText(item.modello),
            posizione_scaffale: normalizeText(item.posizione_scaffale),
            numero_centralina: normalizeText(item.numero_centralina)
        }));

        articoliData = rawData.sort((a, b) => {
            const posA = String(a.posizione_scaffale || "0:0").split(':').map(Number);
            const posB = String(b.posizione_scaffale || "0:0").split(':').map(Number);
            if (posA[0] !== posB[0]) return (posA[0] || 0) - (posB[0] || 0);
            if (posA[1] !== posB[1]) return (posA[1] || 0) - (posB[1] || 0);
            return String(a.numero_centralina).localeCompare(String(b.numero_centralina));
        });`;

file = file.replace(oldFetchSort, newFetchSort);

// 3. Fix handleAdd
const oldHandleAdd = `    const centralina = formData.get('centralina').trim();
    
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
        }]);`;

const newHandleAdd = `    const centralina = normalizeText(formData.get('centralina'));
    
    if (!centralina) return;

    const { data: exist } = await db.from('articoli').select('*').ilike('numero_centralina', centralina).maybeSingle();
    
    if(exist) {
        await db.from('articoli').update({ quantita: exist.quantita + 1 }).eq('id', exist.id);
        triggerHighlight(centralina);
    } else {
        await db.from('articoli').insert([{
            marca_auto: normalizeText(formData.get('marca')),
            modello: normalizeText(formData.get('modello')),
            numero_centralina: centralina,
            posizione_scaffale: normalizeText(formData.get('scaffale')),
            note: formData.get('note').trim(),
            quantita: 1
        }]);`;

file = file.replace(oldHandleAdd, newHandleAdd);

// 4. Fix handleEditSubmit
const oldEditSubmit = `    const updates = {
        marca_auto: formData.get('marca'),
        modello: formData.get('modello'),
        posizione_scaffale: formData.get('scaffale'),
        note: formData.get('note')
    };`;

const newEditSubmit = `    const updates = {
        marca_auto: normalizeText(formData.get('marca')),
        modello: normalizeText(formData.get('modello')),
        posizione_scaffale: normalizeText(formData.get('scaffale')),
        note: formData.get('note').trim()
    };`;

file = file.replace(oldEditSubmit, newEditSubmit);

// 5. Fix handleCSVImport
const oldCsvMap = `            return {
                posizione_scaffale: cols[0],
                marca_auto: cols[1],
                modello: cols[2],
                numero_centralina: cols[3],
                quantita: parseInt(cols[4]) || 1,
                note: cols[5] || ''
            };`;

const newCsvMap = `            return {
                posizione_scaffale: normalizeText(cols[0]),
                marca_auto: normalizeText(cols[1]),
                modello: normalizeText(cols[2]),
                numero_centralina: normalizeText(cols[3]),
                quantita: parseInt(cols[4]) || 1,
                note: cols[5] || ''
            };`;

file = file.replace(oldCsvMap, newCsvMap);

fs.writeFileSync('src/app.js', file);
