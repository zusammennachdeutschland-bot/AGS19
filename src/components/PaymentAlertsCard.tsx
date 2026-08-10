import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, ChevronRight, Wallet, Send } from 'lucide-react';

export const PaymentAlertsCard: React.FC = () => {
  const { payments, profile, setActiveTab, t } = useApp();

  const pendingPayments = payments.filter((p) => {
    if (p.status !== 'unpaid' && p.status !== 'partial' && p.status !== 'pending') return false;
    // Suppress package-based alerts until package completion
    if ((p.bundleSize && p.bundleSize > 1) || p.paymentType === 'package_bundle') {
      return (p.lessonIds?.length || 0) >= (p.bundleSize || 4);
    }
    return true;
  });

  const totalPendingAmount = pendingPayments.reduce(
    (sum, p) => sum + (p.amountDue - p.amountPaid),
    0
  );

  if (pendingPayments.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-3.5 shadow-2xs font-sans transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                {t('payments_pending')}
              </span>
              <span className="text-[9px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded-md">
                {pendingPayments.length}
              </span>
            </div>
            <p className="text-xs font-black text-amber-800 dark:text-amber-300 font-mono mt-0.5">
              {totalPendingAmount.toLocaleString()} {profile.currency} {t('payments_total_pending')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('payments')}
          className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>{t('open')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
