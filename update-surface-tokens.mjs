import fs from 'fs';
let css = fs.readFileSync('src/index.css', 'utf-8');

// We will inject surface variables into the @theme and :root blocks
// We can just append them if they don't exist, but it's cleaner to rewrite the CSS generation.

const accents = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'indigo'];

let newCss = `
/* Design Token System v2 */
@theme {
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: var(--primary-soft);
  --color-primary-border: var(--primary-border);
  --color-primary-glow: var(--primary-glow);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);
  --color-surface-border: var(--surface-border);
  --color-surface-border-soft: var(--surface-border-soft);
  --color-background: var(--background);
  --color-text-main: var(--text-main);
  --color-text-muted: var(--text-muted);
}
`;

accents.forEach(accent => {
  newCss += `
:root${accent === 'blue' ? ', :root.accent-blue' : `.accent-${accent}`} {
  --primary: var(--color-${accent}-500);
  --primary-hover: var(--color-${accent}-600);
  --primary-soft: color-mix(in srgb, var(--color-${accent}-500) 10%, transparent);
  --primary-border: color-mix(in srgb, var(--color-${accent}-500) 20%, transparent);
  --primary-glow: var(--color-${accent}-500);
  
  --surface: #ffffff;
  --surface-hover: #f8fafc;
  --surface-border: #e2e8f0;
  --surface-border-soft: #f1f5f9;
  --background: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #64748b;
}
.dark${accent === 'blue' ? ', .dark.accent-blue' : `.dark.accent-${accent}`} {
  --primary: var(--color-${accent}-500);
  --primary-hover: var(--color-${accent}-400);
  --primary-soft: color-mix(in srgb, var(--color-${accent}-500) 15%, transparent);
  --primary-border: color-mix(in srgb, var(--color-${accent}-500) 30%, transparent);
  --primary-glow: var(--color-${accent}-500);
  
  --surface: color-mix(in srgb, var(--color-${accent}-500) 4%, #0a0c10);
  --surface-hover: color-mix(in srgb, var(--color-${accent}-500) 8%, #12131a);
  --surface-border: color-mix(in srgb, var(--color-${accent}-500) 15%, #1e293b);
  --surface-border-soft: color-mix(in srgb, var(--color-${accent}-500) 8%, #161821);
  --background: #000000;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}
`;
});

// find the /* Design Token System */ and replace it and everything after
const index = css.indexOf('/* Design Token System */');
if (index > -1) {
    css = css.substring(0, index);
}

fs.writeFileSync('src/index.css', css + newCss);
