const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

const setupCode = `window.handleRowClick = function(event, id) {
    if (event && event.target && event.target.closest('.qty-cell')) {
        return;
    }
    openDetailsModal(id);
};
`;

if (!file.includes('window.handleRowClick')) {
    file = file + '\n' + setupCode;
}

const oldTr = `<tr onclick="openDetailsModal('\${item.numero_centralina.replace(/'/g, "\\\\'")}')"`;
const newTr = `<tr onclick="window.handleRowClick(event, '\${item.numero_centralina.replace(/'/g, "\\\\'")}')"`;

file = file.replace(new RegExp(oldTr.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\$/g, '\\$'), 'g'), newTr);

const oldTd = `<td class="p-4">
                \${(() => {
                    const safeId = item.numero_centralina.replace(/[^a-zA-Z0-9]/g, '_') + '_' + index;`;

const newTd = `<td class="p-4 qty-cell">
                \${(() => {
                    const safeId = item.numero_centralina.replace(/[^a-zA-Z0-9]/g, '_') + '_' + index;`;

file = file.replace(oldTd, newTd);
fs.writeFileSync('src/app.js', file);
