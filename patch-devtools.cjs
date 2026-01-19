const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Trouver tous les fichiers index.js dans devtools-kit
const result = execSync('find node_modules -path "*/@vue/devtools-kit/dist/index.js"', { encoding: 'utf8' });
const files = result.trim().split('\n').filter(Boolean);

console.log('Files found:', files);

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content.length;
    content = content.replace(/localStorage\.getItem/g, '(globalThis.localStorage?.getItem || (() => null))');
    content = content.replace(/localStorage\.setItem/g, '(globalThis.localStorage?.setItem || (() => {}))');
    fs.writeFileSync(filePath, content);
    console.log(`Patched: ${filePath} (${before} -> ${content.length})`);
  }
});

console.log('Devtools patched successfully');
