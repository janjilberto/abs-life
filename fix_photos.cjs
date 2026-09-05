const fs = require('fs');
let file = fs.readFileSync('src/app.js', 'utf8');

// 1. Fix getModelPhoto to normalize key
const oldGetModel = `function getModelPhoto(modello) {
    return (modello && modelPhotos[modello]) ? modelPhotos[modello] : '';
}`;
const newGetModel = `function getModelPhoto(modello) {
    const key = normalizeText(modello);
    return (key && modelPhotos[key]) ? modelPhotos[key] : '';
}`;
file = file.replace(oldGetModel, newGetModel);

// 2. Fix fetchArticoli photo mapping
const oldFetchPhoto = `        if (fotoRes.error) {
            console.error("Errore recupero foto modelli:", fotoRes.error);
        } else if (fotoRes.data) {
            modelPhotos = {};
            fotoRes.data.forEach(item => {
                if (item.modello && item.url_foto) {
                    modelPhotos[item.modello] = item.url_foto;
                }
            });
            localStorage.setItem('modelli_foto', JSON.stringify(modelPhotos));
        }`;
const newFetchPhoto = `        if (fotoRes.error) {
            console.error("Errore recupero foto modelli:", fotoRes.error);
        } else if (fotoRes.data) {
            modelPhotos = {};
            fotoRes.data.forEach(item => {
                if (item.modello && item.url_foto) {
                    modelPhotos[normalizeText(item.modello)] = item.url_foto;
                }
            });
            localStorage.setItem('modelli_foto', JSON.stringify(modelPhotos));
        }`;
file = file.replace(oldFetchPhoto, newFetchPhoto);

fs.writeFileSync('src/app.js', file);
