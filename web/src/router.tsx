import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage.tsx';
import { FilesPage } from './pages/FilesPage.tsx';
import { LogoutPage } from './pages/LogoutPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/files/:library/:path?',
    element: <FilesPage />,
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
  // {
  //   path: '/settings',
  //   element: <SettingsPage />,
  // },
  {
    path: '/settings/:setting?',
    element: <SettingsPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);

export const unauthenticatedRouter = createBrowserRouter([
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to="/auth/login" />,
  },
]);
