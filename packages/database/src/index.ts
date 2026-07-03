import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Singleton PrismaClient Instance
// ---------------------------------------------------------------------------
// In development, Next.js / ts-node-dev hot-reloads clear the module cache on
// every change, which would create a new PrismaClient (and a new connection
// pool) each time. We attach the client to `globalThis` so only one instance
// is ever created per Node process.
// ---------------------------------------------------------------------------

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Prisma log levels based on the current environment.
 *
 * - **Development**: log queries, info, warnings, and errors for full
 *   observability during local development.
 * - **Production**: log only warnings and errors to avoid excessive noise
 *   and potential PII leaks in structured logs.
 */
const logLevels: Array<'query' | 'info' | 'warn' | 'error'> = isProduction
  ? ['warn', 'error']
  : ['query', 'info', 'warn', 'error'];

/**
 * Creates a new PrismaClient with sensible production defaults:
 *
 * 1. Environment-aware logging.
 * 2. Datasource URL override via `DATABASE_URL` env var (useful for
 *    read-replicas, connection-pooling proxies like PgBouncer, etc.).
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: logLevels,
    datasourceUrl: process.env.DATABASE_URL,
  });
}

// ---------------------------------------------------------------------------
// Global singleton pattern
// ---------------------------------------------------------------------------

// Extend the global type so TypeScript doesn't complain.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * The singleton PrismaClient instance.
 *
 * Usage:
 * ```ts
 * import { prisma } from '@payment-gateway/database';
 *
 * const user = await prisma.user.findUnique({ where: { id } });
 * ```
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------
// Re-export everything Prisma generates so consumers don't need a direct
// dependency on @prisma/client.
// ---------------------------------------------------------------------------

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
export default prisma;
