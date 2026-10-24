const { z } = require('zod');

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    MONGODB_URI: z.string().optional(),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(300),
  })
  .refine((env) => env.NODE_ENV === 'test' || !!env.MONGODB_URI, {
    path: ['MONGODB_URI'],
    message: 'MONGODB_URI es obligatoria',
  });

/**
 * Valida las variables de entorno y devuelve una configuración tipada.
 * Falla rápido (al arrancar) con un mensaje claro si algo falta o es inválido.
 * @param {NodeJS.ProcessEnv} [env]
 */
function loadConfig(env = process.env) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Configuración de entorno inválida:\n${detail}`);
  }
  const e = parsed.data;
  const origins = e.CORS_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return {
    env: e.NODE_ENV,
    isProduction: e.NODE_ENV === 'production',
    port: e.PORT,
    mongoUri: e.MONGODB_URI,
    corsOrigins: origins.includes('*') ? '*' : origins,
    rateLimitMax: e.RATE_LIMIT_MAX,
  };
}

module.exports = { loadConfig };
