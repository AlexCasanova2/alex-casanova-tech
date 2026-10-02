begin;

-- Optional monthly service; never enters the one-off project subtotal or total.
alter table public.quotes
  add column maintenance_monthly numeric(14,2) check (maintenance_monthly >= 0);

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
      then (p_quote ->> 'maintenance_monthly')::numeric else maintenance_monthly end
  where id = v_quote.id and owner_id = auth.uid()
  returning * into v_quote;
  return v_quote;
end;
$$;

commit;
