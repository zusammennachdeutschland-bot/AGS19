import re

with open('src/components/AvailableTodayWidget.tsx', 'r') as f:
    content = f.read()

content = content.replace(">Free Hours<", ">{language === 'ar' ? 'ساعات فارغة' : language === 'de' ? 'Freie Stunden' : 'Free Hours'}<")
content = content.replace(">Slots (1h)<", ">{language === 'ar' ? 'فترات (١س)' : language === 'de' ? 'Slots (1h)' : 'Slots (1h)'}<")
content = content.replace(">Next Slot<", ">{language === 'ar' ? 'التالي' : language === 'de' ? 'Nächster' : 'Next Slot'}<")
content = content.replace("export const AvailableTodayWidget: React.FC = () => {", "export const AvailableTodayWidget: React.FC = () => {\n  const { language } = useApp();")

with open('src/components/AvailableTodayWidget.tsx', 'w') as f:
    f.write(content)


with open('src/components/FreeTimeSlotsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("Weekly Working Hours Not Set", "{language === 'ar' ? 'لم يتم تعيين ساعات العمل' : language === 'de' ? 'Arbeitszeiten nicht festgelegt' : 'Weekly Working Hours Not Set'}")
content = content.replace("Please configure your weekly working hours in Settings to use the Smart Free Time Finder.", "{language === 'ar' ? 'يرجى ضبط ساعات العمل الأسبوعية في الإعدادات.' : language === 'de' ? 'Bitte Arbeitszeiten in den Einstellungen konfigurieren.' : 'Please configure your weekly working hours in Settings to use the Smart Free Time Finder.'}")
content = content.replace("Smart Free Time Finder", "{language === 'ar' ? 'البحث الذكي عن الأوقات الفارغة' : language === 'de' ? 'Smarte Freizeitsuche' : 'Smart Free Time Finder'}")
content = content.replace(">Automatically finds available slots based on your schedule.<", ">{language === 'ar' ? 'يبحث تلقائياً عن الفترات المتاحة.' : language === 'de' ? 'Findet automatisch verfügbare Zeiten.' : 'Automatically finds available slots based on your schedule.'}<")
content = content.replace("{ id: 'today', label: 'Today' }", "{ id: 'today', label: language === 'ar' ? 'اليوم' : language === 'de' ? 'Heute' : 'Today' }")
content = content.replace("{ id: 'tomorrow', label: 'Tomorrow' }", "{ id: 'tomorrow', label: language === 'ar' ? 'غداً' : language === 'de' ? 'Morgen' : 'Tomorrow' }")
content = content.replace("{ id: 'this_week', label: 'This Week' }", "{ id: 'this_week', label: language === 'ar' ? 'هذا الأسبوع' : language === 'de' ? 'Diese Woche' : 'This Week' }")
content = content.replace("{ id: 'specific_day', label: 'Specific Day' }", "{ id: 'specific_day', label: language === 'ar' ? 'يوم محدد' : language === 'de' ? 'Bestimmter Tag' : 'Specific Day' }")
content = content.replace("Continuous Periods", "{language === 'ar' ? 'فترات متصلة' : language === 'de' ? 'Zusammenhängende Zeit' : 'Continuous Periods'}")
content = content.replace("Bookable Slots", "{language === 'ar' ? 'أوقات قابلة للحجز' : language === 'de' ? 'Buchbare Slots' : 'Bookable Slots'}")
content = content.replace(">Duration:<", ">{language === 'ar' ? 'المدة:' : language === 'de' ? 'Dauer:' : 'Duration:'}<")
content = content.replace("No free time found for the selected period.", "{language === 'ar' ? 'لا يوجد أوقات فارغة' : language === 'de' ? 'Keine freie Zeit gefunden.' : 'No free time found for the selected period.'}")
content = content.replace("{displayMode === 'periods' ? 'Periods' : 'Slots'}", "{displayMode === 'periods' ? (language === 'ar' ? 'فترات' : 'Periods') : (language === 'ar' ? 'مواعيد' : 'Slots')}")
content = content.replace("Fully booked or off day.", "{language === 'ar' ? 'محجوز بالكامل أو يوم عطلة.' : language === 'de' ? 'Ausgebucht oder freier Tag.' : 'Fully booked or off day.'}")

with open('src/components/FreeTimeSlotsView.tsx', 'w') as f:
    f.write(content)

print("Translations applied")
