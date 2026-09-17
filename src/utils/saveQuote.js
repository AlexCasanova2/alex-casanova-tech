export const PRICING_MIGRATION = 'supabase/migrations/202609170001_quote_pricing_modes.sql'

export async function saveQuoteWithCompatibility(client, quote, items, previousPricingMode = 'itemized') {
  const args = { p_quote: quote, p_items: items }
  const result = await client.rpc('save_quote_priced', args)
  const missingFunction = result.error?.code === 'PGRST202'
    && result.error.message?.includes('save_quote_priced')

  // Retry only when PostgREST confirms that the function was never executed.
  // Network errors and SQL failures must not trigger a second write.
  if (!missingFunction) return result

  if (quote.pricing_mode === 'global' || previousPricingMode === 'global') {
    return { data: null, error: { code: 'PRICING_MIGRATION_REQUIRED', message: PRICING_MIGRATION } }
  }

  const { pricing_mode, global_price, ...legacyQuote } = quote
  return client.rpc('save_quote', { p_quote: legacyQuote, p_items: items })
}
