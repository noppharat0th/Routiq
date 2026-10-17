import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  clearSession,
  HandleCreateSession,
  handleGetDevice,
  handleLogin,
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

export const RouterApi: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/router/session', async () => {
    return HandleCreateSession();
  });

  fastify.post('/api/router/login', async (request) => {
    const { sessionId, username, password, captcha } = loginSchema.parse(request.body);

    await handleLogin(sessionId, username, password, captcha);

    return { authenticated: true };
  });

  fastify.get('/api/router/devices', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.query);
    const devices = await handleGetDevice(sessionId);

    return {
      devices,
      total: devices.length,
    };
  });

  fastify.delete('/api/router/session', async (request) => {
    const { sessionId } = sessionIdSchema.parse(request.body);

    await clearSession(sessionId);

    return { success: true };
  });
};
