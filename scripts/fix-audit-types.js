const fs = require('fs');

let content = fs.readFileSync('src/types/index.ts', 'utf8');
content = content.replace(
  /export type AuditEntityType =\r?\n\s*\| 'USER'/,
  "export type AuditEntityType =\n    | 'USER'\n    | 'DRIVER'\n    | 'OPERATOR'"
);
fs.writeFileSync('src/types/index.ts', content, 'utf8');

let provContent = fs.readFileSync('src/lib/server/provider-store.ts', 'utf8');
provContent = provContent.replace(/entityType: 'SETTING'/g, "entityType: 'SETTINGS'");
fs.writeFileSync('src/lib/server/provider-store.ts', provContent, 'utf8');
console.log('Fixed audit types in types/index.ts and provider-store.ts');

