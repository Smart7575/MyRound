import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Trash2, ArrowLeftRight, Sparkles } from 'lucide-react';
import { Drink, TileSize, Language } from '../types';
import { getContrastTextColor, getDarkerBorderColor } from '../utils/contrast';
import { triggerHaptic } from '../utils/haptics';

interface DrinkTileProps {
  drink: Drink;
  count: number;
  lightCount?: number;
  tileSize: TileSize;
  language?: Language;
  hapticsEnabled: boolean;
  isSelectedForReorder: boolean;
  isReorderModeActive: boolean;
  onIncrement: (drink: Drink, isLight?: boolean) => void;
  onDecrement: (drink: Drink, isLight?: boolean) => void;
  onStartReorder: (drink: Drink) => void;
  onSelectReorderTarget: (drink: Drink) => void;
  onPromptDelete: (drink: Drink) => void;
}

export const DrinkTile: React.FC<DrinkTileProps> = ({
  drink,
  count,
  lightCount = 0,
  tileSize,
  language = 'nl',
  hapticsEnabled,
  isSelectedForReorder,
  isReorderModeActive,
  onIncrement,
  onDecrement,
  onStartReorder,
  onSelectReorderTarget,
  onPromptDelete,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [tapEffect, setTapEffect] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const isCompact = tileSize === 'compact';
  const isLarge = tileSize === 'large';
  const normalLabel = language === 'en' ? 'Regular' : 'Normaal';

  const textColor = getContrastTextColor(drink.color);
  const darkerBorderColor = getDarkerBorderColor(drink.color);

  const totalDrinkCount = count + lightCount;

  // Single regular tile click (for drinks without light variant)
  const handleSingleTileClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (isReorderModeActive) {
      onSelectReorderTarget(drink);
      triggerHaptic(hapticsEnabled, 30);
      return;
    }

    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 140);

    triggerHaptic(hapticsEnabled, 15);
    onIncrement(drink, false);
  };

  const handleVariantIncrement = (
    e: React.MouseEvent | React.TouchEvent,
    isLight: boolean
  ) => {
    e.stopPropagation();
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (isReorderModeActive) {
      onSelectReorderTarget(drink);
      triggerHaptic(hapticsEnabled, 30);
      return;
    }

    triggerHaptic(hapticsEnabled, 15);
    onIncrement(drink, isLight);
  };

  const startLongPress = () => {
    isLongPressTriggeredRef.current = false;
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsPressing(false);
      triggerHaptic(hapticsEnabled, [40, 60, 40]);
      onStartReorder(drink);
    }, 420);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleMinusClick = (
    e: React.MouseEvent | React.TouchEvent,
    isLight = false
  ) => {
    e.stopPropagation();
    cancelLongPress();
    triggerHaptic(hapticsEnabled, 20);
    onDecrement(drink, isLight);
  };

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    cancelLongPress();
    triggerHaptic(hapticsEnabled, 25);
    onPromptDelete(drink);
  };

  const hasLight = Boolean(drink.hasLightVariant);

  return (
    <motion.div
      id={`drink-tile-${drink.id}`}
      layout
      whileTap={{ scale: 0.97 }}
      animate={{
        scale: isSelectedForReorder ? 1.04 : tapEffect ? 1.02 : 1,
        y: isSelectedForReorder ? [-2, 2, -2] : 0,
      }}
      transition={
        isSelectedForReorder
          ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 500, damping: 25 }
      }
      onClick={!hasLight ? handleSingleTileClick : undefined}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchCancel={cancelLongPress}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', drink.id);
        onStartReorder(drink);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onSelectReorderTarget(drink);
      }}
      style={{
        backgroundColor: drink.color,
        color: textColor,
        borderColor: darkerBorderColor,
      }}
      className={`relative group select-none cursor-pointer rounded-2xl sm:rounded-[2rem] shadow-md flex flex-col justify-between border-b-4 sm:border-b-8 transition-all duration-100 overflow-hidden aspect-square w-full ${
        isCompact ? 'p-1 sm:p-2' : isLarge ? 'p-2 sm:p-3.5' : 'p-1 sm:p-2.5'
      } ${
        isSelectedForReorder
          ? 'ring-4 ring-orange-500 shadow-2xl z-30'
          : isReorderModeActive
          ? 'ring-2 ring-dashed ring-white/60 hover:ring-white hover:scale-102'
          : isPressing
          ? 'ring-4 ring-orange-400/80 scale-98'
          : ''
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${drink.name}, count ${count}${hasLight ? `, light ${lightCount}` : ''}`}
    >
      {/* Top-Left: Discreet Delete Icon + Position Indicator */}
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-0.5 z-20">
        <button
          type="button"
          id={`delete-drink-${drink.id}`}
          onClick={handleDeleteClick}
          title={language === 'en' ? `Delete ${drink.name}` : `Drankje ${drink.name} verwijderen`}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/25 hover:bg-red-600 active:scale-90 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs backdrop-blur-xs"
          aria-label={language === 'en' ? `Delete ${drink.name}` : `Verwijder ${drink.name}`}
        >
          <Trash2 size={10} className="sm:w-3 sm:h-3" />
        </button>
        <span className="text-[9px] sm:text-[10px] font-mono font-black opacity-60 pointer-events-none drop-shadow-xs ml-0.5">
          #{drink.position + 1}
        </span>
      </div>

      {/* Reorder Mode Indicator Badge on Selected Tile */}
      {isSelectedForReorder && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-slate-900/90 text-white px-2 py-1 rounded-xl text-[9px] sm:text-xs font-black flex items-center gap-1 shadow-lg pointer-events-none">
          <ArrowLeftRight size={11} />
          <span>{language === 'en' ? 'Choose slot' : 'Kies plek'}</span>
        </div>
      )}

      {/* ================= CONDITION A: DRINK WITH LIGHT VARIANT ================= */}
      {hasLight ? (
        <div className="w-full h-full flex flex-col justify-between pt-0.5">
          {/* Tile Header: Name, Emoji & Total Count Badge */}
          <div className={`flex items-center justify-between pl-8 sm:pl-10 pr-0.5 ${
            isCompact ? 'min-h-[20px] sm:min-h-[26px]' : isLarge ? 'min-h-[28px] sm:min-h-[38px]' : 'min-h-[24px] sm:min-h-[32px]'
          }`}>
            <div className="flex items-center gap-1 sm:gap-1.5 truncate">
              <span className={`leading-none drop-shadow-xs select-none ${
                isCompact ? 'text-sm sm:text-xl' : isLarge ? 'text-lg sm:text-3xl' : 'text-base sm:text-2xl'
              }`}>
                {drink.emoji || '🥤'}
              </span>
              <span className={`font-black uppercase tracking-tight truncate drop-shadow-xs ${
                isCompact ? 'text-[9px] sm:text-xs' : isLarge ? 'text-[11px] sm:text-base' : 'text-[10px] sm:text-sm'
              }`}>
                {drink.name}
              </span>
            </div>

            {/* Total count badge for this drink */}
            <AnimatePresence>
              {totalDrinkCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="bg-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[9px] sm:text-xs font-black shadow-xs shrink-0"
                  style={{ color: darkerBorderColor }}
                  title={`${totalDrinkCount} ${language === 'en' ? 'total' : 'totaal'}`}
                >
                  <span>{totalDrinkCount}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Sub-panels: "Regular / Normaal" vs "Light" with independent counters */}
          <div className={`flex gap-1 sm:gap-2 flex-1 min-h-0 ${isCompact ? 'pt-0.5 pb-0' : 'pt-1 pb-0.5'}`}>
            {/* 1) REGULAR / NORMAAL VARIANT BUTTON */}
            <div
              onClick={(e) => handleVariantIncrement(e, false)}
              className={`flex-1 rounded-xl sm:rounded-2xl bg-black/15 hover:bg-black/25 active:scale-96 border border-black/10 flex flex-col items-center justify-between transition-all cursor-pointer relative overflow-hidden ${
                isCompact ? 'p-0.5 sm:p-1.5' : isLarge ? 'p-1.5 sm:p-2.5' : 'p-1 sm:p-2'
              }`}
              role="button"
              tabIndex={0}
              title={language === 'en' ? `Add 1 ${drink.name} ${normalLabel}` : `1 ${drink.name} ${normalLabel} toevoegen`}
              aria-label={`${drink.name} ${normalLabel}, count ${count}`}
            >
              <div className="w-full text-center">
                <span className={`font-black uppercase tracking-wider block opacity-90 ${
                  isCompact ? 'text-[7px] sm:text-[9px]' : isLarge ? 'text-[9px] sm:text-xs' : 'text-[8px] sm:text-[11px]'
                }`}>
                  {normalLabel}
                </span>
              </div>

              {/* Count Circle or Plus Icon */}
              <div className="my-auto flex items-center justify-center">
                {count > 0 ? (
                  <span
                    className={`rounded-full bg-white flex items-center justify-center font-black shadow-md ${
                      isCompact ? 'w-4 h-4 sm:w-6 sm:h-6 text-[9px] sm:text-xs' : isLarge ? 'w-6 h-6 sm:w-9 sm:h-9 text-xs sm:text-lg' : 'w-5 h-5 sm:w-8 sm:h-8 text-[10px] sm:text-base'
                    }`}
                    style={{ color: darkerBorderColor }}
                  >
                    {count}
                  </span>
                ) : (
                  <span className={`font-black opacity-60 leading-none ${
                    isCompact ? 'text-[10px] sm:text-base' : isLarge ? 'text-sm sm:text-xl' : 'text-xs sm:text-lg'
                  }`}>
                    +
                  </span>
                )}
              </div>

              {/* Minus Button for Normal / Regular */}
              <div className={`w-full flex justify-center ${isCompact ? 'h-3.5 sm:h-5' : isLarge ? 'h-5 sm:h-7' : 'h-4 sm:h-6'}`}>
                {count > 0 && !isReorderModeActive && (
                  <button
                    type="button"
                    onClick={(e) => handleMinusClick(e, false)}
                    title={language === 'en' ? `Remove 1 ${drink.name} ${normalLabel}` : `1 ${drink.name} ${normalLabel} verminderen`}
                    className={`rounded-md bg-black/30 hover:bg-black/50 active:scale-85 text-white flex items-center justify-center font-black transition-all cursor-pointer ${
                      isCompact ? 'w-3.5 h-3.5 sm:w-5 sm:h-5' : isLarge ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-4 h-4 sm:w-6 sm:h-6'
                    }`}
                    aria-label={language === 'en' ? `Remove 1 ${drink.name} ${normalLabel}` : `Verminder 1 ${drink.name} ${normalLabel}`}
                  >
                    <Minus size={isCompact ? 8 : isLarge ? 12 : 10} strokeWidth={3.5} />
                  </button>
                )}
              </div>
            </div>

            {/* 2) LIGHT VARIANT BUTTON */}
            <div
              onClick={(e) => handleVariantIncrement(e, true)}
              className={`flex-1 rounded-xl sm:rounded-2xl bg-white/25 hover:bg-white/35 active:scale-96 border border-white/40 flex flex-col items-center justify-between transition-all cursor-pointer relative overflow-hidden backdrop-blur-xs ${
                isCompact ? 'p-0.5 sm:p-1.5' : isLarge ? 'p-1.5 sm:p-2.5' : 'p-1 sm:p-2'
              }`}
              role="button"
              tabIndex={0}
              title={language === 'en' ? `Add 1 ${drink.name} Light` : `1 ${drink.name} Light toevoegen`}
              aria-label={`${drink.name} Light, count ${lightCount}`}
            >
              <div className="w-full flex items-center justify-center gap-0.5">
                <Sparkles size={isCompact ? 7 : isLarge ? 11 : 9} className="opacity-90 sm:w-3 sm:h-3" />
                <span className={`font-black uppercase tracking-wider block opacity-95 ${
                  isCompact ? 'text-[7px] sm:text-[9px]' : isLarge ? 'text-[9px] sm:text-xs' : 'text-[8px] sm:text-[11px]'
                }`}>
                  Light
                </span>
              </div>

              {/* Count Circle or Plus Icon */}
              <div className="my-auto flex items-center justify-center">
                {lightCount > 0 ? (
                  <span
                    className={`rounded-full bg-white flex items-center justify-center font-black shadow-md text-sky-700 ${
                      isCompact ? 'w-4 h-4 sm:w-6 sm:h-6 text-[9px] sm:text-xs' : isLarge ? 'w-6 h-6 sm:w-9 sm:h-9 text-xs sm:text-lg' : 'w-5 h-5 sm:w-8 sm:h-8 text-[10px] sm:text-base'
                    }`}
                  >
                    {lightCount}
                  </span>
                ) : (
                  <span className={`font-black opacity-60 leading-none ${
                    isCompact ? 'text-[10px] sm:text-base' : isLarge ? 'text-sm sm:text-xl' : 'text-xs sm:text-lg'
                  }`}>
                    +
                  </span>
                )}
              </div>

              {/* Minus Button for Light */}
              <div className={`w-full flex justify-center ${isCompact ? 'h-3.5 sm:h-5' : isLarge ? 'h-5 sm:h-7' : 'h-4 sm:h-6'}`}>
                {lightCount > 0 && !isReorderModeActive && (
                  <button
                    type="button"
                    onClick={(e) => handleMinusClick(e, true)}
                    title={language === 'en' ? `Remove 1 ${drink.name} Light` : `1 ${drink.name} Light verminderen`}
                    className={`rounded-md bg-black/30 hover:bg-black/50 active:scale-85 text-white flex items-center justify-center font-black transition-all cursor-pointer ${
                      isCompact ? 'w-3.5 h-3.5 sm:w-5 sm:h-5' : isLarge ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-4 h-4 sm:w-6 sm:h-6'
                    }`}
                    aria-label={language === 'en' ? `Remove 1 ${drink.name} Light` : `Verminder 1 ${drink.name} Light`}
                  >
                    <Minus size={isCompact ? 8 : isLarge ? 12 : 10} strokeWidth={3.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CONDITION B: STANDARD SINGLE DRINK ================= */
        <>
          {/* Top-Right: Round Counter Circle Badge */}
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className={`absolute top-1 right-1 sm:top-2.5 sm:right-2.5 bg-white rounded-full flex items-center justify-center font-black shadow-md z-10 ${
                  isCompact ? 'w-5 h-5 sm:w-9 sm:h-9 text-[10px] sm:text-base' : isLarge ? 'w-7 h-7 sm:w-13 sm:h-13 text-xs sm:text-xl' : 'w-6 h-6 sm:w-11 sm:h-11 text-[11px] sm:text-lg'
                }`}
                style={{ color: darkerBorderColor }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Center Graphic: Emoji & Bold Uppercase Name */}
          <div
            className={`flex flex-col items-center justify-center text-center my-auto px-0.5 max-w-full ${
              isSelectedForReorder ? 'opacity-25' : ''
            }`}
          >
            <div className={`leading-none drop-shadow-xs select-none transition-transform group-hover:scale-105 ${
              isCompact ? 'text-xl sm:text-4xl' : isLarge ? 'text-3xl sm:text-6xl' : 'text-2xl sm:text-5xl'
            }`}>
              {drink.emoji || '🍺'}
            </div>
            <div className={`font-black uppercase tracking-tight sm:tracking-wider drop-shadow-xs truncate max-w-full ${
              isCompact ? 'text-[9px] sm:text-sm mt-0.5 sm:mt-1' : isLarge ? 'text-xs sm:text-lg mt-1.5 sm:mt-2.5' : 'text-[10px] sm:text-base mt-1 sm:mt-2'
            }`}>
              {drink.name}
            </div>
          </div>

          {/* Bottom Left: Tactile Chunky Decrement Button ("-") */}
          {count > 0 && !isReorderModeActive && (
            <button
              type="button"
              id={`drink-minus-${drink.id}`}
              onClick={(e) => handleMinusClick(e, false)}
              title={language === 'en' ? `Remove 1 ${drink.name}` : `1 ${drink.name} verminderen`}
              style={{ backgroundColor: darkerBorderColor }}
              className={`absolute bottom-1 left-1 sm:bottom-2.5 sm:left-2.5 text-white rounded-md sm:rounded-xl flex items-center justify-center font-black shadow-inner opacity-90 hover:opacity-100 active:scale-90 transition-all cursor-pointer z-10 ${
                isCompact ? 'w-5 h-5 sm:w-7 sm:h-7' : isLarge ? 'w-7 h-7 sm:w-11 sm:h-11' : 'w-6 h-6 sm:w-9 sm:h-9'
              }`}
              aria-label={language === 'en' ? `Remove 1 ${drink.name}` : `Verminder 1 ${drink.name}`}
            >
              <Minus size={isCompact ? 10 : isLarge ? 16 : 13} strokeWidth={3.5} />
            </button>
          )}
        </>
      )}
    </motion.div>
  );
};
