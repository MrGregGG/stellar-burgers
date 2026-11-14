import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '@utils-types';
export type ConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};
const initialState: ConstructorState = { bun: null, ingredients: [] };
const slice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() }
      }),
      reducer: (s, a: PayloadAction<TConstructorIngredient>) => {
        if (a.payload.type === 'bun') s.bun = a.payload;
        else s.ingredients.push(a.payload);
      }
    },
    removeIngredient: (s, a: PayloadAction<string>) => {
      s.ingredients = s.ingredients.filter((i) => i.id !== a.payload);
    },
    moveIngredient: (
      s,
      a: PayloadAction<{ id: string; direction: -1 | 1 }>
    ) => {
      const from = s.ingredients.findIndex((i) => i.id === a.payload.id);
      const to = from + a.payload.direction;
      if (from < 0 || to < 0 || to >= s.ingredients.length) return;
      [s.ingredients[from], s.ingredients[to]] = [
        s.ingredients[to],
        s.ingredients[from]
      ];
    },
    completeConstructorOrder: (
      s,
      a: PayloadAction<{ bunId: string; ingredientIds: string[] }>
    ) => {
      if (s.bun?.id === a.payload.bunId) s.bun = null;
      s.ingredients = s.ingredients.filter(
        (i) => !a.payload.ingredientIds.includes(i.id)
      );
    },
    clearConstructor: () => initialState
  }
});
export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  completeConstructorOrder
} = slice.actions;
export default slice.reducer;
