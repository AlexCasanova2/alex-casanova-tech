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

### Quote pricing modes

Apply `supabase/migrations/202609170001_quote_pricing_modes.sql` after the initial CRM migration. This adds per-item and global project pricing, and the transactional `save_quote_priced` RPC. Existing quotes keep per-item pricing. Global prices are before discount and tax; individual item rates are retained when switching modes but are omitted from global-price PDFs.

If PostgREST reports `Could not find the function public.save_quote_priced`, apply that pricing migration to the same Supabase project used by the website. If it was already applied successfully, reload the API schema cache from the SQL editor:

```sql
NOTIFY pgrst, 'reload schema';
```

Per-item quotes can still be saved using the original `save_quote` function while the pricing function is unavailable. Global pricing requires the migration; it is never silently converted to per-item pricing.

New quotes and business settings use the same ES/CA/EN example terms when the corresponding stored terms are empty. Custom saved terms take precedence, and existing quote documents retain their saved terms.
