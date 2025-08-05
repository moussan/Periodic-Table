/**
 * User Preferences Store
 * Manages user settings with localStorage persistence
 */

import { writable, derived } from 'svelte/store';
import type { UserPreferences } from '../types/element';
import { loadUserPreferences, saveUserPreferences } from './persistence';

// Default user preferences
const defaultPreferences: UserPreferences = {
  theme: 'dark',
  animations_enabled: true,
  reduced_motion: false,
  high_contrast: false,
  font_size: 'medium',
  default_units: 'metric',
  language: 'en'
};

// Create the store with persisted values
export const userPreferencesStore = writable<UserPreferences>(loadUserPreferences());

// Derived stores for specific preferences
export const themeStore = derived(
  userPreferencesStore,
  $preferences => $preferences.theme
);

export const animationsEnabledStore = derived(
  userPreferencesStore,
  $preferences => $preferences.animations_enabled
);

export const reducedMotionStore = derived(
  userPreferencesStore,
  $preferences => $preferences.reduced_motion
);

export const highContrastStore = derived(
  userPreferencesStore,
  $preferences => $preferences.high_contrast
);

export const fontSizeStore = derived(
  userPreferencesStore,
  $preferences => $preferences.font_size
);

export const defaultUnitsStore = derived(
  userPreferencesStore,
  $preferences => $preferences.default_units
);

export const languageStore = derived(
  userPreferencesStore,
  $preferences => $preferences.language
);

// Actions for managing preferences
export const updatePreferences = (updates: Partial<UserPreferences>) => {
  userPreferencesStore.update(current => {
    const newPreferences = { ...current, ...updates };
    saveUserPreferences(newPreferences);
    return newPreferences;
  });
};

export const updateTheme = (theme: UserPreferences['theme']) => {
  updatePreferences({ theme });
};

export const toggleAnimations = () => {
  userPreferencesStore.update(current => {
    const newPreferences = {
      ...current,
      animations_enabled: !current.animations_enabled
    };
    saveUserPreferences(newPreferences);
    return newPreferences;
  });
};

export const toggleReducedMotion = () => {
  userPreferencesStore.update(current => {
    const newPreferences = {
      ...current,
      reduced_motion: !current.reduced_motion
    };
    saveUserPreferences(newPreferences);
    return newPreferences;
  });
};

export const toggleHighContrast = () => {
  userPreferencesStore.update(current => {
    const newPreferences = {
      ...current,
      high_contrast: !current.high_contrast
    };
    saveUserPreferences(newPreferences);
    return newPreferences;
  });
};

export const updateFontSize = (font_size: UserPreferences['font_size']) => {
  updatePreferences({ font_size });
};

export const updateDefaultUnits = (default_units: UserPreferences['default_units']) => {
  updatePreferences({ default_units });
};

export const updateLanguage = (language: string) => {
  updatePreferences({ language });
};

export const resetPreferences = () => {
  userPreferencesStore.set(defaultPreferences);
  saveUserPreferences(defaultPreferences);
};

// Persist preferences to localStorage when they change
if (typeof window !== 'undefined') {
  userPreferencesStore.subscribe(preferences => {
    saveUserPreferences(preferences);
  });
}

// Apply theme changes to document
if (typeof window !== 'undefined') {
  themeStore.subscribe(theme => {
    if (theme === 'auto') {
      // Use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      
      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup function would be needed in a real component
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  });
  
  // Apply reduced motion preference
  reducedMotionStore.subscribe(reducedMotion => {
    if (reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  });
  
  // Apply high contrast preference
  highContrastStore.subscribe(highContrast => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  });
  
  // Apply font size preference
  fontSizeStore.subscribe(fontSize => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  });
}