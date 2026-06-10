export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    console.warn('Sentry DSN not configured — skipping init')
    return
  }

  try {
    const Sentry = await import('@sentry/browser')
    Sentry.init({ dsn })
    console.log('Sentry initialized')
  } catch (err) {
    console.warn('Sentry import failed — make sure @sentry/browser is installed', err)
  }
}
