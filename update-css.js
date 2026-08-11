const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

// Remove the old Accent Color System Override for Tailwind v4
css = css.replace(/\/\* Accent Color System Override[\s\S]*?}/g, '');
// there are multiple blocks, let's just substring everything after /* Accent Color System Override
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
:root.dark${accent === 'blue' ? ', :root.dark.accent-blue' : `.dark.accent-${accent}`} {
  --primary: var(--color-${accent}-500);
  --primary-hover: var(--color-${accent}-400);
  --primary-soft: rgba(var(--color-${accent}-500), 0.1);
  --primary-border: rgba(var(--color-${accent}-500), 0.2);
  --primary-glow: var(--color-${accent}-500);
}
`;
});

// Since Tailwind 4 uses oklch or rgb for colors natively in a way that opacity works, 
// using var(--color-blue-500) directly for background with opacity like bg-primary/20 
// might not work if var(--color-blue-500) is a hex. In v4, colors are often defined in a way that supports opacity.
// Actually, in v4, if you alias a color to another color, opacity modifiers still work if it's an ok-lch variable!
// But just to be safe, we'll use --color-primary as defined.

fs.writeFileSync('src/index.css', css + newCss);
