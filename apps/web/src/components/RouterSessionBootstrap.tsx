import { type ReactNode, useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useRouterController } from '@/controllers/use-router-controller';
import { routerSessionStorage } from '@/services/router-session-storage.service';

interface RouterSessionBootstrapProps {
  children: ReactNode;
}

export function RouterSessionBootstrap({ children }: RouterSessionBootstrapProps) {
  const { restoreSession } = useRouterController();
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    // Restore the saved session only once.
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    async function restore() {
      const sessionId = routerSessionStorage.get();

      if (sessionId) {
        await restoreSession(sessionId);
      }

      setReady(true);
    }

    void restore();
  }, [restoreSession]);

  if (!ready) {
    return (
      <main className="bg-muted/30 flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Restoring router session...
        </div>
      </main>
    );
  }

  return children;
}
