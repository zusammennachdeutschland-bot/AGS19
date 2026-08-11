const fs = require('fs');
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf-8');

// 1. Replace overall financials
const overallTarget = `  // Overall Financial & Session Metrics
  const allFinancials = calculateFinancialsForLessons(lessons, groups, students, payments);
  const totalCollectedRevenue = allFinancials.totalCollectedRevenue;
  const totalUnpaidAmount = Math.max(0, allFinancials.totalExpectedRevenue - allFinancials.totalCollectedRevenue);`;

const overallReplacement = `  // Overall Financial & Session Metrics
  const totalCollectedRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);
  const totalUnpaidAmount = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amountDue, 0);`;

content = content.replace(overallTarget, overallReplacement);

// 2. Replace chart data
const chartTarget = `  // Revenue chart data by week or month
  const chartData = Object.entries(weeksGrouped).map(([weekLabel, weekLessons]) => {
    const collected = weekLessons.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
    const unpaid = weekLessons.reduce((sum, l) => sum + (l.paymentStatus !== 'paid' ? (l.amountDue - l.amountPaid) : 0), 0);
    return {
      name: weekLabel.split(' ')[1] || weekLabel,
      Einnahmen: collected,
      Offen: unpaid
    };
  }).reverse();`;

const chartReplacement = `  // Revenue chart data by week or month
  const chartData = Object.entries(weeksGrouped).map(([weekLabel, weekLessons]) => {
    const sampleLessonDate = new Date(weekLessons[0].date);
    const wStart = getWeekStart(sampleLessonDate);
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    const wStartStr = wStart.toISOString().split('T')[0];
    const wEndStr = wEnd.toISOString().split('T')[0];

    const collected = payments.filter(p => p.status === 'paid').filter(p => {
      const d = (p.paidDate || p.dueDate || '').substring(0, 10);
      return d >= wStartStr && d <= wEndStr;
    }).reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);

    const unpaid = payments.filter(p => p.status !== 'paid').filter(p => {
      const d = (p.dueDate || '').substring(0, 10);
      return d >= wStartStr && d <= wEndStr;
    }).reduce((sum, p) => sum + p.amountDue, 0);

    return {
      name: weekLabel.split(' ')[1] || weekLabel,
      Einnahmen: collected,
      Offen: unpaid
    };
  }).reverse();`;

content = content.replace(chartTarget, chartReplacement);

// 3. Replace week financial in the list
const weekTarget = `          Object.entries(weeksGrouped).map(([weekTitle, weekLessons]) => {
            const weekFinancialsT = calculateFinancialsForLessons(weekLessons, groups, students, payments);
            const weekRevenue = weekFinancialsT.totalCollectedRevenue;
            const weekUnpaid = Math.max(0, weekFinancialsT.totalExpectedRevenue - weekFinancialsT.totalCollectedRevenue);`;

const weekReplacement = `          Object.entries(weeksGrouped).map(([weekTitle, weekLessons]) => {
            const sampleLessonDate = new Date(weekLessons[0].date);
            const wStart = getWeekStart(sampleLessonDate);
            const wEnd = new Date(wStart);
            wEnd.setDate(wStart.getDate() + 6);
            const wStartStr = wStart.toISOString().split('T')[0];
            const wEndStr = wEnd.toISOString().split('T')[0];

            const weekRevenue = payments.filter(p => p.status === 'paid').filter(p => {
              const d = (p.paidDate || p.dueDate || '').substring(0, 10);
              return d >= wStartStr && d <= wEndStr;
            }).reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);

            const weekUnpaid = payments.filter(p => p.status !== 'paid').filter(p => {
              const d = (p.dueDate || '').substring(0, 10);
              return d >= wStartStr && d <= wEndStr;
            }).reduce((sum, p) => sum + p.amountDue, 0);`;

content = content.replace(weekTarget, weekReplacement);

fs.writeFileSync('src/components/ReportsView.tsx', content, 'utf-8');
console.log("ReportsView patched");
