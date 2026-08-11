import os
import re

dir_path = 'src/components'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # We want to change 'text-xs' to 'text-sm' ONLY within className strings of <input, <select, <textarea
    # It's easier to just find the tags and replace inside them.
    
    def tag_replacer(match):
        tag_content = match.group(0)
        # replace text-xs with text-sm
        tag_content = re.sub(r'\btext-xs\b', 'text-sm', tag_content)
        # replace p-2 with p-2.5
        tag_content = re.sub(r'\bp-2\b', 'p-2.5', tag_content)
        # replace p-1.5 with p-2.5 (sometimes they are too small)
        tag_content = re.sub(r'\bp-1\.5\b', 'p-2.5', tag_content)
        return tag_content

    # Regex for <input ... >, <select ... >, <textarea ... >
    content = re.sub(r'<(input|select|textarea)[^>]*>', tag_replacer, content)

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Done inputs")
