const fs = require('fs');

let content = fs.readFileSync('src/lib/security/roles-permissions.ts', 'utf8');
content = content.replace(
  /DRIVER:\s*\[\],/,
  `DRIVER: [],\n  DRIVER_MOTO: [],\n  DRIVER_CAR: [],\n  SHUTTLE_OPERATOR: [],\n  SHUTTLE_STAFF: [],`
);
fs.writeFileSync('src/lib/security/roles-permissions.ts', content, 'utf8');
console.log('roles-permissions updated');

