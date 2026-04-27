import os
import re

with open('src/lib/components/FilterPanel.svelte', 'r') as f:
    content = f.read()

# Revert the typecast inside Svelte template since it's not supported by Svelte parser
content = content.replace("handlePropertyRangeChange(property as keyof PropertyRanges)", "handlePropertyRangeChange(property)")

with open('src/lib/components/FilterPanel.svelte', 'w') as f:
    f.write(content)
