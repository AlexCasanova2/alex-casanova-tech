# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## CRM setup

The admin CRM requires the Supabase schema in:

```text
supabase/migrations/202609160001_create_crm.sql
```

Apply it with the Supabase CLI (`supabase db push`) when the project is linked, or run the migration once from the Supabase SQL editor. The migration creates the client, quote and settings tables, row-level security policies, yearly quote numbering and the transactional `save_quote` function.

Authenticated users only have access to their own CRM records. The existing portfolio tables are not modified.

### Private admin access

Set `CRM_OWNER_ID`, `VITE_SUPABASE_ANON_KEY`, and either `SUPABASE_URL` or `VITE_SUPABASE_URL` in Vercel before deploying the protected admin route. `CRM_OWNER_ID` must be the Supabase Auth user ID of the portfolio owner. Without it, `/admin` fails closed with HTTP 404. Sign in at `/acceso`; the server verifies the Supabase access token against the owner ID and issues a short-lived, HttpOnly cookie for `/admin`. The server returns HTTP 404 to visitors without that cookie. Both routes send `noindex` headers, and neither is in the sitemap.

The client-side router also checks the server session for navigation within the SPA. This complements, but does not replace, Supabase row-level security for private CRM tables; do not rely on hiding the URL or on `robots.txt` as access control.

### Quote pricing modes

Apply `supabase/migrations/202609170001_quote_pricing_modes.sql` after the initial CRM migration. This adds per-item and global project pricing, and the transactional `save_quote_priced` RPC. Existing quotes keep per-item pricing. Global prices are before discount and tax; individual item rates are retained when switching modes but are omitted from global-price PDFs.

If PostgREST reports `Could not find the function public.save_quote_priced`, apply that pricing migration to the same Supabase project used by the website. If it was already applied successfully, reload the API schema cache from the SQL editor:

```sql
NOTIFY pgrst, 'reload schema';
```

Per-item quotes can still be saved using the original `save_quote` function while the pricing function is unavailable. Global pricing requires the migration; it is never silently converted to per-item pricing.

### Project drafts and optional maintenance

Apply these migrations before deploying the corresponding admin UI:

1. `supabase/migrations/202610020001_project_drafts.sql` creates owner-only, incomplete project drafts. A project enters the public `projects` table only when published from the editor.
2. `supabase/migrations/202610020002_quote_optional_maintenance.sql` adds an optional monthly maintenance amount to global-price quotes. It appears separately in the editor and PDF, never in the one-off project total.

If a maintenance amount is selected but the second migration is missing, the editor rejects the save before creating a numbered quote. Drafts and optional maintenance can be left unused; existing published projects and quote totals remain unchanged.

New quotes and business settings use the same ES/CA/EN example terms when the corresponding stored terms are empty. Custom saved terms take precedence, and existing quote documents retain their saved terms.

### Lead capture

Apply `supabase/migrations/202609230001_create_lead_capture.sql` after the quote migrations. It creates private leads, versioned estimator pricing, ownership policies and the `publish_lead_pricing` RPC.

Copy the variable names in `.env.example` to a local `.env.local` (ignored by Git) and to Vercel's project environment settings. Never put passwords or real keys in `.env.example`, and never prefix server credentials with `VITE_`. `SUPABASE_SERVICE_ROLE_KEY` is required. In a single-owner CRM, `CRM_OWNER_ID` can be omitted and the API resolves the owner from the only `crm_settings` record; configure it explicitly if there is more than one owner.

For email, set `SMTP_HOST`, `SMTP_PORT` (465 for implicit TLS, 587 for STARTTLS), `SMTP_USER`, and `SMTP_PASSWORD` in Vercel; redeploy after changing them. Optionally set `LEADS_FROM_EMAIL` to an address authorized by the SMTP provider (defaults to `SMTP_USER`) and `LEADS_NOTIFICATION_EMAIL` (defaults to `hola@alexcasanova.es`). The contact and configurator forms save enquiries in Supabase even if SMTP is unavailable; check `leads.email_delivery` for `sent`, `failed`, or `not_configured`. A successful form response alone does not prove an email arrived. Verify the Supabase variables first if `/api/leads` responds with HTTP 500, then send a real test enquiry and confirm delivery.

After deployment, open `Admin > Leads > Tarifas` and publish the initial pricing version. Until then, the public calculator uses the checked-in 700 EUR base configuration. Every submitted lead stores its pricing version and complete estimate snapshot, so later price changes do not alter historical enquiries.
