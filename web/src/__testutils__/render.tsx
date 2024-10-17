import { ReactElement, ReactNode } from 'react';
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { InjectionProvider } from '../hooks/useService';
import { Injector } from '../services/Injector';
import { Provider } from 'react-redux';
import { initializeStore, RootState, Store } from '../store';
import { render as rtlRender } from '@testing-library/react';

export type ReallyDeepPartial<T> = {
  [K in keyof T]?: T[K] extends object | undefined
    ? ReallyDeepPartial<T[K]>
    : T[K];
};

export interface RenderOptions {
  initialState?: ReallyDeepPartial<RootState>;
  path?: string;
  route?: string;
  loggedIn?: boolean;
}

export interface TestAPI {
  navigation: {
    pathname: string;
  };
  store: Store;
}

export async function render(
  element: ReactElement,
  options: RenderOptions = {},
): Promise<TestAPI> {
  const combinedInitialState = options.initialState || {};
  if (options.loggedIn) {
    if (!combinedInitialState.user) {
      combinedInitialState.user = {};
    }
    combinedInitialState.user.token = 'mock-token';
  }

  const injector = new Injector();
  const store = initializeStore(injector, combinedInitialState);
  injector.bindTo(initializeStore, store);

  const navigation = {
    pathname: '',
  };

  const FetchRoute = () => {
    const location = useLocation();
    navigation.pathname = location.pathname;
    return null;
  };

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <InjectionProvider value={injector}>
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            [
              {
                path: options.route ?? '*',
                element: (
                  <>
                    <FetchRoute />
                    {children}
                  </>
                ),
              },
            ],
            {
              initialEntries: [options.path ?? ''],
            },
          )}
        />
      </Provider>
    </InjectionProvider>
  );

  rtlRender(element, { wrapper: Wrapper });

  return { navigation, store };
}
