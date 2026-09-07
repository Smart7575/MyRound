import { Drink, Language } from '../types';

export const PRESET_COLORS = [
  '#fbbf24', // Amber 400 (Bier / Beer)
  '#ef4444', // Red 500 (Cola)
  '#fb7185', // Rose 400 (Wijn / Wine)
  '#34d399', // Emerald 400 (G&T / Mint)
  '#fb923c', // Orange 400 (Aperol)
  '#38bdf8', // Sky 400 (Water / Spa red)
  '#a78bfa', // Violet 400 (Shotje)
  '#facc15', // Yellow 400 (Witte wijn)
  '#f97316', // Orange 500 (Speciaalbier)
  '#b45309', // Amber 700 (Koffie / Coffee)
  '#f43f5e', // Rose 500
  '#10b981', // Emerald 500
  '#84cc16', // Lime 500
  '#06b6d4', // Cyan 500
  '#ec4899', // Pink 500
  '#64748b', // Slate 500
];

export const POPULAR_EMOJIS = [
  '🍺', '🥤', '🍷', '🍸', '🍹', '💧', '🥃', '🥂', '🍻', '☕', '🍾', '🍵', '🧃', '🧊', '🍋', '🍇'
];

export const DEFAULT_DRINKS_NL: Drink[] = [
  {
    id: 'bier',
    name: 'Bier',
    emoji: '🍺',
    color: '#fbbf24',
    isPinned: true,
    position: 0,
  },
  {
    id: 'cola',
    name: 'Cola',
    emoji: '🥤',
    color: '#ef4444',
    isPinned: false,
    position: 1,
    hasLightVariant: true,
  },
  {
    id: 'fanta',
    name: 'Fanta',
    emoji: '🍊',
    color: '#f97316',
    isPinned: false,
    position: 2,
  },
  {
    id: 'spa-rood',
    name: 'Spa rood',
    emoji: '💧',
    color: '#38bdf8',
    isPinned: false,
    position: 3,
  },
  {
    id: 'green-tea',
    name: 'Green tea',
    emoji: '🍵',
    color: '#10b981',
    isPinned: false,
    position: 4,
  },
  {
    id: 'wijn',
    name: 'Wijn',
    emoji: '🍷',
    color: '#fb7185',
    isPinned: false,
    position: 5,
  },
  {
    id: 'koffie',
    name: 'Koffie',
    emoji: '☕',
    color: '#b45309',
    isPinned: false,
    position: 6,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    emoji: '☕',
    color: '#d97706',
    isPinned: false,
    position: 7,
  },
  {
    id: 'thee',
    name: 'Thee',
    emoji: '🫖',
    color: '#eab308',
    isPinned: false,
    position: 8,
  },
];

export const DEFAULT_DRINKS_EN: Drink[] = [
  {
    id: 'bier',
    name: 'Beer',
    emoji: '🍺',
    color: '#fbbf24',
    isPinned: true,
    position: 0,
  },
  {
    id: 'cola',
    name: 'Cola',
    emoji: '🥤',
    color: '#ef4444',
    isPinned: false,
    position: 1,
    hasLightVariant: true,
  },
  {
    id: 'fanta',
    name: 'Fanta',
    emoji: '🍊',
    color: '#f97316',
    isPinned: false,
    position: 2,
  },
  {
    id: 'spa-rood',
    name: 'Spa red',
    emoji: '💧',
    color: '#38bdf8',
    isPinned: false,
    position: 3,
  },
  {
    id: 'green-tea',
    name: 'Green Tea',
    emoji: '🍵',
    color: '#10b981',
    isPinned: false,
    position: 4,
  },
  {
    id: 'wijn',
    name: 'Wine',
    emoji: '🍷',
    color: '#fb7185',
    isPinned: false,
    position: 5,
  },
  {
    id: 'koffie',
    name: 'Coffee',
    emoji: '☕',
    color: '#b45309',
    isPinned: false,
    position: 6,
  },
  {
    id: 'cappuccino',
    name: 'Cappucino',
    emoji: '☕',
    color: '#d97706',
    isPinned: false,
    position: 7,
  },
  {
    id: 'thee',
    name: 'Tea',
    emoji: '🫖',
    color: '#eab308',
    isPinned: false,
    position: 8,
  },
];

export const DEFAULT_DRINKS: Drink[] = DEFAULT_DRINKS_NL;

export const STANDARD_DRINK_TRANSLATIONS: Record<string, { nl: string; en: string }> = {
  bier: { nl: 'Bier', en: 'Beer' },
  cola: { nl: 'Cola', en: 'Cola' },
  fanta: { nl: 'Fanta', en: 'Fanta' },
  'spa-rood': { nl: 'Spa rood', en: 'Spa red' },
  'green-tea': { nl: 'Green tea', en: 'Green Tea' },
  wijn: { nl: 'Wijn', en: 'Wine' },
  koffie: { nl: 'Koffie', en: 'Coffee' },
  cappuccino: { nl: 'Cappuccino', en: 'Cappucino' },
  thee: { nl: 'Thee', en: 'Tea' },
};

export function getDefaultDrinks(language: Language = 'nl'): Drink[] {
  return language === 'en' ? DEFAULT_DRINKS_EN : DEFAULT_DRINKS_NL;
}

export function translateDrinkList(drinks: Drink[], targetLang: Language): Drink[] {
  const fromLang: Language = targetLang === 'en' ? 'nl' : 'en';
  return drinks.map((drink) => {
    const translation = STANDARD_DRINK_TRANSLATIONS[drink.id];
    if (translation) {
      if (
        drink.name === translation[fromLang] ||
        drink.name.toLowerCase() === translation[fromLang].toLowerCase() ||
        drink.name === translation[targetLang]
      ) {
        return {
          ...drink,
          name: translation[targetLang],
        };
      }
    }
    return drink;
  });
}
