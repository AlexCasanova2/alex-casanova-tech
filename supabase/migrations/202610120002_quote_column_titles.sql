begin;

-- Los títulos vacíos mantienen los encabezados predeterminados del idioma.
alter table public.quotes add column column_titles jsonb not null default '{}'::jsonb
  check (jsonb_typeof(column_titles) = 'object');

create or replace function public.save_quote_priced(p_quote jsonb, p_items jsonb)
returns public.quotes language plpgsql security invoker
set search_path = pg_catalog, public as $$
declare v_quote public.quotes;
begin
  select * into v_quote from public.save_quote(p_quote, p_items);
  update public.quotes set
    pricing_mode = coalesce(p_quote ->> 'pricing_mode', pricing_mode),
    global_price = coalesce((p_quote ->> 'global_price')::numeric, global_price),
    maintenance_monthly = case when p_quote ? 'maintenance_monthly'
      then (p_quote ->> 'maintenance_monthly')::numeric else maintenance_monthly end,
    maintenance_in_total = case when p_quote ? 'maintenance_in_total'
      then (p_quote ->> 'maintenance_in_total')::boolean else maintenance_in_total end,
    extras = case when p_quote ? 'extras' then p_quote -> 'extras' else extras end,
    column_titles = case when p_quote ? 'column_titles' then p_quote -> 'column_titles' else column_titles end
  where id = v_quote.id and owner_id = auth.uid()
  returning * into v_quote;
  return v_quote;
end;
$$;

commit;
