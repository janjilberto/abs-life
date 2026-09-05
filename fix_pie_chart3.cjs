const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// 1. Combine small slices into an "Altre Marche" category if they are < X%
// Then sort descending.
const oldRenderStart = `function renderPieChart(selector, data) {
    const el = document.querySelector(selector);
    el.innerHTML = '';

    if (!data || data.length === 0) {
        el.innerHTML = '<div class="h-64 flex items-center justify-center text-slate-500 text-sm">Nessun dato disponibile</div>';
        return;
    }

    const totalQty = d3.sum(data, d => d[1]) || 1;`;

const newRenderStart = `function renderPieChart(selector, data) {
    const el = document.querySelector(selector);
    el.innerHTML = '';

    if (!data || data.length === 0) {
        el.innerHTML = '<div class="h-64 flex items-center justify-center text-slate-500 text-sm">Nessun dato disponibile</div>';
        return;
    }

    let totalQty = d3.sum(data, d => d[1]) || 1;
    
    // Raggruppa fette troppo piccole
    const threshold = totalQty * 0.02; // 2% minimum
    let processedData = [];
    let othersQty = 0;
    
    data.forEach(d => {
        if (d[1] < threshold) {
            othersQty += d[1];
        } else {
            processedData.push(d);
        }
    });
    
    if (othersQty > 0) {
        processedData.push(["Altre Marche", othersQty]);
    }
    
    // Riordina decrescente
    processedData.sort((a, b) => b[1] - a[1]);
    data = processedData; // Sovrascrive i data che vengono passati a pie(data)

    const uniqueBrands = data.length; // ricalcola quante fette effettivamente ci sono`;

file = file.replace(oldRenderStart, newRenderStart);

// 2. Increase dimensions
const oldDimensions = `    const width = el.clientWidth || 360;
    const height = 320;
    const radius = Math.min(width * 0.42, height * 0.42);
    const innerRadius = radius * 0.52;
    const outerRadius = radius * 0.78;
    const hoverOuterRadius = radius * 0.92;
    const hoverInnerRadius = radius * 0.48;`;

const newDimensions = `    const width = el.clientWidth || 360;
    const height = 400; // Ingrandito
    const radius = Math.min(width, height) / 2; 
    const innerRadius = radius * 0.55; 
    const outerRadius = radius * 0.85; 
    const hoverOuterRadius = radius * 0.95;
    const hoverInnerRadius = radius * 0.52;`;

file = file.replace(oldDimensions, newDimensions);

// 3. Fix corner radius logic (safe rounding) - and fix padAngle
// we need to set padAngle in d3.pie() to separate slices!
const oldPie = `    const pie = d3.pie()
        .value(d => d[1])
        .sort(null);`; // don't sort since we already did it

const newPie = `    const pie = d3.pie()
        .value(d => d[1])
        .sort(null)
        .padAngle(0.015); // Aggiunto spazio tra le fette`;

file = file.replace(oldPie, newPie);

// 4. Update the center text to use uniqueBrands 
const oldCenter = `    const centerSubtitle = centerG.append("text")
        .attr("y", 36)
        .attr("class", "fill-orange-400 font-bold text-xs")
        .text(\`\${data.length} marche\`);`;
        
const newCenter = `    const centerSubtitle = centerG.append("text")
        .attr("y", 36)
        .attr("class", "fill-orange-400 font-bold text-xs")
        .text(\`\${uniqueBrands} \${uniqueBrands === 1 ? 'marca' : 'gruppi'}\`);`;

file = file.replace(oldCenter, newCenter);

fs.writeFileSync('src/app.js', file);
