import React, { useState, useEffect } from 'react';
import { IncidentalDrink, Language } from '../types';
import { translations } from '../i18n';
import { triggerHaptic } from '../utils/haptics';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Check,
  Pencil,
  RotateCcw,
} from 'lucide-react';

interface IncidentalDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentalDrinks: IncidentalDrink[];
  language: Language;
  hapticsEnabled: boolean;
  onAddIncidental: (name: string, count: number) => void;
  onIncrementIncidental: (id: string) => void;
  onDecrementIncidental: (id: string) => void;
  onRemoveIncidental: (id: string) => void;
}

const DEFAULT_SUGGESTIONS_NL = [
  'Gin Tonic',
  'Speciaalbier',
  'Aperol Spritz',
  'Radler 0.0',
  'Chocomel',
  'Salmari',
  'Mocktail',
  'Shotje',
];

const DEFAULT_SUGGESTIONS_EN = [
  'Gin & Tonic',
  'Craft Beer',
  'Aperol Spritz',
  'Radler 0.0',
  'Hot Chocolate',
  'Tequila Shot',
  'Mocktail',
  'Cocktail',
];

export const IncidentalDrinkModal: React.FC<IncidentalDrinkModalProps> = ({
  isOpen,
  onClose,
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
  const [isEditingSuggestions, setIsEditingSuggestions] = useState(false);
  const [isAddingNewSuggestion, setIsAddingNewSuggestion] = useState(false);
  const [newSuggestionInput, setNewSuggestionInput] = useState('');

  // Load custom saved suggestions or fall back to defaults
  const [suggestions, setSuggestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`myround_incidental_suggestions_${language}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return language === 'en' ? DEFAULT_SUGGESTIONS_EN : DEFAULT_SUGGESTIONS_NL;
  });

  // Keep in sync when language changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`myround_incidental_suggestions_${language}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSuggestions(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setSuggestions(language === 'en' ? DEFAULT_SUGGESTIONS_EN : DEFAULT_SUGGESTIONS_NL);
  }, [language]);

  if (!isOpen) return null;

  const totalIncidentalCount = incidentalDrinks.reduce((acc, d) => acc + d.count, 0);

  const persistSuggestions = (newSuggestions: string[]) => {
    setSuggestions(newSuggestions);
    try {
      localStorage.setItem(
        `myround_incidental_suggestions_${language}`,
        JSON.stringify(newSuggestions)
      );
    } catch {
      // ignore
    }
  };

  const handleRemoveSuggestion = (suggestionToRemove: string) => {
    triggerHaptic(hapticsEnabled, 20);
    const updated = suggestions.filter((s) => s.toLowerCase() !== suggestionToRemove.toLowerCase());
    persistSuggestions(updated);
    if (drinkName.toLowerCase() === suggestionToRemove.toLowerCase()) {
      setDrinkName('');
    }
  };

  const handleAddCustomSuggestion = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    triggerHaptic(hapticsEnabled, 20);
    if (!suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...suggestions, trimmed];
      persistSuggestions(updated);
    }
    setDrinkName(trimmed);
    setNewSuggestionInput('');
    setIsAddingNewSuggestion(false);
  };

  const handleResetSuggestions = () => {
    triggerHaptic(hapticsEnabled, 25);
    const defaults = language === 'en' ? DEFAULT_SUGGESTIONS_EN : DEFAULT_SUGGESTIONS_NL;
    persistSuggestions(defaults);
    setIsEditingSuggestions(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = drinkName.trim();
    if (!trimmed) return;
    triggerHaptic(hapticsEnabled, 25);
    onAddIncidental(trimmed, Math.max(1, quantity));
    setDrinkName('');
    setQuantity(1);
  };

  const handleQtyChange = (delta: number) => {
    triggerHaptic(hapticsEnabled, 15);
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (isEditingSuggestions) return;
    triggerHaptic(hapticsEnabled, 15);
    setDrinkName(suggestion);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div
        id="incidental-drink-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[2.2rem] sm:rounded-[2.2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 text-xl font-bold shrink-0 shadow-xs">
              ✨
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black tracking-tight truncate">
                  {language === 'en' ? 'Incidental Drinks' : 'Incidentele drankjes'}
                </h3>
                {totalIncidentalCount > 0 && (
                  <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    {totalIncidentalCount} {t.totalDrinks}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'en'
                  ? 'Register special or one-off drinks'
                  : 'Registreer soort en aantal'}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            id="btn-close-incidental-modal"
            onClick={() => {
              triggerHaptic(hapticsEnabled, 15);
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title={t.close}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Registration Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="input-incidental-name"
                className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
              >
                {language === 'en' ? 'Drink type / name' : 'Soort drankje'}
              </label>
              <input
                id="input-incidental-name"
                type="text"
                autoFocus
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'e.g. Gin Tonic, Aperol, Duvel...'
                    : 'bijv. Gin Tonic, Duvel, Salmari...'
                }
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs transition-all"
              />
            </div>

            {/* Popular Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'en' ? 'Quick choices' : 'Snelle keuzes'}
                </span>
                <div className="flex items-center gap-1.5">
                  {!isEditingSuggestions ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(hapticsEnabled, 15);
                          setIsAddingNewSuggestion((prev) => !prev);
                        }}
                        className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                        <span>{language === 'en' ? 'Add new' : 'Toevoegen'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(hapticsEnabled, 15);
                          setIsEditingSuggestions(true);
                          setIsAddingNewSuggestion(false);
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer ml-1"
                        title={language === 'en' ? 'Edit or remove suggestions' : 'Suggesties bewerken of verwijderen'}
                      >
                        <Pencil size={11} />
                        <span>{language === 'en' ? 'Edit' : 'Aanpassen'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleResetSuggestions}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        title={language === 'en' ? 'Reset to defaults' : 'Standaard herstellen'}
                      >
                        <RotateCcw size={11} />
                        <span>{language === 'en' ? 'Reset' : 'Standaard'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(hapticsEnabled, 15);
                          setIsEditingSuggestions(false);
                        }}
                        className="text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} strokeWidth={2.5} />
                        <span>{language === 'en' ? 'Done' : 'Klaar'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Add New Suggestion Inline Field */}
              {isAddingNewSuggestion && (
                <div className="p-2.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 animate-in fade-in duration-150 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSuggestionInput}
                      onChange={(e) => setNewSuggestionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSuggestion(newSuggestionInput);
                        }
                      }}
                      placeholder={
                        language === 'en'
                          ? 'New incidental drink name...'
                          : 'Nieuwe dranknaam (bijv. Mojito)...'
                      }
                      autoFocus
                      className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-700 font-bold text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomSuggestion(newSuggestionInput)}
                      disabled={!newSuggestionInput.trim()}
                      className="h-9 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>{language === 'en' ? 'Save' : 'Opslaan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewSuggestion(false);
                        setNewSuggestionInput('');
                      }}
                      className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer shrink-0"
                      title={t.cancel}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions Flex Container */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className={`inline-flex items-center rounded-xl border transition-all ${
                      isEditingSuggestions
                        ? 'border-dashed border-red-300 dark:border-red-800/80 bg-red-50/50 dark:bg-red-950/20 pr-1 pl-2.5 py-0.5'
                        : drinkName.toLowerCase() === suggestion.toLowerCase()
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs px-2.5 py-1'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`text-[11px] font-bold truncate max-w-[130px] cursor-pointer ${
                        isEditingSuggestions
                          ? 'text-red-900 dark:text-red-200'
                          : ''
                      }`}
                    >
                      {suggestion}
                    </button>

                    {isEditingSuggestions && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSuggestion(suggestion);
                        }}
                        className="ml-1 w-5 h-5 rounded-lg bg-red-200/80 hover:bg-red-300 dark:bg-red-900/60 dark:hover:bg-red-800 text-red-700 dark:text-red-200 flex items-center justify-center cursor-pointer transition-colors"
                        title={
                          language === 'en'
                            ? `Delete ${suggestion}`
                            : `Verwijder ${suggestion}`
                        }
                      >
                        <X size={11} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Inline Quick Add Pill */}
                {!isEditingSuggestions && !isAddingNewSuggestion && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(hapticsEnabled, 15);
                      setIsAddingNewSuggestion(true);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-xl border border-dashed border-orange-300 dark:border-orange-700/80 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    <span>{language === 'en' ? 'Add' : 'Toevoegen'}</span>
                  </button>
                )}
              </div>

              {/* Helpful Hint if user typed custom name not yet in suggestions */}
              {drinkName.trim() &&
                !suggestions.some(
                  (s) => s.toLowerCase() === drinkName.trim().toLowerCase()
                ) &&
                !isEditingSuggestions && (
                  <button
                    type="button"
                    onClick={() => handleAddCustomSuggestion(drinkName)}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    <span>
                      {language === 'en'
                        ? `Save "${drinkName.trim()}" as quick choice`
                        : `"${drinkName.trim()}" bewaren als snelle keuze`}
                    </span>
                  </button>
                )}
            </div>

            {/* Quantity Stepper and Add Button */}
            <div className="flex items-center gap-2 pt-1">
              {/* Stepper */}
              <div className="flex items-center h-11 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title={t.subtractOne}
                >
                  <Minus size={15} strokeWidth={2.5} />
                </button>
                <span className="w-9 text-center font-black text-sm text-slate-900 dark:text-slate-100 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(1)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  title={t.add}
                >
                  <Plus size={15} strokeWidth={2.5} />
                </button>
              </div>

              {/* Submit Add Button */}
              <button
                type="submit"
                id="btn-submit-incidental-drink"
                disabled={!drinkName.trim()}
                className="flex-1 h-11 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20 transition-all active:scale-98"
              >
                <Plus size={17} strokeWidth={3} />
                <span>{language === 'en' ? 'Add Drink' : 'Drankje noteren'}</span>
              </button>
            </div>
          </form>

          {/* Registered Drinks in this round */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Registered in this round' : 'Genoteerd in dit rondje'}
              </h4>
              {incidentalDrinks.length > 0 && (
                <span className="text-[11px] font-bold text-slate-400">
                  {incidentalDrinks.length} {language === 'en' ? 'items' : 'soorten'}
                </span>
              )}
            </div>

            {incidentalDrinks.length > 0 ? (
              <div className="space-y-2">
                {incidentalDrinks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    {/* Item Name */}
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">
                        {item.name}
                      </span>
                    </div>

                    {/* Stepper + Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(hapticsEnabled, 15);
                          onDecrementIncidental(item.id);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                        title={t.subtractOne}
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>

                      <span className="w-7 text-center font-black text-sm text-orange-600 dark:text-orange-400 tabular-nums">
                        {item.count}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(hapticsEnabled, 15);
                          onIncrementIncidental(item.id);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                        title={t.add}
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(hapticsEnabled, 25);
                          onRemoveIncidental(item.id);
                        }}
                        className="w-8 h-8 ml-1 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                        title={t.delete}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'en'
                    ? 'No incidental drinks registered yet in this round.'
                    : 'Nog geen incidentele drankjes genoteerd in dit rondje.'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {language === 'en'
                    ? 'Type a drink name above or tap a quick suggestion.'
                    : 'Typ hierboven een naam of kies een van de suggesties.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Done / Close Button */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalIncidentalCount > 0
              ? (language === 'en'
                  ? `${totalIncidentalCount} incidental drinks in round`
                  : `${totalIncidentalCount} incidentele drankjes in dit rondje`)
              : (language === 'en'
                  ? 'Tap Done when finished'
                  : 'Tik op Klaar als je klaar bent')}
          </p>
          <button
            type="button"
            id="btn-done-incidental"
            onClick={() => {
              triggerHaptic(hapticsEnabled, 15);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95 shadow-sm"
          >
            <Check size={15} strokeWidth={2.5} />
            <span>{language === 'en' ? 'Done' : 'Klaar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
