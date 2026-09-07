import { Drink } from '../types';

/**
 * Sorts drinks for display on the grid:
 * 1. Pinned drinks first (Bier is always #1 if pinned, or ordered by position)
 * 2. Drinks ordered by their custom grid position (position field)
 * 3. Ties broken by alphabetical name
 */
export function sortDrinks(drinks: Drink[]): Drink[] {
  return [...drinks].sort((a, b) => {
    // Follow custom grid position
    if (a.position !== b.position) {
      return a.position - b.position;
    }

    // Fallback alphabetical
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

/**
 * Recalculate consecutive 0-based positions after reordering or adding/deleting drinks
 */
export function reindexPositions(drinks: Drink[]): Drink[] {
  return drinks.map((drink, index) => ({
    ...drink,
    position: index,
  }));
}

/**
 * Swap two drinks positions directly
 */
export function swapDrinks(drinks: Drink[], drinkIdA: string, drinkIdB: string): Drink[] {
  const sorted = sortDrinks(drinks);
  const indexA = sorted.findIndex((d) => d.id === drinkIdA);
  const indexB = sorted.findIndex((d) => d.id === drinkIdB);
  if (indexA === -1 || indexB === -1 || indexA === indexB) return drinks;

  const updated = [...sorted];
  const temp = updated[indexA];
  updated[indexA] = updated[indexB];
  updated[indexB] = temp;

  return reindexPositions(updated);
}

/**
 * Move a drink to a new 0-based target position in the list
 */
export function moveDrinkToPosition(drinks: Drink[], drinkId: string, targetPosition: number): Drink[] {
  const sorted = sortDrinks(drinks);
  const currentIndex = sorted.findIndex((d) => d.id === drinkId);
  if (currentIndex === -1) return drinks;

  const validTarget = Math.max(0, Math.min(sorted.length - 1, targetPosition));
  if (currentIndex === validTarget) return drinks;

  const updated = [...sorted];
  const [movedItem] = updated.splice(currentIndex, 1);
  updated.splice(validTarget, 0, movedItem);

  return reindexPositions(updated);
}
