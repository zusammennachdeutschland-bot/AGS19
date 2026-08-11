import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

# I will find the translation keys and add new ones if not there.
if "'payments_overdue'" not in content:
    # Add to TranslationKey type
    content = content.replace("  | 'payments_no_paid_period'", "  | 'payments_no_paid_period'\n  | 'payments_overdue'\n  | 'payments_expected'\n  | 'payments_revenue_overview'")

    content = content.replace("payments_total_pending: 'المتبقي',", "payments_total_pending: 'المتبقي',\n    payments_overdue: 'متأخر',\n    payments_expected: 'المتوقع',\n    payments_revenue_overview: 'نظرة عامة على الإيرادات',")
    content = content.replace("payments_total_pending: 'Pending',", "payments_total_pending: 'Pending',\n    payments_overdue: 'Overdue',\n    payments_expected: 'Expected',\n    payments_revenue_overview: 'Revenue Overview',")
    content = content.replace("payments_total_pending: 'Ausstehend',", "payments_total_pending: 'Ausstehend',\n    payments_overdue: 'Überfällig',\n    payments_expected: 'Erwartet',\n    payments_revenue_overview: 'Umsatzübersicht',")

    with open('src/i18n/translations.ts', 'w') as f:
        f.write(content)
    print("Added keys to translations")
else:
    print("Keys already exist")
