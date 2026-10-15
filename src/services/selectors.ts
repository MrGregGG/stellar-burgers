import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
export const selectIngredients = (s: RootState) => s.ingredients.items;
export const selectConstructor = (s: RootState) => s.burgerConstructor;
export const selectBuns = createSelector(selectIngredients, (items) =>
  items.filter((i) => i.type === 'bun')
);
export const selectMains = createSelector(selectIngredients, (items) =>
  items.filter((i) => i.type === 'main')
);
export const selectSauces = createSelector(selectIngredients, (items) =>
  items.filter((i) => i.type === 'sauce')
);
export const selectPrice = createSelector(
  selectConstructor,
  ({ bun, ingredients }) =>
    (bun ? bun.price * 2 : 0) + ingredients.reduce((sum, i) => sum + i.price, 0)
);
export const selectCounters = createSelector(
  selectConstructor,
  ({ bun, ingredients }) => {
    const counts: Record<string, number> = {};
    ingredients.forEach((i) => {
      counts[i._id] = (counts[i._id] || 0) + 1;
    });
    if (bun) counts[bun._id] = 2;
    return counts;
  }
);
