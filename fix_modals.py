import os
import re

dir_path = 'src/components'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the outer wrapper: <div className="fixed inset-0 ... flex items-center justify-center ..."
    # We replace "items-center justify-center" with "items-end sm:items-center justify-center p-0 sm:p-4 pb-0 pt-safe-top"
    # and remove the old padding.
    
    # regex to match the fixed wrapper
    def replace_outer(m):
        classes = m.group(1)
        classes = re.sub(r'\bitems-center\b', 'items-end sm:items-center', classes)
        # remove existing padding classes
        classes = re.sub(r'\bp-[0-9]+\b', '', classes)
        classes = re.sub(r'\bsm:p-[0-9]+\b', '', classes)
        classes = re.sub(r'\bpt-\[[^\]]+\]\b', '', classes)
        classes = re.sub(r'\bpb-[0-9]+\b', '', classes)
        # add our custom padding
        classes += ' p-0 sm:p-4 pb-0'
        # ensure space formatting is clean
        classes = ' '.join(classes.split())
        return f'<div className="{classes}"'

    content = re.sub(r'<div className="([^"]*fixed inset-0[^"]*flex[^"]*items-center[^"]*)"', replace_outer, content)
    
    # For the inner container (the modal itself), it's usually the next div after the outer wrapper.
    # It usually has `rounded-xl` or `rounded-lg` or `rounded-2xl` and `w-full max-w-...`
    # Let's make it rounded on top only for mobile.
    content = re.sub(r'\brounded-xl\b', 'rounded-t-[24px] sm:rounded-xl', content, count=0)
    content = re.sub(r'\brounded-lg\b', 'rounded-t-[20px] sm:rounded-lg', content, count=0)
    # Be careful not to replace rounded-xl on buttons.
    # Actually, replacing all rounded-xl is dangerous because of buttons.
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk(dir_path):
    for file in files:
        if 'Modal' in file or file in ['ScheduleView.tsx', 'PaymentsView.tsx']:
            # Maybe just apply to all tsx
            pass

print("Done")
