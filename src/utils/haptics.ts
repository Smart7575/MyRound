/**
 * Safe haptic feedback trigger for mobile devices.
 */
export function triggerHaptic(enabled: boolean, pattern: number | number[] = 25): void {
  if (!enabled) return;
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported browser environments
  }
}
