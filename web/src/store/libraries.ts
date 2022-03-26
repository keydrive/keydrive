import { LibrariesService, Library } from '../services/LibrariesService';
import { RootState } from './index';
import { ApiError } from '../services/ApiService';
import { Injector } from '../services/Injector';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface State {
  libraries?: Library[];
}

const initialState: State = {};

interface ThunkApiConfig {
  state: RootState;
  rejectValue: ApiError;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const librariesStore = (injector: Injector) => {
  const librariesService = injector.resolve(LibrariesService);

  const getLibrariesAsync = createAsyncThunk<State['libraries'], undefined, ThunkApiConfig>(
    'libraries/getLibraries',
    async (arg, { rejectWithValue }) => {
      try {
        return await librariesService.listLibraries();
      } catch (e) {
        return rejectWithValue(e as ApiError);
      }
    }
  );

  const librariesSlice = createSlice({
    name: 'libraries',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(getLibrariesAsync.fulfilled, (state, action) => {
        state.libraries = action.payload;
      });
    },
  });

  return {
    actions: {
      ...librariesSlice.actions,
      getLibrariesAsync,
    },
    reducer: librariesSlice.reducer,
    selectors: {
      libraries: (state: RootState) => state.libraries.libraries,
      libraryById: (id: number) => (state: RootState) => state.libraries.libraries?.find((lib) => lib.id === id),
    },
  };
};
