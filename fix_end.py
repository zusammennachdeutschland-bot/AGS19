with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# We need to replace the last lines.
# Current: 
#      </div>
#       </div>
#     </div>
#   );
# };
#
# Correct:
#           </div>
#         )}
#       </div>
#     </div>
#   );
# };

import re

# Find the end
end_pattern = r"     </div>\n      </div>\n    </div>\n  \);\n};\n?$"

new_end = """          </div>
        )}
      </div>
    </div>
  );
};
"""
content = re.sub(end_pattern, new_end, content)

# Check if it was replaced
if not re.search(r"        \)\}\n      </div>\n    </div>\n  \);\n};\n?$", content):
    print("Could not fix the end of file via regex. Trying manual replace.")
    content = content.replace("     </div>\n      </div>\n    </div>\n  );\n};\n", new_end)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
print("Fixed end of file.")

