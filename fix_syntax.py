import re

with open('src/components/FreeTimeSlotsView.tsx', 'r') as f:
    content = f.read()

bad_string = "Please configure your weekly working hours in Settings to use the {language === 'ar' ? 'البحث الذكي عن الأوقات الفارغة' : language === 'de' ? 'Smarte Freizeitsuche' : 'Smart Free Time Finder'}."

good_string = "Please configure your weekly working hours in Settings to use the Smart Free Time Finder."

content = content.replace(bad_string, good_string)

with open('src/components/FreeTimeSlotsView.tsx', 'w') as f:
    f.write(content)

