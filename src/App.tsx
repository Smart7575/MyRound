/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Drink, SavedRound, AppSettings, IncidentalDrink } from './types';
import {
  loadStoredDrinks,
  saveStoredDrinks,
  loadStoredCounts,
  saveStoredCounts,
  loadStoredIncidental,
  saveStoredIncidental,
  loadStoredHistory,
  saveStoredHistory,
  loadStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import { getDefaultDrinks, translateDrinkList } from './data/defaultDrinks';
import { sortDrinks, moveDrinkToPosition, reindexPositions, swapDrinks } from './utils/sorting';
import { translations } from './i18n';
import { Navbar } from './components/Navbar';
import { DrinkGrid } from './components/DrinkGrid';
import { IncidentalDrinkModal } from './components/IncidentalDrinkModal';
import { BottomBar } from './components/BottomBar';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { ManageDrinksModal } from './components/ManageDrinksModal';
import { AddDrinkModal } from './components/AddDrinkModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { AlertCircle, Trash2 } from 'lucide-react';

export default function App() {
  // Application Data States
  const [settings, setSettings] = useState<AppSettings>(loadStoredSettings);
  const [drinks, setDrinks] = useState<Drink[]>(() => {
    const s = loadStoredSettings();
    return loadStoredDrinks(s.language);
  });
  const [counts, setCounts] = useState<Record<string, number>>(loadStoredCounts);
  const [incidentalDrinks, setIncidentalDrinks] = useState<IncidentalDrink[]>(loadStoredIncidental);
  const [history, setHistory] = useState<SavedRound[]>(loadStoredHistory);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Modals
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAddDrinkOpen, setIsAddDrinkOpen] = useState(false);
  const [isIncidentalOpen, setIsIncidentalOpen] = useState(false);
  const [drinkToDelete, setDrinkToDelete] = useState<Drink | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [editingDrinkForManage, setEditingDrinkForManage] = useState<Drink | null>(null);

  const t = translations[settings.language];

  // Dark Mode Sync with DOM
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Persist State Changes
  useEffect(() => {
    saveStoredDrinks(drinks);
  }, [drinks]);

  useEffect(() => {
    saveStoredCounts(counts);
  }, [counts]);

  useEffect(() => {
    saveStoredIncidental(incidentalDrinks);
  }, [incidentalDrinks]);

  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Total incidental glasses
  const totalIncidentalGlasses = useMemo(() => {
    return incidentalDrinks.reduce((acc: number, item) => acc + (item.count || 0), 0);
  }, [incidentalDrinks]);

  // Derived Totals (Grid drinks + Incidental drinks)
  const totalGlasses = useMemo(() => {
    const gridTotal = (Object.entries(counts) as [string, number][]).reduce(
      (acc: number, [key, count]) => {
        if (key === 'incidental') return acc;
        return acc + (Number(count) || 0);
      },
      0
    );
    return gridTotal + totalIncidentalGlasses;
  }, [counts, totalIncidentalGlasses]);

  // Combined counts for grid display (so 12th incidental tile shows total badge)
  const displayCounts = useMemo(() => {
    return {
      ...counts,
      incidental: totalIncidentalGlasses,
    };
  }, [counts, totalIncidentalGlasses]);

  // Incidental drink handlers
  const handleAddIncidental = useCallback((name: string, count: number) => {
    setIncidentalDrinks((prev) => {
      const trimmed = name.trim();
      const existingIndex = prev.findIndex((d) => d.name.toLowerCase() === trimmed.toLowerCase());
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + count,
        };
        return updated;
      }
      const newItem: IncidentalDrink = {
        id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        count,
      };
      return [...prev, newItem];
    });
  }, []);

  const handleIncrementIncidental = useCallback((id: string) => {
    setIncidentalDrinks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, count: d.count + 1 } : d))
    );
  }, []);

  const handleDecrementIncidental = useCallback((id: string) => {
    setIncidentalDrinks((prev) =>
      prev
        .map((d) => (d.id === id ? { ...d, count: d.count - 1 } : d))
        .filter((d) => d.count > 0)
    );
  }, []);

  const handleRemoveIncidental = useCallback((id: string) => {
    setIncidentalDrinks((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Promote incidental drink to permanent tile on the grid
  const handlePromoteIncidentalToPermanent = useCallback((item: IncidentalDrink) => {
    setDrinks((prev) => {
      const nextPos = prev.length;
      const newDrink: Drink = {
        id: `drink-${Date.now()}`,
        name: item.name,
        emoji: '✨',
        color: '#0284c7', // Nice sky blue
        isPinned: false,
        position: nextPos,
      };
      return [...prev, newDrink];
    });
    // Transfer count to grid tile
    setCounts((prev) => ({
      ...prev,
      [`drink-${Date.now()}`]: item.count,
    }));
    // Remove from incidentals
    setIncidentalDrinks((prev) => prev.filter((d) => d.id !== item.id));
  }, []);

  // Last payer for who's turn
  const lastPayer = useMemo(() => {
    if (history.length === 0) return undefined;
    return history[history.length - 1].paidBy;
  }, [history]);

  // Action: Increment drink count (+1)
  const handleIncrement = useCallback(
    (drink: Drink, isLight?: boolean) => {
      const key = isLight ? `${drink.id}__light` : drink.id;
      setCounts((prev) => {
        const next = (prev[key] || 0) + 1;
        return { ...prev, [key]: next };
      });
    },
    []
  );

  // Action: Decrement drink count (-1)
  const handleDecrement = useCallback(
    (drink: Drink, isLight?: boolean) => {
      const key = isLight ? `${drink.id}__light` : drink.id;
      setCounts((prev) => {
        const current = prev[key] || 0;
        if (current <= 0) return prev;
        const next = current - 1;
        const copy = { ...prev };
        if (next === 0) {
          delete copy[key];
        } else {
          copy[key] = next;
        }
        return copy;
      });
    },
    []
  );

  // Action: Add new drink
  const handleAddDrink = useCallback((newDrink: Drink) => {
    setDrinks((prev) => {
      const updated = [...prev, newDrink];
      return reindexPositions(updated);
    });
  }, []);

  // Action: Swap drinks positions (e.g. from long-press reordering)
  const handleSwapDrinks = useCallback((idA: string, idB: string) => {
    setDrinks((prev) => swapDrinks(prev, idA, idB));
  }, []);

  // Action: Toggle drink light variant
  const handleToggleDrinkLightVariant = useCallback((drinkId: string) => {
    setDrinks((prev) =>
      prev.map((d) => (d.id === drinkId ? { ...d, hasLightVariant: !d.hasLightVariant } : d))
    );
  }, []);

  // Action: Delete drink and reorder positions
  const handleConfirmDeleteDrink = useCallback(() => {
    if (!drinkToDelete) return;
    const drink = drinkToDelete;

    setDrinks((prev) => {
      const remaining = prev.filter((d) => d.id !== drink.id);
      return reindexPositions(remaining);
    });

    setCounts((prev) => {
      const copy = { ...prev };
      delete copy[drink.id];
      delete copy[`${drink.id}__light`];
      return copy;
    });

    setDrinkToDelete(null);
  }, [drinkToDelete]);

  // Action: Reset current round
  const handleResetRound = useCallback(() => {
    setCounts({});
    setIncidentalDrinks([]);
    setIsIncidentalOpen(false);
    setIsResetConfirmOpen(false);
  }, []);

  // Action: Complete and save round to history
  const handleSaveRound = useCallback(
    (roundData: Omit<SavedRound, 'id' | 'timestamp'>) => {
      const newRound: SavedRound = {
        ...roundData,
        id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
      };

      setHistory((prev) => [...prev, newRound]);
      setCounts({});
      setIncidentalDrinks([]);
      setIsIncidentalOpen(false);
    },
    []
  );

  // Drink customization management handlers
  const handleSaveDrink = useCallback((drinkToSave: Drink) => {
    setDrinks((prev) => {
      const index = prev.findIndex((d) => d.id === drinkToSave.id);
      let updated: Drink[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = drinkToSave;
      } else {
        updated = [...prev, drinkToSave];
      }
      return sortDrinks(updated);
    });
  }, []);

  const handleDeleteDrink = useCallback((id: string) => {
    setDrinks((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      return reindexPositions(filtered);
    });
    setCounts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      delete copy[`${id}__light`];
      return copy;
    });
  }, []);

  const handleMoveDrink = useCallback((id: string, direction: 'up' | 'down') => {
    setDrinks((prev) => {
      const sorted = sortDrinks(prev);
      const currentIndex = sorted.findIndex((d) => d.id === id);
      if (currentIndex < 0) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      return moveDrinkToPosition(sorted, id, targetIndex);
    });
  }, []);

  const handleSetGridPosition = useCallback((id: string, newPos: number) => {
    setDrinks((prev) => {
      return moveDrinkToPosition(prev, id, newPos);
    });
  }, []);

  const handleResetDrinksToDefault = useCallback(() => {
    setDrinks(getDefaultDrinks(settings.language));
  }, [settings.language]);

  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      if (newSettings.language && newSettings.language !== prev.language) {
        setDrinks((currentDrinks) => translateDrinkList(currentDrinks, newSettings.language!));
      }
      return { ...prev, ...newSettings };
    });
  }, []);

  const handleResetAllData = useCallback(() => {
    setDrinks(getDefaultDrinks(settings.language));
    setCounts({});
    setIncidentalDrinks([]);
    setHistory([]);
    setSettings({
      language: settings.language,
      darkMode: false,
      tileSize: 'normal',
      hapticFeedback: true,
      showPrices: false,
      groupMembers: ['Stefan', 'Lisa', 'Tim', 'Sophie'],
    });
  }, [settings.language]);

  const handleAddMember = useCallback((name: string) => {
    setSettings((prev) => ({
      ...prev,
      groupMembers: [...new Set([...prev.groupMembers, name])],
    }));
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setSettings((prev) => {
      const nextLang = prev.language === 'nl' ? 'en' : 'nl';
      setDrinks((currentDrinks) => translateDrinkList(currentDrinks, nextLang));
      return {
        ...prev,
        language: nextLang,
      };
    });
  }, []);

  const handleOpenEditDrink = useCallback((drink: Drink) => {
    setIsSettingsOpen(false);
    setEditingDrinkForManage(drink);
    setIsManageOpen(true);
  }, []);

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none overflow-hidden">
      {/* Top Navbar with Brand & Controls */}
      <Navbar
        language={settings.language}
        totalGlasses={totalGlasses}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => handleUpdateSettings({ darkMode: !settings.darkMode })}
        onOpenManage={() => setIsManageOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area: Responsive No-Scroll Phone View */}
      <main className="flex-1 min-h-0 max-w-lg sm:max-w-2xl lg:max-w-3xl w-full mx-auto px-2 sm:px-4 py-1 flex flex-col overflow-hidden">
        {/* Quick Turn Alert if group tracking active */}
        {lastPayer && history.length > 0 && (
          <div className="mb-1 px-3 py-1 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[11px] font-semibold text-orange-900 dark:text-orange-300 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5 truncate">
              <span>🍻</span>
              <span className="truncate">
                {t.treatedBy}: <strong className="text-orange-700 dark:text-orange-400">{lastPayer}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="font-bold underline text-[11px] hover:text-orange-950 dark:hover:text-orange-200 cursor-pointer ml-2 shrink-0"
            >
              {t.historyTitle} →
            </button>
          </div>
        )}

        {/* Responsive Drink Grid (fills 100% vertical space without scroll) */}
        <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
          <DrinkGrid
            drinks={drinks}
            counts={displayCounts}
            searchQuery={showSearch ? searchQuery : ''}
            setSearchQuery={setSearchQuery}
            showSearch={showSearch}
            tileSize={settings.tileSize}
            hapticsEnabled={settings.hapticFeedback}
            language={settings.language}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onOpenIncidentalModal={() => setIsIncidentalOpen(true)}
            onSwapDrinks={handleSwapDrinks}
            onPromptDelete={(drink) => setDrinkToDelete(drink)}
          />
        </div>
      </main>

      {/* Persistent Bottom Action Bar */}
      <BottomBar
        totalGlasses={totalGlasses}
        language={settings.language}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onPromptReset={() => setIsResetConfirmOpen(true)}
      />

      {/* Incidental Drink Popup Modal (opened exclusively via the 12th drink tile) */}
      <IncidentalDrinkModal
        isOpen={isIncidentalOpen}
        onClose={() => setIsIncidentalOpen(false)}
        incidentalDrinks={incidentalDrinks}
        language={settings.language}
        hapticsEnabled={settings.hapticFeedback}
        onAddIncidental={handleAddIncidental}
        onIncrementIncidental={handleIncrementIncidental}
        onDecrementIncidental={handleDecrementIncidental}
        onRemoveIncidental={handleRemoveIncidental}
      />

      {/* Drink Delete Confirmation Dialog */}
      {drinkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            id="modal-confirm-delete-drink"
            className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-2xl">
              {drinkToDelete.emoji || <Trash2 size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {drinkToDelete.name} {t.delete.toLowerCase()}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {(t.confirmDeleteDrinkDesc || 'Weet je zeker dat je "{name}" wilt verwijderen?').replace('{name}', drinkToDelete.name)}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                id="btn-confirm-delete-drink"
                onClick={handleConfirmDeleteDrink}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-md shadow-red-600/20 active:scale-98 transition-all"
              >
                {t.delete}
              </button>
              <button
                type="button"
                onClick={() => setDrinkToDelete(null)}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.confirmResetTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.confirmResetDesc}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                id="btn-confirm-reset-yes"
                onClick={handleResetRound}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm cursor-pointer shadow-xs transition-colors"
              >
                {t.resetYes}
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RoundSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        drinks={drinks.filter((d) => d.id !== 'incidental')}
        counts={counts}
        incidentalDrinks={incidentalDrinks}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onIncrementIncidental={handleIncrementIncidental}
        onDecrementIncidental={handleDecrementIncidental}
        onRemoveIncidental={handleRemoveIncidental}
        onResetRound={handleResetRound}
        onSaveRound={handleSaveRound}
        language={settings.language}
        groupMembers={settings.groupMembers}
        onAddMember={handleAddMember}
        lastPayer={lastPayer}
      />

      <ManageDrinksModal
        isOpen={isManageOpen}
        onClose={() => {
          setIsManageOpen(false);
          setEditingDrinkForManage(null);
        }}
        drinks={drinks}
        onSaveDrink={handleSaveDrink}
        onDeleteDrink={handleDeleteDrink}
        onMoveDrink={handleMoveDrink}
        onSetGridPosition={handleSetGridPosition}
        onResetDrinksToDefault={handleResetDrinksToDefault}
        language={settings.language}
        initialEditingDrink={editingDrinkForManage}
      />

      <AddDrinkModal
        isOpen={isAddDrinkOpen}
        onClose={() => setIsAddDrinkOpen(false)}
        onAddDrink={handleAddDrink}
        existingCount={drinks.length}
        language={settings.language}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        rounds={history}
        onClearHistory={() => setHistory([])}
        language={settings.language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetAllData}
        onOpenAddDrink={() => setIsAddDrinkOpen(true)}
        onOpenManageDrinks={() => {
          setEditingDrinkForManage(null);
          setIsManageOpen(true);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        drinks={drinks}
        onToggleDrinkLightVariant={handleToggleDrinkLightVariant}
        onOpenEditDrink={handleOpenEditDrink}
      />
    </div>
  );
}
