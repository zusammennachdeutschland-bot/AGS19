const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsView.tsx', 'utf-8');

if (!content.includes('ChevronDown')) {
  content = content.replace("import { Search, UserPlus, Filter, X, Trash2 } from 'lucide-react';", "import { Search, UserPlus, Filter, X, Trash2, ChevronDown } from 'lucide-react';");
}

fs.writeFileSync('src/components/StudentsView.tsx', content, 'utf-8');
console.log("Added ChevronDown");
