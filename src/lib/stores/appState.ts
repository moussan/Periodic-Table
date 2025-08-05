/**
 * Application State Store
 * Manages global application state and UI modes
 */

import { writable, derived } from 'svelte/store';
import type { AppState } from '../types/element';

// Default application state
const defaultAppState: AppState = {
  selectedElements: [],
  filterCriteria: {
    searchTerm: '',
    categories: [],
    propertyRanges: {
      atomic_mass: null,
      melting_point: null,
      boiling_point: null,
      density: null,
      electronegativity: null,
      ionization_energy: null,
      atomic_radius: null
    },
    periods: [],
    groups: [],
    blocks: [],
    phases: [],
    discoveryYear: null,
    hasIsotopes: null,
    hasCompounds: null
  },
  viewMode: 'table',
  activeModal: null,
  searchHistory: [],
  userPreferences: {
    theme: 'dark',
    animations_enabled: true,
    reduced_motion: false,
    high_contrast: false,
    font_size: 'medium',
    default_units: 'metric',
    language: 'en'
  }
};

// Main application state store
export const appStateStore = writable<AppState>(defaultAppState);

// Derived stores for specific parts of the state
export const viewModeStore = derived(
  appStateStore,
  $appState => $appState.viewMode
);

export const activeModalStore = derived(
  appStateStore,
  $appState => $appState.activeModal
);

// Actions for managing application state
export const updateAppState = (updates: Partial<AppState>) => {
  appStateStore.update(current => ({
    ...current,
    ...updates
  }));
};

export const setViewMode = (viewMode: AppState['viewMode']) => {
  appStateStore.update(current => ({
    ...current,
    viewMode
  }));
};

export const setActiveModal = (modalId: string | null) => {
  appStateStore.update(current => ({
    ...current,
    activeModal: modalId
  }));
};

export const openModal = (modalId: string) => {
  setActiveModal(modalId);
};

export const closeModal = () => {
  setActiveModal(null);
};

// Derived store for modal state
export const isModalOpen = derived(
  activeModalStore,
  $activeModal => $activeModal !== null
);

export const isSpecificModalOpen = (modalId: string) => derived(
  activeModalStore,
  $activeModal => $activeModal === modalId
);

// Loading state management
export const loadingStore = writable<{
  elements: boolean;
  externalData: boolean;
  search: boolean;
}>({
  elements: false,
  externalData: false,
  search: false
});

export const setLoading = (key: keyof typeof defaultAppState, isLoading: boolean) => {
  loadingStore.update(current => ({
    ...current,
    [key]: isLoading
  }));
};

// Error state management
export const errorStore = writable<{
  elements: string | null;
  externalData: string | null;
  search: string | null;
}>({
  elements: null,
  externalData: null,
  search: null
});

export const setError = (key: string, error: string | null) => {
  errorStore.update(current => ({
    ...current,
    [key]: error
  }));
};

export const clearError = (key: string) => {
  setError(key, null);
};

export const clearAllErrors = () => {
  errorStore.set({
    elements: null,
    externalData: null,
    search: null
  });
};

// Notification system
export const notificationStore = writable<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}[]>([]);

export const addNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  duration: number = 5000
) => {
  const id = Math.random().toString(36).substr(2, 9);
  const notification = { id, type, message, duration };
  
  notificationStore.update(notifications => [...notifications, notification]);
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
  
  return id;
};

export const removeNotification = (id: string) => {
  notificationStore.update(notifications => 
    notifications.filter(n => n.id !== id)
  );
};

export const clearAllNotifications = () => {
  notificationStore.set([]);
};

// Performance monitoring
export const performanceStore = writable<{
  renderTime: number;
  searchTime: number;
  filterTime: number;
  lastUpdate: string;
}>({
  renderTime: 0,
  searchTime: 0,
  filterTime: 0,
  lastUpdate: new Date().toISOString()
});

export const updatePerformanceMetric = (metric: string, time: number) => {
  performanceStore.update(current => ({
    ...current,
    [metric]: time,
    lastUpdate: new Date().toISOString()
  }));
};