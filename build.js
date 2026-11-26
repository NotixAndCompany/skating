// Собирает docs/index.html для GitHub Pages из skating-plan.html (тот же файл публикуется на claude.ai).
// Запуск: node build.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'skating-plan.html'), 'utf8');
const head = '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  '<style>:root{color-scheme:dark;background:#0d1318;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
  'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
  '</head><body>';
const out = head + src + '</body></html>\n';

fs.mkdirSync(path.join(__dirname, 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'docs', 'index.html'), out);
fs.writeFileSync(path.join(__dirname, 'docs', '.nojekyll'), '');
console.log('docs/index.html готов:', out.length, 'байт');
