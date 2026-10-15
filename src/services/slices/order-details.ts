import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';
import { errorMessage } from '../../utils/errors';
import { logout, sessionExpired } from './auth';
export const fetchOrderDetails = createAsyncThunk(
  'orderDetails/fetch',
  async (number: number, { rejectWithValue }) => {
    try {
      return (await getOrderByNumberApi(number)).orders[0] || null;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);
const initialState = {
  data: null as TOrder | null,
  loading: false,
  error: '',
  requestId: '',
  number: 0,
  loaded: false
};
const slice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: { clearOrderDetails: () => initialState },
  extraReducers: (b) => {
    b.addCase(fetchOrderDetails.pending, (s, a) => {
      s.loading = true;
      s.loaded = false;
      s.data = null;
      s.error = '';
      s.requestId = a.meta.requestId;
      s.number = a.meta.arg;
    })
      .addCase(fetchOrderDetails.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.loading = false;
        s.loaded = true;
        s.data = a.payload;
      })
      .addCase(fetchOrderDetails.rejected, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.loading = false;
        s.error = String(a.payload || a.error.message);
      })
      .addCase(logout.pending, () => initialState)
      .addCase(sessionExpired, () => initialState);
  }
});
export const { clearOrderDetails } = slice.actions;
export default slice.reducer;
