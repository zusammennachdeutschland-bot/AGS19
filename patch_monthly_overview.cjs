const fs = require('fs');
let content = fs.readFileSync('src/components/MonthlyOverviewWidget.tsx', 'utf-8');

const target = `    // Calculate financials using the verified utility for this month's lessons
    // Note: Due cycles might span outside the month. 
    // To keep it strictly monthly: 
    const completedAndPaidLessons = monthLessons.filter(l => l.status === 'completed' || l.paymentStatus === 'paid');
    const financialReport = calculateFinancialsForLessons(completedAndPaidLessons, groups, students, payments);
    const collected = financialReport.totalCollectedRevenue;

    const allMonthLessonsReport = calculateFinancialsForLessons(monthLessons, groups, students, payments);
    const totalExpected = allMonthLessonsReport.totalExpectedRevenue;
    const uncollected = Math.max(0, totalExpected - collected);`;

const replacement = `    // Use actual payment records for accurate revenue tracking (matching Payments View)
    const paidOnly = payments.filter(p => p.status === 'paid');
    const monthlyPayments = paidOnly.filter(p => {
      const d = p.paidDate || p.dueDate;
      return d && d.startsWith(currentMonthPrefix);
    });
    const collected = monthlyPayments.reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);

    const pendingOnly = payments.filter(p => p.status !== 'paid');
    const monthlyPending = pendingOnly.filter(p => {
      const d = p.dueDate;
      return d && d.startsWith(currentMonthPrefix);
    });
    const uncollected = monthlyPending.reduce((sum, p) => sum + p.amountDue, 0);
    const totalExpected = collected + uncollected;`;

content = content.replace(target, replacement);

// Replace import if needed
if (!content.includes('import { calculateFinancialsForLessons }')) {
  // It's probably there. We can remove it or leave it, compiler will warn but work
}

fs.writeFileSync('src/components/MonthlyOverviewWidget.tsx', content, 'utf-8');
console.log("Monthly patched");
