import os
import re

with open('src/routes/+page.svelte', 'r') as f:
    content = f.read()

# remove extra </main>
content = content.replace("        </main>\n</div>", "      </div>\n    </div>\n")

with open('src/routes/+page.svelte', 'w') as f:
    f.write(content)
