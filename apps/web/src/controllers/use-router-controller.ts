import { useCallback } from 'react';
import type { RouterCredentials } from '@/models/router.model';
import { routerService } from '@/services/router.service';
import { useRouterStore } from '@/stores/router.store';

function messageFrom(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

export function useRouterController() {
  const session = useRouterStore((state) => state.session);
  const authenticated = useRouterStore((state) => state.authenticated);
  const devices = useRouterStore((state) => state.devices);
  const pendingAction = useRouterStore((state) => state.pendingAction);
  const error = useRouterStore((state) => state.error);

  const setSession = useRouterStore((state) => state.setSession);
  const setAuthenticated = useRouterStore((state) => state.setAuthenticated);
  const setDevices = useRouterStore((state) => state.setDevices);
  const beginRequest = useRouterStore((state) => state.beginRequest);
  const endRequest = useRouterStore((state) => state.endRequest);
  const setError = useRouterStore((state) => state.setError);
  const reset = useRouterStore((state) => state.reset);

  const connect = useCallback(async () => {
    beginRequest('session');

    try {
      if (session) {
        await routerService.deleteSession(session.sessionId);
      }

      const newSession = await routerService.createSession();
      setSession(newSession);
    } catch (cause) {
      setError(messageFrom(cause, 'Failed to create a router session.'));
    } finally {
      endRequest();
    }
  }, [beginRequest, endRequest, session, setError, setSession]);

  const login = useCallback(
    async (credentials: RouterCredentials): Promise<boolean> => {
      if (!session) {
        setError('Connect to the router before signing in.');
        return false;
      }

      beginRequest('login');

      try {
        const result = await routerService.login(session.sessionId, credentials);
        setAuthenticated(result.authenticated);
      } catch (cause) {
        setAuthenticated(false);
        setError(messageFrom(cause, 'Router login failed.'));
        return false;
      }

      beginRequest('devices');

      try {
        const result = await routerService.getDevices(session.sessionId);
        setDevices(result.devices);
      } catch (cause) {
        setError(messageFrom(cause, 'Signed in, but failed to load devices.'));
      } finally {
        endRequest();
      }

      return true;
    },
    [beginRequest, endRequest, session, setAuthenticated, setDevices, setError]
  );

  const refreshDevices = useCallback(async () => {
    if (!session) {
      setError('Router session not found. Reconnect and try again.');
      return;
    }

    beginRequest('devices');

    try {
      const result = await routerService.getDevices(session.sessionId);
      setDevices(result.devices);
    } catch (cause) {
      setError(messageFrom(cause, 'Failed to load devices.'));
    } finally {
      endRequest();
    }
  }, [beginRequest, endRequest, session, setDevices, setError]);

  const disconnect = useCallback(async () => {
    if (!session) {
      return;
    }

    beginRequest('logout');

    try {
      await routerService.deleteSession(session.sessionId);
      reset();
    } catch (cause) {
      setError(messageFrom(cause, 'Failed to close the router session.'));
    } finally {
      endRequest();
    }
  }, [beginRequest, endRequest, reset, session, setError]);

  return {
    session,
    authenticated,
    devices,
    pendingAction,
    error,
    connect,
    login,
    refreshDevices,
    disconnect,
    clearError: () => setError(null),
  };
}
