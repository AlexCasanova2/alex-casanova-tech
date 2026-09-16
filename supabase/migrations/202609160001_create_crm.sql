create extension if not exists pgcrypto;

create type public.quote_status as enum ('draft', 'sent', 'accepted', 'rejected');
create type public.crm_language as enum ('es', 'ca', 'en');

create table public.crm_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  quote_prefix text not null default 'Q' check (quote_prefix ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,19}$'),
  default_language public.crm_language not null default 'es',
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  issuer_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(issuer_snapshot) = 'object'),
  default_vat_percentage numeric(7,4) not null default 21 check (default_vat_percentage between 0 and 100),
  default_withholding_percentage numeric(7,4) not null default 0 check (default_withholding_percentage between 0 and 100),
  default_validity_days integer not null default 30 check (default_validity_days between 1 and 365),
  default_terms jsonb not null default '{"es":"","ca":"","en":""}'::jsonb check (jsonb_typeof(default_terms) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  tax_id text,
  email text,
  phone text,
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  language public.crm_language not null default 'es',
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, id)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id uuid,
  quote_number text not null,
  quote_year integer not null check (quote_year between 2000 and 9999),
  title text not null default 'Presupuesto' check (btrim(title) <> ''),
  status public.quote_status not null default 'draft',
  language public.crm_language not null default 'es',
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  issue_date date not null default current_date,
  valid_until date,
  client_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(client_snapshot) = 'object'),
  issuer_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(issuer_snapshot) = 'object'),
  notes text,
  terms text,
  discount_percentage numeric(7,4) not null default 0 check (discount_percentage between 0 and 100),
  vat_percentage numeric(7,4) not null default 21 check (vat_percentage between 0 and 100),
  withholding_percentage numeric(7,4) not null default 0 check (withholding_percentage between 0 and 100),
  subtotal numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  taxable_base numeric(14,2) not null default 0,
  vat_amount numeric(14,2) not null default 0,
  withholding_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, id),
  unique (owner_id, quote_number),
  constraint quotes_owned_client_fk foreign key (owner_id, client_id)
    references public.clients (owner_id, id) on delete restrict,
  check (valid_until is null or valid_until >= issue_date)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  description text not null check (btrim(description) <> ''),
  quantity numeric(14,4) not null default 1 check (quantity >= 0),
  unit text not null default 'unit' check (btrim(unit) <> ''),
  unit_price numeric(14,4) not null default 0 check (unit_price >= 0),
  line_total numeric(14,2) not null default 0 check (line_total >= 0),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quote_id, position)
);

create table public.quote_counters (
  owner_id uuid not null references auth.users (id) on delete cascade,
  quote_year integer not null check (quote_year between 2000 and 9999),
  current_value integer not null check (current_value > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, quote_year)
);

