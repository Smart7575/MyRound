export interface Drink {
  id: string;
  name: string;
  emoji: string;
  color: string;
  price?: number;
  isPinned: boolean;
  position: number; // custom grid position: 0, 1, 2...
  hasLightVariant?: boolean; // indicates if the drink has a light / zero variant
}

export interface RoundItem {
  drinkId: string;
  drinkName: string;
  emoji: string;
  count: number;
  unitPrice?: number;
  isIncidental?: boolean;
}

export interface IncidentalDrink {
  id: string;
  name: string;
  count: number;
}

export interface SavedRound {
  id: string;
  timestamp: string; // ISO date string
  items: RoundItem[];
  totalCount: number;
  totalPrice: number;
  paidBy?: string;
  notes?: string;
}

export type Language = 'nl' | 'en';
export type TileSize = 'compact' | 'normal' | 'large';

export interface AppSettings {
  language: Language;
  darkMode: boolean;
  tileSize: TileSize;
  hapticFeedback: boolean;
  showPrices: boolean;
  groupMembers: string[];
}

export interface UndoAction {
  type: 'increment' | 'decrement' | 'delete_drink';
  drinkId: string;
  drinkName: string;
  emoji: string;
  message?: string;
  deletedDrink?: Drink;
  deletedDrinkPosition?: number;
  previousCount?: number;
}
