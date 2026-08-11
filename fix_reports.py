import re

with open('src/components/ReportsView.tsx', 'r') as f:
    content = f.read()

# Fix broken import
content = content.replace("import { import { BarChart", "import { BarChart")

# Add missing imports
if "calculateFinancialsForLessons" not in content[:500]:
    content = content.replace("import { Lesson } from '../types';", "import { Lesson } from '../types';\nimport { calculateFinancialsForLessons } from '../utils/financeUtils';\nimport { FinancialDebugModal } from './FinancialDebugModal';")

# Add groups, students, payments to useApp
if "const { lessons, updateLesson, profile, openLessonControl, t } = useApp();" in content:
    content = content.replace(
        "const { lessons, updateLesson, profile, openLessonControl, t } = useApp();",
        "const { lessons, updateLesson, profile, openLessonControl, t, groups, students, payments } = useApp();\n  const [showDebugModal, setShowDebugModal] = useState(false);"
    )

with open('src/components/ReportsView.tsx', 'w') as f:
    f.write(content)

