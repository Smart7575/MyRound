import React, { useState } from 'react';
import { IncidentalDrink, Language } from '../types';
import { translations } from '../i18n';
import { Plus, Minus, X, Sparkles } from 'lucide-react';

interface IncidentalDrinksBarProps {
  incidentalDrinks: IncidentalDrink[];
  language: Language;
  hapticsEnabled: boolean;
  onAddIncidental: (name: string, count: number) => void;
  onIncrementIncidental: (id: string) => void;
  onDecrementIncidental: (id: string) => void;
  onRemoveIncidental: (id: string) => void;
}

export const IncidentalDrinksBar: React.FC<IncidentalDrinksBarProps> = ({
  incidentalDrinks,
  language,
  hapticsEnabled,
  onAddIncidental,
  onIncrementIncidental,
  onDecrementIncidental,
  onRemoveIncidental,
}) => {
  const t = translations[language];
  const [drinkName, setDrinkName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  const triggerHaptic = () => {
    if (hapticsEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore vibration failure
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = drinkName.trim();
    if (!trimmed) return;
    triggerHaptic();
    onAddIncidental(trimmed, Math.max(1, quantity));
    setDrinkName('');
    setQuantity(1);
  };

  const handleQtyChange = (delta: number) => {
    triggerHaptic();
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  return (
    <div
      id="incidental-drinks-container"
      className="mt-1.5 sm:mt-3 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs shrink-0"
    >
      {/* Header and counter label */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor="input-incidental-drink-name"
          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
        >
          <Sparkles size={13} className="text-orange-500" />
          <span>{t.incidentalSectionTitle}</span>
        </label>
        {incidentalDrinks.length > 0 && (
          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20 px-2 py-0.5 rounded-full">
            {incidentalDrinks.reduce((acc, d) => acc + d.count, 0)} {t.totalDrinks}
          </span>
        )}
      </div>

      {/* Input row for name & count */}
      <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 sm:gap-2">
        {/* Name input */}
        <div className="relative flex-1 min-w-0">
          <input
            id="input-incidental-drink-name"
            type="text"
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            placeholder={t.incidentalPlaceholder}
            className="w-full h-9 sm:h-10 pl-3 pr-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center h-9 sm:h-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-1 shrink-0">
          <button
            type="button"
            onClick={() => handleQtyChange(-1)}
            disabled={quantity <= 1}
            className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title={t.subtractOne}
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <span className="w-6 sm:w-7 text-center font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQtyChange(1)}
            className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            title={t.add}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-add-incidental-drink"
          disabled={!drinkName.trim()}
          className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-xs shadow-orange-500/20 shrink-0"
        >
          <Plus size={15} strokeWidth={3} />
          <span className="hidden xs:inline">{t.incidentalAddBtn}</span>
        </button>
      </form>

      {/* Active Incidental Drinks list in current round */}
      {incidentalDrinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 max-h-24 sm:max-h-28 overflow-y-auto">
          {incidentalDrinks.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs group"
            >
              <span className="font-bold truncate max-w-[110px] sm:max-w-[160px]">{item.name}</span>
              <span className="bg-orange-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-lg tabular-nums">
                {item.count}×
              </span>

              {/* Stepper buttons on badge */}
              <div className="flex items-center gap-0.5 ml-0.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onDecrementIncidental(item.id);
                  }}
                  className="w-5 h-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                  title={t.subtractOne}
                >
                  <Minus size={11} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onIncrementIncidental(item.id);
                  }}
                  className="w-5 h-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                  title={t.add}
                >
                  <Plus size={11} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onRemoveIncidental(item.id);
                  }}
                  className="w-5 h-5 rounded-md hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 flex items-center justify-center text-slate-400 cursor-pointer ml-0.5 transition-colors"
                  title={t.delete}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
