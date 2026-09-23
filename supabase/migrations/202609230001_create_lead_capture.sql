begin;

create type public.lead_status as enum ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost');

create table public.lead_pricing_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  version integer not null check (version > 0),
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (owner_id, version),
  unique (owner_id, id)
);

create unique index lead_pricing_one_active_idx
  on public.lead_pricing_versions (owner_id) where is_active;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  status public.lead_status not null default 'new',
  source text not null default 'website' check (char_length(source) between 1 and 80),
  submission_key text not null check (char_length(submission_key) between 10 and 100),
  language public.crm_language not null default 'es',
  name text not null check (char_length(btrim(name)) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text check (company is null or char_length(company) <= 160),
  website text check (website is null or char_length(website) <= 500),
  message text check (message is null or char_length(message) <= 4000),
  project_data jsonb not null default '{}'::jsonb check (jsonb_typeof(project_data) = 'object'),
  estimate_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(estimate_snapshot) = 'object'),
  pricing_version_id uuid,
  attribution jsonb not null default '{}'::jsonb check (jsonb_typeof(attribution) = 'object'),
  email_delivery jsonb not null default '{}'::jsonb check (jsonb_typeof(email_delivery) = 'object'),
  privacy_accepted_at timestamptz not null,
  notes text,
  next_action_at timestamptz,
  client_id uuid,
  quote_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, submission_key),
  constraint leads_pricing_fk foreign key (owner_id, pricing_version_id)
    references public.lead_pricing_versions (owner_id, id) on delete restrict,
  constraint leads_client_fk foreign key (owner_id, client_id)
    references public.clients (owner_id, id) on delete restrict,
  constraint leads_quote_fk foreign key (owner_id, quote_id)
    references public.quotes (owner_id, id) on delete restrict
);

create index leads_owner_status_idx on public.leads (owner_id, status, created_at desc);
create index leads_owner_followup_idx on public.leads (owner_id, next_action_at) where archived_at is null;
create index leads_owner_email_idx on public.leads (owner_id, lower(email));

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.lead_pricing_versions enable row level security;
alter table public.leads enable row level security;

create policy lead_pricing_owner_all on public.lead_pricing_versions
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy leads_owner_all on public.leads
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create function public.publish_lead_pricing(p_config jsonb)
returns public.lead_pricing_versions
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_owner_id uuid := auth.uid();
  v_version integer;
  v_result public.lead_pricing_versions;
begin
  if v_owner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_config is null or jsonb_typeof(p_config) <> 'object' then
    raise exception 'Pricing config must be an object' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_owner_id::text));
  select coalesce(max(version), 0) + 1 into v_version
    from public.lead_pricing_versions where owner_id = v_owner_id;

  update public.lead_pricing_versions set is_active = false
    where owner_id = v_owner_id and is_active;

  insert into public.lead_pricing_versions (owner_id, version, config, is_active, published_at)
  values (v_owner_id, v_version, p_config, true, now())
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on table public.lead_pricing_versions, public.leads from anon;
revoke all on table public.lead_pricing_versions, public.leads from authenticated;
grant select, insert, update, delete on table public.lead_pricing_versions, public.leads to authenticated;
revoke all on function public.publish_lead_pricing(jsonb) from public;
grant execute on function public.publish_lead_pricing(jsonb) to authenticated;

commit;
