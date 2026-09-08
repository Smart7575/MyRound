import React, { useState, useRef, useEffect } from 'react';
import { Drink, Language } from '../types';
import { PRESET_COLORS, POPULAR_EMOJIS, STANDARD_DRINK_TRANSLATIONS } from '../data/defaultDrinks';
import { translations } from '../i18n';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Edit2,
  Trash2,
  RotateCcw,
  Pin,
  Check,
  Sparkles,
} from 'lucide-react';

interface ManageDrinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  drinks: Drink[];
  onSaveDrink: (drink: Drink) => void;
  onDeleteDrink: (id: string) => void;
  onMoveDrink: (id: string, direction: 'up' | 'down') => void;
  onSetGridPosition: (id: string, position: number) => void;
  onResetDrinksToDefault: () => void;
  language: Language;
  initialEditingDrink?: Drink | null;
}

export const ManageDrinksModal: React.FC<ManageDrinksModalProps> = ({
  isOpen,
  onClose,
  drinks,
  onSaveDrink,
  onDeleteDrink,
  onMoveDrink,
  onSetGridPosition,
  onResetDrinksToDefault,
  language,
  initialEditingDrink,
}) => {
  const t = translations[language];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍺');
  const [color, setColor] = useState('#fbbf24');
  const [isPinned, setIsPinned] = useState(false);
  const [hasLightVariant, setHasLightVariant] = useState(false);
  const [position, setPosition] = useState<number>(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startEditDrink = (drink: Drink) => {
    setEditingDrink(drink);
    setIsCreatingNew(false);
    setName(drink.name);
    setEmoji(drink.emoji);
    setColor(drink.color);
    setIsPinned(Boolean(drink.isPinned));
    setHasLightVariant(Boolean(drink.hasLightVariant));
    setPosition(drink.position);
    setDeleteConfirmId(null);

    // Scroll to top immediately so user sees the edit form
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const startCreateNewDrink = () => {
    setEditingDrink(null);
    setIsCreatingNew(true);
    setName('');
    setEmoji(POPULAR_EMOJIS[Math.floor(Math.random() * 4)]);
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setIsPinned(false);
    setHasLightVariant(false);
    setPosition(drinks.length);
    setDeleteConfirmId(null);

    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  // Sync initial editing drink prop if passed from Settings
  useEffect(() => {
    if (isOpen) {
      if (initialEditingDrink) {
        startEditDrink(initialEditingDrink);
      } else {
        setEditingDrink(null);
        setIsCreatingNew(false);
      }
    } else {
      setEditingDrink(null);
      setIsCreatingNew(false);
      setDeleteConfirmId(null);
    }
  }, [isOpen, initialEditingDrink]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const drinkToSave: Drink = {
      id: editingDrink ? editingDrink.id : `drink-${Date.now()}`,
      name: name.trim(),
      emoji: emoji.trim() || '🍺',
      color: color,
      isPinned: isPinned,
      hasLightVariant: hasLightVariant,
      position: position,
    };

    onSaveDrink(drinkToSave);
    setEditingDrink(null);
    setIsCreatingNew(false);
  };

  const cancelForm = () => {
    setEditingDrink(null);
    setIsCreatingNew(false);
  };

  const isEditingOrCreating = Boolean(editingDrink || isCreatingNew);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="manage-drinks-modal"
        className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {isEditingOrCreating && (
              <button
                type="button"
                onClick={cancelForm}
                className="p-2 -ml-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t.cancel}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {editingDrink
                  ? `${t.editDrinkTitle}: ${editingDrink.name}`
                  : isCreatingNew
                  ? t.addNewDrink
                  : t.manageDrinksTitle}
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {editingDrink
                  ? (language === 'nl'
                      ? 'Pas gegevens, kleur en de light variant optie aan'
                      : 'Customize name, color, and light variant option')
                  : isCreatingNew
                  ? (language === 'nl'
                      ? 'Nieuwe dranktegel toevoegen aan het raster'
                      : 'Add new drink tile to the grid')
                  : t.manageDrinksDesc}
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

        {/* Modal content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* VIEW A: Create or Edit Form */}
          {isEditingOrCreating ? (
            <form
              onSubmit={handleFormSubmit}
              className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-5 animate-in fade-in duration-150"
            >
              {/* Tile Live Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80">
                <div
                  className="w-24 h-24 aspect-square rounded-2xl flex flex-col items-center justify-center p-2 shadow-md relative overflow-hidden shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-3xl leading-none select-none">{emoji}</span>
                  <span className="mt-1 font-black text-xs text-slate-900 text-center leading-tight truncate max-w-full px-1">
                    {name.trim() || (language === 'en' ? 'Preview' : 'Voorbeeld')}
                  </span>
                  {hasLightVariant && (
                    <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-sky-900/80 text-[8px] font-black text-white uppercase tracking-wider">
                      Light
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {language === 'en' ? 'Live tile preview' : 'Live voorvertoning tegel'}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {hasLightVariant
                      ? (language === 'en'
                          ? '✨ This tile shows separate buttons for Regular and Light on the main screen.'
                          : '✨ Deze tegel toont op het hoofdscherm aparte knoppen voor Normaal en Light.')
                      : (language === 'en'
                          ? 'This tile has 1 counter for the regular drink.'
                          : 'Deze tegel heeft 1 teller voor de normale variant.')}
                  </p>
                </div>
              </div>

              {/* Name & Emoji selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    {t.drinkName}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. Cola or Radler' : 'bijv. Cola of Radler'}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-sm focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="w-12 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-2xl shadow-xs">
                      {emoji}
                    </div>
                  </div>
                </div>

                {/* Popular Emojis Quick Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t.selectEmoji}
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {POPULAR_EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center cursor-pointer transition-transform ${
                          emoji === e
                            ? 'bg-orange-500/20 scale-110 ring-2 ring-orange-500'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette Picker */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    {t.drinkColor}
                  </label>
                  <div className="grid grid-cols-8 gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
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
                      className="w-28 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* ✨ Light Variant Toggle Box */}
              <div
                id="edit-light-variant-toggle-box"
                onClick={() => setHasLightVariant(!hasLightVariant)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  hasLightVariant
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      hasLightVariant
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {t.lightVariantLabel}
                      </span>
                      {hasLightVariant && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                          {language === 'en' ? 'Active' : 'Actief'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {t.lightVariantDesc}
                    </span>
                  </div>
                </div>

                {/* Switch visual */}
                <div
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ml-2 ${
                    hasLightVariant ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                      hasLightVariant ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Grid Position Controls */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.gridPosition}
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-sm focus:ring-2 focus:ring-orange-500"
                >
                  {Array.from({ length: Math.max(drinks.length, 12) }, (_, i) => (
                    <option key={i} value={i}>
                      {(t.gridSlotNumber || 'Vakje #{pos}').replace('{pos}', (i + 1).toString())}
                      {i === 0 ? (language === 'en' ? ' (First tile top-left)' : ' (Eerste tegel linksboven)') : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pin Favorite toggle */}
              <div
                onClick={() => setIsPinned(!isPinned)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Pin size={16} className={`rotate-45 ${isPinned ? 'text-orange-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {t.pinDrink}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'en' ? 'Pinned favorite' : 'Vaste favoriet'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 accent-orange-500 cursor-pointer rounded"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  id="btn-save-drink-changes"
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 font-black text-white text-sm cursor-pointer shadow-md shadow-orange-500/20 transition-all active:scale-98"
                >
                  {t.save}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="py-3.5 px-5 rounded-2xl bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW B: List of all drinks with Edit & Move controls */
            <>
              <button
                type="button"
                id="btn-open-create-drink"
                onClick={startCreateNewDrink}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-orange-400 dark:border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-50 text-orange-600 dark:text-orange-400 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Plus size={18} strokeWidth={3} />
                {t.addNewDrink}
              </button>

              {/* Current Drinks List sorted by Position */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  {drinks.length} {t.drinksTitle} {language === 'en' ? '(tap pencil to edit)' : '(tik op potloodje om te bewerken)'}
                </h4>

                {drinks.map((drink, index) => {
                  const isBeer = drink.id === 'beer-pils' || drink.id === 'bier' || drink.position === 0;
                  const isIncidental = drink.id === 'incidental';
                  const standardTrans = STANDARD_DRINK_TRANSLATIONS[drink.id];
                  const displayName = standardTrans
                    ? (language === 'en'
                        ? (drink.name === standardTrans.nl || drink.name.toLowerCase() === standardTrans.nl.toLowerCase() ? standardTrans.en : drink.name)
                        : (drink.name === standardTrans.en || drink.name.toLowerCase() === standardTrans.en.toLowerCase() ? standardTrans.nl : drink.name))
                    : drink.name;

                  return (
                    <div
                      key={drink.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                    >
                      {/* Left: Tile icon preview + name */}
                      <div
                        onClick={() => startEditDrink(drink)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        title={t.editDrinkTitle}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0"
                          style={{ backgroundColor: drink.color }}
                        >
                          {drink.emoji}
                        </div>

                        {/* Name & details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-sm leading-tight text-slate-900 dark:text-slate-100 truncate">
                              {displayName}
                            </h4>
                            {drink.isPinned && (
                              <span className="p-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-[10px]">
                                <Pin size={11} className="rotate-45" />
                              </span>
                            )}
                            {drink.hasLightVariant && (
                              <span className="px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold flex items-center gap-0.5">
                                <Sparkles size={10} />
                                <span>Light</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                            {language === 'en' ? `Tile #${drink.position + 1}` : `Plek #${drink.position + 1}`}
                            {isBeer ? (language === 'en' ? ' (Fixed top-left)' : ' (Vast linksboven)') : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions (Move Up/Down, Edit Pencil, Delete) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Move Up/Down on Grid */}
                        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => onMoveDrink(drink.id, 'up')}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 rounded-lg cursor-pointer"
                            title={t.moveUp}
                          >
                            <ArrowUp size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            disabled={index === drinks.length - 1}
                            onClick={() => onMoveDrink(drink.id, 'down')}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 rounded-lg cursor-pointer"
                            title={t.moveDown}
                          >
                            <ArrowDown size={14} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Position select dropdown */}
                        <select
                          value={drink.position}
                          onChange={(e) => onSetGridPosition(drink.id, Number(e.target.value))}
                          className="text-xs font-bold py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                          title={language === 'en' ? 'Direct grid position' : 'Directe rasterpositie'}
                        >
                          {drinks.map((_, i) => (
                            <option key={i} value={i}>
                              #{i + 1}
                            </option>
                          ))}
                        </select>

                        {/* Prominent Edit Pencil Button */}
                        <button
                          type="button"
                          id={`edit-drink-${drink.id}`}
                          onClick={() => startEditDrink(drink)}
                          className="py-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                          title={t.editDrinkTitle}
                        >
                          <Edit2 size={14} className="text-orange-500" />
                          <span className="hidden sm:inline">{t.edit}</span>
                        </button>

                        {/* Delete Button with inline confirmation (not shown for incidental tile) */}
                        {!isIncidental && (
                          deleteConfirmId === drink.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteDrink(drink.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg cursor-pointer"
                              >
                                {t.deleteDrink}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(drink.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer"
                              title={t.deleteDrink}
                            >
                              <Trash2 size={15} />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset to standard preset defaults */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onResetDrinksToDefault}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <RotateCcw size={13} />
                  {t.resetDrinksToDefault}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
