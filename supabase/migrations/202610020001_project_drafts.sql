begin;

-- Drafts stay in an owner-only table, separate from the public projects API.
create table public.project_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_drafts_owner_updated_idx on public.project_drafts (owner_id, updated_at desc);
create trigger project_drafts_set_updated_at
before update on public.project_drafts
for each row execute function public.set_updated_at();

alter table public.project_drafts enable row level security;
create policy project_drafts_owner_all on public.project_drafts
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

revoke all on table public.project_drafts from anon;
grant select, insert, update, delete on table public.project_drafts to authenticated;

commit;
