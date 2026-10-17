import { Navigate } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { routes } from '@/routes/route-paths';
import { useRouterStore } from '@/stores/router.store';

export function ProtectedLayout() {
  const authenticated = useRouterStore((state) => state.authenticated);

  if (!authenticated) {
    return <Navigate replace to={routes.login} />;
  }

  return <MainLayout />;
}
