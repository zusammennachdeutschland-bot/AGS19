const fs = require('fs');
let content = fs.readFileSync('src/components/SmartDailySummaryWidget.tsx', 'utf-8');

// Replace the calculation
const calcTarget = `    // Expected revenue today using verified financial utils
    const financialReport = calculateFinancialsForLessons(todaysLessons, groups, students, payments);
    const expectedIncomeToday = financialReport.totalExpectedRevenue;`;

const calcReplacement = `    // Revenue collected today (matching Payments View)
    const paidOnly = payments.filter(p => p.status === 'paid');
    const dailyPayments = paidOnly.filter(p => {
      const d = p.paidDate || p.dueDate;
      return d && d.startsWith(todayStr);
    });
    const collectedToday = dailyPayments.reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);`;

content = content.replace(calcTarget, calcReplacement);

// Replace the text generation
const textTarget = `      if (language === 'ar') {
        text = \`لديك اليوم \${todaysLessonsCount} حصص، و \${todaysStudentsCount} طالبًا. متوقع تحصيل \${expectedIncomeToday.toLocaleString()} \${currency}. \${lateText} \${firstText}\`;
      } else if (language === 'de') {
        text = \`Sie haben heute \${todaysLessonsCount} Stunde(n) und \${todaysStudentsCount} Schüler. Erwartete Einnahmen: \${expectedIncomeToday.toLocaleString()} \${currency}. \${lateText} \${firstText}\`;
      } else {
        text = \`You have \${todaysLessonsCount} lesson(s) today with \${todaysStudentsCount} student(s). Expected collection: \${expectedIncomeToday.toLocaleString()} \${currency}. \${lateText} \${firstText}\`;
      }`;

const textReplacement = `      if (language === 'ar') {
        text = \`لديك اليوم \${todaysLessonsCount} حصص، و \${todaysStudentsCount} طالبًا. تم تحصيل \${collectedToday.toLocaleString()} \${currency} اليوم. \${lateText} \${firstText}\`;
      } else if (language === 'de') {
        text = \`Sie haben heute \${todaysLessonsCount} Stunde(n) und \${todaysStudentsCount} Schüler. Heute eingenommen: \${collectedToday.toLocaleString()} \${currency}. \${lateText} \${firstText}\`;
      } else {
        text = \`You have \${todaysLessonsCount} lesson(s) today with \${todaysStudentsCount} student(s). Collected today: \${collectedToday.toLocaleString()} \${currency}. \${lateText} \${firstText}\`;
      }`;
      
content = content.replace(textTarget, textReplacement);

// Replace expectedIncomeToday with collectedToday in return
content = content.replace('expectedIncomeToday,', 'collectedToday,');
content = content.replace('expectedIncomeToday:', 'collectedToday:');
content = content.replace('{summary.expectedIncomeToday.toLocaleString()}', '{summary.collectedToday.toLocaleString()}');
content = content.replace("t('smart_summary_expected_income')", "t('daily_stats_revenue_today')");


fs.writeFileSync('src/components/SmartDailySummaryWidget.tsx', content, 'utf-8');
console.log("Smart daily patched");
