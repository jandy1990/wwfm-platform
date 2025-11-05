import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Client-Side Configuration
 *
 * Captures errors that occur in the browser (client components, user interactions)
 * Only initializes in production to avoid overhead in development
 */

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions (adjust based on traffic)

    // Session Replay - Watch user sessions leading to errors
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Always capture sessions with errors

    // Environment
    environment: process.env.NODE_ENV || 'production',

    // Ignore common non-critical errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Timeout errors that don't affect UX
      'Non-Error promise rejection captured',
    ],
  });
}
