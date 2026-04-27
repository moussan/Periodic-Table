import os
import re

def fix_unused_css(content):
    # This is a naive regex-based removal that might not be perfect for nested CSS,
    # but it handles the straightforward warnings found in the build output.
    css_classes_to_remove = [
        "\\.orbitals-sidebyside", "\\.filter-toggle:hover", "\\.filter-count", 
        "\\.reset-button:hover", "\\.summary-chip", "\\.manage-presets-button:hover",
        "\\.preset-button:hover", "\\.preset-button", "\\.manage-presets-button",
        "\\.reset-button", "\\.filter-toggle", "\\.close-button:hover", 
        "\\.close-button", "\\.save-preset-button", "\\.delete-button:hover",
        "\\.delete-button", "\\.compounds-overview", "\\.compound-card:hover",
        "\\.compound-card", "\\.clear-button:hover", "\\.reset-filters-btn",
        "\\.clear-button"
    ]
    
    # We will just suppress unused CSS warnings globally for simplicity in Svelte components
    # since removing CSS with regex can be tricky. It's better to just leave the unused CSS
    # or remove the elements manually if they are unused.
    
    # A safer approach is to suppress warnings for now if they are just warnings.
    # Let's focus on the TS error in FilterPanel.svelte.
    return content

def fix_ts_error(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix the typing issue in handlePropertyRangeToggle and handlePropertyRangeChange
    content = content.replace("property: keyof import('$lib/stores/filters').FilterCriteria['propertyRanges']", "property: keyof PropertyRanges")
    
    with open(filepath, 'w') as f:
        f.write(content)

def fix_a11y_warnings(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    # OrbitAnimationModal.svelte fixes
    if "OrbitAnimationModal" in filepath:
        content = content.replace('<div class="orbital-cell"', '<div class="orbital-cell" role="button" tabindex="0" on:keydown={(e) => { if(e.key === \'Enter\' || e.key === \' \') { selectedOrbitalType = orb.type; activeTab = \'3d\'; } }}')
        content = content.replace('<div\n    class="modal-content"', '<div role="document" tabindex="-1"\n    class="modal-content"')
        content = content.replace('<div class="modal-backdrop" on:click={close}', '<div class="modal-backdrop" on:click={close} on:keydown={(e) => { if(e.key === \'Escape\') close(); }}')

    # FilterPresetManager.svelte fixes
    if "FilterPresetManager" in filepath:
        content = content.replace('<div class="preset-manager-overlay" on:click={() => isOpen = false}>', '<div class="preset-manager-overlay" role="button" tabindex="0" on:keydown={(e) => { if(e.key === \'Enter\' || e.key === \' \') isOpen = false; }} on:click={() => isOpen = false}>')
        content = content.replace('<div class="preset-manager glass" on:click|stopPropagation>', '<div class="preset-manager glass" role="dialog" tabindex="-1" on:click|stopPropagation>')

    # ConfirmDialog.svelte fixes
    if "ConfirmDialog" in filepath:
        content = content.replace('<div class="dialog-overlay" on:click={handleCancel} on:keydown={handleKeydown}>', '<div class="dialog-overlay" role="presentation" on:click={handleCancel} on:keydown={handleKeydown}>')
        content = content.replace('<div class="dialog glass" on:click|stopPropagation>', '<div class="dialog glass" role="dialog" tabindex="-1" on:click|stopPropagation>')

    with open(filepath, 'w') as f:
        f.write(content)

fix_ts_error('src/lib/components/FilterPanel.svelte')
fix_a11y_warnings('src/lib/OrbitAnimationModal.svelte')
fix_a11y_warnings('src/lib/components/FilterPresetManager.svelte')
fix_a11y_warnings('src/lib/components/ConfirmDialog.svelte')
print("Fixes applied.")
