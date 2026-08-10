const fs = require('fs');
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');

const targetCard = `          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold text-slate-500 mb-1">{t('reports_completed_sessions')}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              {completedSessionsCount}
            </p>
          </div>`;

const newCard = `          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold text-slate-500 mb-1">{t('reports_completed_sessions')}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              {completedSessionsCount}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold text-slate-500 mb-1">{language === 'ar' ? 'حصص ملغاة' : 'Cancelled'}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              {cancelledSessionsCount}
            </p>
          </div>`;

content = content.replace(targetCard, newCard);

if (!content.includes('XCircle')) {
  content = content.replace(
    "import { BarChart2, TrendingUp, DollarSign, CheckCircle, Calendar, User, CreditCard } from 'lucide-react';",
    "import { BarChart2, TrendingUp, DollarSign, CheckCircle, XCircle, Calendar, User, CreditCard } from 'lucide-react';"
  );
}

fs.writeFileSync('src/components/ReportsView.tsx', content);
