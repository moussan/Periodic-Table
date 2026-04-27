/**
 * Svelte Stores for Advanced Periodic Table
 * Centralized state management with reactive data flow
 */

export { 
  selectedElementsStore, 
  selectElement, 
  deselectElement, 
  clearSelection, 
  toggleElementSelection,
  selectionCount,
  canCompare,
  isSelectionFull,
  selectionStatus,
  MAX_SELECTED_ELEMENTS
} from './selectedElements';

export { 
  filterStore, 
  updateFilter, 
  resetFilters, 
  addSearchToHistory, 
  updateSearchTerm, 
  addCategory, 
  removeCategory, 
  toggleCategory,
  addPeriod,
  removePeriod,
  togglePeriod,
  addGroup,
  removeGroup,
  toggleGroup,
  toggleBlock,
  togglePhase,
  updatePropertyRange,
  activeFiltersCount,
  hasActiveFilters,
  filterSummary,
  filterPresets,
  applyFilterPreset,
  saveCurrentFiltersAsPreset,
  searchHistoryStore
} from './filters';

export { 
  appStateStore, 
  setViewMode, 
  setActiveModal, 
  updateAppState, 
  openModal, 
  closeModal,
  viewModeStore,
  activeModalStore,
  isModalOpen,
  isSpecificModalOpen,
  loadingStore,
  setLoading,
  errorStore,
  setError,
  clearError,
  clearAllErrors,
  notificationStore,
  addNotification,
  removeNotification,
  clearAllNotifications,
  performanceStore,
  updatePerformanceMetric
} from './appState';

export { 
  userPreferencesStore, 
  updatePreferences, 
  resetPreferences, 
  updateTheme, 
  toggleAnimations,
  themeStore,
  animationsEnabledStore,
  reducedMotionStore,
  highContrastStore,
  fontSizeStore,
  defaultUnitsStore,
  languageStore,
  toggleReducedMotion,
  toggleHighContrast,
  updateFontSize,
  updateDefaultUnits,
  updateLanguage
} from './userPreferences';

export { 
  elementsStore, 
  loadElements, 
  updateElementData, 
  filteredElementsStore, 
  elementsWithSelectionStore,
  elementCategoriesStore,
  availablePeriodsStore,
  availableGroupsStore,
  availableBlocksStore,
  availablePhasesStore,
  getElementByNumber,
  getElementBySymbol,
  searchElements,
  elementStatsStore,
  elementsLoadingStore,
  elementsErrorStore
} from './elements';

export { 
  initializeStores, 
  selectedElementsData,
  elementComparisonData,
  setupReactiveDataFlow
} from './init';
export * from './persistence';