import type {
  ApiErrorResponse,
  DeleteRouterSessionResponse,
  RouterCredentials,
  RouterDevicesResponse,
  RouterDosSettings,
  RouterFirewallLevel,
  RouterFirewallSettings,
  RouterLoginResponse,
  RouterNetworkInsights,
  RouterSession,
  RouterSessionStatusResponse,
  RouterStatus,
} from '@/models/router.model';

const ROUTER_API_PATH = '/api/router';

export class RouterApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = 'RouterApiError';
  }
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${ROUTER_API_PATH}${path}`, options);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return (await response.json()) as T;
}

async function createApiError(response: Response): Promise<RouterApiError> {
  const fallback = `Request failed (${response.status})`;

  try {
    const body = (await response.json()) as ApiErrorResponse;
    return new RouterApiError(body.message || fallback, response.status, body.code);
  } catch {
    return new RouterApiError(fallback, response.status);
  }
}

export const routerService = {
  createSession(): Promise<RouterSession> {
    return requestJson<RouterSession>('/session', { method: 'POST' });
  },

  getSessionStatus(sessionId: string): Promise<RouterSessionStatusResponse> {
    const query = new URLSearchParams({ sessionId });
    return requestJson<RouterSessionStatusResponse>(`/session?${query.toString()}`);
  },

  login(sessionId: string, credentials: RouterCredentials): Promise<RouterLoginResponse> {
    return requestJson<RouterLoginResponse>('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, ...credentials }),
    });
  },

  getDevices(sessionId: string): Promise<RouterDevicesResponse> {
    const query = new URLSearchParams({ sessionId });
    return requestJson<RouterDevicesResponse>(`/devices?${query.toString()}`);
  },

  getStatus(sessionId: string): Promise<RouterStatus> {
    const query = new URLSearchParams({ sessionId });
    return requestJson<RouterStatus>(`/status?${query.toString()}`);
  },

  getNetworkInsights(sessionId: string): Promise<RouterNetworkInsights> {
    const query = new URLSearchParams({ sessionId });
    return requestJson<RouterNetworkInsights>(`/network?${query.toString()}`);
  },

  setFirewallLevel(sessionId: string, level: RouterFirewallLevel): Promise<RouterFirewallSettings> {
    return requestJson<RouterFirewallSettings>('/security/firewall', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, level }),
    });
  },

  setDosProtection(sessionId: string, settings: RouterDosSettings): Promise<RouterDosSettings> {
    return requestJson<RouterDosSettings>('/security/dos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, ...settings }),
    });
  },

  deleteSession(sessionId: string): Promise<DeleteRouterSessionResponse> {
    return requestJson<DeleteRouterSessionResponse>('/session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  },
};
