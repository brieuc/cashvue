const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/@vue/devtools-kit/dist/index.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/localStorage\.getItem/g, '(typeof localStorage !== "undefined" ? localStorage.getItem : (() => null))');
  fs.writeFileSync(filePath, content);
  console.log('Devtools patched successfully');
}
