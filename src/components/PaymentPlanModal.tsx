import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, PaymentPlanType } from '../types';
import { X, DollarSign, Check, Award, Layers, Save, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentPlanModalProps {
  student: Student;
  onClose: () => void;
}

export const PaymentPlanModal: React.FC<PaymentPlanModalProps> = ({ student, onClose }) => {
  const { updateStudentPaymentPlan, groups } = useApp();

  const currentGroup = groups.find(g => g.id === student.groupId);
  const defaultPrice = currentGroup?.pricePerSession || currentGroup?.monthlyPackagePrice || 200;

  const [plan, setPlan] = useState<PaymentPlanType>(student.paymentPlan || '4_lessons');
  const [pricePerLesson, setPricePerLesson] = useState<number>(student.pricePerLesson || defaultPrice);
  const [bundleSize, setBundleSize] = useState<number>(student.bundleSize || 4);
  const [customBundlePrice, setCustomBundlePrice] = useState<number>(student.customBundlePrice || (pricePerLesson * bundleSize));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentPaymentPlan(
      student.id,
      plan,
      Number(pricePerLesson),
      Number(bundleSize),
      Number(customBundlePrice)
    );
    confetti({ particleCount: 50, spread: 40 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-scale-up space-y-0 font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 bg-white/20 px-2.5 py-0.5 rounded-full">
              Zahlungsplan anpassen
            </span>
            <h3 className="text-base font-black mt-1 flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-amber-300" />
              <span>Zahlungsplan für {student.name}</span>
            </h3>
            <p className="text-xs text-blue-100">
              Lektionsbasierte Abrechnung & Paketvereinbarung.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Plan Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Wählen Sie das Abrechnungsmodell:
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setPlan('per_lesson'); setBundleSize(1); }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  plan === 'per_lesson'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-extrabold text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">Pro Einzel-Lektion</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Zahlung nach jeder Lektion</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlan('4_lessons'); setBundleSize(4); }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  plan === '4_lessons'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-extrabold text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">4er Lektionspaket</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Abrechnung alle 4 Lektionen</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlan('8_lessons'); setBundleSize(8); }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  plan === '8_lessons'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-extrabold text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">8er Paket (Monatlich)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">2 Lektionen pro Woche</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlan('12_lessons'); setBundleSize(12); }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  plan === '12_lessons'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-extrabold text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">12er Paket (Quartal)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Großpaket mit Rabatt</div>
              </button>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Preis pro Einzel-Lektion (EGP)
                </label>
                <input
                  type="number"
                  value={pricePerLesson}
                  onChange={(e) => setPricePerLesson(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Anzahl Lektionen im Paket
                </label>
                <input
                  type="number"
                  value={bundleSize}
                  onChange={(e) => setBundleSize(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                Gesamtpreis für Paket (EGP)
              </label>
              <input
                type="number"
                value={plan === 'custom_bundle' ? customBundlePrice : pricePerLesson * bundleSize}
                onChange={(e) => {
                  setPlan('custom_bundle');
                  setCustomBundlePrice(Number(e.target.value));
                }}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Zahlungsplan Speichern</span>
          </button>
        </form>

      </div>
    </div>
  );
};
