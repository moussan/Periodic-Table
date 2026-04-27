import os
import re

with open('src/routes/+page.svelte', 'r') as f:
    content = f.read()

# fix trailing unclosed div issue
content = content.replace("</div>\n    \n    <!-- Conditionally render the ElementModal", "  </main>\n</div>\n\n<!-- Conditionally render the ElementModal")
content = content.replace("  </main>\n</div>\n\n<style>", "<style>")

with open('src/routes/+page.svelte', 'w') as f:
    f.write(content)
