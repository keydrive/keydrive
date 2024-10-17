import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { HomePage } from './pages/HomePage.tsx';
import { FilesPage } from './pages/FilesPage.tsx';
import { LogoutPage } from './pages/LogoutPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { App } from './App.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/files/:library/:path?',
        element: <FilesPage />,
      },
      {
        path: '/settings/:setting?',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
];

export const browserRouter = createBrowserRouter(routes);
