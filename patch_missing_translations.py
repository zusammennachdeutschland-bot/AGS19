import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

# Add to type TranslationKey
keys = [
    'payments_completed_cycle',
    'payments_daily_summary',
    'payments_details_heading',
    'payments_due_tab',
    'payments_history_sub',
    'payments_monthly_summary',
    'payments_no_cycles_period',
    'payments_no_due_sub',
    'payments_not_yet_btn',
    'payments_paid_btn',
    'payments_parent_notice',
    'payments_pending_tag',
    'payments_weekly_summary',
    'payments_daily_gain',
    'payments_weekly_gain',
    'payments_monthly_gain',
]

for key in keys:
    if f"| '{key}'" not in content:
        content = content.replace("  | 'payments_no_paid_period'", f"  | 'payments_no_paid_period'\n  | '{key}'")


content = content.replace("payments_total_pending: 'المتبقي',", 
                          "payments_total_pending: 'المتبقي',\n" +
                          "    payments_completed_cycle: 'الدورة اكتملت',\n" +
                          "    payments_daily_summary: 'ملخص اليوم',\n" +
                          "    payments_details_heading: 'التفاصيل',\n" +
                          "    payments_due_tab: 'المستحقات',\n" +
                          "    payments_history_sub: 'تاريخ سداد المدفوعات',\n" +
                          "    payments_monthly_summary: 'ملخص الشهر',\n" +
                          "    payments_no_cycles_period: 'لا توجد دورات مسددة',\n" +
                          "    payments_no_due_sub: 'لا توجد مستحقات سداد حاليا',\n" +
                          "    payments_not_yet_btn: 'لم يتم السداد',\n" +
                          "    payments_paid_btn: 'تم السداد',\n" +
                          "    payments_parent_notice: 'إشعار لولي الأمر',\n" +
                          "    payments_pending_tag: 'في الانتظار',\n" +
                          "    payments_weekly_summary: 'ملخص الأسبوع',\n" +
                          "    payments_daily_gain: 'أرباح اليوم',\n" +
                          "    payments_weekly_gain: 'أرباح الأسبوع',\n" +
                          "    payments_monthly_gain: 'أرباح الشهر',")

content = content.replace("payments_total_pending: 'Pending',", 
                          "payments_total_pending: 'Pending',\n" +
                          "    payments_completed_cycle: 'Completed Cycle',\n" +
                          "    payments_daily_summary: 'Daily Summary',\n" +
                          "    payments_details_heading: 'Details',\n" +
                          "    payments_due_tab: 'Due',\n" +
                          "    payments_history_sub: 'Payment history records',\n" +
                          "    payments_monthly_summary: 'Monthly Summary',\n" +
                          "    payments_no_cycles_period: 'No paid cycles.',\n" +
                          "    payments_no_due_sub: 'No payments are due right now.',\n" +
                          "    payments_not_yet_btn: 'Not Yet',\n" +
                          "    payments_paid_btn: 'Paid',\n" +
                          "    payments_parent_notice: 'Parent Notice',\n" +
                          "    payments_pending_tag: 'Pending',\n" +
                          "    payments_weekly_summary: 'Weekly Summary',\n" +
                          "    payments_daily_gain: 'Daily Revenue',\n" +
                          "    payments_weekly_gain: 'Weekly Revenue',\n" +
                          "    payments_monthly_gain: 'Monthly Revenue',")

content = content.replace("payments_total_pending: 'Ausstehend',", 
                          "payments_total_pending: 'Ausstehend',\n" +
                          "    payments_completed_cycle: 'Abgeschlossener Zyklus',\n" +
                          "    payments_daily_summary: 'Tagesübersicht',\n" +
                          "    payments_details_heading: 'Details',\n" +
                          "    payments_due_tab: 'Fällig',\n" +
                          "    payments_history_sub: 'Verlauf der Zahlungen',\n" +
                          "    payments_monthly_summary: 'Monatsübersicht',\n" +
                          "    payments_no_cycles_period: 'Keine bezahlten Zyklen.',\n" +
                          "    payments_no_due_sub: 'Derzeit keine fälligen Zahlungen.',\n" +
                          "    payments_not_yet_btn: 'Noch nicht',\n" +
                          "    payments_paid_btn: 'Bezahlt',\n" +
                          "    payments_parent_notice: 'Elternnotiz',\n" +
                          "    payments_pending_tag: 'Ausstehend',\n" +
                          "    payments_weekly_summary: 'Wochenübersicht',\n" +
                          "    payments_daily_gain: 'Tagesumsatz',\n" +
                          "    payments_weekly_gain: 'Wochenumsatz',\n" +
                          "    payments_monthly_gain: 'Monatsumsatz',")

with open('src/i18n/translations.ts', 'w') as f:
    f.write(content)
