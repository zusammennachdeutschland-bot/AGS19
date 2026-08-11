import fs from 'fs';
let content = fs.readFileSync('src/components/SmartDailySummaryWidget.tsx', 'utf-8');

// Replace indigo with primary
content = content.replace(/indigo/g, 'primary');

// Replace dark:bg-primary-950/80 etc with dark:bg-primary-soft or similar
content = content.replace(/bg-primary-500\/5/g, 'bg-primary/5');
content = content.replace(/bg-primary-500\/10/g, 'bg-primary/10');
content = content.replace(/bg-purple-500\/5/g, 'bg-primary/5');
content = content.replace(/bg-purple-500\/10/g, 'bg-primary/10');
content = content.replace(/bg-primary-100 dark:bg-primary-950\/80 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/g, 'bg-primary-soft text-primary border border-primary-border');
content = content.replace(/bg-primary-50 dark:bg-primary-950\/60 text-primary-700 dark:text-primary-300 border border-primary-200\/80 dark:border-primary-800\/80/g, 'bg-primary-soft text-primary border border-primary-border');
content = content.replace(/bg-primary-50\/40/g, 'bg-primary-soft/40');
content = content.replace(/border border-primary-100\/80 dark:border-surface-border\/80/g, 'border border-primary-border');
content = content.replace(/border-primary-200\/80/g, 'border-primary-border');
content = content.replace(/border-primary-900\/60/g, 'border-primary-border');
content = content.replace(/dark:bg-blue-950\/80/g, 'dark:bg-primary-soft');
content = content.replace(/border-primary-200/g, 'border-primary-border');

// other colors like emerald, amber, rose can stay or be changed.
fs.writeFileSync('src/components/SmartDailySummaryWidget.tsx', content);
