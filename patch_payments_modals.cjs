const fs = require('fs');
let content = fs.readFileSync('src/components/PaymentsView.tsx', 'utf-8');

// The WhatsApp message template is fine to keep as Arabic as a default if they haven't configured it, but let's translate it.
const oldMsgTemplate = `    return \`السلام عليكم ورحمة الله وبركاته،

إشعار اكتمال الدورة الدراسية واستحقاق السداد 📚

الطالب/ة: \${item.studentName}
المجموعة: \${item.groupName}
المبلغ المستحق: \${item.amountDue} \${currency} (عدد \${item.cycleLength} حصص)

تاريخ الحصص المكتملة في هذه الدورة:
\${lessonDatesStr}

شاكرين ومقدرين حسن تعاونكم معنا للتسديد.\`;`;

const newMsgTemplate = `    const greeting = language === 'ar' ? 'السلام عليكم ورحمة الله وبركاته،' : language === 'de' ? 'Hallo,' : 'Hello,';
    const notice = language === 'ar' ? 'إشعار استحقاق السداد 📚' : language === 'de' ? 'Zahlungserinnerung 📚' : 'Payment Reminder 📚';
    const stLabel = language === 'ar' ? 'الطالب/ة:' : language === 'de' ? 'Schüler/in:' : 'Student:';
    const gpLabel = language === 'ar' ? 'المجموعة:' : language === 'de' ? 'Gruppe:' : 'Group:';
    const amLabel = language === 'ar' ? 'المبلغ المستحق:' : language === 'de' ? 'Fälliger Betrag:' : 'Amount Due:';
    const datesLabel = language === 'ar' ? 'تاريخ الحصص المكتملة:' : language === 'de' ? 'Abgeschlossene Lektionen:' : 'Completed Lessons:';
    const thanks = language === 'ar' ? 'شاكرين ومقدرين حسن تعاونكم معنا.' : language === 'de' ? 'Vielen Dank für Ihre Mitarbeit.' : 'Thank you for your cooperation.';

    return \`\${greeting}

\${notice}

\${stLabel} \${item.studentName}
\${gpLabel} \${item.groupName}
\${amLabel} \${item.amountDue} \${currency} (\${item.cycleLength})

\${datesLabel}
\${lessonDatesStr}

\${thanks}\`;`;

content = content.replace(oldMsgTemplate, newMsgTemplate);

// We need to also patch the bottom modal.
const modalRegex = /<div className="fixed inset-0 z-50 bg-slate-900\/60[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const match = content.match(modalRegex);
if(match) {
  let modalContent = match[0];
  
  modalContent = modalContent.replace('إنهاء الدورة الحالية والمطالبة بالدفع', "{_t('إنهاء الدورة والمطالبة بالدفع', 'End Cycle & Request Payment', 'Zyklus beenden & Zahlung anfordern')}");
  
  modalContent = modalContent.replace('اسم الطالب (Student):', "{_t('اسم الطالب:', 'Student:', 'Schüler:')}");
  modalContent = modalContent.replace('المجموعة (Group):', "{_t('المجموعة:', 'Group:', 'Gruppe:')}");
  modalContent = modalContent.replace('معدل الحضور (Attendance Progress):', "{_t('معدل الحضور:', 'Attendance Progress:', 'Anwesenheitsfortschritt:')}");
  modalContent = modalContent.replace('حضر {prorateModalItem.lessonDates.length} حصص من أصل دورة من {prorateModalItem.cycleLength} حصص', "{_t(`حضر ${prorateModalItem.lessonDates.length} حصص من أصل ${prorateModalItem.cycleLength}`, `${prorateModalItem.lessonDates.length} out of ${prorateModalItem.cycleLength} lessons`, `${prorateModalItem.lessonDates.length} von ${prorateModalItem.cycleLength} Lektionen`)}");
  modalContent = modalContent.replace('تواريخ الحصص المنجزة:', "{_t('تواريخ الحصص المنجزة:', 'Completed Dates:', 'Abgeschlossene Daten:')}");
  modalContent = modalContent.replace('تعديل القيمة المستحقة للدفع الجزئي (Prorated Due Amount):', "{_t('القيمة المستحقة للدفع الجزئي:', 'Prorated Due Amount:', 'Anteiliger fälliger Betrag:')}");
  modalContent = modalContent.replace('* تم حساب القيمة المقترحة تلقائياً بناءً على متوسط قيمة الحصة الواحدة. يمكنك تعديل المبلغ يدوياً قبل تأكيد الفاتورة.', "{_t('القيمة مقترحة تلقائياً. يمكنك تعديلها يدوياً.', 'Amount auto-calculated. You can edit it manually.', 'Betrag automatisch berechnet. Sie können ihn manuell ändern.')}");
  modalContent = modalContent.replace('تسجيل كفاتورة غير مدفوعة (Mark Unpaid)', "{_t('تسجيل كغير مدفوعة', 'Mark Unpaid', 'Als unbezahlt markieren')}");
  modalContent = modalContent.replace('تسجيل كمدفوع بالكامل فوراً (Mark Paid Now)', "{_t('تسجيل كمدفوع بالكامل', 'Mark Paid Now', 'Jetzt als bezahlt markieren')}");
  modalContent = modalContent.replace('إلغاء (Cancel)', "{_t('إلغاء', 'Cancel', 'Abbrechen')}");
  
  content = content.replace(match[0], modalContent);
}

fs.writeFileSync('src/components/PaymentsView.tsx', content, 'utf-8');
console.log("Updated PaymentsView Modal");
