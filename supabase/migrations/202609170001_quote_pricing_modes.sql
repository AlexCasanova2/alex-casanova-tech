begin;

alter table public.quotes
  add column pricing_mode text not null default 'itemized' check (pricing_mode in ('itemized', 'global')),
  add column global_price numeric(14,2) not null default 0 check (global_price >= 0);

create or replace function public.recalculate_quote_totals()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare v_subtotal numeric(14,2);
begin
  if new.pricing_mode = 'global' then
    v_subtotal := new.global_price;
  else
    select coalesce(sum(line_total), 0) into v_subtotal
      from public.quote_items where quote_id = new.id;
  end if;
  new.subtotal := v_subtotal;
  new.discount_amount := round(v_subtotal * new.discount_percentage / 100, 2);
  new.taxable_base := round(v_subtotal - new.discount_amount, 2);
  new.vat_amount := round(new.taxable_base * new.vat_percentage / 100, 2);
  new.withholding_amount := round(new.taxable_base * new.withholding_percentage / 100, 2);
  new.total := round(new.taxable_base + new.vat_amount - new.withholding_amount, 2);
  return new;
end;
$$;

-- Both calls run in the same transaction; any error rolls back lines and header.
-- Security invoker preserves the existing ownership checks and RLS policies.
create function public.save_quote_priced(p_quote jsonb, p_items jsonb)
returns public.quotes language plpgsql security invoker
set search_path = pg_catalog, public as $$
declare v_quote public.quotes;
begin
  select * into v_quote from public.save_quote(p_quote, p_items);
  update public.quotes set
    pricing_mode = coalesce(p_quote ->> 'pricing_mode', pricing_mode),
    global_price = coalesce((p_quote ->> 'global_price')::numeric, global_price)
  where id = v_quote.id and owner_id = auth.uid()
  returning * into v_quote;
  return v_quote;
end;
$$;
revoke all on function public.save_quote_priced(jsonb, jsonb) from public;
grant execute on function public.save_quote_priced(jsonb, jsonb) to authenticated;
commit;
