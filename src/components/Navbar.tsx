import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { SlidersHorizontal, Settings, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  language: Language;
  totalGlasses: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenManage: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  totalGlasses,
  darkMode,
  onToggleDarkMode,
  onOpenManage,
  onOpenSettings,
}) => {
  const t = translations[language];

  return (
    <header className="shrink-0 w-full bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-1.5 sm:py-3 transition-colors">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 flex items-center justify-between gap-2">
        {/* Brand & Heading */}
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-900 dark:bg-transparent border border-slate-800 dark:border-transparent transition-colors">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight select-none truncate">
              <span className="text-white">MY</span><span className="text-orange-500">ROUND</span>
            </h1>
            {totalGlasses > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-orange-500 text-white shadow-xs">
                {totalGlasses}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium text-xs mt-0.5">
            {language === 'nl' ? 'Wie haalt de volgende?' : "Who's getting the next one?"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Manage Drinks */}
          <button
            type="button"
            id="nav-manage-btn"
            onClick={onOpenManage}
            className="bg-white dark:bg-slate-800 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs"
            title={t.manageDrinksTitle}
          >
            <SlidersHorizontal size={16} className="sm:w-4.5 sm:h-4.5" />
            <span className="hidden md:inline">{t.manageDrinksTitle}</span>
          </button>

          {/* Dark Mode / Light Mode Toggle */}
          <button
            type="button"
            id="nav-dark-btn"
            onClick={onToggleDarkMode}
            className="bg-white dark:bg-slate-800 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title={
              darkMode
                ? (language === 'nl' ? 'Schakel naar lichte weergave (zon)' : 'Switch to light mode')
                : (language === 'nl' ? 'Schakel naar donkere weergave (maan)' : 'Switch to dark mode')
            }
            aria-label={darkMode ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
          >
            {darkMode ? (
              <Sun size={16} className="sm:w-4.5 sm:h-4.5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={16} className="sm:w-4.5 sm:h-4.5 text-slate-700 dark:text-slate-300 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="bg-white dark:bg-slate-800 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-transform active:scale-95 cursor-pointer"
            title={t.settingsTitle}
          >
            <Settings size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
