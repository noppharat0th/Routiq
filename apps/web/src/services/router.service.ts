import type {
  ApiErrorResponse,
  DeleteRouterSessionResponse,
  RouterCredentials,
  RouterDevicesResponse,
  RouterLoginResponse,
  RouterSession,
} from '@/models/router.model';

const ROUTER_API_PATH = '/api/router';

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${ROUTER_API_PATH}${path}`, options);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed (${response.status})`;

  try {
    const body = (await response.json()) as ApiErrorResponse;
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

export const routerService = {
  createSession(): Promise<RouterSession> {
    return requestJson<RouterSession>('/session', { method: 'POST' });
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

  deleteSession(sessionId: string): Promise<DeleteRouterSessionResponse> {
    return requestJson<DeleteRouterSessionResponse>('/session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  },
};
