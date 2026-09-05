const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// 1. Remove .cornerRadius() from arc and arcHover, or make it conditional.
// In D3, to safely round without overlaps, we can just remove the cornerRadius. 
// Or set padAngle instead of cornerRadius.
// Also, remove drop-shadow on thin slices to prevent darkening, or use a brighter shadow.
// Also, conditionally apply stroke width (0 for thin slices).

const oldArc = `    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(4);

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(6);`;

const newArc = `    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(d => (d.endAngle - d.startAngle) > 0.1 ? 4 : 0);

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(d => (d.endAngle - d.startAngle) > 0.1 ? 6 : 0);`;

file = file.replace(oldArc, newArc);

// 2. Fix stroke width for thin slices and darkening drop-shadow
const oldStroke = `        .attr('stroke', '#020617')
        .style('stroke-width', '2px')`;

const newStroke = `        .attr('stroke', '#020617')
        .style('stroke-width', d => (d.endAngle - d.startAngle) > 0.03 ? '2px' : '0.5px')`;

file = file.replace(oldStroke, newStroke);

const oldHoverShadow = `            d3.select(this)
                .transition().duration(200)
                .attr('d', arcHover)
                .style('filter', \`drop-shadow(0 0 12px \${sliceColor})\`);`;

const newHoverShadow = `            d3.select(this)
                .transition().duration(200)
                .attr('d', arcHover)
                .style('filter', (d.endAngle - d.startAngle) > 0.05 ? \`drop-shadow(0 0 12px \${sliceColor})\` : 'none');
            
            // Bring hovered slice to front to prevent it being covered by strokes of adjacent slices
            this.parentNode.appendChild(this);`;

file = file.replace(oldHoverShadow, newHoverShadow);

fs.writeFileSync('src/app.js', file);
