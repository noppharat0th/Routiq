import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './core/app-error.js';
import { RouterApi } from './routes/router.js';
import { cleanupExpiredRouterSessions, closeAllRouterSessions } from './services/router.service.js';

interface BuildAppOptions {
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        status: 'error',
        code: 'INVALID_REQUEST',
        message: error.issues[0]?.message ?? 'Invalid request.',
      });
    }

    const statusCode = error instanceof AppError ? error.statusCode : (error.statusCode ?? 500);

    if (statusCode >= 500) {
      request.log.error(error);
    } else {
      request.log.warn({ err: error }, error.message);
    }

    reply.status(statusCode).send({
      status: 'error',
      code: error instanceof AppError ? error.code : 'INTERNAL_ERROR',
      message: error.message || 'Internal Server Error',
    });
  });

  app.get('/api/health', async () => ({ status: 'ok' }));
  app.register(RouterApi);

  const cleanupTimer = setInterval(() => void cleanupExpiredRouterSessions(), 60_000).unref();

  app.addHook('onClose', async () => {
    clearInterval(cleanupTimer);
    await closeAllRouterSessions();
  });

  return app;
}
