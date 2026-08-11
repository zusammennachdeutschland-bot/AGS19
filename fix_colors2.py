import os
import re

dir_path = 'src'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the bug from previous script: bg-primary-soft0 was generated from bg-color-500
    content = content.replace('bg-primary-soft0', 'bg-primary')
    content = content.replace('bg-primary0', 'bg-primary')
    
    # Let's also do a proper replacement for any remaining hardcoded colors with word boundaries
    colors = 'emerald|amber|rose|indigo|purple|teal|blue'
    
    # Backgrounds
    content = re.sub(fr'\bbg-({colors})-(50|100)\b', 'bg-primary-soft', content)
    content = re.sub(fr'\bdark:bg-({colors})-(900|950)\b', 'dark:bg-primary-soft', content)
    content = re.sub(fr'\bbg-({colors})-(500|600)\b', 'bg-primary', content)
    content = re.sub(fr'\bhover:bg-({colors})-(600|700)\b', 'hover:bg-primary-hover', content)
    
    # Backgrounds with opacity
    content = re.sub(fr'\bbg-({colors})-(50|100)\/([0-9]+)\b', 'bg-primary-soft', content)
    content = re.sub(fr'\bdark:bg-({colors})-(900|950)\/([0-9]+)\b', 'dark:bg-primary-soft', content)
    content = re.sub(fr'\bbg-({colors})-(500|600)\/([0-9]+)\b', r'bg-primary/\3', content)
    content = re.sub(fr'\bdark:bg-({colors})-(500|600)\/([0-9]+)\b', r'dark:bg-primary/\3', content)
    content = re.sub(fr'\bhover:bg-({colors})-(500|600)\/([0-9]+)\b', r'hover:bg-primary-hover/\3', content)

    # Texts
    content = re.sub(fr'\btext-({colors})-(500|600|700|800|900|950)\b', 'text-primary', content)
    content = re.sub(fr'\bdark:text-({colors})-(100|200|300|400|500)\b', 'dark:text-primary', content)
    
    # Texts with opacity
    content = re.sub(fr'\btext-({colors})-(500|600|700|800|900|950)\/([0-9]+)\b', r'text-primary/\3', content)
    content = re.sub(fr'\bdark:text-({colors})-(100|200|300|400|500)\/([0-9]+)\b', r'dark:text-primary/\3', content)
    
    # Borders
    content = re.sub(fr'\bborder-({colors})-(200|300|400|500|600)\b', 'border-primary-border', content)
    content = re.sub(fr'\bdark:border-({colors})-(400|500|600|700|800|900|950)\b', 'dark:border-primary-border', content)
    
    # Borders with opacity
    content = re.sub(fr'\bborder-({colors})-(200|300|400|500|600)\/([0-9]+)\b', r'border-primary-border', content)
    content = re.sub(fr'\bdark:border-({colors})-(400|500|600|700|800|900|950)\/([0-9]+)\b', r'dark:border-primary-border', content)
    
    # Rings
    content = re.sub(fr'\bring-({colors})-(200|300|400|500|600)\b', 'ring-primary', content)
    content = re.sub(fr'\bdark:ring-({colors})-(400|500|600|700|800|900|950)\b', 'dark:ring-primary', content)

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done phase 2")
