/**
 * Calculate relative luminance of a hex color
 * and determine whether text should be dark (#0f172a) or white (#ffffff)
 * for optimal WCAG AA contrast compliance.
 */
export function getContrastTextColor(hexColor: string): string {
  // Normalize hex
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  if (hex.length !== 6) {
    return '#ffffff';
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Convert to sRGB luminance
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // High luminance threshold: use dark charcoal text, else bright crisp white
  return L > 0.45 ? '#09090b' : '#ffffff';
}

/**
 * Returns a slightly adjusted background for badges or buttons inside the tile
 */
export function getSubtleOverlayColor(hexColor: string): { badgeBg: string; badgeText: string } {
  const textColor = getContrastTextColor(hexColor);
  if (textColor === '#ffffff') {
    // Dark background tile: badges look best with semi-transparent white or pure white pill
    return {
      badgeBg: 'rgba(255, 255, 255, 0.22)',
      badgeText: '#ffffff',
    };
  } else {
    // Light background tile: badges look best with semi-transparent dark or black pill
    return {
      badgeBg: 'rgba(0, 0, 0, 0.12)',
      badgeText: '#09090b',
    };
  }
}

/**
 * Darkens a hex color by 28% to create the signature 3D bottom lip border (border-b-8)
 */
export function getDarkerBorderColor(hexColor: string): string {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return '#000000';

  const r = Math.max(0, Math.floor(parseInt(hex.substring(0, 2), 16) * 0.72));
  const g = Math.max(0, Math.floor(parseInt(hex.substring(2, 4), 16) * 0.72));
  const b = Math.max(0, Math.floor(parseInt(hex.substring(4, 6), 16) * 0.72));

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

