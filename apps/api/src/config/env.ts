import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const rootEnvPath = fileURLToPath(new URL('../../../../.env', import.meta.url));

try {
  loadEnvFile(rootEnvPath);
} catch (cause) {
  if ((cause as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw cause;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.string().default('info'),
  ROUTER_BASE_URL: z.string().url().default('http://192.168.1.1'),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive().max(1440).default(30),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;
