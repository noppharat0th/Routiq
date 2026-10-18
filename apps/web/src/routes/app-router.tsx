import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ProtectedLayout } from '@/layouts/ProtectedLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DevicesPage } from '@/pages/DevicesPage';
import { LoginPage } from '@/pages/LoginPage';
import { NetworkPage } from '@/pages/NetworkPage';
import { SecurityPage } from '@/pages/SecurityPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { routes } from '@/routes/route-paths';

const router = createBrowserRouter([
  {
    path: routes.login,
    Component: LoginPage,
  },
  {
    Component: ProtectedLayout,
    children: [
      {
        index: true,
        element: <Navigate replace to={routes.dashboard} />,
      },
      {
        path: routes.dashboard,
        Component: DashboardPage,
      },
      {
        path: routes.devices,
        Component: DevicesPage,
      },
      {
        path: routes.network,
        Component: NetworkPage,
      },
      {
        path: routes.security,
        Component: SecurityPage,
      },
      {
        path: routes.settings,
        Component: SettingsPage,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to={routes.dashboard} />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
