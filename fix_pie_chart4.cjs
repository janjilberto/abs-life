const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// The corner radius doesn't need conditional logic anymore since slices are big enough
// and we have padAngle. Let's make it standard and clean up the stroke width.

const oldArc = `    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(d => (d.endAngle - d.startAngle) > 0.1 ? 4 : 0);

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(d => (d.endAngle - d.startAngle) > 0.1 ? 6 : 0);`;
        
const newArc = `    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(6);

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(8);`;

file = file.replace(oldArc, newArc);

const oldStroke = `        .attr('stroke', '#020617')
        .style('stroke-width', d => (d.endAngle - d.startAngle) > 0.05 ? '2px' : '0px')`;
        
const newStroke = `        .attr('stroke', 'transparent')
        .style('stroke-width', '0px')`;

file = file.replace(oldStroke, newStroke);

fs.writeFileSync('src/app.js', file);
