Configuration

Add the environment variables from `.env.example` to a local `.env` file or your deployment platform. Important keys:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — Supabase project values.
- `SENDGRID_API_KEY` and `SENDGRID_FROM` — required to send transactional emails via SendGrid.
- `DELIVERY_API_KEY` and `DELIVERY_WEBHOOK_SECRET` — delivery provider credentials.
- `SENTRY_DSN` — optional, set to enable Sentry error reporting.
 - `EMAIL_WEBHOOK_SECRET` — optional, used to verify inbound email webhook signatures.
 - `SUPABASE_SERVICE_ROLE_KEY` — optional server-side Supabase key for webhook-driven DB updates (keep secret).

SendGrid

1. Create a SendGrid account and generate an API key with `Mail Send` permission.
2. Set `SENDGRID_API_KEY` and `SENDGRID_FROM` in your environment.
3. In local dev, the app calls `/api/send-seller-email` from the client after submitting a seller application. The endpoint uses `SENDGRID_*` vars to send mail.

Sentry

1. Install Sentry SDK locally if you want client-side error reporting:

```
npm install @sentry/browser
```

2. Set `SENTRY_DSN` in your environment. The app dynamically imports `@sentry/browser` and initializes it when `SENTRY_DSN` is present.

Local testing

- Start dev server: `npm install && npm run dev`
- Submit a seller application to exercise the upload flow and the `/api/send-seller-email` endpoint.

Notes

- The repo includes a placeholder `src/lib/sentry.ts` that dynamically imports the Sentry SDK if `SENTRY_DSN` is set.
- If you prefer to avoid installing the Sentry package today, leave `SENTRY_DSN` empty and the app will skip initialization.