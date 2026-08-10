const fs = require('fs');
let content = fs.readFileSync('src/components/InspirationCardWidget.tsx', 'utf8');
content = content.replace(
  "  if (!activeInspirationCard",
  "  React.useEffect(() => {\n    if (activeInspirationCard) {\n      const timer = setTimeout(() => {\n        dismissInspirationCard();\n      }, 5000);\n      return () => clearTimeout(timer);\n    }\n  }, [activeInspirationCard, dismissInspirationCard]);\n\n  if (!activeInspirationCard"
);
fs.writeFileSync('src/components/InspirationCardWidget.tsx', content);
