import React, { useState } from 'react';
import { AppSettings, Drink, Language, TileSize } from '../types';
import { translations } from '../i18n';
import {
  X,
  Languages,
  Moon,
  Sun,
  LayoutGrid,
  Smartphone,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  History,
  Beer,
  Sparkles,
  Edit2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onOpenAddDrink?: () => void;
  onOpenManageDrinks?: () => void;
  onOpenHistory?: () => void;
  drinks: Drink[];
  onToggleDrinkLightVariant?: (drinkId: string) => void;
  onOpenEditDrink?: (drink: Drink) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
  onOpenAddDrink,
  onOpenManageDrinks,
  onOpenHistory,
  drinks,
  onToggleDrinkLightVariant,
  onOpenEditDrink,
}) => {
  const t = translations[settings.language];
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="settings-modal"
        className="w-full sm:max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t.settingsTitle}</h2>
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Language Selection: Nederlands & English */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Languages size={15} />
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-lang-nl"
                onClick={() => onUpdateSettings({ language: 'nl' })}
                className={`py-3 px-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.language === 'nl'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <span>🇳🇱</span>
                <span>{t.languageNl}</span>
              </button>
              <button
                type="button"
                id="btn-lang-en"
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`py-3 px-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.language === 'en'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <span>🇬🇧</span>
                <span>{t.languageEn}</span>
              </button>
            </div>
          </div>

          {/* Appearance: Dark / Light Mode */}
          <div
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer select-none hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/15 flex items-center justify-center shrink-0">
                {settings.darkMode ? (
                  <Moon size={18} className="text-orange-600 dark:text-orange-400" />
                ) : (
                  <Sun size={18} className="text-amber-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm block text-slate-900 dark:text-slate-100">
                    {settings.darkMode
                      ? t.darkMode
                      : (settings.language === 'nl' ? 'Lichte modus' : 'Light mode')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {settings.darkMode ? 'Donker' : 'Licht'}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                  {settings.darkMode
                    ? t.darkModeDesc
                    : (settings.language === 'nl' ? 'Helder en prettig leesbaar bij daglicht' : 'Bright and clear in daylight')}
                </span>
              </div>
            </div>
            <button
              type="button"
              id="btn-toggle-dark-mode"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ml-2 ${
                settings.darkMode ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Drankjes toevoegen & beheren via instellingen */}
          {(onOpenAddDrink || onOpenManageDrinks) && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Beer size={15} className="text-orange-500" />
                  {settings.language === 'nl' ? 'Drankjes' : 'Drinks'}
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.language === 'nl'
                  ? 'Voeg nieuwe drankjes toe aan het raster of beheer en herorden je assortiment.'
                  : 'Add new drinks to the grid or manage and reorder your drink selection.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {onOpenAddDrink && (
                  <button
                    type="button"
                    id="btn-settings-add-drink"
                    onClick={() => {
                      onClose();
                      onOpenAddDrink();
                    }}
                    className="py-3 px-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-orange-500/20 transition-all"
                  >
                    <Plus size={15} strokeWidth={3} />
                    <span>{t.addDrinkBtn}</span>
                  </button>
                )}
                {onOpenManageDrinks && (
                  <button
                    type="button"
                    id="btn-settings-manage-drinks"
                    onClick={() => {
                      onClose();
                      onOpenManageDrinks();
                    }}
                    className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <SlidersHorizontal size={15} />
                    <span>{t.manageDrinksTitle}</span>
                  </button>
                )}
                {onOpenHistory && (
                  <button
                    type="button"
                    id="btn-settings-history"
                    onClick={() => {
                      onClose();
                      onOpenHistory();
                    }}
                    className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <History size={15} />
                    <span>{t.historyTitle}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Light varianten configuratie per drankje */}
          {drinks && drinks.length > 0 && onToggleDrinkLightVariant && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Sparkles size={15} className="text-sky-500" />
                  {t.lightVariantLabel}
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.language === 'nl'
                  ? 'Geef hieronder aan welke drankjes een aparte Light variant hebben. Deze kun je dan op het hoofdscherm afzonderlijk aantikken en tellen.'
                  : 'Specify below which drinks have a separate Light variant. These can then be tapped and counted separately on the main screen.'}
              </p>

              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                {drinks.map((drink) => (
                  <div
                    key={drink.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-xs shrink-0"
                        style={{ backgroundColor: drink.color }}
                      >
                        {drink.emoji}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 block truncate">
                          {drink.name}
                        </span>
                        {drink.hasLightVariant ? (
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                            {settings.language === 'nl' ? 'Normaal + Light actief' : 'Regular + Light active'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {settings.language === 'nl' ? 'Alleen normaal' : 'Regular only'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {onOpenEditDrink && (
                        <button
                          type="button"
                          id={`edit-drink-pencil-${drink.id}`}
                          onClick={() => {
                            onClose();
                            onOpenEditDrink(drink);
                          }}
                          className="p-1.5 text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title={`Wijzig ${drink.name}`}
                          aria-label={`Wijzig ${drink.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        id={`toggle-light-setting-${drink.id}`}
                        onClick={() => onToggleDrinkLightVariant(drink.id)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          drink.hasLightVariant ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={`Light optie voor ${drink.name}`}
                        aria-label={`Toggle light variant for ${drink.name}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            drink.hasLightVariant ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tile Size (Compact / Normal / Large thumb-friendly) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <LayoutGrid size={15} />
                {t.tileSize}
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {settings.language === 'nl' ? 'Compact = past direct op telefoon' : 'Compact = fits phone without scrolling'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'large'] as TileSize[]).map((size) => {
                const label =
                  size === 'compact'
                    ? t.tileSizeCompact
                    : size === 'normal'
                    ? t.tileSizeNormal
                    : t.tileSizeLarge;

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onUpdateSettings({ tileSize: size })}
                    className={`py-2.5 px-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer text-center ${
                      settings.tileSize === size
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Haptic Feedback Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/15 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Smartphone size={18} />
              </div>
              <div>
                <span className="font-black text-sm block">{t.haptics}</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t.hapticsDesc}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ hapticFeedback: !settings.hapticFeedback })}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                settings.hapticFeedback ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  settings.hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset All Data to Defaults */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {showResetConfirm ? (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-2">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">
                  {t.confirmResetAll}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetAllData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black cursor-pointer shadow-xs"
                  >
                    {t.resetYes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 px-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw size={14} />
                {t.resetAllData}
              </button>
            )}
          </div>
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
