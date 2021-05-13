import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { AuthService } from '../services/AuthService';
import { Injector } from '../services/Injector';
import { PersistConfig } from 'redux-persist/es/types';
import storage from 'redux-persist/lib/storage';

export interface State {
  token?: string;
}

interface RootState {
  user: State;
}

const initialState: State = {};

interface ThunkApiConfig {
  state: RootState;
  rejectValue: unknown;
}

const persistConfig: PersistConfig<State> = {
  key: 'user',
  version: 1,
  storage,
  whitelist: ['token'],
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const userStore = (injector: Injector) => {
  const authService = injector.resolve(AuthService);

  const loginAsync = createAsyncThunk<State, { username: string; password: string }, ThunkApiConfig>(
    'user/login',
    async ({ username, password }, { rejectWithValue }) => {
      try {
        const response = await authService.login(username, password);
        return {
          token: response.accessToken,
        };
      } catch (e) {
        return rejectWithValue(e);
      }
    }
  );

  const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      logout: (state: Draft<State>) => {
        state.token = undefined;
      },
    },
    extraReducers: (builder) => {
      builder.addCase(loginAsync.fulfilled, (state, action) => {
        state.token = action.payload.token;
      });
      builder.addCase(loginAsync.rejected, (state) => {
        state.token = undefined;
      });
    },
  });

  return {
    actions: {
      ...userSlice.actions,
      loginAsync,
    },
    reducer: persistReducer(persistConfig, userSlice.reducer),
    selectors: {
      isLoggedIn: (state: RootState) => !!state.user.token,
    },
  };
};
