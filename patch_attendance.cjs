const fs = require('fs');

// 1. Add to lessonUtils
let utils = fs.readFileSync('src/utils/lessonUtils.ts', 'utf-8');
const utilsAdd = `
export const calculateOverallAttendance = (lessons: any[], students: any[]) => {
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  lessons.forEach(l => {
    if (l.status !== 'completed' || !l.report) return;
    if (l.groupId) {
      const groupStudents = students.filter(s => s.groupId === l.groupId);
      groupStudents.forEach(st => {
        const status = l.report?.studentAttendance?.[st.id] || l.report?.attendanceStatus || 'present';
        if (status === 'present') presentCount++;
        if (status === 'late') lateCount++;
        if (status === 'absent') absentCount++;
      });
    } else {
      const status = l.report.attendanceStatus || 'present';
      if (status === 'present') presentCount++;
      if (status === 'late') lateCount++;
      if (status === 'absent') absentCount++;
    }
  });

  return { presentCount, lateCount, absentCount };
};
`;
fs.writeFileSync('src/utils/lessonUtils.ts', utils + utilsAdd, 'utf-8');

// 2. Patch ReportsView
let reports = fs.readFileSync('src/components/ReportsView.tsx', 'utf-8');

// add import
reports = reports.replace(
  "import { Lesson } from '../types';", 
  "import { Lesson } from '../types';\nimport { calculateOverallAttendance } from '../utils/lessonUtils';"
);

const oldAttendance = `  // Attendance breakdown
  const attendanceData = [
    { name: 'Anwesend', value: lessons.filter(l => l.report?.attendanceStatus === 'present').length || 12, color: '#10B981' },
    { name: 'Verspätet', value: lessons.filter(l => l.report?.attendanceStatus === 'late').length || 2, color: '#F59E0B' },
    { name: 'Abwesend', value: lessons.filter(l => l.report?.attendanceStatus === 'absent').length || 1, color: '#EF4444' }
  ];`;

const newAttendance = `  // Attendance breakdown
  const { presentCount, lateCount, absentCount } = calculateOverallAttendance(lessons, students);
  const attendanceData = [
    { name: 'Anwesend', value: presentCount, color: '#10B981' },
    { name: 'Verspätet', value: lateCount, color: '#F59E0B' },
    { name: 'Abwesend', value: absentCount, color: '#EF4444' }
  ];`;

reports = reports.replace(oldAttendance, newAttendance);
fs.writeFileSync('src/components/ReportsView.tsx', reports, 'utf-8');
console.log("Attendance patched");
