import { MainLayout } from '@/layouts/MainLayout';
import { RouterPage } from '@/pages/RouterPage';
import { useRouterStore } from '@/stores/router.store';

export default function App() {
  const authenticated = useRouterStore((state) => state.authenticated);

  if (!authenticated) {
    return <RouterPage />;
  }

  return (
    <MainLayout>
      <RouterPage />
    </MainLayout>
  );
}
