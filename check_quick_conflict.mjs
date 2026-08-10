import fs from 'fs';
let code = fs.readFileSync('src/components/AddQuickLessonModal.tsx', 'utf8');

if (code.includes('checkConflict') || code.includes('overlap')) {
    console.log("QuickLessonModal has conflict check");
} else {
    console.log("QuickLessonModal has NO conflict check");
}
