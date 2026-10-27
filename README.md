# ROMEO MVP pilot

ROMEO is a food-delivery MVP for a limited, manually operated pilot. It uses
Vercel for the static web app and Supabase for phone OTP authentication,
restaurant/menu reads, customer-scoped order history, and server-validated
cash-on-delivery orders.

**Online payments, automatic dispatch, restaurant/staff dashboards, and
production customer support workflows are not enabled. Do not accept online
payments or treat this pilot as a fully staffed production marketplace.**

## Run locally

Requirements: Node.js 20 or newer.

```powershell
npm install
npm run dev
```

Without a `.env` file, the local development server opens the sample-data demo.
Production builds fail closed and will not expose demo checkout if the Supabase
environment variables are missing.

## Set up Supabase

1. Create a Supabase project and keep its database and Auth credentials private.
2. In the Supabase SQL Editor, run `supabase/schema.sql`, followed by
   `supabase/seed.sql`.
3. Before inviting a pilot customer, add their E.164 phone number (India:
   `+91` followed by the 10-digit number) to `public.pilot_phone_allowlist`
   using the Supabase SQL Editor. For example:

   ```sql
   insert into public.pilot_phone_allowlist (phone)
   values ('+919876543210');
   ```

   Replace the example with the customer's actual number; do not commit real
   phone numbers. New account creation is blocked unless the number is on this
   allowlist.
4. In **Authentication → Providers**, enable Phone and configure an SMS
   provider. Confirm the provider's costs, delivery limits, and any local
   sender/template requirements before inviting customers.
5. Configure the Supabase Auth site URL and allowed redirect URLs for localhost
   and the final Vercel domain.
6. Copy `.env.example` to `.env` for local connected testing and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (or the Supabase publishable key)

The browser only uses the public anon/publishable key. Never put a Supabase
`service_role` key, PhonePe secret, or other private credential in frontend
code, `.env` values beginning with `VITE_`, or Git.

The SQL schema enables Row Level Security. Customers can browse active menus
and read only their own orders. The `place_order` database function verifies
the signed-in user, active restaurant and menu items, quantities, prices,
minimum spend, discount, delivery fee, and final total on the server. Direct
customer writes to order, pricing, profile-role, and menu tables are denied.

For this low-cost pilot, maintain restaurant/menu records and manually process
orders in the authenticated Supabase dashboard. The customer-facing Partner,
Rider, and Admin demo tabs are hidden when the backend is configured; they are
not production staff tools. Restrict dashboard access to trusted operators and
use MFA on the Supabase owner account.

## Deploy to Vercel

1. Push the project to a private GitHub repository and import it into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment
   variables for the intended deployment environments. Use only the public
   anon/publishable key in the frontend.
3. Deploy with the included Vite build configuration, then add the production
   URL to Supabase Auth's site URL and allowed redirect URLs.
4. Test phone OTP, order placement, promo validation, order privacy, and COD
   operations on the deployed URL before inviting customers.

Vercel build output is `dist/`. `vercel.json` configures the SPA route fallback
and basic security headers.

## Before inviting customers

- Add a real domain and configure Supabase Auth URL allowlists for it.
- Publish accurate Terms, Privacy, refund/cancellation, and contact/support
  information; review local food business, tax, consumer, and privacy
  obligations with qualified professionals.
- Confirm SMS delivery and cost, COD handling, delivery coverage, capacity,
  order support, and data retention/deletion procedures.
- Test that a second account cannot read another customer's orders.
- Set up backups/monitoring appropriate for the pilot and verify restoration.
- Do not enable PhonePe until a server-side payment creation flow, webhook
  signature verification, idempotency, refunds, and reconciliation have been
  implemented and tested. Never trust a browser success redirect as proof of
  payment.

This repository contains the app and configuration scaffold, not your Supabase
project, Vercel account, domain, SMS provider, or deployment credentials. A
successful build alone does not mean the service is live or launch-approved.

## Food photography

Food photography in `assets/` is sourced from Unsplash and used under the
Unsplash License.
