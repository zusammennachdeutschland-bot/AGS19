const fs = require('fs');

let content = fs.readFileSync('src/components/PaymentsView.tsx', 'utf-8');

const oldCalc = `  // Total Due Calculation
  const totalAmountDue = useMemo(() => {
    return filteredDueCycles.reduce((sum, item) => sum + item.amountDue, 0);
  }, [filteredDueCycles]);`;

const newCalc = `  // Total Due Calculation
  const totalAmountDue = useMemo(() => {
    return filteredDueCycles.reduce((sum, item) => {
      const existingRec = payments.find(p => p.id === item.existingPaymentRecordId);
      const paid = existingRec ? (existingRec.amountPaid || 0) : 0;
      const discount = existingRec ? (existingRec.discountAmount || 0) : 0;
      return sum + Math.max(0, item.amountDue - paid - discount);
    }, 0);
  }, [filteredDueCycles, payments]);`;

content = content.replace(oldCalc, newCalc);

fs.writeFileSync('src/components/PaymentsView.tsx', content, 'utf-8');
console.log("PaymentsView total due patched");
