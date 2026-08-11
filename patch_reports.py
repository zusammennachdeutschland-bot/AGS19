import re

with open('src/components/ReportsView.tsx', 'r') as f:
    content = f.read()

import_statement = "import { calculateFinancialsForLessons } from '../utils/financeUtils';\n"
content = content.replace("import { getWeekKey, formatDateRange } from '../utils/timeUtils';", "import { getWeekKey, formatDateRange } from '../utils/timeUtils';\n" + import_statement)

# Total Collected
old_total_collected = """  const totalCollectedRevenue = lessons
    .filter(l => l.status === 'completed' || l.amountPaid > 0)
    .reduce((sum, l) => sum + (l.amountPaid || 0), 0);

  const totalUnpaidAmount = lessons
    .filter(l => l.paymentStatus !== 'paid')
    .reduce((sum, l) => sum + Math.max(0, (l.amountDue || 0) - (l.amountPaid || 0)), 0);"""

new_total_collected = """  const allFinancials = calculateFinancialsForLessons(lessons, groups, students, payments);
  const totalCollectedRevenue = allFinancials.totalCollectedRevenue;
  const totalUnpaidAmount = Math.max(0, allFinancials.totalExpectedRevenue - allFinancials.totalCollectedRevenue);"""

content = content.replace(old_total_collected, new_total_collected)

# Inside the chart generation
old_chart = """    const weekLessons = weeksGrouped[weekKey];
    const completed = weekLessons.filter(l => l.status === 'completed').length;
    const cancelled = weekLessons.filter(l => l.status === 'cancelled').length;
    const collected = weekLessons.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
    const unpaid = weekLessons.reduce((sum, l) => sum + (l.paymentStatus !== 'paid' ? (l.amountDue - l.amountPaid) : 0), 0);"""

new_chart = """    const weekLessons = weeksGrouped[weekKey];
    const completed = weekLessons.filter(l => l.status === 'completed').length;
    const cancelled = weekLessons.filter(l => l.status === 'cancelled').length;
    const weekFinancials = calculateFinancialsForLessons(weekLessons, groups, students, payments);
    const collected = weekFinancials.totalCollectedRevenue;
    const unpaid = Math.max(0, weekFinancials.totalExpectedRevenue - weekFinancials.totalCollectedRevenue);"""

content = content.replace(old_chart, new_chart)

# Inside the table generation
old_table = """            const weekRevenue = weekLessons.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
            const weekUnpaid = weekLessons.reduce((sum, l) => sum + (l.paymentStatus !== 'paid' ? (l.amountDue - l.amountPaid) : 0), 0);"""

new_table = """            const weekFinancialsT = calculateFinancialsForLessons(weekLessons, groups, students, payments);
            const weekRevenue = weekFinancialsT.totalCollectedRevenue;
            const weekUnpaid = Math.max(0, weekFinancialsT.totalExpectedRevenue - weekFinancialsT.totalCollectedRevenue);"""

content = content.replace(old_table, new_table)

with open('src/components/ReportsView.tsx', 'w') as f:
    f.write(content)

