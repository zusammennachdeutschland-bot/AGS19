const fs = require('fs');
let content = fs.readFileSync('src/components/WeeklyOverviewWidget.tsx', 'utf-8');

const target = `    const completedAndPaidLessons = weekLessons.filter(l => l.status === 'completed' || l.paymentStatus === 'paid');
    const financialReport = calculateFinancialsForLessons(completedAndPaidLessons, groups, students, payments);

    // Weekly revenue usually tracks collected or expected for those completed.
    // Given the previous logic was loosely summing amounts, we will use totalExpectedRevenue 
    // for what we *should* have earned, or totalCollectedRevenue for what was paid.
    // Let's stick to what we expect to earn for completed lessons + what was paid.
    const revenue = financialReport.totalExpectedRevenue;`;

const replacement = `    // Use actual payment records for accurate revenue tracking (matching Payments View)
    const paidOnly = payments.filter(p => p.status === 'paid');
    const weeklyPayments = paidOnly.filter(p => {
      const d = p.paidDate || p.dueDate;
      if (!d) return false;
      const dateOnly = d.substring(0, 10);
      return dateOnly >= friStr && dateOnly <= thuStr;
    });
    const revenue = weeklyPayments.reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/WeeklyOverviewWidget.tsx', content, 'utf-8');
console.log("Weekly patched");
