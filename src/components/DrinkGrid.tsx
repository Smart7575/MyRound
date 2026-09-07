import React, { useState } from 'react';
import { Drink, TileSize, Language } from '../types';
import { DrinkTile } from './DrinkTile';
import { translations } from '../i18n';
import { Search } from 'lucide-react';

interface DrinkGridProps {
  drinks: Drink[];
  counts: Record<string, number>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearch: boolean;
  tileSize: TileSize;
  hapticsEnabled: boolean;
  language: Language;
  onIncrement: (drink: Drink, isLight?: boolean) => void;
  onDecrement: (drink: Drink, isLight?: boolean) => void;
  onOpenAddDrink?: () => void;
  onSwapDrinks: (idA: string, idB: string) => void;
  onPromptDelete: (drink: Drink) => void;
}

export const DrinkGrid: React.FC<DrinkGridProps> = ({
  drinks,
  counts,
  searchQuery,
  setSearchQuery,
  showSearch,
  tileSize,
  hapticsEnabled,
  language,
  onIncrement,
  onDecrement,
  onOpenAddDrink,
  onSwapDrinks,
  onPromptDelete,
}) => {
  const t = translations[language];
  const [reorderingDrink, setReorderingDrink] = useState<Drink | null>(null);

  // Filter drinks based on search query
  const filteredDrinks = drinks.filter((drink) =>
    drink.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleStartReorder = (drink: Drink) => {
    // If user re-taps the currently selected drink, exit reorder mode
    if (reorderingDrink?.id === drink.id) {
      setReorderingDrink(null);
    } else {
      setReorderingDrink(drink);
    }
  };

  const handleSelectReorderTarget = (targetDrink: Drink) => {
    if (!reorderingDrink) {
      setReorderingDrink(targetDrink);
      return;
    }

    if (reorderingDrink.id === targetDrink.id) {
      // tapped same drink, cancel
      setReorderingDrink(null);
      return;
    }

    // Swap positions
    onSwapDrinks(reorderingDrink.id, targetDrink.id);
    setReorderingDrink(null);
  };

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 h-full overflow-hidden sm:overflow-auto">
      {/* Search Bar (only when active) */}
      {showSearch && (
        <div className="mb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="drink-search-input"
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reorder Status Banner */}
      {reorderingDrink && (
        <div className="mb-2 shrink-0 px-3.5 py-2.5 bg-orange-500 text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg shadow-orange-500/20 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base shrink-0">{reorderingDrink.emoji}</span>
            <span className="truncate">
              {t.reorderActiveFor} <strong>{reorderingDrink.name}</strong>: {t.reorderInstruction}
            </span>
          </div>
          <button
            type="button"
            id="btn-done-reorder"
            onClick={() => setReorderingDrink(null)}
            className="ml-2 px-3 py-1 bg-white text-orange-600 rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            {t.reorderDone}
          </button>
        </div>
      )}

      {/* Grid: 3 columns, perfectly square tiles (aspect-square) */}
      {filteredDrinks.length > 0 ? (
        <div
          id="drinks-grid-container"
          className={`grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full justify-items-stretch transition-all duration-200 ${
            tileSize === 'compact'
              ? 'gap-1.5 sm:gap-2.5 max-w-4xl mx-auto'
              : tileSize === 'large'
              ? 'gap-2.5 sm:gap-4 max-w-6xl mx-auto'
              : 'gap-2 sm:gap-3.5 max-w-5xl mx-auto'
          }`}
        >
          {filteredDrinks.map((drink) => (
            <DrinkTile
              key={drink.id}
              drink={drink}
              count={counts[drink.id] || 0}
              lightCount={drink.hasLightVariant ? (counts[`${drink.id}__light`] || 0) : 0}
              tileSize={tileSize}
              language={language}
              hapticsEnabled={hapticsEnabled}
              isSelectedForReorder={reorderingDrink?.id === drink.id}
              isReorderModeActive={reorderingDrink !== null}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onStartReorder={handleStartReorder}
              onSelectReorderTarget={handleSelectReorderTarget}
              onPromptDelete={onPromptDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm my-auto">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">{t.noDrinksFound}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.noDrinksDesc}</p>
        </div>
      )}
    </div>
  );
};
