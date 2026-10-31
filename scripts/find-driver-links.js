const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(entry.name) && !fullPath.includes('src\\app\\driver') && !fullPath.includes('src/app/driver') && !fullPath.includes('src\\app\\api\\driver') && !fullPath.includes('src/app/api/driver') && !fullPath.includes('src\\components\\driver') && !fullPath.includes('src/components/driver')) {
        walk(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/['"`]\/driver/.test(line)) {
          console.log(`${fullPath}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

walk('./src');
