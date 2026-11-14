import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TOrder } from '@utils-types';
import { errorMessage } from '../../utils/errors';
export const fetchFeed = createAsyncThunk(
  'feed/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getFeedsApi();
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  {
    condition: (_, { getState }) =>
      !(getState() as { feed: { loading: boolean } }).feed.loading
  }
);
const slice = createSlice({
  name: 'feed',
  initialState: {
    orders: [] as TOrder[],
    total: 0,
    totalToday: 0,
    loading: false,
    loaded: false,
    error: ''
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFeed.pending, (s) => {
      s.loading = true;
      s.error = '';
    })
      .addCase(fetchFeed.fulfilled, (s, a) => {
        s.loading = false;
        s.loaded = true;
        s.orders = a.payload.orders;
        s.total = a.payload.total;
        s.totalToday = a.payload.totalToday;
      })
      .addCase(fetchFeed.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.payload || a.error.message);
      });
  }
});
export default slice.reducer;
