/**
 * Selected Elements Store
 * Manages multi-element selection state for comparison and analysis
 */

import { writable, derived } from 'svelte/store';
import type { Element } from '../types/element';
import { loadSelectedElements, saveSelectedElements } from './persistence';

// Store for selected element numbers with persistence
export const selectedElementsStore = writable<number[]>(loadSelectedElements());

// Maximum number of elements that can be selected for comparison
export const MAX_SELECTED_ELEMENTS = 8;

// Actions for managing selected elements
export const selectElement = (elementNumber: number) => {
  selectedElementsStore.update(selected => {
    if (!selected.includes(elementNumber) && selected.length < MAX_SELECTED_ELEMENTS) {
      return [...selected, elementNumber];
    }
    return selected;
  });
};

export const deselectElement = (elementNumber: number) => {
  selectedElementsStore.update(selected => 
    selected.filter(num => num !== elementNumber)
  );
};

export const toggleElementSelection = (elementNumber: number) => {
  selectedElementsStore.update(selected => {
    if (selected.includes(elementNumber)) {
      return selected.filter(num => num !== elementNumber);
    } else {
      return [...selected, elementNumber];
    }
  });
};

export const clearSelection = () => {
  selectedElementsStore.set([]);
};

// Derived store for selection count
export const selectionCount = derived(
  selectedElementsStore,
  $selected => $selected.length
);

// Derived store for comparison mode availability
export const canCompare = derived(
  selectedElementsStore,
  $selected => $selected.length >= 2
);

// Derived store for selection limit status
export const isSelectionFull = derived(
  selectedElementsStore,
  $selected => $selected.length >= MAX_SELECTED_ELEMENTS
);

// Derived store for selection status
export const selectionStatus = derived(
  selectedElementsStore,
  $selected => ({
    count: $selected.length,
    max: MAX_SELECTED_ELEMENTS,
    canAdd: $selected.length < MAX_SELECTED_ELEMENTS,
    canCompare: $selected.length >= 2,
    isEmpty: $selected.length === 0,
    isFull: $selected.length >= MAX_SELECTED_ELEMENTS
  })
);

// Persist selected elements to localStorage
if (typeof window !== 'undefined') {
  selectedElementsStore.subscribe(selectedElements => {
    saveSelectedElements(selectedElements);
  });
}