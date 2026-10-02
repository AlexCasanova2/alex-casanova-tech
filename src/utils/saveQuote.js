export const PRICING_MIGRATION = 'supabase/migrations/202609170001_quote_pricing_modes.sql'
export const MAINTENANCE_MIGRATION = 'supabase/migrations/202610020002_quote_optional_maintenance.sql'
export const EXTRAS_MIGRATION = 'supabase/migrations/202610020003_quote_extras.sql'

export async function saveQuoteWithCompatibility(client, quote, items, previousPricingMode = 'itemized') {
  quote = { ...quote }
  if (quote.extras != null) {
    const { error } = await client.from('quotes').select('extras').limit(1)
    if (error) {
      if (error.code !== '42703') return { data:null, error }
      if (quote.extras.length) return { data:null, error:{ code:'EXTRAS_MIGRATION_REQUIRED', message:EXTRAS_MIGRATION } }
      delete quote.extras
    }
  }
  if (quote.maintenance_monthly != null) {
    // Check the new column before any RPC that could create a numbered quote.
    const { error } = await client.from('quotes').select('maintenance_monthly').limit(1)
    if (error) return { data:null, error:error.code === '42703'
      ? { code:'MAINTENANCE_MIGRATION_REQUIRED', message:MAINTENANCE_MIGRATION }
      : error }
  }
  const args = { p_quote: quote, p_items: items }
  const result = await client.rpc('save_quote_priced', args)
  const missingFunction = result.error?.code === 'PGRST202'
    && result.error.message?.includes('save_quote_priced')

  // Retry only when PostgREST confirms that the function was never executed.
  // Network errors and SQL failures must not trigger a second write.
  if (!missingFunction) return result

  if (quote.pricing_mode === 'global' || previousPricingMode === 'global' || quote.maintenance_monthly != null || quote.extras?.length) {
    return { data: null, error: { code: 'PRICING_MIGRATION_REQUIRED', message: PRICING_MIGRATION } }
  }

  const { pricing_mode, global_price, maintenance_monthly, ...legacyQuote } = quote
  return client.rpc('save_quote', { p_quote: legacyQuote, p_items: items })
}
