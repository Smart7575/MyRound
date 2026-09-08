import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { RotateCcw, Check } from 'lucide-react';

interface BottomBarProps {
  totalGlasses: number;
  language: Language;
  onOpenSummary: () => void;
  onPromptReset: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  totalGlasses,
  language,
  onOpenSummary,
  onPromptReset,
}) => {
  const t = translations[language];

  return (
    <div className="shrink-0 w-full px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] sm:p-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 z-20">
      <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-4 h-12 sm:h-18">
        {/* Main "Rondje Klaar" Primary Action Button */}
        <button
          type="button"
          id="btn-round-done"
          onClick={onOpenSummary}
          className={`flex-[3] rounded-2xl sm:rounded-3xl flex items-center justify-between px-3.5 sm:px-8 h-full shadow-lg transition-transform active:scale-95 cursor-pointer border-b-4 sm:border-b-6 border-slate-950 dark:border-slate-300 ${
            totalGlasses > 0
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-800/80 text-slate-300 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {/* Left: Icon + Uppercase Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-white/20 dark:bg-black/10 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <Check size={20} strokeWidth={3.5} className="text-white dark:text-slate-900 sm:w-6 sm:h-6" />
            </div>
            <span className="text-sm sm:text-2xl font-black uppercase tracking-wider text-left">
              {t.finishRound}
            </span>
          </div>

          {/* Right: Big Bold Count with Orange Highlight */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xl sm:text-3xl font-black text-orange-400 dark:text-orange-500">
              {totalGlasses}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white/70 dark:text-slate-600">
              {t.totalDrinks}
            </span>
          </div>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          id="btn-bottom-reset"
          onClick={onPromptReset}
          className="flex-1 max-w-[90px] sm:max-w-[130px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-base h-full transition-transform active:scale-95 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shrink-0"
          title={t.resetRound}
        >
          <RotateCcw size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
