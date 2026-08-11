import os
import re

dir_path = 'src/components'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # regex to match the fixed wrapper
    def replace_outer(m):
        classes = m.group(1)
        if 'items-end' in classes: return m.group(0) # already processed
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
    
    # Try to find the inner div. It's usually the next <div className="...">
    # We can use a regex that looks for the outer div, then the inner div.
    pattern = r'(<div className="[^"]*fixed inset-0[^"]*items-end sm:items-center[^"]*">\s*<div className="[^"]*)rounded-(xl|2xl|lg|md)'
    
    def replace_inner(m):
        prefix = m.group(1)
        radius = m.group(2)
        return f'{prefix}rounded-t-[28px] sm:rounded-{radius} pb-safe-bottom sm:pb-0 mb-0'

    content = re.sub(pattern, replace_inner, content)

    # Let's also add a small handle to the inner div for mobile
    # We can inject it right after the inner div opening
    pattern2 = r'(<div className="[^"]*fixed inset-0[^"]*items-end sm:items-center[^"]*">\s*<div className="[^"]*rounded-t-\[28px\][^"]*">)'
    def add_handle(m):
        if 'sm:hidden' in content[m.end():m.end()+100]: return m.group(0)
        handle = '\n        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />'
        return m.group(1) + handle

    content = re.sub(pattern2, add_handle, content)

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Done modals")
