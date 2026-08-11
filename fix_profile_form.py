import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Remove the display of start/end time in profile info
content = re.sub(r'<span className="text-\[11px\] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2\.5 py-0\.5 rounded-md">\s*\{startTime\} - \{endTime\}\s*</span>', '', content)

# Remove start/end time inputs from profile form
content = re.sub(r'<div className="space-y-1">\s*<label className="text-xs font-bold text-text-main">\{t\(\'settings_start_time\'\)\}</label>\s*<input\s*type="time"\s*value=\{startTime\}\s*onChange=\{\(e\) => setStartTime\(e\.target\.value\)\}\s*className="[^"]*"\s*/>\s*</div>', '', content)

content = re.sub(r'<div className="space-y-1">\s*<label className="text-xs font-bold text-text-main">\{t\(\'settings_end_time\'\)\}</label>\s*<input\s*type="time"\s*value=\{endTime\}\s*onChange=\{\(e\) => setEndTime\(e\.target\.value\)\}\s*className="[^"]*"\s*/>\s*</div>', '', content)

# Change grid-cols-1 sm:grid-cols-3 to sm:grid-cols-1 or whatever is appropriate since only currency remains
content = content.replace('<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">', '<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">')

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)

print("Fixed profile form")
