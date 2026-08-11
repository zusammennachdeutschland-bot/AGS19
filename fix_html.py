import re

with open('index.html', 'r') as f:
    content = f.read()

fonts = """    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300..900&family=Plus+Jakarta+Sans:wght@300..800&display=swap" rel="stylesheet">"""

content = content.replace("</title>", "</title>\n" + fonts)

with open('index.html', 'w') as f:
    f.write(content)
