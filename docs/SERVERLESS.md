# Serverless endpoints

This project includes example serverless webhook endpoints under the `api/` folder for Vercel-style functions:

- `api/delivery-webhook.ts` — delivery provider webhook receiver (stub)
- `api/email-webhook.ts` — transactional email provider webhook receiver (stub)

Environment variables referenced:

- `DELIVERY_WEBHOOK_SECRET` — used to verify delivery provider signatures
- `EMAIL_WEBHOOK_SECRET` — used to verify email provider signatures

These are stubs intended to be extended with provider-specific verification and logic to update Supabase records.
