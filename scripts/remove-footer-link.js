const fs = require('fs');
let content = fs.readFileSync('src/components/shared/Footer.tsx', 'utf8');
content = content.replace(/<li>\s*<Link href="\/driver"[\s\S]*?<\/Link>\s*<\/li>\r?\n?/, '');
fs.writeFileSync('src/components/shared/Footer.tsx', content, 'utf8');
console.log('Removed successfully');

