import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const replacement = `
          // Find open payment record cycle for this student where lesson dates length < bundleSize and status is not fully settled
          const openCycleIndex = nextPayments.findIndex(p =>
            p.studentId === st.id &&
            (p.lessonDates?.length || 0) < (p.bundleSize || bundleSize) &&
            p.status !== 'paid'
          );
          
          const stPayChoice = report.studentPayments?.[st.id];

          // Compute how many unbilled lessons this student has right now
          const paidLessonIds = new Set<string>();
          nextPayments.forEach(p => {
            if (p.status === 'paid' && p.lessonIds) {
              p.lessonIds.forEach(id => paidLessonIds.add(id));
            }
          });
          
          const unbilledCompletedLessons = lessons.filter(l => {
             if (l.status !== 'completed' && l.id !== targetLesson.id) return false;
             if (l.groupId !== st.groupId && l.studentId !== st.id) return false;
             if (paidLessonIds.has(l.id) && l.id !== targetLesson.id) return false;
             const att = l.report?.studentAttendance?.[st.id] || l.report?.attendanceStatus || (l.id === targetLesson.id ? stAttendance : 'present');
             if (att === 'absent') return false;
             return true;
          });
          
          const reachedBundleSize = unbilledCompletedLessons.length >= bundleSize;
          const isPayingNow = stPayChoice?.amount !== undefined && stPayChoice.amount > 0;

          if (!reachedBundleSize && !isPayingNow) {
            // DO NOT CREATE PAYMENT RECORD
            return;
          }
`;

code = code.replace(
  /          \/\/ Find open payment record cycle for this student where lesson dates length < bundleSize and status is not fully settled\n          const openCycleIndex = nextPayments\.findIndex\(p =>[\s\S]*?const stPayChoice = report\.studentPayments\?\.\[st\.id\];/,
  replacement
);

fs.writeFileSync('src/context/AppContext.tsx', code);
