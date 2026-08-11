import fs from 'fs';
let css = fs.readFileSync('src/index.css', 'utf-8');

const index = css.indexOf('/* Accent Color System Override');
if (index > -1) css = css.substring(0, index);

const accents = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'indigo'];
let newCss = `
/* Design Token System */
@theme {
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-soft: var(--primary-soft);
  --color-primary-border: var(--primary-border);
  --color-primary-glow: var(--primary-glow);
}

`;

accents.forEach(accent => {
  newCss += `
:root${accent === 'blue' ? ', :root.accent-blue' : `.accent-${accent}`} {
  --primary: var(--color-${accent}-500);
  --primary-hover: var(--color-${accent}-600);
  --primary-soft: var(--color-${accent}-50);
  --primary-border: var(--color-${accent}-200);
  --primary-glow: var(--color-${accent}-500);
}
.dark${accent === 'blue' ? ', .dark.accent-blue' : `.dark.accent-${accent}`} {
  --primary: var(--color-${accent}-500);
  --primary-hover: var(--color-${accent}-400);
  --primary-soft: color-mix(in srgb, var(--color-${accent}-500) 10%, transparent);
  --primary-border: color-mix(in srgb, var(--color-${accent}-500) 20%, transparent);
  --primary-glow: var(--color-${accent}-500);
}
`;
});

fs.writeFileSync('src/index.css', css + newCss);
