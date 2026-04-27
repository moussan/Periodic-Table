import os
import re

with open('src/routes/+page.svelte', 'r') as f:
    content = f.read()

# remove extra </div>
content = content.replace("</div>\n    </div>\n    \n    <!-- Conditionally render the ElementModal", "</div>\n    \n    <!-- Conditionally render the ElementModal")
content = content.replace("</main>\n</div>", "</main>\n")

with open('src/routes/+page.svelte', 'w') as f:
    f.write(content)
