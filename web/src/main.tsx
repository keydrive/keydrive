import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.scss';
import { Provider } from 'react-redux';
import { initializeStore } from './store';
import { Injector } from './services/Injector';
import { InjectionProvider } from './hooks/useService';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { browserRouter } from './router.tsx';
import { RouterProvider } from 'react-router-dom';

const injector = new Injector();
const store = injector.resolve(initializeStore);
const persistor = persistStore(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InjectionProvider value={injector}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <RouterProvider router={browserRouter} />
        </PersistGate>
      </Provider>
    </InjectionProvider>
  </StrictMode>,
);
