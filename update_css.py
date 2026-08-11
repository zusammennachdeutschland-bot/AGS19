import re

with open('src/index.css', 'r') as f:
    css = f.read()

new_css = """
:root.accent-pink {
  --primary: var(--color-pink-500);
  --primary-hover: var(--color-pink-600);
  --primary-soft: color-mix(in srgb, var(--color-pink-500) 10%, transparent);
  --primary-border: color-mix(in srgb, var(--color-pink-500) 20%, transparent);
  --primary-glow: var(--color-pink-500);
}
.dark.accent-pink {
  --primary: var(--color-pink-500);
  --primary-hover: var(--color-pink-400);
  --primary-soft: color-mix(in srgb, var(--color-pink-500) 15%, transparent);
  --primary-border: color-mix(in srgb, var(--color-pink-500) 30%, transparent);
  --primary-glow: var(--color-pink-500);
}
:root.accent-lime {
  --primary: var(--color-lime-500);
  --primary-hover: var(--color-lime-600);
  --primary-soft: color-mix(in srgb, var(--color-lime-500) 10%, transparent);
  --primary-border: color-mix(in srgb, var(--color-lime-500) 20%, transparent);
  --primary-glow: var(--color-lime-500);
}
.dark.accent-lime {
  --primary: var(--color-lime-500);
  --primary-hover: var(--color-lime-400);
  --primary-soft: color-mix(in srgb, var(--color-lime-500) 15%, transparent);
  --primary-border: color-mix(in srgb, var(--color-lime-500) 30%, transparent);
  --primary-glow: var(--color-lime-500);
}

@theme {"""

css = css.replace("@theme {", new_css)

with open('src/index.css', 'w') as f:
    f.write(css)

print("Done")
