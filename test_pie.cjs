const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// Wait... in the previous picture, why were some slices popping out natively? 
// They didn't pop out natively in the previous screenshot. I'm sorry, I misunderstood the user's issue. The user is referring to the new screenshot! 
// Oh, the user uploaded a new screenshot! 
// Looking at the new screenshot (Screenshot 2026-09-05 at 14.38.11.png), 
// WOW! The smaller slices in the top left are literally projecting outwards further than the big slices! 
// Let me look at the image. 
// Ah! In the second screenshot, the slices in the top left are sticking out, breaking the perfect circle of the pie chart.
// Let me see the code for `const radius = Math.min(width, height) / 2;`.
// Why would the `d3.pie()` create varying radii? D3's `arc()` takes innerRadius and outerRadius, which are constants!
// Ah... maybe the `padAngle` is causing the arc length calculation to break for very thin slices?
// Yes! In D3, when you apply a `cornerRadius` to a slice that is narrower than the cornerRadius itself, D3's arc generator attempts to fit the circle and sometimes pushes the arc outwards or makes it weird.
// Wait, in my previous fix I set `cornerRadius(6)`. For a slice that is less than 12 pixels wide, a corner radius of 6 pixels is geometrically impossible without distorting the outer radius! D3 will try to draw it anyway and cause it to bulge out!

const oldArc = `    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(6);

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(8);`;

const newArc = `    // Limitiamo il cornerRadius in base all'ampiezza dell'angolo per evitare che le fette piccole sporgano
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(d => {
            const maxRadius = (d.endAngle - d.startAngle) * outerRadius / 2;
            return Math.min(6, maxRadius);
        });

    const arcHover = d3.arc()
        .innerRadius(hoverInnerRadius)
        .outerRadius(hoverOuterRadius)
        .cornerRadius(d => {
            const maxRadius = (d.endAngle - d.startAngle) * hoverOuterRadius / 2;
            return Math.min(8, maxRadius);
        });`;

file = file.replace(oldArc, newArc);
fs.writeFileSync('src/app.js', file);
