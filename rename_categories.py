import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

def replace_cat(cat_id, new_en_title, new_en_sub):
    global content
    
    # We find the id: 'id' block
    pattern = rf"(id:\s*'{cat_id}' as SettingsCategory,\s*title:\s*_t\([^,]+,\s*)'[^']+'(.*?description:\s*_t\([^,]+,\s*)'[^']+'"
    
    # Replacement function
    def repl(m):
        return m.group(1) + "'" + new_en_title + "'" + m.group(2) + "'" + new_en_sub + "'"
        
    content = re.sub(pattern, repl, content, flags=re.DOTALL)


replace_cat('profile', 'Profile & Work Schedule', 'Personal information, contact details & weekly availability')
replace_cat('calendar', 'Lessons & Calendar', 'Lesson durations, meeting links & scheduling defaults')
replace_cat('payment', 'Payments & Finance', 'Financial information, transfer methods & payment sharing')
replace_cat('messages', 'Messages & Communication', 'Automated parent communication templates')
replace_cat('notifications', 'Notifications & Alerts', 'Reminders, lesson alerts & daily summaries')
replace_cat('language', 'Appearance & Language', 'Personalize the interface experience')
replace_cat('inspiration', 'Motivation & Gratitude', 'Daily inspiration and positive reminders')
replace_cat('backup', 'Data & Backup', 'Backup, restore and data management')
replace_cat('about', 'About', 'Application information and version details')

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
print("Renamed categories.")
