const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const oldMouseEnter = `            // 1. Ingrandisci lo spicchio con animazione fluida
            d3.select(this)
                .transition()
                .duration(280)
                .ease(d3.easeCubicOut)
                .attr('d', arcHover)
                .style('filter', \`drop-shadow(0 0 12px \${sliceColor})\`);

            // Attenua gli altri spicchi
            slices.filter(s => s !== d)
                .transition()
                .duration(200)
                .style('opacity', 0.35);`;

const newMouseEnter = `            // 1. Ingrandisci lo spicchio con animazione fluida
            d3.select(this)
                .transition()
                .duration(280)
                .ease(d3.easeCubicOut)
                .attr('d', arcHover)
                .style('filter', \`drop-shadow(0 0 12px \${sliceColor})\`)
                .style('opacity', 1);

            // Attenua gli altri spicchi
            slices.filter(s => s !== d)
                .transition()
                .duration(200)
                .style('opacity', 0.35);`;

file = file.replace(oldMouseEnter, newMouseEnter);

fs.writeFileSync('src/app.js', file);
