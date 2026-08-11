import os
import re

dir_path = 'src/components'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to replace semantic colors with primary ones.
    # Backgrounds
    content = re.sub(r'bg-(emerald|amber|rose|indigo|purple|teal)-(50|100)(\/[0-9]+)?', 'bg-primary-soft', content)
    content = re.sub(r'dark:bg-(emerald|amber|rose|indigo|purple|teal)-(900|950)(\/[0-9]+)?', 'dark:bg-primary-soft', content)
    
    # Text
    content = re.sub(r'text-(emerald|amber|rose|indigo|purple|teal)-(600|700|800|900|950)', 'text-primary', content)
    content = re.sub(r'dark:text-(emerald|amber|rose|indigo|purple|teal)-(100|200|300|400)', 'dark:text-primary', content)
    content = re.sub(r'text-(emerald|amber|rose|indigo|purple|teal)-500', 'text-primary', content)
    
    # Borders
    content = re.sub(r'border-(emerald|amber|rose|indigo|purple|teal)-(200|300)(\/[0-9]+)?', 'border-primary-border', content)
    content = re.sub(r'dark:border-(emerald|amber|rose|indigo|purple|teal)-(800|900|950)(\/[0-9]+)?', 'dark:border-primary-border', content)
    
    # Solid Backgrounds
    content = re.sub(r'bg-(emerald|amber|rose|indigo|purple|teal)-500(\/[0-9]+)?', 'bg-primary', content)
    content = re.sub(r'bg-(emerald|amber|rose|indigo|purple|teal)-600', 'bg-primary', content)
    content = re.sub(r'hover:bg-(emerald|amber|rose|indigo|purple|teal)-700', 'hover:bg-primary-hover', content)
    content = re.sub(r'active:bg-(emerald|amber|rose|indigo|purple|teal)-800', 'active:scale-95', content)
    
    # Gradients
    content = re.sub(r'from-(emerald|amber|rose|indigo|purple|teal|blue)-(500|600)', 'from-primary', content)
    content = re.sub(r'to-(emerald|amber|rose|indigo|purple|teal|blue)-(600|700)', 'to-primary-hover', content)
    content = re.sub(r'via-(emerald|amber|rose|indigo|purple|teal|blue)-(600)', 'via-primary', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

# Also run on App.tsx and Context if needed
process_file('src/App.tsx')

print("Done")
