import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.scss';
import { App } from './App';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { initializeStore } from './store';
import { Injector } from './services/Injector';
import { InjectionProvider } from './hooks/useService';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

const injector = new Injector();
const store = injector.resolve(initializeStore);
const persistor = persistStore(store);

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <InjectionProvider value={injector}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </InjectionProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
