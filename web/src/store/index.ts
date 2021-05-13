import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { userStore } from './user';
import { Injector } from '../services/Injector';
import { useService } from '../hooks/useService';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializeStore = (injector: Injector) =>
  configureStore({
    reducer: {
      user: injector.resolve(userStore).reducer,
    },
  });

type Store = ReturnType<typeof initializeStore>;
type RootState = ReturnType<Store['getState']>;
type AppDispatch = Store['dispatch'];

export const useAppDispatch = (): AppDispatch => useService(initializeStore).dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
