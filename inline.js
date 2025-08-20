const fs = require('fs');

let html = fs.readFileSync('src/index.html', 'utf8');
let js = fs.readFileSync('dist.rr.js', 'utf8'); // roadroller-version

// Ta bort HTML-kommentarer
html = html.replace(/<!--[\s\S]*?-->/g, '');

// Ta bort radbrytningar och extra mellanslag
html = html.replace(/\n+/g, '').replace(/\s{2,}/g, ' ');

// Ta bort onödiga mellanslag mellan taggar
html = html.replace(/>\s+</g, '><');

// Minifiera CSS i <style>-taggar
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
  return `<style>${css
    .replace(/\n+/g, '')        // ta bort radbrytningar
    .replace(/\s{2,}/g, ' ')    // ta bort extra mellanslag
    .replace(/\s*([:;{},])\s*/g, '$1') // ta bort mellanslag runt symboler
  }</style>`;
});

// Ersätt script-taggen med inline-kod
html = html.replace('<script src="main.js"></script>', `<script>${js}</script>`);

// Spara kompakt HTML
fs.writeFileSync('index.html', html.trim());
