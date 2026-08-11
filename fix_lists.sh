sed -i 's/hover:shadow-xs transition-all flex items-center/hover:shadow-xs active:scale-[0.99] active:bg-surface-hover transition-all flex items-center/g' src/components/StudentsView.tsx
sed -i 's/hover:bg-background\/20 transition-all/hover:bg-background\/20 active:scale-[0.99] active:bg-surface-hover transition-all/g' src/components/SessionHistoryView.tsx
sed -i 's/p-1.5 rounded-xl border transition-all cursor-pointer/p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 active:bg-surface-hover/g' src/components/ScheduleView.tsx
