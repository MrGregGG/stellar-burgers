import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';
import { errorMessage } from '../../utils/errors';
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getIngredientsApi();
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  {
    condition: (_, { getState }) =>
      !(getState() as { ingredients: { loading: boolean } }).ingredients.loading
  }
);
const slice = createSlice({
  name: 'ingredients',
  initialState: {
    items: [] as TIngredient[],
    loading: false,
    loaded: false,
    error: ''
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchIngredients.pending, (s) => {
      s.loading = true;
      s.error = '';
    })
      .addCase(fetchIngredients.fulfilled, (s, a) => {
        s.loading = false;
        s.loaded = true;
        s.items = a.payload;
      })
      .addCase(fetchIngredients.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload || a.error.message);
      });
  }
});
export default slice.reducer;
