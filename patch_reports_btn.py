import re

with open('src/components/ReportsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState, useMemo } from 'react';", "import React, { useState, useMemo } from 'react';\nimport { FinancialDebugModal } from './FinancialDebugModal';")

content = content.replace("const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});", "const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});\n  const [showDebugModal, setShowDebugModal] = useState(false);")

btn = """          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-main hover:bg-surface-hover rounded-xl text-xs font-bold border border-surface-border transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Drucken / PDF</span>
          </button>"""

new_btn = btn + """
          <button
            onClick={() => setShowDebugModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold border border-emerald-500/20 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Finanzen Debug</span>
          </button>"""

content = content.replace(btn, new_btn)

modal = """      {/* Revenue & Attendance Visual Charts */}"""
new_modal = """      {showDebugModal && <FinancialDebugModal onClose={() => setShowDebugModal(false)} />}
      {/* Revenue & Attendance Visual Charts */}"""

content = content.replace(modal, new_modal)

with open('src/components/ReportsView.tsx', 'w') as f:
    f.write(content)

