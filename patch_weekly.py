import re

with open('src/components/WeeklyOverviewWidget.tsx', 'r') as f:
    content = f.read()

import_statement = "import { calculateFinancialsForLessons } from '../utils/financeUtils';\n"
content = content.replace("import { useApp } from '../context/AppContext';", "import { useApp } from '../context/AppContext';\n" + import_statement)

content = content.replace("  const { lessons, profile, language, t } = useApp();", "  const { lessons, groups, students, payments, profile, language, t } = useApp();")

old_revenue = """    const revenue = weekLessons
      .filter(l => l.status === 'completed' || l.paymentStatus === 'paid')
      .reduce((sum, l) => sum + (l.amountPaid || l.price || l.amountDue || 0), 0);"""

new_revenue = """    const completedAndPaidLessons = weekLessons.filter(l => l.status === 'completed' || l.paymentStatus === 'paid');
    const financialReport = calculateFinancialsForLessons(completedAndPaidLessons, groups, students, payments);
    // Weekly revenue usually tracks collected or expected for those completed.
    // Given the previous logic was loosely summing amounts, we will use totalExpectedRevenue 
    // for what we *should* have earned, or totalCollectedRevenue for what was paid.
    // Let's stick to what we expect to earn for completed lessons + what was paid.
    const revenue = financialReport.totalExpectedRevenue;"""

content = content.replace(old_revenue, new_revenue)

with open('src/components/WeeklyOverviewWidget.tsx', 'w') as f:
    f.write(content)

