import { RouterSessionBootstrap } from '@/components/RouterSessionBootstrap';
import { AppRouter } from '@/routes/app-router';

export default function App() {
  return (
    <RouterSessionBootstrap>
      <AppRouter />
    </RouterSessionBootstrap>
  );
}
