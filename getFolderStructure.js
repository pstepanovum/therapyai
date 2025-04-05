const fs = require('fs');
const path = require('path');

function printDirTree(dirPath, indent = '') {
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file, index) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    const isLast = index === files.length - 1;
    const prefix = isLast ? '└── ' : '├── ';

    console.log(`${indent}${prefix}${file}`);

    if (stats.isDirectory()) {
      const newIndent = indent + (isLast ? '    ' : '│   ');
      printDirTree(fullPath, newIndent);
    }
  });
}

const startPath = path.join(__dirname, 'src', 'app');
console.log('src/app/');
if (fs.existsSync(startPath)) {
  printDirTree(startPath);
} else {
  console.log('src/app folder not found');
}