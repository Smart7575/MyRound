import React, { useState } from 'react';
import { Drink, Language, SavedRound, IncidentalDrink } from '../types';
import { translations } from '../i18n';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface RoundSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  drinks: Drink[];
  counts: Record<string, number>;
  incidentalDrinks?: IncidentalDrink[];
  onIncrement: (drink: Drink, isLight?: boolean) => void;
  onDecrement: (drink: Drink, isLight?: boolean) => void;
  onIncrementIncidental?: (id: string) => void;
  onDecrementIncidental?: (id: string) => void;
  onRemoveIncidental?: (id: string) => void;
  onResetRound: () => void;
  onSaveRound: (round: Omit<SavedRound, 'id' | 'timestamp'>) => void;
  language: Language;
  groupMembers?: string[];
  onAddMember?: (name: string) => void;
  lastPayer?: string;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  isOpen,
  onClose,
  drinks,
  counts,
  incidentalDrinks = [],
  onIncrement,
  onDecrement,
  onIncrementIncidental,
  onDecrementIncidental,
  onRemoveIncidental,
  onSaveRound,
  language,
  lastPayer,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Active items (split normal & light if separate)
  interface ActiveSummaryItem {
    key: string;
    drink: Drink;
    isLight: boolean;
    displayName: string;
    count: number;
  }

  const activeItems: ActiveSummaryItem[] = [];

  drinks.forEach((d) => {
    const normalCount = counts[d.id] || 0;
    const lightCount = d.hasLightVariant ? (counts[`${d.id}__light`] || 0) : 0;

    if (normalCount > 0) {
      activeItems.push({
        key: `${d.id}-normal`,
        drink: d,
        isLight: false,
        displayName: d.hasLightVariant ? `${d.name} (${t.normalVariant || 'Normaal'})` : d.name,
        count: normalCount,
      });
    }

    if (d.hasLightVariant && lightCount > 0) {
      activeItems.push({
        key: `${d.id}-light`,
        drink: d,
        isLight: true,
        displayName: `${d.name} (${t.lightVariant || 'Light'})`,
        count: lightCount,
      });
    }
  });

  const activeIncidental = incidentalDrinks.filter((item) => item.count > 0);

  const totalGridGlasses = activeItems.reduce((acc, item) => acc + item.count, 0);
  const totalIncidentalGlasses = activeIncidental.reduce((acc, item) => acc + item.count, 0);
  const totalGlasses = totalGridGlasses + totalIncidentalGlasses;

  // Generate share message text (no prices)
  const generateShareText = () => {
    if (activeItems.length === 0 && activeIncidental.length === 0) return '';
    const drinkItemsList = activeItems
      .map((item) => `${item.count}x ${item.drink.emoji} ${item.displayName}`);
    const incidentalItemsList = activeIncidental
      .map((item) => `${item.count}x ✨ ${item.name}`);
    const combined = [...drinkItemsList, ...incidentalItemsList].join(', ');

    let msg = `🍻 Rondje: ${combined} — Totaal ${totalGlasses} ${t.totalDrinks}`;
    if (lastPayer) {
      msg += ` [${t.treatedBy}: ${lastPayer}]`;
    }
    return msg;
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const text = generateShareText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Complete and save to history
  const handleCompleteAndSave = () => {
    if (totalGlasses === 0) return;

    const roundItems = [
      ...activeItems.map((item) => ({
        drinkId: item.isLight ? `${item.drink.id}__light` : item.drink.id,
        drinkName: item.displayName,
        emoji: item.drink.emoji,
        count: item.count,
        isIncidental: false,
      })),
      ...activeIncidental.map((item) => ({
        drinkId: item.id,
        drinkName: item.name,
        emoji: '✨',
        count: item.count,
        isIncidental: true,
      })),
    ];

    onSaveRound({
      items: roundItems,
      totalCount: totalGlasses,
      totalPrice: 0,
      paidBy: lastPayer || undefined,
    });
    onClose();
  };

  const hasAnyItems = activeItems.length > 0 || activeIncidental.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="round-summary-modal"
        className="w-full sm:max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{t.summaryTitle}</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {totalGlasses} {t.totalDrinks}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!hasAnyItems ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <span className="text-5xl block mb-3">🍻</span>
              <p className="font-bold text-base">{t.summaryEmpty}</p>
            </div>
          ) : (
            <>
              {/* List of active drinks with increment/decrement */}
              <div className="space-y-2">
                {activeItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0"
                        style={{ backgroundColor: item.drink.color }}
                      >
                        {item.drink.emoji}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm sm:text-base leading-tight truncate">
                          {item.displayName}
                        </h4>
                        {item.isLight && (
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                            Light variant
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Counter Controls */}
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => onDecrement(item.drink, item.isLight)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer font-bold"
                          aria-label={`Min 1 ${item.displayName}`}
                        >
                          <Minus size={15} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center font-black text-sm">
                          {item.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(item.drink, item.isLight)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer font-bold"
                          aria-label={`Plus 1 ${item.displayName}`}
                        >
                          <Plus size={15} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* List of active incidental drinks */}
                {activeIncidental.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs bg-orange-400 text-white">
                        ✨
                      </div>
                      <div>
                        <h4 className="font-black text-sm sm:text-base leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                          {t.incidentalExtraLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Counter Controls */}
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900 rounded-xl p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => onDecrementIncidental?.(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-orange-950 active:scale-95 cursor-pointer font-bold"
                          aria-label="Min 1"
                        >
                          <Minus size={15} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center font-black text-sm text-orange-600 dark:text-orange-400">
                          {item.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrementIncidental?.(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-orange-950 active:scale-95 cursor-pointer font-bold"
                          aria-label="Plus 1"
                        >
                          <Plus size={15} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Remove button */}
                      {onRemoveIncidental && (
                        <button
                          type="button"
                          onClick={() => onRemoveIncidental(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Verwijderen"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Box */}
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">
                    {t.totalGlasses}
                  </span>
                  <div className="text-2xl font-black text-orange-950 dark:text-orange-100">
                    {totalGlasses} {t.totalDrinks}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Copy to Clipboard */}
          <button
            type="button"
            id="btn-copy-summary"
            onClick={handleCopy}
            disabled={!hasAnyItems}
            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-40"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            <span>{copied ? t.copied : t.copy}</span>
          </button>

          {/* Complete and save */}
          <button
            type="button"
            id="btn-complete-round"
            onClick={handleCompleteAndSave}
            disabled={!hasAnyItems}
            className="w-full py-4 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25 transition-all active:scale-98"
          >
            <Sparkles size={18} />
            <span>{t.finishRound} ({totalGlasses})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
