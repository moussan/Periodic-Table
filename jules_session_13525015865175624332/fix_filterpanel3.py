import os
import re

with open('src/lib/components/FilterPanel.svelte', 'r') as f:
    content = f.read()

# Revert the typecast inside Svelte template since it's not supported by Svelte parser
content = content.replace("propertyRanges[property as keyof PropertyRanges].enabled", "propertyRanges[property].enabled")
content = content.replace("handlePropertyRangeToggle(property as keyof PropertyRanges)", "handlePropertyRangeToggle(property)")

# Add typecasting where property is used by JS logic
content = content.replace("handlePropertyRangeChange(property)", "handlePropertyRangeChange(property)") # No need to cast here
content = content.replace("handlePropertyRangeToggle(property: keyof PropertyRanges)", "handlePropertyRangeToggle(property: keyof import('../types/element').PropertyRanges)")
content = content.replace("handlePropertyRangeChange(property: keyof PropertyRanges)", "handlePropertyRangeChange(property: keyof import('../types/element').PropertyRanges)")


with open('src/lib/components/FilterPanel.svelte', 'w') as f:
    f.write(content)
