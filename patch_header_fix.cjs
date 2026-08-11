const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Insert _t after useApp call
const target = "const { \n    activeTab,";
const targetIndex = content.indexOf("const { \n    activeTab,");

if (!content.includes('const _t = ')) {
  content = content.replace("const { \n    activeTab,", "const { language } = useApp();\n  const _t = (ar: string, en: string, de?: string) => language === 'ar' ? ar : language === 'de' ? (de || en) : en;\n\n  const { \n    activeTab,");
}

fs.writeFileSync('src/components/Header.tsx', content, 'utf-8');
console.log("Fixed Header _t");
