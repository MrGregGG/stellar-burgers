import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi,
  TLoginData,
  TRegisterData
} from '@api';
import { TUser } from '@utils-types';
import { getCookie } from '../../utils/cookie';
import { clearTokens, saveTokens } from '../../utils/session';
import { errorMessage } from '../../utils/errors';
const authIdle = (_: unknown, { getState }: { getState: () => unknown }) =>
  !(getState() as { auth: { loading: boolean } }).auth.loading;
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken'))
      return null;
    try {
      return (await getUserApi()).user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const a = (
        getState() as { auth: { checking: boolean; checked: boolean } }
      ).auth;
      return !a.checking && !a.checked;
    }
  }
);
export const login = createAsyncThunk(
  'auth/login',
  async (data: TLoginData, { rejectWithValue }) => {
    try {
      const r = await loginUserApi(data);
      saveTokens(r);
      return r.user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  { condition: authIdle }
);
export const register = createAsyncThunk(
  'auth/register',
  async (data: TRegisterData, { rejectWithValue }) => {
    try {
      const r = await registerUserApi(data);
      saveTokens(r);
      return r.user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  { condition: authIdle }
);
export const updateUser = createAsyncThunk(
  'auth/update',
  async (data: Partial<TRegisterData>, { rejectWithValue }) => {
    try {
      return (await updateUserApi(data)).user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  { condition: authIdle }
);
export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    // fetch reads the refresh token synchronously, before local credentials are cleared.
    const request = logoutApi();
    clearTokens();
    try {
      await request;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
  { condition: authIdle }
);
const initialState = {
  user: null as TUser | null,
  checked: false,
  checking: false,
  loading: false,
  error: '',
  requestId: ''
};
const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired: (s) => {
      s.user = null;
      s.checked = true;
      s.checking = false;
      s.loading = false;
      s.requestId = '';
    },
    clearAuthError: (s) => {
      s.error = '';
    }
  },
  extraReducers: (b) => {
    b.addCase(checkAuth.pending, (s) => {
      s.checking = true;
    })
      .addCase(checkAuth.fulfilled, (s, a) => {
        s.checking = false;
        s.checked = true;
        s.user = a.payload;
      })
      .addCase(checkAuth.rejected, (s, a) => {
        s.checking = false;
        s.checked = true;
        s.user = null;
        s.error = String(a.payload || 'Не удалось проверить сессию');
      });
    [login, register, updateUser].forEach((thunk) => {
      b.addCase(thunk.pending, (s, a) => {
        s.loading = true;
        s.error = '';
        s.requestId = a.meta.requestId;
      })
        .addCase(thunk.fulfilled, (s, a) => {
          if (s.requestId !== a.meta.requestId) return;
          s.loading = false;
          s.user = a.payload;
          s.checked = true;
        })
        .addCase(thunk.rejected, (s, a) => {
          if (s.requestId !== a.meta.requestId) return;
          s.loading = false;
          s.error = String(a.payload || a.error.message);
        });
    });
    b.addCase(logout.pending, (s) => {
      s.user = null;
      s.loading = true;
      s.error = '';
      s.requestId = '';
    })
      .addCase(logout.fulfilled, (s) => {
        s.loading = false;
        s.checked = true;
      })
      .addCase(logout.rejected, (s) => {
        s.loading = false;
        s.checked = true;
        s.error =
          'Вы вышли на этом устройстве. Сервер не подтвердил завершение сессии.';
      });
  }
});
export const { sessionExpired, clearAuthError } = slice.actions;
export default slice.reducer;