create index clients_owner_archived_idx on public.clients (owner_id, archived_at);
create index quotes_owner_archived_idx on public.quotes (owner_id, archived_at);
create index quotes_owner_client_idx on public.quotes (owner_id, client_id);
create index quote_items_quote_idx on public.quote_items (quote_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger crm_settings_set_updated_at
before update on public.crm_settings
for each row execute function public.set_updated_at();

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger quote_items_set_updated_at
before update on public.quote_items
for each row execute function public.set_updated_at();

create trigger quote_counters_set_updated_at
before update on public.quote_counters
for each row execute function public.set_updated_at();

create function public.enforce_quote_item_total()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.line_total := round(new.quantity * new.unit_price, 2);
  return new;
end;
$$;

create trigger quote_items_enforce_total
before insert or update on public.quote_items
for each row execute function public.enforce_quote_item_total();

create function public.recalculate_quote_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_subtotal numeric(14,2);
begin
  select coalesce(sum(line_total), 0) into v_subtotal
    from public.quote_items where quote_id = new.id;

  new.subtotal := v_subtotal;
  new.discount_amount := round(v_subtotal * new.discount_percentage / 100, 2);
  new.taxable_base := round(v_subtotal - new.discount_amount, 2);
  new.vat_amount := round(new.taxable_base * new.vat_percentage / 100, 2);
  new.withholding_amount := round(new.taxable_base * new.withholding_percentage / 100, 2);
  new.total := round(new.taxable_base + new.vat_amount - new.withholding_amount, 2);
  return new;
end;
$$;

create trigger quotes_recalculate_totals
before insert or update on public.quotes
for each row execute function public.recalculate_quote_totals();

create function public.refresh_quote_after_item_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_quote_id uuid;
begin
  v_quote_id := case when tg_op = 'DELETE' then old.quote_id else new.quote_id end;
  update public.quotes set updated_at = now()
   where id = v_quote_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger quote_items_refresh_quote
after insert or update or delete on public.quote_items
for each row execute function public.refresh_quote_after_item_change();

create function public.assign_quote_number()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_prefix text;
  v_next integer;
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;

  if new.owner_id is null or (auth.uid() is not null and new.owner_id <> auth.uid()) then
    raise exception 'Cannot assign a quote number for another owner' using errcode = '42501';
  end if;

  new.quote_year := extract(year from coalesce(new.issue_date, current_date))::integer;

  select s.quote_prefix
    into v_prefix
    from public.crm_settings as s
   where s.owner_id = new.owner_id;

  v_prefix := coalesce(v_prefix, 'Q');

  insert into public.quote_counters (owner_id, quote_year, current_value)
  values (new.owner_id, new.quote_year, 1)
  on conflict (owner_id, quote_year) do update
    set current_value = public.quote_counters.current_value + 1
  returning current_value into v_next;

  new.quote_number := v_prefix || '-' || new.quote_year::text || '-' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;

create trigger quotes_assign_number
before insert on public.quotes
for each row execute function public.assign_quote_number();

create function public.prevent_quote_number_change()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.quote_number is distinct from old.quote_number or new.quote_year is distinct from old.quote_year then
    raise exception 'Quote numbers cannot be changed' using errcode = '23514';
  end if;
  if extract(year from new.issue_date)::integer <> old.quote_year then
    raise exception 'A numbered quote cannot be moved to another year' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger quotes_prevent_number_change
before update on public.quotes
for each row execute function public.prevent_quote_number_change();

alter table public.crm_settings enable row level security;
alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_counters enable row level security;

create policy crm_settings_owner_all on public.crm_settings
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy clients_owner_all on public.clients
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy quotes_owner_all on public.quotes
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy quote_items_owner_select on public.quote_items
for select to authenticated
using (exists (
  select 1 from public.quotes as q
  where q.id = quote_items.quote_id and q.owner_id = auth.uid()
));

create policy quote_items_owner_insert on public.quote_items
for insert to authenticated
with check (exists (
  select 1 from public.quotes as q
  where q.id = quote_items.quote_id and q.owner_id = auth.uid()
));

create policy quote_items_owner_update on public.quote_items
for update to authenticated
using (exists (
  select 1 from public.quotes as q
  where q.id = quote_items.quote_id and q.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.quotes as q
  where q.id = quote_items.quote_id and q.owner_id = auth.uid()
));

create policy quote_items_owner_delete on public.quote_items
for delete to authenticated
using (exists (
  select 1 from public.quotes as q
  where q.id = quote_items.quote_id and q.owner_id = auth.uid()
));

create function public.save_quote(p_quote jsonb, p_items jsonb)
returns public.quotes
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_owner_id uuid := auth.uid();
  v_quote public.quotes;
  v_quote_id uuid;
  v_client_id uuid;
  v_subtotal numeric(14,2);
begin
  if v_owner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_quote is null or jsonb_typeof(p_quote) <> 'object' then
    raise exception 'p_quote must be a JSON object' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array' using errcode = '22023';
  end if;

  v_quote_id := nullif(p_quote ->> 'id', '')::uuid;

  if v_quote_id is not null then
    select * into v_quote
      from public.quotes
     where id = v_quote_id and owner_id = v_owner_id
     for update;
    if not found then
      raise exception 'Quote not found or not owned by current user' using errcode = '42501';
    end if;
    v_client_id := case when p_quote ? 'client_id'
      then nullif(p_quote ->> 'client_id', '')::uuid else v_quote.client_id end;
  else
    v_client_id := nullif(p_quote ->> 'client_id', '')::uuid;
  end if;

  if v_client_id is not null and not exists (
    select 1 from public.clients where id = v_client_id and owner_id = v_owner_id
  ) then
    raise exception 'Client not found or not owned by current user' using errcode = '42501';
  end if;

  if v_quote_id is null then
    insert into public.quotes (
      owner_id, client_id, quote_number, quote_year, title, status, language, currency,
      issue_date, valid_until, client_snapshot, issuer_snapshot, notes, terms,
      discount_percentage, vat_percentage, withholding_percentage, archived_at
    ) values (
      v_owner_id,
      v_client_id,
      '',
      extract(year from coalesce(nullif(p_quote ->> 'issue_date', '')::date, current_date))::integer,
      coalesce(nullif(p_quote ->> 'title', ''), 'Presupuesto'),
      coalesce(nullif(p_quote ->> 'status', '')::public.quote_status, 'draft'),
      coalesce(nullif(p_quote ->> 'language', '')::public.crm_language, 'es'),
      coalesce(nullif(p_quote ->> 'currency', ''), 'EUR'),
      coalesce(nullif(p_quote ->> 'issue_date', '')::date, current_date),
      nullif(p_quote ->> 'valid_until', '')::date,
      coalesce(p_quote -> 'client_snapshot', '{}'::jsonb),
      coalesce(p_quote -> 'issuer_snapshot', '{}'::jsonb),
      p_quote ->> 'notes',
      p_quote ->> 'terms',
      coalesce(nullif(p_quote ->> 'discount_percentage', '')::numeric, 0),
      coalesce(nullif(p_quote ->> 'vat_percentage', '')::numeric, 21),
      coalesce(nullif(p_quote ->> 'withholding_percentage', '')::numeric, 0),
      nullif(p_quote ->> 'archived_at', '')::timestamptz
    ) returning * into v_quote;
  else
    update public.quotes set
      client_id = v_client_id,
      title = case when p_quote ? 'title' then p_quote ->> 'title' else title end,
      status = case when p_quote ? 'status' then (p_quote ->> 'status')::public.quote_status else status end,
      language = case when p_quote ? 'language' then (p_quote ->> 'language')::public.crm_language else language end,
      currency = case when p_quote ? 'currency' then p_quote ->> 'currency' else currency end,
      issue_date = case when p_quote ? 'issue_date' then (p_quote ->> 'issue_date')::date else issue_date end,
      valid_until = case when p_quote ? 'valid_until' then nullif(p_quote ->> 'valid_until', '')::date else valid_until end,
      client_snapshot = case when p_quote ? 'client_snapshot' then p_quote -> 'client_snapshot' else client_snapshot end,
      issuer_snapshot = case when p_quote ? 'issuer_snapshot' then p_quote -> 'issuer_snapshot' else issuer_snapshot end,
      notes = case when p_quote ? 'notes' then p_quote ->> 'notes' else notes end,
      terms = case when p_quote ? 'terms' then p_quote ->> 'terms' else terms end,
      discount_percentage = case when p_quote ? 'discount_percentage' then (p_quote ->> 'discount_percentage')::numeric else discount_percentage end,
      vat_percentage = case when p_quote ? 'vat_percentage' then (p_quote ->> 'vat_percentage')::numeric else vat_percentage end,
      withholding_percentage = case when p_quote ? 'withholding_percentage' then (p_quote ->> 'withholding_percentage')::numeric else withholding_percentage end,
      archived_at = case when p_quote ? 'archived_at' then nullif(p_quote ->> 'archived_at', '')::timestamptz else archived_at end
    where id = v_quote_id and owner_id = v_owner_id
    returning * into v_quote;
  end if;

  delete from public.quote_items where quote_id = v_quote.id;

  insert into public.quote_items (quote_id, description, quantity, unit, unit_price, line_total, position)
  select
    v_quote.id,
    item.value ->> 'description',
    coalesce(nullif(item.value ->> 'quantity', '')::numeric, 1),
    coalesce(nullif(item.value ->> 'unit', ''), 'unit'),
    coalesce(nullif(item.value ->> 'unit_price', '')::numeric, 0),
    round(
      coalesce(nullif(item.value ->> 'quantity', '')::numeric, 1)
      * coalesce(nullif(item.value ->> 'unit_price', '')::numeric, 0),
      2
    ),
    coalesce(nullif(item.value ->> 'position', '')::integer, item.ordinality::integer - 1)
  from jsonb_array_elements(p_items) with ordinality as item(value, ordinality);

  select coalesce(sum(line_total), 0) into v_subtotal
    from public.quote_items where quote_id = v_quote.id;

  update public.quotes set
    subtotal = v_subtotal,
    discount_amount = round(v_subtotal * discount_percentage / 100, 2),
    taxable_base = round(v_subtotal - round(v_subtotal * discount_percentage / 100, 2), 2),
    vat_amount = round(round(v_subtotal - round(v_subtotal * discount_percentage / 100, 2), 2) * vat_percentage / 100, 2),
    withholding_amount = round(round(v_subtotal - round(v_subtotal * discount_percentage / 100, 2), 2) * withholding_percentage / 100, 2),
    total = round(
      round(v_subtotal - round(v_subtotal * discount_percentage / 100, 2), 2)
      + round(round(v_subtotal - round(v_subtotal * discount_percentage / 100, 2), 2) * vat_percentage / 100, 2)
      - round(round(v_subtotal - round(v_subtotal * discount_percentage / 100, 2), 2) * withholding_percentage / 100, 2),
      2
    )
  where id = v_quote.id and owner_id = v_owner_id
  returning * into v_quote;

  return v_quote;
end;
$$;

revoke all on table public.crm_settings, public.clients, public.quotes, public.quote_items, public.quote_counters from anon;
revoke all on table public.crm_settings, public.clients, public.quotes, public.quote_items, public.quote_counters from authenticated;
grant select, insert, update, delete on table public.crm_settings, public.clients, public.quotes, public.quote_items to authenticated;

revoke all on function public.set_updated_at(), public.enforce_quote_item_total(), public.recalculate_quote_totals(), public.refresh_quote_after_item_change(), public.assign_quote_number(), public.prevent_quote_number_change() from public;
revoke all on function public.save_quote(jsonb, jsonb) from public;
grant execute on function public.save_quote(jsonb, jsonb) to authenticated;
