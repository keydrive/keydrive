import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { userStore, State as UserState } from './user';
import { librariesStore, State as LibrariesState } from './libraries';
import { Injector } from '../services/Injector';
import { useService } from '../hooks/useService';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export const initializeStore = (injector: Injector, initialState?: any) =>
  configureStore({
    reducer: {
      user: injector.resolve(userStore).reducer,
      libraries: injector.resolve(librariesStore).reducer,
    },
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
    preloadedState: initialState,
  });

export type Store = ReturnType<typeof initializeStore>;
export type AppDispatch = Store['dispatch'];
export interface RootState {
  user: UserState;
  libraries: LibrariesState;
}

export const useAppDispatch = (): AppDispatch => useService(initializeStore).dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
