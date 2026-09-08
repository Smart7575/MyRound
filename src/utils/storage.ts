import { Drink, SavedRound, AppSettings, IncidentalDrink, Language } from '../types';
import { getDefaultDrinks, translateDrinkList } from '../data/defaultDrinks';
import { sortDrinks } from './sorting';

const DRINKS_KEY = 'rondjeteller_drinks_v4';
const COUNTS_KEY = 'rondjeteller_active_counts_v1';
const INCIDENTAL_KEY = 'rondjeteller_active_incidental_v1';
const HISTORY_KEY = 'rondjeteller_history_v1';
const SETTINGS_KEY = 'rondjeteller_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  darkMode: false,
  tileSize: 'normal',
  hapticFeedback: true,
  showPrices: false,
  groupMembers: ['Stefan', 'Lisa', 'Tim', 'Sophie'],
};

export function loadStoredDrinks(language: Language = 'en'): Drink[] {
  try {
    const raw = localStorage.getItem(DRINKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let drinksList: Drink[] = parsed;
        // If stored drinks list is from previous 9-drink version, upgrade to 12 drinks
        if (drinksList.length < 12 || !drinksList.some((d) => d.id === 'incidental')) {
          const defaultList = getDefaultDrinks(language);
          const existingIds = new Set(drinksList.map((d) => d.id));
          const missingDefaults = defaultList.filter((d) => !existingIds.has(d.id));
          drinksList = [...drinksList, ...missingDefaults].map((d, index) => ({
            ...d,
            position: index,
          }));
        }
        return sortDrinks(translateDrinkList(drinksList, language));
      }
    }
  } catch {
    // Ignore error and return defaults
  }
  return sortDrinks(getDefaultDrinks(language));
}

export function saveStoredDrinks(drinks: Drink[]): void {
  try {
    localStorage.setItem(DRINKS_KEY, JSON.stringify(drinks));
  } catch {
    // Ignore error
  }
}

export function loadStoredCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COUNTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }
  return {};
}

export function saveStoredCounts(counts: Record<string, number>): void {
  try {
    localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // Ignore error
  }
}

export function loadStoredIncidental(): IncidentalDrink[] {
  try {
    const raw = localStorage.getItem(INCIDENTAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return [];
}

export function saveStoredIncidental(items: IncidentalDrink[]): void {
  try {
    localStorage.setItem(INCIDENTAL_KEY, JSON.stringify(items));
  } catch {
    // Ignore error
  }
}

export function loadStoredHistory(): SavedRound[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return [];
}

export function saveStoredHistory(history: SavedRound[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore error
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore error
  }
}
