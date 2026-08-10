import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const replacement = `
          if (openCycleIndex >= 0) {
            // Update existing open payment cycle
            const currentRec = nextPayments[openCycleIndex];
            const existingDates = currentRec.lessonDates || [];
            const existingIds = currentRec.lessonIds || [];

            const updatedDates = existingDates.includes(formattedDate) ? existingDates : [...existingDates, formattedDate];
            const updatedIds = existingIds.includes(targetLesson.id) ? existingIds : [...existingIds, targetLesson.id];
            
            // If we reached bundle size and haven't added the previous ones, let's add them
            if (reachedBundleSize) {
                unbilledCompletedLessons.forEach(l => {
                    const lDate = l.date.split('-').length === 3 ? \`\${l.date.split('-')[2]}/\${l.date.split('-')[1]}/\${l.date.split('-')[0]}\` : l.date;
                    if (!updatedIds.includes(l.id)) updatedIds.push(l.id);
                    if (!updatedDates.includes(lDate)) updatedDates.push(lDate);
                });
            }

            const curPaid = stPayChoice?.amount !== undefined ? stPayChoice.amount : currentRec.amountPaid;
            const curStatus = stPayChoice?.status || (curPaid >= bundlePrice ? 'paid' : (curPaid > 0 ? 'partial' : 'pending'));

            const updatedRecord: PaymentRecord = {
              ...currentRec,
              groupId: st.groupId || targetLesson.groupId || '',
              groupName: grp?.name || targetLesson.groupName || 'Gruppe',
              bundleSize: currentRec.bundleSize || bundleSize,
              amountDue: currentRec.amountDue || bundlePrice,
              amountPaid: curPaid,
              remainingBalance: Math.max(0, (currentRec.amountDue || bundlePrice) - curPaid - (currentRec.discountAmount || 0)),
              lessonIds: updatedIds,
              lessonDates: updatedDates,
              status: curStatus,
              paidDate: curStatus === 'paid' ? today : currentRec.paidDate,
              notes: \`Paket (\${updatedDates.length}/\${currentRec.bundleSize || bundleSize} Lektionen)\`
            };

            nextPayments[openCycleIndex] = updatedRecord;
          } else {
            // Create a brand new payment cycle record for student
            const initPaid = stPayChoice?.status === 'paid' ? bundlePrice : (stPayChoice?.amount || 0);
            const initStatus = stPayChoice?.status || (initPaid >= bundlePrice ? 'paid' : (initPaid > 0 ? 'partial' : 'pending'));
            
            const initialIds = [targetLesson.id];
            const initialDates = [formattedDate];
            
            if (reachedBundleSize) {
                unbilledCompletedLessons.forEach(l => {
                    const lDate = l.date.split('-').length === 3 ? \`\${l.date.split('-')[2]}/\${l.date.split('-')[1]}/\${l.date.split('-')[0]}\` : l.date;
                    if (!initialIds.includes(l.id)) initialIds.push(l.id);
                    if (!initialDates.includes(lDate)) initialDates.push(lDate);
                });
            }

            const newRecord: PaymentRecord = {
              id: \`pay_cycle_\${st.id}_\${Date.now()}_\${Math.random().toString(36).substring(2, 5)}\`,
              studentId: st.id,
              studentName: st.name,
              groupId: st.groupId || targetLesson.groupId || '',
              groupName: grp?.name || targetLesson.groupName || 'Gruppe',
              bundleSize: bundleSize,
              amountDue: bundlePrice,
              amountPaid: initPaid,
              remainingBalance: Math.max(0, bundlePrice - initPaid),
              dueDate: targetLesson.date,
              paidDate: initStatus === 'paid' ? today : undefined,
              status: initStatus,
              lessonIds: initialIds,
              lessonDates: initialDates,
              paymentType: bundleSize > 1 ? 'package_bundle' : 'single_lesson',
              paymentMethod: 'vodafone_cash',
              notes: \`Zahlungszyklus (\${bundleSize}er Paket)\`,
              createdAt: new Date().toISOString()
            };
            nextPayments.unshift(newRecord);
          }
`;

code = code.replace(
  /          if \(openCycleIndex >= 0\) \{[\s\S]*?nextPayments\.unshift\(newRecord\);\n          \}/,
  replacement
);

fs.writeFileSync('src/context/AppContext.tsx', code);
