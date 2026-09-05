function renderShelfGrid(selector, shelfData) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = '';

    const minHeight = 0;
    const maxHeight = 7;
    const minDistance = 0;
    const maxDistance = 1;

    const rows = maxHeight - minHeight + 1; // 8 piani totali (0-7)
    const cols = maxDistance - minDistance + 1; // 2 colonne (0-1)

    const colW = 140;
    const rowH = 65;
    const shelfD = 100;
    const t = 8; // spessore pannelli stile blender

    const sWidth = cols * colW + (cols + 1) * t; 
    const sHeight = rows * rowH + t;

    const scene = d3.select(selector)
        .append('div')
        .attr('class', 'relative w-full h-[550px] flex items-center justify-center bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden cursor-move select-none')
        .style('perspective', '1600px');

    const shelfWrapper = scene.append('div')
        .attr('class', 'relative')
        .style('transform-style', 'preserve-3d')
        .style('transform', 'rotateX(-10deg) rotateY(-35deg) scale(0.8)')
        .style('width', `${sWidth}px`)
        .style('height', `${sHeight}px`)
        .style('transition', 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)');

    let rotX = -10;
    let rotY = -35;
    let isDragging = false;
    let lastMouse = {x: 0, y: 0};

    scene.on('mousedown', (e) => {
        isDragging = true;
        lastMouse = {x: e.clientX, y: e.clientY};
        shelfWrapper.style('transition', 'none');
    });
    window.addEventListener('mouseup', () => {
        if(isDragging) {
            isDragging = false;
            shelfWrapper.style('transition', 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)');
        }
    });
    scene.on('mousemove', (e) => {
        if(!isDragging) return;
        const deltaX = e.clientX - lastMouse.x;
        const deltaY = e.clientY - lastMouse.y;
        rotY += deltaX * 0.5;
        rotX -= deltaY * 0.5;
        rotX = Math.max(-85, Math.min(25, rotX));
        shelfWrapper.style('transform', `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(0.8)`);
        lastMouse = {x: e.clientX, y: e.clientY};
    });
    scene.on('dblclick', () => {
        rotX = -10; rotY = -35;
        shelfWrapper.style('transition', 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)')
                    .style('transform', 'rotateX(-10deg) rotateY(-35deg) scale(0.8)');
    });

    shelfWrapper.append('div')
        .attr('class', 'absolute bottom-0 bg-black/90 blur-2xl rounded-full pointer-events-none')
        .style('left', '-40px')
        .style('width', `${sWidth + 80}px`)
        .style('height', `${shelfD + 60}px`)
        .style('transform-style', 'preserve-3d')
        .style('transform', `rotateX(90deg) translateZ(5px) translateY(${-shelfD/2}px)`);

    function createBox(parent, x, y, z, w, h, d, colorClass, extraClass="") {
        const box = parent.append('div')
            .attr('class', `absolute ${extraClass}`)
            .style('left', `${x}px`)
            .style('bottom', `${y}px`)
            .style('width', `${w}px`)
            .style('height', `${h}px`)
            .style('transform-style', 'preserve-3d')
            .style('transform', `translateZ(${z}px)`);

        box.append('div').attr('class', `absolute inset-0 ${colorClass} brightness-100 border border-black/10`).style('transform', `translateZ(${d/2}px)`);
        box.append('div').attr('class', `absolute inset-0 ${colorClass} brightness-50 border border-black/10`).style('transform', `rotateY(180deg) translateZ(${d/2}px)`);
        box.append('div').attr('class', `absolute ${colorClass} brightness-75 border border-black/10`).style('width', `${d}px`).style('height', `${h}px`).style('left', `${w/2 - d/2}px`).style('transform', `rotateY(-90deg) translateZ(${w/2}px)`);
        box.append('div').attr('class', `absolute ${colorClass} brightness-90 border border-black/10`).style('width', `${d}px`).style('height', `${h}px`).style('left', `${w/2 - d/2}px`).style('transform', `rotateY(90deg) translateZ(${w/2}px)`);
        box.append('div').attr('class', `absolute ${colorClass} brightness-110 border border-black/10`).style('width', `${w}px`).style('height', `${d}px`).style('top', `${h/2 - d/2}px`).style('transform', `rotateX(90deg) translateZ(${h/2}px)`);
        box.append('div').attr('class', `absolute ${colorClass} brightness-50 border border-black/10`).style('width', `${w}px`).style('height', `${d}px`).style('top', `${h/2 - d/2}px`).style('transform', `rotateX(-90deg) translateZ(${h/2}px)`);
        
        return box;
    }

    const panelColor = 'bg-[#cbd5e1]';
    const backColor = 'bg-[#94a3b8]';

    createBox(shelfWrapper, 0, 0, -shelfD/2 + t/2, sWidth, sHeight, t, backColor);

    createBox(shelfWrapper, 0, 0, 0, t, sHeight, shelfD, panelColor);
    createBox(shelfWrapper, t + colW, 0, 0, t, sHeight, shelfD, panelColor);
    createBox(shelfWrapper, 2*t + 2*colW, 0, 0, t, sHeight, shelfD, panelColor);

    for(let r=0; r<=rows; r++) {
        const yPos = r * rowH;
        createBox(shelfWrapper, t, yPos, 0, colW, t, shelfD, panelColor);
        createBox(shelfWrapper, 2*t + colW, yPos, 0, colW, t, shelfD, panelColor);
    }

    const slotItemsMap = new Map();
    if (typeof articoliData !== 'undefined') {
        articoliData.forEach(item => {
            const key = item.posizione_scaffale || "0:0";
            if (!slotItemsMap.has(key)) slotItemsMap.set(key, []);
            slotItemsMap.get(key).push(item);
        });
    }

    const tooltip = scene.append('div')
        .attr('class', 'absolute top-6 left-6 bg-slate-950/95 backdrop-blur-md border border-orange-500/40 p-4 rounded-2xl text-xs z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-none opacity-0 transition-opacity duration-300 min-w-[200px]');

    scene.append('div')
        .attr('class', 'absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 pointer-events-none flex items-center gap-2')
        .html('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg> Trascina per ruotare');

    for (let h = minHeight; h <= maxHeight; h++) {
        for (let d = minDistance; d <= maxDistance; d++) {
            const key = `${h}:${d}`;
            const items = slotItemsMap.get(key) || [];
            const qty = items.reduce((sum, it) => sum + (Number(it.quantita) || 1), 0);
            
            const leftOffset = d === 0 ? t : 2*t + colW;
            const bottomOffset = h * rowH + t;

            const hitbox = shelfWrapper.append('div')
                .attr('class', 'absolute cursor-pointer')
                .style('left', `${leftOffset}px`)
                .style('bottom', `${bottomOffset}px`)
                .style('width', `${colW}px`)
                .style('height', `${rowH - t}px`)
                .style('transform-style', 'preserve-3d');
            
            hitbox.append('div')
                .attr('class', 'absolute text-[9px] font-mono font-bold text-slate-500 bg-slate-200/80 px-1 rounded')
                .style('bottom', '2px')
                .style('left', '2px')
                .style('transform', 'translateZ(2px)')
                .text(`${h}:${d}`);

            const cubes = [];

            if (qty > 0) {
                const absColor = 'bg-[#f97316]'; 
                const numCubes = Math.min(qty, 8); 
                const cubeSize = 16;
                
                const positions = [
                    {x: 30, z: 20}, {x: 70, z: 20}, {x: 110, z: 20},
                    {x: 30, z: -20}, {x: 70, z: -20}, {x: 110, z: -20},
                    {x: 50, z: 0}, {x: 90, z: 0}
                ];

                for(let i=0; i<numCubes; i++) {
                    const pos = positions[i] || positions[0];
                    const rx = pos.x + (Math.random()*4 - 2);
                    const rz = pos.z + (Math.random()*4 - 2);
                    
                    const cube = createBox(hitbox, rx - cubeSize/2, 0, rz, cubeSize, cubeSize, cubeSize, absColor, "abs-cube transition-transform duration-300");
                    cube.selectAll('div').classed('border-orange-900/50', true).classed('border-black/10', false);
                    cubes.push(cube);
                }
            }

            hitbox.on('mouseenter', () => {
                tooltip.style('opacity', '1');
                tooltip.html(`
                    <div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                        <span class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold text-xs border border-orange-500/30">Scaffale ${h}:${d}</span>
                    </div>
                    <div class="text-white font-bold mb-2 text-sm">${qty} ABS ${qty === 1 ? 'presente' : 'presenti'}</div>
                    <div class="text-slate-400 space-y-1">
                        ${items.slice(0,3).map(it => `<div><span class="text-orange-400 font-bold">${it.marca_auto}</span> ${it.modello} <span class="opacity-50">(${it.quantita})</span></div>`).join('')}
                        ${items.length > 3 ? `<div class="italic text-slate-500 pt-1">+ altri ${items.length - 3} articoli</div>` : ''}
                    </div>
                `);
                
                cubes.forEach(c => {
                    const currentZ = c.style('transform').match(/translateZ\(([^)]+)\)/)[1];
                    c.style('transform', `translateZ(${currentZ}) translateY(4px) scale(1.15) rotateY(10deg)`);
                });
            }).on('mouseleave', () => {
                tooltip.style('opacity', '0');
                cubes.forEach(c => {
                    const currentZ = c.style('transform').match(/translateZ\(([^)]+)\)/)[1];
                    c.style('transform', `translateZ(${currentZ})`);
                });
            });
        }
    }
}
