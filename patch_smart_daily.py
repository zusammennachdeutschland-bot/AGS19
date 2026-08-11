import re

with open('src/components/SmartDailySummaryWidget.tsx', 'r') as f:
    content = f.read()

import_statement = "import { calculateFinancialsForLessons } from '../utils/financeUtils';\n"
content = content.replace("import { calculateDuePaymentCycles } from '../utils/paymentUtils';", "import { calculateDuePaymentCycles } from '../utils/paymentUtils';\n" + import_statement)

old_expected = """    // Expected revenue today
    const expectedIncomeToday = todaysLessons.reduce((sum, l) => {
      return sum + (l.price || l.amountDue || 0);
    }, 0);"""

new_expected = """    // Expected revenue today using verified financial utils
    const financialReport = calculateFinancialsForLessons(todaysLessons, groups, students, payments);
    const expectedIncomeToday = financialReport.totalExpectedRevenue;"""

content = content.replace(old_expected, new_expected)

# Also expose the report in summary to potentially show a debug button
content = content.replace("expectedIncomeToday,", "expectedIncomeToday,\n      financialReport,")

with open('src/components/SmartDailySummaryWidget.tsx', 'w') as f:
    f.write(content)

