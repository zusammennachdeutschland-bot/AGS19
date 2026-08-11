import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # First, let's inject the helper function after the first `const { ..., language, ... } = useApp();`
    # Or just `const isRtl = ...`
    # Wait, some components might not have `isRtl`.
    # Let's just find `const { ..., t } = useApp();` and inject it there.
    
    helper = """
  // Helper for inline translations
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };
"""
    
    if "const _t =" not in content:
        # try to find useApp
        content = re.sub(r'(const \{[^}]*language[^}]*\} = useApp\(\);)', r'\1\n' + helper, content)
        # If language wasn't in useApp, it won't inject.
        
    pattern1 = r"language\s*===\s*'ar'\s*\?\s*('[^']*')\s*:\s*language\s*===\s*'de'\s*\?\s*('[^']*')\s*:\s*('[^']*')"
    content = re.sub(pattern1, r"_t(\1, \3, \2)", content)

    pattern2 = r"language\s*===\s*'ar'\s*\?\s*('[^']*')\s*:\s*('[^']*')"
    # Wait, pattern2 might match things like `currency = profile.currency || (language === 'ar' ? 'ج.م' : 'EGP')`
    content = re.sub(pattern2, r"_t(\1, \2)", content)

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Done")
