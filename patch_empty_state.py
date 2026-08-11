import re

with open('src/components/PaymentsView.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('filteredDueCycles.length === 0 ? (')
if start_idx != -1:
    end_idx = content.find(') : (', start_idx)
    old_empty_state = content[start_idx:end_idx+5]

    new_empty_state = """filteredDueCycles.length === 0 ? (
            <div className="py-12 sm:py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
                <div className="w-20 h-20 bg-primary-soft dark:bg-primary-soft text-primary rounded-3xl flex items-center justify-center mx-auto relative z-10 shadow-sm border border-primary-border/30 rotate-3">
                  <CheckCircle2 className="w-10 h-10 -rotate-3" />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-base sm:text-lg font-black text-text-main tracking-tight">
                  {t('payments_no_due_title') || t('payments_no_due')}
                </h3>
                <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                  {t('payments_no_due_desc') || t('payments_no_due_sub')}
                </p>
              </div>
            </div>
          ) : ("""
    
    content = content.replace(old_empty_state, new_empty_state)

    with open('src/components/PaymentsView.tsx', 'w') as f:
        f.write(content)
    print("Patched empty state")
else:
    print("Could not find empty state")
