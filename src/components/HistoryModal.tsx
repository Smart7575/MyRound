import React, { useState } from 'react';
import { SavedRound, Language } from '../types';
import { translations } from '../i18n';
import { X, Download, Trash2, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rounds: SavedRound[];
  onClearHistory: () => void;
  language: Language;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  rounds,
  onClearHistory,
  language,
}) => {
  const t = translations[language];
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate statistics
  const totalRounds = rounds.length;
  const totalDrinks = rounds.reduce((acc, r) => acc + r.totalCount, 0);

  // Favorite drink calculation
  const drinkCountsMap: Record<string, { count: number; name: string; emoji: string }> = {};
  rounds.forEach((round) => {
    round.items.forEach((item) => {
      if (!drinkCountsMap[item.drinkName]) {
        drinkCountsMap[item.drinkName] = { count: 0, name: item.drinkName, emoji: item.emoji };
      }
      drinkCountsMap[item.drinkName].count += item.count;
    });
  });

  const sortedFavorite = Object.values(drinkCountsMap).sort((a, b) => b.count - a.count)[0];

  // CSV Export (without prices)
  const handleExportCsv = () => {
    if (rounds.length === 0) return;

    let csv = 'Ronde,Datum,Tijd,Drankje,Aantal,BetaaldDoor\n';
    rounds.forEach((round, roundIndex) => {
      const date = new Date(round.timestamp);
      const dateStr = date.toLocaleDateString('nl-NL');
      const timeStr = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

      round.items.forEach((item) => {
        const payer = round.paidBy ? `"${round.paidBy.replace(/"/g, '""')}"` : '';
        const name = `"${item.drinkName.replace(/"/g, '""')}"`;
        csv += `${roundIndex + 1},${dateStr},${timeStr},${name},${item.count},${payer}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rondjesteller-geschiedenis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      time: d.toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="history-modal"
        className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t.historyTitle}</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.historySubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {rounds.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <span className="text-5xl block mb-3">📜</span>
              <p className="font-bold text-base">{t.noHistory}</p>
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">{t.noHistoryDesc}</p>
            </div>
          ) : (
            <>
              {/* High-level Statistics Banner */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="p-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t.totalRoundsCount}
                  </span>
                  <span className="text-2xl font-black text-orange-500">
                    {totalRounds}
                  </span>
                </div>
                <div className="p-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t.totalDrinksConsumed}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {totalDrinks}
                  </span>
                </div>
                {sortedFavorite && (
                  <div className="p-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {t.favoriteDrink}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 truncate">
                      {sortedFavorite.emoji} {sortedFavorite.name} ({sortedFavorite.count}×)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Export CSV & Clear */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
                >
                  <Download size={14} />
                  {t.exportCsv}
                </button>

                {showClearConfirm ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClearHistory();
                        setShowClearConfirm(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black cursor-pointer shadow-xs"
                    >
                      {t.clearHistory}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 size={13} />
                    {t.clearHistory}
                  </button>
                )}
              </div>

              {/* List of Previous Rounds (Newest First) */}
              <div className="space-y-3 pt-2">
                {[...rounds].reverse().map((round, revIndex) => {
                  const roundNum = rounds.length - revIndex;
                  const { date, time } = formatDate(round.timestamp);
                  const isExpanded = expandedRoundId === round.id;

                  return (
                    <div
                      key={round.id}
                      className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden"
                    >
                      {/* Round Header / summary row */}
                      <button
                        type="button"
                        onClick={() => setExpandedRoundId(isExpanded ? null : round.id)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 dark:bg-orange-400/15 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm shadow-xs">
                            #{roundNum}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                                {round.totalCount} {t.totalDrinks}
                              </span>
                              {round.paidBy && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                  {t.treatedBy}: {round.paidBy}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>
                      </button>

                      {/* Expanded Drink Breakdown */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/50">
                          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                            {round.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 font-medium"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span>{item.emoji}</span>
                                  <span className="truncate">{item.drinkName}</span>
                                </span>
                                <span className="font-black ml-1.5 shrink-0 text-slate-900 dark:text-slate-100">
                                  {item.count}×
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
