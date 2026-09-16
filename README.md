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
