const fs = require('fs');
let content = fs.readFileSync('src/utils/paymentUtils.ts', 'utf-8');

const additionalExports = `

export const getPaymentsForPeriod = (payments: PaymentRecord[], startDateStr: string, endDateStr: string) => {
  return payments.filter(p => {
    const dStr = p.paidDate || p.dueDate;
    if (!dStr) return false;
    // Extract YYYY-MM-DD
    const d = dStr.substring(0, 10);
    return d >= startDateStr && d <= endDateStr;
  });
};

export const getPaymentsForMonth = (payments: PaymentRecord[], monthPrefix: string) => {
  return payments.filter(p => {
    const dStr = p.paidDate || p.dueDate;
    if (!dStr) return false;
    return dStr.startsWith(monthPrefix);
  });
};

export const getPaymentsForDay = (payments: PaymentRecord[], dayStr: string) => {
  return payments.filter(p => {
    const dStr = p.paidDate || p.dueDate;
    if (!dStr) return false;
    return dStr.startsWith(dayStr);
  });
};

export const sumPayments = (list: PaymentRecord[]) => list.reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);
`;

content = content + additionalExports;
fs.writeFileSync('src/utils/paymentUtils.ts', content, 'utf-8');
