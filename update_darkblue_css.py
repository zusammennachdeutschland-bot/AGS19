import re

with open('src/index.css', 'r') as f:
    css = f.read()

new_css = """
:root.accent-darkblue {
  --primary: var(--color-blue-800);
  --primary-hover: var(--color-blue-900);
  --primary-soft: color-mix(in srgb, var(--color-blue-800) 10%, transparent);
  --primary-border: color-mix(in srgb, var(--color-blue-800) 20%, transparent);
  --primary-glow: var(--color-blue-800);
}
.dark.accent-darkblue {
  --primary: var(--color-blue-600);
  --primary-hover: var(--color-blue-500);
  --primary-soft: color-mix(in srgb, var(--color-blue-600) 15%, transparent);
  --primary-border: color-mix(in srgb, var(--color-blue-600) 30%, transparent);
  --primary-glow: var(--color-blue-600);
}

@theme {"""

css = css.replace("@theme {", new_css)

with open('src/index.css', 'w') as f:
    f.write(css)

print("Updated CSS")
