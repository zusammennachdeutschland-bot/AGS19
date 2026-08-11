const fs = require('fs');

let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');
content = content.replace('title="Daten aktualisieren"', 'title={_t("تحديث البيانات", "Refresh Data", "Daten aktualisieren")}');
fs.writeFileSync('src/components/Header.tsx', content, 'utf-8');
console.log("Updated Header");
