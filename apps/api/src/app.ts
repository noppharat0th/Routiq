import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { RouterApi } from './routes/router.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      status: 'error',
      message: error.message || 'Internal Server Error',
    });
  });

  // Register routes
  app.register(RouterApi);

  return app;
}
