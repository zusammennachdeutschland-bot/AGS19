import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /if \(\!exists\) \{[\s\S]*?newLessons\.push\(\{[\s\S]*?\}\);\n        \}\n      \}\n    \}/g;

code = code.replace(regex, (match) => {
  // We need to add the closing brace properly
  let fixedMatch = match.replace(/\}\);\n        \}\n      \}\n    \}/, "});\n          }\n        }\n      }\n    }");
  return fixedMatch;
});

fs.writeFileSync('src/context/AppContext.tsx', code);
