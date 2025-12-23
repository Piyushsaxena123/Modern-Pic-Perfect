// Local storage utilities for storing user data and preferences

const STORAGE_KEYS = {
  USER_PROFILE: 'picperfect_user_profile',
  EDITING_HISTORY: 'picperfect_editing_history',
  FAVORITE_PRESETS: 'picperfect_favorite_presets',
  APP_SETTINGS: 'picperfect_app_settings',
} as const;

// User Profile
export interface LocalUserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Editing History
export interface LocalEditingHistory {
  id: string;
  toolType: string;
  originalImageUrl?: string;
  editedImageUrl?: string;
  settings?: Record<string, any>;
  createdAt: string;
}

// Favorite Preset
export interface LocalFavoritePreset {
  id: string;
  name: string;
  toolType: string;
  settings: Record<string, any>;
  createdAt: string;
}

// App Settings
export interface LocalAppSettings {
  theme: 'light' | 'dark' | 'system';
  autoSaveHistory: boolean;
  maxHistoryItems: number;
  defaultQuality: number;
}

const DEFAULT_SETTINGS: LocalAppSettings = {
  theme: 'dark',
  autoSaveHistory: true,
  maxHistoryItems: 50,
  defaultQuality: 80,
};

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// User Profile Functions
export function getLocalUserProfile(): LocalUserProfile | null {
  return getItem<LocalUserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
}

export function saveLocalUserProfile(profile: LocalUserProfile): void {
  setItem(STORAGE_KEYS.USER_PROFILE, { ...profile, updatedAt: new Date().toISOString() });
}

export function createLocalUserProfile(email: string, fullName?: string): LocalUserProfile {
  const profile: LocalUserProfile = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    fullName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveLocalUserProfile(profile);
  return profile;
}

export function deleteLocalUserProfile(): void {
  removeItem(STORAGE_KEYS.USER_PROFILE);
}

// Editing History Functions
export function getEditingHistory(): LocalEditingHistory[] {
  return getItem<LocalEditingHistory[]>(STORAGE_KEYS.EDITING_HISTORY, []);
}

export function addToEditingHistory(entry: Omit<LocalEditingHistory, 'id' | 'createdAt'>): LocalEditingHistory {
  const history = getEditingHistory();
  const settings = getAppSettings();
  
  const newEntry: LocalEditingHistory = {
    ...entry,
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  // Add to beginning and limit to max items
  const updatedHistory = [newEntry, ...history].slice(0, settings.maxHistoryItems);
  setItem(STORAGE_KEYS.EDITING_HISTORY, updatedHistory);
  
  return newEntry;
}

export function deleteFromEditingHistory(id: string): void {
  const history = getEditingHistory();
  const updatedHistory = history.filter(h => h.id !== id);
  setItem(STORAGE_KEYS.EDITING_HISTORY, updatedHistory);
}

export function clearEditingHistory(): void {
  setItem(STORAGE_KEYS.EDITING_HISTORY, []);
}

// Favorite Presets Functions
export function getFavoritePresets(): LocalFavoritePreset[] {
  return getItem<LocalFavoritePreset[]>(STORAGE_KEYS.FAVORITE_PRESETS, []);
}

export function addFavoritePreset(preset: Omit<LocalFavoritePreset, 'id' | 'createdAt'>): LocalFavoritePreset {
  const presets = getFavoritePresets();
  
  const newPreset: LocalFavoritePreset = {
    ...preset,
    id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  setItem(STORAGE_KEYS.FAVORITE_PRESETS, [...presets, newPreset]);
  return newPreset;
}

export function deleteFavoritePreset(id: string): void {
  const presets = getFavoritePresets();
  const updatedPresets = presets.filter(p => p.id !== id);
  setItem(STORAGE_KEYS.FAVORITE_PRESETS, updatedPresets);
}

export function clearFavoritePresets(): void {
  setItem(STORAGE_KEYS.FAVORITE_PRESETS, []);
}

// App Settings Functions
export function getAppSettings(): LocalAppSettings {
  return getItem<LocalAppSettings>(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS);
}

export function updateAppSettings(settings: Partial<LocalAppSettings>): LocalAppSettings {
  const currentSettings = getAppSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  setItem(STORAGE_KEYS.APP_SETTINGS, updatedSettings);
  return updatedSettings;
}

export function resetAppSettings(): LocalAppSettings {
  setItem(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

// Clear all local data
export function clearAllLocalData(): void {
  removeItem(STORAGE_KEYS.USER_PROFILE);
  removeItem(STORAGE_KEYS.EDITING_HISTORY);
  removeItem(STORAGE_KEYS.FAVORITE_PRESETS);
  removeItem(STORAGE_KEYS.APP_SETTINGS);
}

// Export all data (for backup)
export function exportLocalData(): string {
  const data = {
    profile: getLocalUserProfile(),
    history: getEditingHistory(),
    presets: getFavoritePresets(),
    settings: getAppSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

// Import data (from backup)
export function importLocalData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveLocalUserProfile(data.profile);
    if (data.history) setItem(STORAGE_KEYS.EDITING_HISTORY, data.history);
    if (data.presets) setItem(STORAGE_KEYS.FAVORITE_PRESETS, data.presets);
    if (data.settings) setItem(STORAGE_KEYS.APP_SETTINGS, data.settings);
    return true;
  } catch {
    return false;
  }
}
