import re

with open('src/components/MonthlyOverviewWidget.tsx', 'r') as f:
    content = f.read()

import_statement = "import { calculateFinancialsForLessons } from '../utils/financeUtils';\n"
content = content.replace("import { calculateDuePaymentCycles } from '../utils/paymentUtils';", "import { calculateDuePaymentCycles } from '../utils/paymentUtils';\n" + import_statement)

old_revenue = """    // Revenue collected this month
    const collected = monthLessons
      .filter(l => l.status === 'completed' || l.paymentStatus === 'paid')
      .reduce((sum, l) => sum + (l.amountPaid || l.price || l.amountDue || 0), 0);

    // Uncollected / Due money across current cycles and unpaid lessons
    const dueCycles = calculateDuePaymentCycles(students, groups, lessons, payments);
    const uncollected = dueCycles.reduce((sum, item) => {
      const existingRec = payments.find(p => p.id === item.existingPaymentRecordId);
      const paid = existingRec ? (existingRec.amountPaid || 0) : 0;
      const discount = existingRec ? (existingRec.discountAmount || 0) : 0;
      const rem = Math.max(0, item.amountDue - paid - discount);
      return sum + rem;
    }, 0);

    const totalExpected = collected + uncollected;"""

new_revenue = """    // Calculate financials using the verified utility for this month's lessons
    // Note: Due cycles might span outside the month. 
    // To keep it strictly monthly: 
    const completedAndPaidLessons = monthLessons.filter(l => l.status === 'completed' || l.paymentStatus === 'paid');
    const financialReport = calculateFinancialsForLessons(completedAndPaidLessons, groups, students, payments);
    const collected = financialReport.totalCollectedRevenue;

    const allMonthLessonsReport = calculateFinancialsForLessons(monthLessons, groups, students, payments);
    const totalExpected = allMonthLessonsReport.totalExpectedRevenue;
    const uncollected = Math.max(0, totalExpected - collected);"""

content = content.replace(old_revenue, new_revenue)

with open('src/components/MonthlyOverviewWidget.tsx', 'w') as f:
    f.write(content)

