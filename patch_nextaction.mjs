import fs from 'fs';
let code = fs.readFileSync('src/components/NextActionCard.tsx', 'utf8');

code = code.replace(
  "if (l.status === 'completed' || l.status === 'cancelled') return false;",
  "if (!isPendingStatus(l.status)) return false;"
);

code = code.replace(
  "filteredLessons.find(l => l.status === 'in_progress' || l.status === 'scheduled')",
  "filteredLessons.find(l => isPendingStatus(l.status))"
);

fs.writeFileSync('src/components/NextActionCard.tsx', code);
