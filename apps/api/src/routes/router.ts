import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  createRouterSession,
  deleteRouterSession,
  getRouterDevices,
  getRouterNetworkInsights,
  getRouterSessionStatus,
  getRouterStatus,
  loginToRouter,
  setRouterFirewallLevel,
  setRouterDosProtection,
} from '../services/router.service.js';

const loginSchema = z.object({
  sessionId: z.string().uuid(),
  username: z.string().trim().min(1),
  password: z.string().min(1),
  captcha: z.string().trim().min(1),
});

const sessionIdSchema = z.object({
  sessionId: z.string().uuid(),
});

const firewallLevelSchema = z.object({
  sessionId: z.string().uuid(),
  level: z.enum(['Low', 'Middle', 'High']),
});

const dosProtectionSchema = z.object({
  sessionId: z.string().uuid(),
  enabled: z.boolean(),
  threshold: z.number().int().min(1).max(65_535),
});

export const RouterApi: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/router/session', async () => {
    return createRouterSession();
  });

  fastify.get('/api/router/session', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.query);
    return getRouterSessionStatus(sessionId);
  });

  fastify.post('/api/router/login', async (request) => {
    const { sessionId, username, password, captcha } = loginSchema.parse(request.body);

    await loginToRouter(sessionId, username, password, captcha);

    return { authenticated: true };
  });

  fastify.get('/api/router/devices', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.query);
    const devices = await getRouterDevices(sessionId);

    return {
      devices,
      total: devices.length,
    };
  });

  fastify.get('/api/router/status', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.query);
    return getRouterStatus(sessionId);
  });

  fastify.get('/api/router/network', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.query);
    return getRouterNetworkInsights(sessionId);
  });

  fastify.patch('/api/router/security/firewall', async (request) => {
    const { sessionId, level } = firewallLevelSchema.parse(request.body);
    return setRouterFirewallLevel(sessionId, level);
  });

  fastify.patch('/api/router/security/dos', async (request) => {
    const { sessionId, enabled, threshold } = dosProtectionSchema.parse(request.body);
    return setRouterDosProtection(sessionId, { enabled, threshold });
  });

  fastify.delete('/api/router/session', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.body);

    await deleteRouterSession(sessionId);

    return { success: true };
  });
};
