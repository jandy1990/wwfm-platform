/**
 * Next.js 15 Instrumentation
 *
 * This file is automatically loaded by Next.js to set up monitoring and observability.
 * Only loads Sentry in production to avoid overhead in development.
 */

export async function register() {
  // Only load Sentry in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  }
}

// Only set up error capturing in production
export const onRequestError = process.env.NODE_ENV === 'production'
  ? async (error: unknown, request: Request) => {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureRequestError(error, request);
    }
  : undefined;
