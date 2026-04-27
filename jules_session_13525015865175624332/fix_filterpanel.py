import os

with open('src/lib/components/FilterPanel.svelte', 'r') as f:
    content = f.read()

content = content.replace("property: keyof PropertyRanges", "property: keyof import('../types/element').PropertyRanges")

with open('src/lib/components/FilterPanel.svelte', 'w') as f:
    f.write(content)
