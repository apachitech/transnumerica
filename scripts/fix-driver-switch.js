const fs = require('fs');

let content = fs.readFileSync('src/app/driver/DriverPageClient.tsx', 'utf8');
content = content.replace(
  "    } else {\n      setDriver((prev) => ({\n        ...prev,\n        vehicleType: 'CAR',",
  "    } else if (type === 'CAR') {\n      setDriver((prev) => ({\n        ...prev,\n        vehicleType: 'CAR',"
);
fs.writeFileSync('src/app/driver/DriverPageClient.tsx', content, 'utf8');
console.log('Fixed if/else if structure');

