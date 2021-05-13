import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { userStore } from './user';
import { Injector } from '../services/Injector';
import { useService } from '../hooks/useService';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializeStore = (injector: Injector) =>
  configureStore({
    reducer: {
      user: injector.resolve(userStore).reducer,
    },
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  });

type Store = ReturnType<typeof initializeStore>;
type RootState = ReturnType<Store['getState']>;
type AppDispatch = Store['dispatch'];

export const useAppDispatch = (): AppDispatch => useService(initializeStore).dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
