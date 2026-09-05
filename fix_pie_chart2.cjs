const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const oldStroke = `        .attr('stroke', '#020617')
        .style('stroke-width', d => (d.endAngle - d.startAngle) > 0.03 ? '2px' : '0.5px')`;

const newStroke = `        .attr('stroke', '#020617')
        .style('stroke-width', d => (d.endAngle - d.startAngle) > 0.05 ? '2px' : '0px')`;

file = file.replace(oldStroke, newStroke);

fs.writeFileSync('src/app.js', file);
