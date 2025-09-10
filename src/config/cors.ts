import cors, { type CorsOptions } from 'cors';

// Build CORS options from environment variables.
// ENV vars:
//   CORS_ORIGINS        Comma-separated list of allowed origins
//   FRONTEND_URL        Single allowed origin (fallback if CORS_ORIGINS unset)
//   CORS_ALLOW_HEADERS  Extra comma-separated headers to allow
//   CORS_EXPOSE_HEADERS Headers to expose
//   CORS_MAX_AGE        Preflight cache seconds (default 600)
//   CORS_CREDENTIALS    'true' to enable credentials (default true)
export function buildCorsOptions(): CorsOptions {
  const rawOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173';
  const allowList = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

  const wildcard = allowList.includes('*');
  const allowCredentialsEnv = (process.env.CORS_CREDENTIALS || 'true').toLowerCase() === 'true';
  // If wildcard used, credentials cannot safely be true (browser blocks). Force false.
  const allowCredentials = wildcard ? false : allowCredentialsEnv;

  const extraAllowedHeaders = (process.env.CORS_ALLOW_HEADERS || '').split(',').map(h => h.trim()).filter(Boolean);
  const exposeHeaders = (process.env.CORS_EXPOSE_HEADERS || '').split(',').map(h => h.trim()).filter(Boolean);
  const maxAge = parseInt(process.env.CORS_MAX_AGE || '600', 10);

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true); // Non-browser or same-origin
      if (wildcard) return callback(null, true);
      if (allowList.includes(origin)) return callback(null, true);
      return callback(null, false); // Disallowed origin -> no CORS headers
    },
    credentials: allowCredentials,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization', ...extraAllowedHeaders],
    exposedHeaders: exposeHeaders.length ? exposeHeaders : undefined,
    maxAge,
    optionsSuccessStatus: 204
  };
}

// Convenience middleware factory
export function corsMiddleware() {
  return cors(buildCorsOptions());
}
