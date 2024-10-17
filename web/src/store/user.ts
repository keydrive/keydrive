import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { AuthService } from '../services/AuthService';
import { Injector } from '../services/Injector';
import { PersistConfig } from 'redux-persist/es/types';
import storage from 'redux-persist/lib/storage';
import { UpdateUser, User, UserService } from '../services/UserService';
import { ApiError } from '../services/ApiService';
import { RootState } from './index';

export interface State {
  token?: string;
  currentUser?: User;
}

const initialState: State = {};

interface ThunkApiConfig {
  state: RootState;
  rejectValue: ApiError;
}

const persistConfig: PersistConfig<State> = {
  key: 'user',
  version: 1,
  storage,
  whitelist: ['token'],
};

export const userStore = (injector: Injector) => {
  const authService = injector.resolve(AuthService);
  const userService = injector.resolve(UserService);

  const loginAsync = createAsyncThunk<State['token'], { username: string; password: string }, ThunkApiConfig>(
    'user/login',
    async ({ username, password }, { rejectWithValue }) => {
      try {
        return (await authService.login(username, password)).accessToken;
      } catch (e) {
        return rejectWithValue(e as ApiError);
      }
    },
  );

  const getCurrentUserAsync = createAsyncThunk<State['currentUser'], undefined, ThunkApiConfig>(
    'user/getCurrentUser',
    async (_arg, { rejectWithValue }) => {
      try {
        return await userService.getCurrentUser();
      } catch (e) {
        return rejectWithValue(e as ApiError);
      }
    },
  );

  const updateCurrentUserAsync = createAsyncThunk<State['currentUser'], UpdateUser, ThunkApiConfig>(
    'user/updateCurrentUser',
    async (updates, { rejectWithValue }) => {
      try {
        return await userService.updateCurrentUser(updates);
      } catch (e) {
        return rejectWithValue(e as ApiError);
      }
    },
  );

  function reset(state: Draft<State>) {
    state.token = undefined;
    state.currentUser = undefined;
  }

  const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      logout: (state) => {
        reset(state);
      },
    },
    extraReducers: (builder) => {
      builder.addCase(loginAsync.fulfilled, (state, action) => {
        state.token = action.payload;
      });
      builder.addCase(loginAsync.rejected, (state) => {
        reset(state);
      });
      builder.addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
      builder.addCase(getCurrentUserAsync.rejected, (state) => {
        reset(state);
      });
      builder.addCase(updateCurrentUserAsync.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
    },
  });

  return {
    actions: {
      ...userSlice.actions,
      loginAsync,
      getCurrentUserAsync,
      updateCurrentUserAsync,
    },
    reducer: persistReducer(persistConfig, userSlice.reducer),
    selectors: {
      token: (state: RootState) => state.user.token,
      currentUser: (state: RootState) => state.user.currentUser,
      assertCurrentUser: (state: RootState) => {
        const u = state.user.currentUser;
        if (!u) {
          throw new Error('Current user is undefined.');
        }
        return u;
      },
    },
  };
};
