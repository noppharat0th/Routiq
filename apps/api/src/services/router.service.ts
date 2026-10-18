import { randomUUID } from 'node:crypto';
import { ZteAdapter } from '../adapters/zte/zte.adapter.js';
import { env } from '../config/env.js';
import type { RouterDosSettings, RouterFirewallLevel } from '../core/router.types.js';
import {
  AppError,
  RouterAuthenticationRequiredError,
  RouterSessionNotFoundError,
} from '../core/app-error.js';

interface RouterSession {
  adapter: ZteAdapter;
  authenticated: boolean;
  lastAccessedAt: number;
}

// Keep active router sessions in API memory.
const sessions = new Map<string, RouterSession>();
const sessionTtlMs = env.SESSION_TTL_MINUTES * 60_000;

function routerDetails(adapter: ZteAdapter) {
  return {
    id: adapter.id,
    name: adapter.name,
    capabilities: adapter.getCapabilities(),
  };
}

async function requireSession(sessionId: string): Promise<RouterSession> {
  const session = sessions.get(sessionId);

  if (!session) {
    throw new RouterSessionNotFoundError();
  }

  if (Date.now() - session.lastAccessedAt >= sessionTtlMs) {
    sessions.delete(sessionId);
    await session.adapter.clearSession();
    throw new RouterSessionNotFoundError();
  }

  session.lastAccessedAt = Date.now();
  return session;
}

export async function createRouterSession() {
  const adapter = new ZteAdapter(env.ROUTER_BASE_URL);

  try {
    await adapter.prepareLogin();
    const captcha = await adapter.getCaptcha();
    const sessionId = randomUUID();

    sessions.set(sessionId, {
      adapter,
      authenticated: false,
      lastAccessedAt: Date.now(),
    });

    return {
      sessionId,
      captchaImage: `data:image/jpeg;base64,${captcha.toString('base64')}`,
      router: routerDetails(adapter),
    };
  } catch (cause) {
    await adapter.clearSession();
    const message = cause instanceof Error ? cause.message : 'Unable to connect to the router.';
    throw new AppError(message, 502, 'ROUTER_UNAVAILABLE');
  }
}

export async function loginToRouter(
  sessionId: string,
  username: string,
  password: string,
  captcha: string
) {
  const session = await requireSession(sessionId);

  try {
    await session.adapter.login(username, password, captcha);
    session.authenticated = true;
    session.lastAccessedAt = Date.now();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Router login failed.';
    throw new AppError(message, 401, 'ROUTER_LOGIN_FAILED');
  }

  return { authenticated: true };
}

export async function getRouterDevices(sessionId: string) {
  const session = await requireSession(sessionId);

  if (!session.authenticated) {
    throw new RouterAuthenticationRequiredError();
  }

  try {
    return await session.adapter.getDevices();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to load router devices.';
    throw new AppError(message, 502, 'ROUTER_REQUEST_FAILED');
  }
}

export async function getRouterStatus(sessionId: string) {
  const session = await requireSession(sessionId);

  if (!session.authenticated) {
    throw new RouterAuthenticationRequiredError();
  }

  try {
    return await session.adapter.getStatus();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to load router status.';
    throw new AppError(message, 502, 'ROUTER_STATUS_FAILED');
  }
}

export async function getRouterNetworkInsights(sessionId: string) {
  const session = await requireSession(sessionId);

  if (!session.authenticated) {
    throw new RouterAuthenticationRequiredError();
  }

  try {
    return await session.adapter.getNetworkInsights();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to load network insights.';
    throw new AppError(message, 502, 'ROUTER_NETWORK_FAILED');
  }
}

export async function setRouterFirewallLevel(sessionId: string, level: RouterFirewallLevel) {
  const session = await requireSession(sessionId);

  if (!session.authenticated) {
    throw new RouterAuthenticationRequiredError();
  }

  try {
    return await session.adapter.setFirewallLevel(level);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to update the firewall level.';
    throw new AppError(message, 502, 'ROUTER_FIREWALL_UPDATE_FAILED');
  }
}

export async function setRouterDosProtection(sessionId: string, settings: RouterDosSettings) {
  const session = await requireSession(sessionId);

  if (!session.authenticated) {
    throw new RouterAuthenticationRequiredError();
  }

  try {
    return await session.adapter.setDosProtection(settings);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unable to update DoS protection.';
    throw new AppError(message, 502, 'ROUTER_DOS_UPDATE_FAILED');
  }
}

export async function getRouterSessionStatus(sessionId: string) {
  const session = await requireSession(sessionId);

  return {
    active: true,
    authenticated: session.authenticated,
    router: routerDetails(session.adapter),
  };
}

export async function deleteRouterSession(sessionId: string) {
  const session = sessions.get(sessionId);

  if (session) {
    sessions.delete(sessionId);
    await session.adapter.clearSession();
  }
}

export async function cleanupExpiredRouterSessions(): Promise<void> {
  const now = Date.now();
  const expiredSessions = [...sessions.entries()].filter(
    ([, session]) => now - session.lastAccessedAt >= sessionTtlMs
  );

  await Promise.allSettled(
    expiredSessions.map(async ([sessionId, session]) => {
      sessions.delete(sessionId);
      await session.adapter.clearSession();
    })
  );
}

export async function closeAllRouterSessions(): Promise<void> {
  const activeSessions = [...sessions.values()];
  sessions.clear();
  await Promise.allSettled(activeSessions.map((session) => session.adapter.clearSession()));
}
