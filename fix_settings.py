import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Fix updateProfile calls
content = re.sub(r'workingHours:\s*\{\s*workingDays,\s*startTime,\s*endTime\s*\}', 'weeklyWorkingHours', content)

# Remove toggleWorkingDay
content = re.sub(r'  const toggleWorkingDay = \(dayNum: number\) => \{\n.*?  \};\n', '', content, flags=re.DOTALL)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)

print("Fixed updateProfile and toggleWorkingDay")
