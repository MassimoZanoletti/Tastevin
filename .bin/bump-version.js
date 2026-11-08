// Incrementa il terzo numero della versione in package.json
// e imposta "compile-date" alla data odierna (yyyy-mm-dd).
// Uso: node .bin/bump-version.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'package.json');
let text = fs.readFileSync(file, 'utf8');
const pkg = JSON.parse(text);

const parts = String(pkg.version).split('.');
while (parts.length < 3) parts.push('0');
parts[2] = String(Number(parts[2]) + 1);
const version = parts.join('.');

const d = new Date();
const p = n => String(n).padStart(2, '0');
const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;

// sostituzione mirata: mantiene la formattazione del file
text = text.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`);
text = text.replace(/("compile-date"\s*:\s*")[^"]*(")/, `$1${date}$2`);
fs.writeFileSync(file, text);

console.log(`Versione ${pkg.version} -> ${version} (compilata il ${date})`);
