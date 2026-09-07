import React, { useState } from 'react';
import { Drink, Language } from '../types';
import { PRESET_COLORS, POPULAR_EMOJIS } from '../data/defaultDrinks';
import { translations } from '../i18n';
import { X, Plus, Check, Sparkles } from 'lucide-react';

interface AddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrink: (drink: Drink) => void;
  existingCount: number;
  language: Language;
}

export const AddDrinkModal: React.FC<AddDrinkModalProps> = ({
  isOpen,
  onClose,
  onAddDrink,
  existingCount,
  language,
}) => {
  const t = translations[language];
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍺');
  const [color, setColor] = useState('#fbbf24');
  const [hasLightVariant, setHasLightVariant] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDrink: Drink = {
      id: `drink-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      emoji: emoji.trim() || '🍺',
      color: color,
      isPinned: false,
      hasLightVariant: hasLightVariant,
      position: existingCount,
    };

    onAddDrink(newDrink);
    setName('');
    setEmoji('🍺');
    setHasLightVariant(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="add-drink-modal"
        className="w-full sm:max-w-md max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{t.addNewDrink}</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {language === 'nl' ? 'Nieuw vakje op het raster' : 'New tile on the grid'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Live Preview Tile */}
          <div className="flex flex-col items-center justify-center py-2">
            <div
              className="w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-lg border-b-4 transition-transform active:scale-95"
              style={{
                backgroundColor: color,
                borderColor: 'rgba(0,0,0,0.25)',
              }}
            >
              <span className="text-4xl">{emoji || '🍺'}</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 truncate max-w-[90%] mt-1">
                {name.trim() || (language === 'nl' ? 'Dranknaam' : 'Drink name')}
              </span>
            </div>
          </div>

          {/* Name & Emoji input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t.drinkName}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.drinkNamePlaceholder}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-sm focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                title={t.emojiLabel}
                className="w-14 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center text-2xl shadow-xs"
              />
            </div>
          </div>

          {/* Quick Emoji Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              {language === 'nl' ? 'Kies een icoon' : 'Choose icon'}
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              {POPULAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center cursor-pointer transition-transform ${
                    emoji === e
                      ? 'bg-orange-500/20 scale-110 ring-2 ring-orange-500'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t.colorLabel}
            </label>
            <div className="grid grid-cols-8 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-7 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'ring-3 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110'
                      : 'hover:scale-105'
                  }`}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check size={14} className="text-white drop-shadow-sm stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#fbbf24"
                className="w-28 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Light Variant Option */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {t.lightVariantLabel}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {t.lightVariantDesc}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="add-drink-toggle-light"
              checked={hasLightVariant}
              onChange={(e) => setHasLightVariant(e.target.checked)}
              className="w-5 h-5 accent-sky-600 cursor-pointer rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm cursor-pointer shadow-lg shadow-orange-500/25 transition-all active:scale-98"
            >
              {t.add}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 cursor-pointer"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
