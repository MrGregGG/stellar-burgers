import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';
import { logout, sessionExpired } from './auth';
import { errorMessage } from '../../utils/errors';
export const fetchProfileOrders = createAsyncThunk(
  'profileOrders/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersApi();
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const s = getState() as {
        profileOrders: { loading: boolean };
        auth: { user: unknown };
      };
      return !!s.auth.user && !s.profileOrders.loading;
    }
  }
);
const initialState = {
  orders: [] as TOrder[],
  loading: false,
  loaded: false,
  error: '',
  requestId: ''
};
const slice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProfileOrders.pending, (s, a) => {
      s.loading = true;
      s.error = '';
      s.requestId = a.meta.requestId;
    })
      .addCase(fetchProfileOrders.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.loading = false;
        s.loaded = true;
        s.orders = a.payload;
      })
      .addCase(fetchProfileOrders.rejected, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.loading = false;
        s.error = String(a.payload || a.error.message);
      })
      .addCase(logout.pending, () => initialState)
      .addCase(sessionExpired, () => initialState);
  }
});
export default slice.reducer;
