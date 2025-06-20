export const trackError = (error: Error, context?: string) => {
  console.error(`[${context}] Error:`, error);
  // Send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
};
