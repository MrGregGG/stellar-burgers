import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { TOrder } from '@utils-types';
import {
  completeConstructorOrder,
  ConstructorState
} from './burger-constructor';
import { fetchFeed } from './feed';
import { fetchProfileOrders } from './profile-orders';
import { errorMessage } from '../../utils/errors';
import { sessionGeneration } from '../../utils/session';
import { logout, sessionExpired } from './auth';
export const createOrder = createAsyncThunk(
  'order/create',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { bun, ingredients } = (
      getState() as { burgerConstructor: ConstructorState }
    ).burgerConstructor;
    if (!bun) return rejectWithValue('Выберите булку');
    const generation = sessionGeneration();
    try {
      const response = await orderBurgerApi([
        bun._id,
        ...ingredients.map((i) => i._id),
        bun._id
      ]);
      if (generation !== sessionGeneration())
        return rejectWithValue('Сессия завершена');
      dispatch(
        completeConstructorOrder({
          bunId: bun.id,
          ingredientIds: ingredients.map((i) => i.id)
        })
      );
      dispatch(fetchFeed());
      dispatch(fetchProfileOrders());
      return response.order;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const s = getState() as {
        order: { loading: boolean };
        auth: { user: unknown };
      };
      return !!s.auth.user && !s.order.loading;
    }
  }
);
const initialState = {
  data: null as TOrder | null,
  loading: false,
  error: '',
  requestId: '',
  modalOpen: false
};
const slice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    closeOrder: (s) => {
      s.data = null;
      s.error = '';
      s.modalOpen = false;
    }
  },
  extraReducers: (b) => {
    b.addCase(createOrder.pending, (s, a) => {
      s.loading = true;
      s.modalOpen = true;
      s.data = null;
      s.error = '';
      s.requestId = a.meta.requestId;
    })
      .addCase(createOrder.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.loading = false;
        s.data = a.payload;
        s.modalOpen = true;
      })
      .addCase(createOrder.rejected, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.loading = false;
        s.error = String(a.payload || a.error.message);
      })
      .addCase(logout.pending, () => initialState)
      .addCase(sessionExpired, () => initialState);
  }
});
export const { closeOrder } = slice.actions;
export default slice.reducer;
