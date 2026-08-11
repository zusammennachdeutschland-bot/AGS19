import re

with open('src/components/PaymentsView.tsx', 'r') as f:
    content = f.read()

start_marker = "{/* TOP BANNER */}"
end_marker = "{/* SEGMENT TABS */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_top = """{/* FINANCIAL DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
        <div className="bg-surface hover:bg-surface-hover transition-colors p-3.5 rounded-2xl border border-surface-border flex flex-col justify-center relative overflow-hidden shadow-sm">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            {t('payments_total_collected') || 'Collected'}
          </span>
          <span className="text-lg font-black text-primary font-mono">{monthlyTotal} <span className="text-[10px] text-primary/70">{currency}</span></span>
        </div>
        <div className="bg-surface hover:bg-surface-hover transition-colors p-3.5 rounded-2xl border border-surface-border flex flex-col justify-center relative overflow-hidden shadow-sm">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            {t('payments_total_pending') || 'Pending'}
          </span>
          <span className="text-lg font-black text-amber-500 font-mono">{totalAmountDue} <span className="text-[10px] text-amber-500/70">{currency}</span></span>
        </div>
        <div className="bg-surface hover:bg-surface-hover transition-colors p-3.5 rounded-2xl border border-surface-border flex flex-col justify-center relative overflow-hidden shadow-sm">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            Overdue
          </span>
          <span className="text-lg font-black text-red-500 font-mono">0 <span className="text-[10px] text-red-500/70">{currency}</span></span>
        </div>
        <div className="bg-surface hover:bg-surface-hover transition-colors p-3.5 rounded-2xl border border-surface-border flex flex-col justify-center relative overflow-hidden shadow-sm">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-indigo-500" />
            Expected
          </span>
          <span className="text-lg font-black text-indigo-500 font-mono">{totalAmountDue + monthlyTotal} <span className="text-[10px] text-indigo-500/70">{currency}</span></span>
        </div>
      </div>

      {/* REVENUE OVERVIEW CARD */}
      <div className="bg-gradient-to-br from-primary/5 via-surface to-surface border border-primary-border/20 p-4 rounded-2xl shadow-sm mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <TrendingUp className="w-24 h-24 text-primary" />
        </div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Revenue Overview</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <button 
            type="button"
            onClick={() => setSelectedGainPeriod('daily')} 
            className="flex flex-col items-center p-3 bg-surface hover:bg-primary-soft transition-colors rounded-xl border border-surface-border cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">{t('payments_daily_gain_title') || 'Today'}</span>
            <span className="text-base sm:text-lg font-black text-text-main font-mono">{dailyTotal}</span>
            <div className="mt-1.5 flex items-center justify-center text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full"><TrendingUp className="w-2.5 h-2.5 mr-0.5"/> +0%</div>
          </button>
          
          <button 
            type="button"
            onClick={() => setSelectedGainPeriod('weekly')} 
            className="flex flex-col items-center p-3 bg-surface hover:bg-primary-soft transition-colors rounded-xl border border-surface-border cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">{t('payments_weekly_gain_title') || 'Weekly'}</span>
            <span className="text-base sm:text-lg font-black text-text-main font-mono">{weeklyTotal}</span>
            <div className="mt-1.5 flex items-center justify-center text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full"><TrendingUp className="w-2.5 h-2.5 mr-0.5"/> +0%</div>
          </button>

          <button 
            type="button"
            onClick={() => setSelectedGainPeriod('monthly')} 
            className="flex flex-col items-center p-3 bg-surface hover:bg-primary-soft transition-colors rounded-xl border border-surface-border cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">{t('payments_monthly_gain_title') || 'Monthly'}</span>
            <span className="text-base sm:text-lg font-black text-text-main font-mono">{monthlyTotal}</span>
            <div className="mt-1.5 flex items-center justify-center text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full"><TrendingUp className="w-2.5 h-2.5 mr-0.5"/> +0%</div>
          </button>
        </div>
      </div>

      """

new_content = content[:start_idx] + new_top + content[end_idx:]
with open('src/components/PaymentsView.tsx', 'w') as f:
    f.write(new_content)

print("Replaced top banner.")
