import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# I will inject the helper function
helper = """
  // Helper for inline translations
  const _t = (ar: string, en: string, de: string) => {
    return language === 'ar' ? ar : language === 'de' ? de : en;
  };
"""

content = content.replace("const isRtl = language === 'ar';", "const isRtl = language === 'ar';\n" + helper)

# Now I'll do regex replacements.
# e.g., language === 'ar' ? 'اللغة والمظهر' : language === 'de' ? 'Sprache & Erscheinungsbild' : 'Language & Appearance'
pattern1 = r"language\s*===\s*'ar'\s*\?\s*('[^']*')\s*:\s*language\s*===\s*'de'\s*\?\s*('[^']*')\s*:\s*('[^']*')"
content = re.sub(pattern1, r"_t(\1, \3, \2)", content)

# e.g., language === 'ar' ? 'مفعلة' : 'Active'
# Wait, if there's no German, we can just do _t('مفعلة', 'Active', 'Aktiv') 
pattern2 = r"language\s*===\s*'ar'\s*\?\s*('[^']*')\s*:\s*('[^']*')"
# Actually, it's safer to just let the helper handle 2 args if we make the 3rd optional, but the helper needs 3.
# I'll update the helper:
helper_new = """
  // Helper for inline translations
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };
"""
content = content.replace(helper, helper_new)
content = re.sub(pattern2, r"_t(\1, \2)", content)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)

