import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Extract the categoryCards array block
match = re.search(r"  const categoryCards = \[\s*(.*?)\s*\];\s*// Helper Header Component", content, re.DOTALL)
if not match:
    print("Could not find categoryCards")
    exit(1)

category_cards_block = match.group(1)

# We can split the block by `    {` assuming each item starts with that.
items = category_cards_block.split("    {")
# Remove empty strings
items = [item for item in items if item.strip()]

# Re-add the "    {" to the beginning of each item
items = ["    {" + item for item in items]

# Extract ID for each item to sort them
def get_id(item):
    id_match = re.search(r"id:\s*'([^']+)'", item)
    return id_match.group(1) if id_match else ""

items_dict = {get_id(item): item for item in items}

desired_order = [
    'profile',
    'calendar',
    'payment',
    'messages',
    'notifications',
    'language',
    'inspiration',
    'backup',
    'about'
]

new_items_list = []
for cid in desired_order:
    if cid in items_dict:
        new_items_list.append(items_dict[cid])

# Re-join
new_category_cards_block = ",\n".join(new_items_list)
# One item might end with a comma, or not. The split might have kept the comma for some.
# Let's cleanly rebuild.

