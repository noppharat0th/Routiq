import { useCallback } from 'react';
import type {
  RouterCredentials,
  RouterDosSettings,
  RouterFirewallLevel,
} from '@/models/router.model';
import { RouterApiError, routerService } from '@/services/router.service';
import { routerSessionStorage } from '@/services/router-session-storage.service';
import { useRouterStore } from '@/stores/router.store';

function messageFrom(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

function isInvalidSession(cause: unknown): boolean {
  return (
    cause instanceof RouterApiError &&
    (cause.code === 'SESSION_NOT_FOUND' || cause.code === 'AUTH_REQUIRED')
  );
}

export function useRouterController() {
  const session = useRouterStore((state) => state.session);
  const authenticated = useRouterStore((state) => state.authenticated);
  const devices = useRouterStore((state) => state.devices);
  const status = useRouterStore((state) => state.status);
  const networkInsights = useRouterStore((state) => state.networkInsights);
  const pendingAction = useRouterStore((state) => state.pendingAction);
  const error = useRouterStore((state) => state.error);

  const setSession = useRouterStore((state) => state.setSession);
  const setAuthenticated = useRouterStore((state) => state.setAuthenticated);
  const setDevices = useRouterStore((state) => state.setDevices);
  const setStatus = useRouterStore((state) => state.setStatus);
  const setNetworkInsights = useRouterStore((state) => state.setNetworkInsights);
  const setFirewallSettings = useRouterStore((state) => state.setFirewallSettings);
  const setDosSettings = useRouterStore((state) => state.setDosSettings);
  const beginRequest = useRouterStore((state) => state.beginRequest);
  const endRequest = useRouterStore((state) => state.endRequest);
  const setError = useRouterStore((state) => state.setError);
  const reset = useRouterStore((state) => state.reset);

  // Load data shared by the dashboard pages.
  const loadRouterData = useCallback(
    async (sessionId: string): Promise<boolean> => {
      let warning: string | null = null;

      beginRequest('devices');
      try {
        const devicesResult = await routerService.getDevices(sessionId);
        setDevices(devicesResult.devices);
      } catch (cause) {
        if (isInvalidSession(cause)) {
          routerSessionStorage.clear();
          reset();
          return false;
        }

        warning = messageFrom(cause, 'Failed to load devices.');
      }

      beginRequest('status');
      try {
        setStatus(await routerService.getStatus(sessionId));
      } catch (cause) {
        if (isInvalidSession(cause)) {
          routerSessionStorage.clear();
          reset();
          return false;
        }

        warning ??= messageFrom(cause, 'Failed to load router status.');
      }

      beginRequest('network');
      try {
        setNetworkInsights(await routerService.getNetworkInsights(sessionId));
      } catch (cause) {
        if (isInvalidSession(cause)) {
          routerSessionStorage.clear();
          reset();
          return false;
        }

        warning ??= messageFrom(cause, 'Failed to load network insights.');
      }

      if (warning) {
        setError(warning);
      } else {
        endRequest();
      }

      return true;
    },
    [beginRequest, endRequest, reset, setDevices, setError, setNetworkInsights, setStatus]
  );

  const connect = useCallback(async () => {
    beginRequest('session');
    routerSessionStorage.clear();

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
        routerSessionStorage.save(session.sessionId);
      } catch (cause) {
        setAuthenticated(false);
        setError(messageFrom(cause, 'Router login failed.'));
        return false;
      }

      return loadRouterData(session.sessionId);
    },
    [beginRequest, loadRouterData, session, setAuthenticated, setError]
  );

  const restoreSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      beginRequest('session');

      try {
        const status = await routerService.getSessionStatus(sessionId);

        if (!status.authenticated) {
          routerSessionStorage.clear();
          reset();
          return false;
        }

        setSession({
          sessionId,
          captchaImage: '',
          router: status.router,
        });
        setAuthenticated(true);

        return loadRouterData(sessionId);
      } catch (cause) {
        routerSessionStorage.clear();
        reset();

        if (!isInvalidSession(cause)) {
          setError(messageFrom(cause, 'Failed to restore the router session.'));
        }

        return false;
      } finally {
        endRequest();
      }
    },
    [beginRequest, endRequest, loadRouterData, reset, setAuthenticated, setError, setSession]
  );

  const refreshDevices = useCallback(async () => {
    if (!session) {
      setError('Router session not found. Reconnect and try again.');
      return;
    }

    if (pendingAction !== null) {
      return;
    }

    await loadRouterData(session.sessionId);
  }, [loadRouterData, pendingAction, session, setError]);

  const disconnect = useCallback(async () => {
    if (!session) {
      routerSessionStorage.clear();
      reset();
      return;
    }

    beginRequest('logout');

    try {
      await routerService.deleteSession(session.sessionId);
    } catch {
      // Local sign-out must still succeed when the API or router is unavailable.
    } finally {
      routerSessionStorage.clear();
      reset();
    }
  }, [beginRequest, reset, session]);

  const updateFirewallLevel = useCallback(
    async (level: RouterFirewallLevel): Promise<boolean> => {
      if (!session) {
        setError('Router session not found. Reconnect and try again.');
        return false;
      }

      if (pendingAction !== null) return false;

      beginRequest('firewall');
      try {
        const settings = await routerService.setFirewallLevel(session.sessionId, level);
        setFirewallSettings(settings);
        endRequest();
        return true;
      } catch (cause) {
        if (isInvalidSession(cause)) {
          routerSessionStorage.clear();
          reset();
          return false;
        }

        setError(messageFrom(cause, 'Failed to update the firewall level.'));
        return false;
      }
    },
    [beginRequest, endRequest, pendingAction, reset, session, setError, setFirewallSettings]
  );

  const updateDosProtection = useCallback(
    async (settings: RouterDosSettings): Promise<boolean> => {
      if (!session) {
        setError('Router session not found. Reconnect and try again.');
        return false;
      }

      if (pendingAction !== null) return false;

      beginRequest('dos');
      try {
        const verifiedSettings = await routerService.setDosProtection(session.sessionId, settings);
        setDosSettings(verifiedSettings);
        endRequest();
        return true;
      } catch (cause) {
        if (isInvalidSession(cause)) {
          routerSessionStorage.clear();
          reset();
          return false;
        }

        setError(messageFrom(cause, 'Failed to update DoS protection.'));
        return false;
      }
    },
    [beginRequest, endRequest, pendingAction, reset, session, setDosSettings, setError]
  );

  return {
    session,
    authenticated,
    devices,
    status,
    networkInsights,
    pendingAction,
    error,
    connect,
    login,
    restoreSession,
    refreshDevices,
    updateFirewallLevel,
    updateDosProtection,
    disconnect,
    clearError: () => setError(null),
  };
}
