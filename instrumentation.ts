/**
 * Next.js 15 Instrumentation
 *
 * This file is automatically loaded by Next.js to set up monitoring and observability.
 * Required for Sentry error tracking.
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
