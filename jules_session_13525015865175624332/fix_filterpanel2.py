import os
import re

with open('src/lib/components/FilterPanel.svelte', 'r') as f:
    content = f.read()

# Fix the type issues in the Svelte template
content = content.replace("handlePropertyRangeToggle(property)", "handlePropertyRangeToggle(property as keyof PropertyRanges)")
content = content.replace("handlePropertyRangeChange(property)", "handlePropertyRangeChange(property as keyof PropertyRanges)")
content = content.replace("propertyRanges[property].enabled", "propertyRanges[property as keyof PropertyRanges].enabled")

with open('src/lib/components/FilterPanel.svelte', 'w') as f:
    f.write(content)
