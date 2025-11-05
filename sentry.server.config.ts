// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production to avoid overhead in development
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: "https://3a2de81b2237fb241459e13bccd21a08@o4510292630700032.ingest.us.sentry.io/4510292631617536",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 0.1, // Reduced from 1.0 to 10% to avoid excessive quota usage

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}
