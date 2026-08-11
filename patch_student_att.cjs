const fs = require('fs');

let content = fs.readFileSync('src/components/StudentProfileModal.tsx', 'utf-8');

const old1 = `const presentCount = studentLessons.filter(l => l.report?.attendanceStatus === 'present' || l.report?.studentAttendance?.[student.id] === 'present').length;`;
const new1 = `const presentCount = studentLessons.filter(l => l.status === 'completed' && l.report && (l.report.studentAttendance?.[student.id] || l.report.attendanceStatus || 'present') === 'present').length;`;

const old2 = `const lateCount = studentLessons.filter(l => l.report?.attendanceStatus === 'late' || l.report?.studentAttendance?.[student.id] === 'late').length;`;
const new2 = `const lateCount = studentLessons.filter(l => l.status === 'completed' && l.report && (l.report.studentAttendance?.[student.id] || l.report.attendanceStatus || 'present') === 'late').length;`;

const old3 = `const absentCount = studentLessons.filter(l => l.report?.attendanceStatus === 'absent' || l.report?.studentAttendance?.[student.id] === 'absent').length;`;
const new3 = `const absentCount = studentLessons.filter(l => l.status === 'completed' && l.report && (l.report.studentAttendance?.[student.id] || l.report.attendanceStatus || 'present') === 'absent').length;`;

content = content.replace(old1, new1).replace(old2, new2).replace(old3, new3);

fs.writeFileSync('src/components/StudentProfileModal.tsx', content, 'utf-8');
console.log("Student Profile Attendance patched");
