import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord, Student, Group } from '../types';
import { getStudentCyclePricing } from '../utils/paymentUtils';
import { 
  DollarSign, CheckCircle2, Clock, Send, Search, 
  Check, X, Sparkles, History, Calendar, AlertCircle, TrendingUp, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DuePaymentCycle {
  id: string; // unique key
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  cycleLength: number; // e.g. 4
  amountDue: number; // e.g. 400
  lessonDates: string[]; // e.g. ["01/08/2026", "03/08/2026", "05/08/2026", "08/08/2026"]
  lessonIds: string[];
  status: 'due' | 'not_yet';
  parentPhone?: string;
  existingPaymentRecordId?: string;
}

export const PaymentsView: React.FC = () => {
  const { 
    students, groups, lessons, payments, profile, 
    markCyclePaymentPaid, markCyclePaymentNotYet, t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'due' | 'history'>('due');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  // Gains Summary Modal State
  const [selectedGainPeriod, setSelectedGainPeriod] = useState<'daily' | 'weekly' | 'monthly' | null>(null);

  // WhatsApp Parent Message Modal state
  const [selectedCycleForWhatsApp, setSelectedCycleForWhatsApp] = useState<DuePaymentCycle | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Flexible Prorate Modal State
  const [prorateModalItem, setProrateModalItem] = useState<DuePaymentCycle | null>(null);
  const [customProrateAmount, setCustomProrateAmount] = useState<number>(0);

  const currency = profile.currency || 'EGP';
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to format YYYY-MM-DD -> DD/MM/YYYY
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // --------------------------------------------------------------------------
  // GAIN COMPUTATIONS (DAILY, WEEKLY, MONTHLY)
  // --------------------------------------------------------------------------
  const { dailyPayments, weeklyPayments, monthlyPayments, dailyTotal, weeklyTotal, monthlyTotal } = useMemo(() => {
    const paidOnly = payments.filter(p => p.status === 'paid');
    const currentMonthStr = todayStr.substring(0, 7); // e.g., "2026-08"

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const daily = paidOnly.filter(p => {
      const d = p.paidDate || p.dueDate;
      return d && d.startsWith(todayStr);
    });

    const weekly = paidOnly.filter(p => {
      const dStr = p.paidDate || p.dueDate;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= sevenDaysAgo && d <= now;
    });

    const monthly = paidOnly.filter(p => {
      const d = p.paidDate || p.dueDate;
      return d && d.startsWith(currentMonthStr);
    });

    const sumList = (list: PaymentRecord[]) => list.reduce((sum, p) => sum + (p.amountPaid || p.amountDue || 0), 0);

    return {
      dailyPayments: daily,
      weeklyPayments: weekly,
      monthlyPayments: monthly,
      dailyTotal: sumList(daily),
      weeklyTotal: sumList(weekly),
      monthlyTotal: sumList(monthly)
    };
  }, [payments, todayStr]);

  // --------------------------------------------------------------------------
  // CALCULATE DUE PAYMENT CYCLES (ONLY STUDENTS WHO REACHED END OF CYCLE)
  // --------------------------------------------------------------------------
  const dueCycles = useMemo(() => {
    const list: DuePaymentCycle[] = [];

    // Map paid lesson IDs for fast lookup
    const paidLessonIds = new Set<string>();
    payments.forEach(p => {
      if (p.status === 'paid' && p.lessonIds && p.lessonIds.length > 0) {
        p.lessonIds.forEach(id => paidLessonIds.add(id));
      }
    });

    students.forEach(st => {
      // Find assigned group
      const grp = groups.find(g => g.id === st.groupId);

      // Determine cycle length (N) and package price (P) using canonical pricing utility
      const { cycleLength, amountDue } = getStudentCyclePricing(st, grp);

      // Collect all completed attended lessons for this student that have NOT been paid for
      const stCompletedLessons = lessons.filter(l => {
        if (l.status !== 'completed') return false;
        const matchesGroup = grp ? l.groupId === grp.id : false;
        const matchesStudent = l.studentId === st.id || l.studentName === st.name;
        if (!matchesGroup && !matchesStudent) return false;

        // Attendance check
        const att = l.report?.studentAttendance?.[st.id] || l.report?.attendanceStatus || 'present';
        if (att === 'absent') return false;

        // Check if this lesson ID has already been marked paid
        if (paidLessonIds.has(l.id)) return false;

        return true;
      });

      // Sort chronologically
      stCompletedLessons.sort((a, b) => a.date.localeCompare(b.date));

      // Check if student has an existing unpaid payment record in `payments`
      const unpaidRec = payments.find(p => p.studentId === st.id && p.status !== 'paid');

      // Check if student completed their cycle (unbilled lessons >= cycleLength)
      if (stCompletedLessons.length >= cycleLength) {
        let remaining = [...stCompletedLessons];
        let chunkIndex = 0;

        while (remaining.length >= cycleLength) {
          const currentChunk = remaining.slice(0, cycleLength);
          const lessonDates = currentChunk.map(l => formatDateDisplay(l.date));
          const lessonIds = currentChunk.map(l => l.id);

          list.push({
            id: (chunkIndex === 0 && unpaidRec?.id) ? unpaidRec.id : `due_cycle_${st.id}_${currentChunk[0]?.id || Date.now()}_${chunkIndex}`,
            studentId: st.id,
            studentName: st.name,
            groupId: st.groupId || grp?.id || '',
            groupName: grp?.name || 'Gruppe',
            cycleLength,
            amountDue,
            lessonDates,
            lessonIds,
            status: (chunkIndex === 0 && unpaidRec) ? 'not_yet' : 'due',
            parentPhone: st.parentPhone || st.studentPhone || '',
            existingPaymentRecordId: chunkIndex === 0 ? unpaidRec?.id : undefined
          });

          remaining = remaining.slice(cycleLength);
          chunkIndex++;
        }
      } else if (unpaidRec) {
        // Unpaid record exists from past cycle
        list.push({
          id: unpaidRec.id,
          studentId: st.id,
          studentName: st.name,
          groupId: st.groupId || grp?.id || '',
          groupName: grp?.name || unpaidRec.groupName || 'Gruppe',
          cycleLength: unpaidRec.bundleSize || cycleLength,
          amountDue: unpaidRec.amountDue || amountDue,
          lessonDates: unpaidRec.lessonDates || [],
          lessonIds: unpaidRec.lessonIds || [],
          status: 'not_yet',
          parentPhone: st.parentPhone || st.studentPhone || '',
          existingPaymentRecordId: unpaidRec.id
        });
      }
      // Note: If stCompletedLessons.length < cycleLength and no unpaid record exists,
      // student is NOT due for payment and will NOT appear on Payments page!
    });

    return list;
  }, [students, groups, lessons, payments]);

  // Filtered Due Cycles based on search & group filter
  const filteredDueCycles = useMemo(() => {
    return dueCycles.filter(item => {
      const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.groupName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroupId === 'all' || item.groupId === selectedGroupId;
      return matchesSearch && matchesGroup;
    });
  }, [dueCycles, searchTerm, selectedGroupId]);

  // CALCULATE IN PROGRESS CYCLES FOR FLEXIBLE & PRORATED BILLING
  const inProgressCycles = useMemo(() => {
    const list: DuePaymentCycle[] = [];

    // Map ALL billed lesson IDs (both paid and unpaid) for fast lookup
    const billedLessonIds = new Set<string>();
    payments.forEach(p => {
      if (p.lessonIds && p.lessonIds.length > 0) {
        p.lessonIds.forEach(id => billedLessonIds.add(id));
      }
    });

    students.forEach(st => {
      // Find assigned group
      const grp = groups.find(g => g.id === st.groupId);

      // Determine cycle length (N) and package price (P) using canonical pricing utility
      const { cycleLength, amountDue } = getStudentCyclePricing(st, grp);

      // Collect all completed attended lessons for this student that have NOT been billed yet (neither paid nor unpaid)
      const stCompletedLessons = lessons.filter(l => {
        if (l.status !== 'completed') return false;
        const matchesGroup = grp ? l.groupId === grp.id : false;
        const matchesStudent = l.studentId === st.id || l.studentName === st.name;
        if (!matchesGroup && !matchesStudent) return false;

        // Attendance check
        const att = l.report?.studentAttendance?.[st.id] || l.report?.attendanceStatus || 'present';
        if (att === 'absent') return false;

        // Check if this lesson ID has already been billed
        if (billedLessonIds.has(l.id)) return false;

        return true;
      });

      // Sort chronologically
      stCompletedLessons.sort((a, b) => a.date.localeCompare(b.date));

      const hasUnpaidRec = payments.some(p => p.studentId === st.id && p.status !== 'paid');

      // If they have completed some lessons but less than cycle length, and they do NOT have an unpaid record already
      if (stCompletedLessons.length > 0 && stCompletedLessons.length < cycleLength && !hasUnpaidRec) {
        const lessonDates = stCompletedLessons.map(l => formatDateDisplay(l.date));
        const lessonIds = stCompletedLessons.map(l => l.id);

        // Prorated calculations
        const pricePerSession = amountDue / cycleLength;
        const proratedAmount = Math.round(pricePerSession * stCompletedLessons.length);

        list.push({
          id: `in_progress_cycle_${st.id}_${stCompletedLessons[0]?.id || Date.now()}`,
          studentId: st.id,
          studentName: st.name,
          groupId: st.groupId || grp?.id || '',
          groupName: grp?.name || 'Gruppe',
          cycleLength,
          amountDue: proratedAmount, // default to prorated
          lessonDates,
          lessonIds,
          status: 'not_yet',
          parentPhone: st.parentPhone || st.studentPhone || '',
        });
      }
    });

    return list;
  }, [students, groups, lessons, payments]);

  const filteredInProgressCycles = useMemo(() => {
    return inProgressCycles.filter(item => {
      const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.groupName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroupId === 'all' || item.groupId === selectedGroupId;
      return matchesSearch && matchesGroup;
    });
  }, [inProgressCycles, searchTerm, selectedGroupId]);

  // Paid Payment History
  const paidHistory = useMemo(() => {
    return payments
      .filter(p => p.status === 'paid')
      .filter(p => {
        const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.groupName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = selectedGroupId === 'all' || p.groupId === selectedGroupId;
        return matchesSearch && matchesGroup;
      })
      .sort((a, b) => (b.paidDate || b.dueDate || '').localeCompare(a.paidDate || a.dueDate || ''));
  }, [payments, searchTerm, selectedGroupId]);

  // Total Due Calculation
  const totalAmountDue = useMemo(() => {
    return filteredDueCycles.reduce((sum, item) => sum + item.amountDue, 0);
  }, [filteredDueCycles]);

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleMarkPaid = (item: DuePaymentCycle) => {
    markCyclePaymentPaid({
      studentId: item.studentId,
      studentName: item.studentName,
      groupId: item.groupId,
      groupName: item.groupName,
      amountDue: item.amountDue,
      amountPaid: item.amountDue,
      lessonDates: item.lessonDates,
      lessonIds: item.lessonIds,
      existingPaymentRecordId: item.existingPaymentRecordId,
      notes: `Bezahlt (${item.cycleLength}/${item.cycleLength} Lektionen)`
    });
  };

  const handleMarkNotYet = (item: DuePaymentCycle) => {
    markCyclePaymentNotYet({
      studentId: item.studentId,
      studentName: item.studentName,
      groupId: item.groupId,
      groupName: item.groupName,
      amountDue: item.amountDue,
      lessonDates: item.lessonDates,
      lessonIds: item.lessonIds,
      existingPaymentRecordId: item.existingPaymentRecordId
    });
  };

  // WhatsApp Parent Message Generator
  const generateWhatsAppMessage = (item: DuePaymentCycle) => {
    const datesFormatted = item.lessonDates.length > 0 
      ? item.lessonDates.map(d => `• ${d}`).join('\n')
      : '• مواعيد الحصص المكتملة';

    return `السلام عليكم ورحمة الله وبركاته،

إشعار اكتمال الدورة الدراسية واستحقاق السداد 📚

الطالب/ة: ${item.studentName}
المجموعة: ${item.groupName}
المبلغ المستحق: ${item.amountDue} ${currency} (عدد ${item.cycleLength} حصص)

تاريخ الحصص المكتملة في هذه الدورة:
${datesFormatted}

شاكرين ومقدرين حسن تعاونكم معنا للتسديد.`;
  };

  const handleCopyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleOpenWhatsApp = (phone: string, msg: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      handleCopyMessage(msg);
    }
  };

  return (
    <div className="space-y-5 pb-24 font-sans max-w-4xl mx-auto">
      {/* TOP BANNER */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-250 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* SMALL GAIN SUMMARY BUTTONS - HORIZONTAL EQUAL SIZE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
          <button
            type="button"
            onClick={() => setSelectedGainPeriod('daily')}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('payments_daily_gain')}:</span>
            <span className="font-mono font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">{dailyTotal} {currency}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGainPeriod('weekly')}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t('payments_weekly_gain')}:</span>
            <span className="font-mono font-bold whitespace-nowrap text-blue-600 dark:text-blue-400">{weeklyTotal} {currency}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGainPeriod('monthly')}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{t('payments_monthly_gain')}:</span>
            <span className="font-mono font-bold whitespace-nowrap text-indigo-600 dark:text-indigo-400">{monthlyTotal} {currency}</span>
          </button>
        </div>

        {/* SUMMARY BADGE */}
        {dueCycles.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{t('payments_total_due')}</span>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {totalAmountDue} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
          </div>
        )}
      </div>

      {/* SEGMENT TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-lg">
          <button
            onClick={() => setActiveTab('due')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'due'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('payments_due_tab')} ({dueCycles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('payments_history_tab')} ({paidHistory.length})</span>
          </button>
        </div>

        {/* GROUP FILTER */}
        {groups.length > 0 && (
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
          >
            <option value="all">{t('students_all_groups')}</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* TAB 1: OFFENE ZAHLUNGEN (DUE NOW) */}
      {activeTab === 'due' && (
        <div className="space-y-3">
          {filteredDueCycles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('payments_no_due')} ✨
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {t('payments_no_due_sub')}
                </p>
              </div>
            </div>
          ) : (
            filteredDueCycles.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-amber-200/80 dark:border-amber-950/80 shadow-xs space-y-3.5 relative overflow-hidden"
              >
                {/* TOP ROW: STUDENT INFO & AMOUNT DUE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {item.studentName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        {item.groupName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                        {t('payments_completed_cycle')}: {item.cycleLength} / {item.cycleLength} {t('payment_plan_lessons')}
                      </span>
                      {item.status === 'not_yet' && (
                        <span className="text-[11px] font-bold text-slate-400">
                          ({t('payments_pending_tag')} ⏳)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{t('payments_amount_due')}</span>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {item.amountDue} <span className="text-xs font-normal text-slate-400">{currency}</span>
                    </div>
                  </div>
                </div>

                {/* LESSON DATES INCLUDED IN THIS CYCLE */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('payments_completed_dates')}:</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.lessonDates.length > 0 ? (
                      item.lessonDates.map((d, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-200 dark:border-slate-700"
                        >
                          🗓️ {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {item.cycleLength} {t('payment_plan_lessons')}
                      </span>
                    )}
                  </div>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* PAID BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(item)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{t('payments_paid_btn')} (Paid)</span>
                    </button>

                    {/* NOT YET BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleMarkNotYet(item)}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('payments_not_yet_btn')} (Not Yet)</span>
                    </button>
                  </div>

                  {/* WHATSAPP MESSAGE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setSelectedCycleForWhatsApp(item)}
                    className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all border border-emerald-200 dark:border-emerald-800/60 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('payments_parent_notice')} (WhatsApp)</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Section: Flexible & Prorated Billing (إنهاء الدورة مبكراً والفوترة الجزئية) */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-right dir-rtl">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>الفوترة الجزئية وإنهاء الدورة مبكراً (Flexible & Prorated Billing)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  يمكنك إنهاء الدورة الحالية للطلاب مبكراً والمطالبة بالدفع بناءً على الحصص التي حضروها فعلياً.
                </p>
              </div>
            </div>

            {filteredInProgressCycles.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg text-center border border-slate-100 dark:border-slate-800/50">
                <p className="text-xs text-slate-400 font-medium">لا يوجد طلاب لديهم حصص مكتملة غير مفوترة حالياً تحت الحد الأقصى للدورة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredInProgressCycles.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-3 shadow-xs relative text-right dir-rtl">
                    <div className="flex justify-between items-start flex-row-reverse">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white text-right">{item.studentName}</h4>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded-md inline-block mt-0.5">{item.groupName}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">القيمة المقترحة (Prorated)</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{item.amountDue} {currency}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 text-[11px] space-y-1">
                      <div className="flex justify-between flex-row-reverse">
                        <span className="text-slate-500">الحصص المكتملة (Attended):</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{item.lessonDates.length} / {item.cycleLength} حصة</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-1 mt-1 justify-end">
                        {item.lessonDates.map((d, idx) => (
                          <span key={idx} className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">🗓️ {d}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProrateModalItem(item);
                        setCustomProrateAmount(item.amountDue);
                      }}
                      className="w-full py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all text-xs font-black rounded-xl border border-blue-200/50 dark:border-blue-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>إنهاء الدورة والفوترة (Force Cycle & Bill)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ZAHLUNGSHISTORIE (PAID HISTORY) */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {paidHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('payments_no_history')}</p>
              <p className="text-xs text-slate-400">{t('payments_history_sub')}</p>
            </div>
          ) : (
            paidHistory.map(p => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{p.studentName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {p.groupName}
                    </span>
                  </div>

                  {p.lessonDates && p.lessonDates.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {p.lessonDates.map((d, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ✓ {p.amountPaid} {currency}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {t('payments_paid_on')}: {p.paidDate || p.dueDate}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* WHATSAPP RECEIPT / NOTICE MODAL */}
      {selectedCycleForWhatsApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                <span>{t('payments_parent_notice')}</span>
              </h2>
              <button
                onClick={() => setSelectedCycleForWhatsApp(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed dir-rtl text-right">
              {generateWhatsAppMessage(selectedCycleForWhatsApp)}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopyMessage(generateWhatsAppMessage(selectedCycleForWhatsApp))}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{copiedSuccess ? `${t('reports_copied')} ✓` : t('payments_copy_text')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenWhatsApp(
                    selectedCycleForWhatsApp.parentPhone || '',
                    generateWhatsAppMessage(selectedCycleForWhatsApp)
                  );
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{t('payments_open_whatsapp')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAIN SUMMARY MODAL */}
      {selectedGainPeriod && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedGainPeriod === 'daily' && t('payments_daily_summary')}
                    {selectedGainPeriod === 'weekly' && t('payments_weekly_summary')}
                    {selectedGainPeriod === 'monthly' && t('payments_monthly_summary')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('payments_gain_summary_sub')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGainPeriod(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOTAL STAT CARD */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider block">{t('payments_total_gains')}</span>
                <div className="text-2xl font-black font-mono mt-0.5">
                  {selectedGainPeriod === 'daily' ? dailyTotal : selectedGainPeriod === 'weekly' ? weeklyTotal : monthlyTotal} <span className="text-sm font-normal text-emerald-100">{currency}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider block">{t('payments_paid_cycles')}</span>
                <div className="text-2xl font-black font-mono mt-0.5">
                  {selectedGainPeriod === 'daily' ? dailyPayments.length : selectedGainPeriod === 'weekly' ? weeklyPayments.length : monthlyPayments.length}
                </div>
              </div>
            </div>

            {/* LIST OF PAYMENTS IN THIS PERIOD */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{t('payments_details_heading')}</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {(selectedGainPeriod === 'daily' ? dailyPayments : selectedGainPeriod === 'weekly' ? weeklyPayments : monthlyPayments).length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    {t('payments_no_cycles_period')}
                  </div>
                ) : (
                  (selectedGainPeriod === 'daily' ? dailyPayments : selectedGainPeriod === 'weekly' ? weeklyPayments : monthlyPayments).map(p => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{p.studentName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.groupName} • {p.paidDate || p.dueDate}</div>
                      </div>
                      <div className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        +{p.amountPaid || p.amountDue} {currency}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedGainPeriod(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-black rounded-xl text-xs transition-all cursor-pointer shadow-xs"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* FORCE CYCLE / PRORATE MODAL */}
      {prorateModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up text-right dir-rtl">
            <div className="flex items-center justify-between flex-row-reverse">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>إنهاء الدورة الحالية والمطالبة بالدفع</span>
              </h2>
              <button
                onClick={() => setProrateModalItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Student info card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/60 text-sm space-y-2 text-right">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">اسم الطالب (Student):</span>
                  <span className="font-black text-slate-900 dark:text-white">{prorateModalItem.studentName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block">المجموعة (Group):</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{prorateModalItem.groupName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block">معدل الحضور (Attendance Progress):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">حضر {prorateModalItem.lessonDates.length} حصص من أصل دورة من {prorateModalItem.cycleLength} حصص</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block">تواريخ الحصص المنجزة:</span>
                  <div className="flex flex-wrap gap-1 mt-1 justify-end">
                    {prorateModalItem.lessonDates.map((d, idx) => (
                      <span key={idx} className="bg-white dark:bg-slate-900 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">🗓️ {d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount editor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 text-right">
                  تعديل القيمة المستحقة للدفع الجزئي (Prorated Due Amount):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customProrateAmount}
                    onChange={(e) => setCustomProrateAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    {currency}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed text-right">
                  * تم حساب القيمة المقترحة تلقائياً بناءً على متوسط قيمة الحصة الواحدة. يمكنك تعديل المبلغ يدوياً قبل تأكيد الفاتورة.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  markCyclePaymentNotYet({
                    studentId: prorateModalItem.studentId,
                    studentName: prorateModalItem.studentName,
                    groupId: prorateModalItem.groupId,
                    groupName: prorateModalItem.groupName,
                    amountDue: customProrateAmount,
                    lessonDates: prorateModalItem.lessonDates,
                    lessonIds: prorateModalItem.lessonIds
                  });
                  setProrateModalItem(null);
                  confetti({ particleCount: 30, spread: 40 });
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <span>تسجيل كفاتورة غير مدفوعة (Mark Unpaid)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  markCyclePaymentPaid({
                    studentId: prorateModalItem.studentId,
                    studentName: prorateModalItem.studentName,
                    groupId: prorateModalItem.groupId,
                    groupName: prorateModalItem.groupName,
                    amountDue: customProrateAmount,
                    amountPaid: customProrateAmount,
                    lessonDates: prorateModalItem.lessonDates,
                    lessonIds: prorateModalItem.lessonIds,
                    notes: `دفع جزئي مرن (${prorateModalItem.lessonDates.length}/${prorateModalItem.cycleLength} حصص)`
                  });
                  setProrateModalItem(null);
                  confetti({ particleCount: 50, spread: 50 });
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <span>تسجيل كمدفوع بالكامل فوراً (Mark Paid Now)</span>
              </button>

              <button
                type="button"
                onClick={() => setProrateModalItem(null)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>إلغاء (Cancel)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
