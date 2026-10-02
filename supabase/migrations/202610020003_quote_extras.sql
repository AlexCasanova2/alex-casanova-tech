begin;

-- Los extras se suman después del descuento general y antes de los impuestos.
alter table public.quotes add column extras jsonb not null default '[]'::jsonb;

create or replace function public.recalculate_quote_totals()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare
  v_subtotal numeric(14,2);
  v_extras numeric(14,2) := 0;
  v_extra jsonb;
  v_original numeric(14,2);
  v_discounted numeric(14,2);
begin
  if jsonb_typeof(new.extras) <> 'array' then
    raise exception 'Extras must be an array';
  end if;
  for v_extra in select value from jsonb_array_elements(new.extras) loop
    v_original := (v_extra ->> 'original_price')::numeric;
    v_discounted := (v_extra ->> 'discounted_price')::numeric;
    if coalesce(btrim(v_extra ->> 'description'), '') = '' or v_original is null
      or v_original < 0 or v_original::text in ('NaN', 'Infinity', '-Infinity')
      or (v_discounted is not null and (v_discounted < 0 or v_discounted > v_original
        or v_discounted::text in ('NaN', 'Infinity', '-Infinity'))) then
      raise exception 'Invalid extra description or price';
    end if;
    v_extras := v_extras + coalesce(v_discounted, v_original);
  end loop;
  if new.pricing_mode = 'global' then
    v_subtotal := new.global_price;
  else
    select coalesce(sum(line_total), 0) into v_subtotal
      from public.quote_items where quote_id = new.id;
  end if;
  new.subtotal := v_subtotal;
  new.discount_amount := round(v_subtotal * new.discount_percentage / 100, 2);
  new.taxable_base := round(v_subtotal - new.discount_amount + v_extras, 2);
  new.vat_amount := round(new.taxable_base * new.vat_percentage / 100, 2);
  new.withholding_amount := round(new.taxable_base * new.withholding_percentage / 100, 2);
  new.total := round(new.taxable_base + new.vat_amount - new.withholding_amount, 2);
  return new;
end;
$$;

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
    extras = case when p_quote ? 'extras' then p_quote -> 'extras' else extras end
  where id = v_quote.id and owner_id = auth.uid()
  returning * into v_quote;
  return v_quote;
end;
$$;

commit;
