import React, { useContext } from 'react';
import { Injector, Provider } from '../services/Injector';

const Context = React.createContext<Injector | undefined>(undefined);

export const InjectionProvider = Context.Provider;

export function useService<T>(provider: Provider<T>): T {
  const injector = useContext(Context);
  if (!injector) {
    throw new Error('Wrap this component in an InjectionProvider');
  }
  return injector.resolve(provider);
}
