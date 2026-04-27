import os

with open('src/lib/components/ConfirmDialog.svelte', 'r') as f:
    content = f.read()
    
content = content.replace('<div class="dialog glass" role="dialog" tabindex="-1" on:click|stopPropagation>', '<div class="dialog glass" role="dialog" on:click|stopPropagation>')

with open('src/lib/components/ConfirmDialog.svelte', 'w') as f:
    f.write(content)
    
with open('src/lib/components/FilterPresetManager.svelte', 'r') as f:
    content = f.read()

content = content.replace('<div class="preset-manager glass" role="dialog" tabindex="-1" on:click|stopPropagation>', '<div class="preset-manager glass" role="dialog" on:click|stopPropagation>')

with open('src/lib/components/FilterPresetManager.svelte', 'w') as f:
    f.write(content)
    
with open('src/lib/components/visualizations/OrbitalViewer.svelte', 'r') as f:
    content = f.read()
    
content = content.replace('<div class="orbital-cell" on:click={() => {selectedOrbitalType = orb.type; activeTab = \'3d\';}}>', '<button class="orbital-cell" on:click={() => {selectedOrbitalType = orb.type; activeTab = \'3d\';}}>')
content = content.replace('</div>\n                      {/if}\n                    {/each}', '</button>\n                      {/if}\n                    {/each}')

with open('src/lib/components/visualizations/OrbitalViewer.svelte', 'w') as f:
    f.write(content)
