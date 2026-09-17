export function validateQuoteValues(quote) {
  const numberInRange = (value, min, max = Infinity) =>
    value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max
  const validDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
    const date = new Date(`${value}T12:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  }
  if (!validDate(quote.issue_date) || (quote.valid_until && (!validDate(quote.valid_until) || quote.valid_until < quote.issue_date))) return 'dates'
  if (quote.quote_year && Number(quote.issue_date.slice(0, 4)) !== Number(quote.quote_year)) return 'year'
  if (['discount_percentage', 'vat_percentage', 'withholding_percentage'].some(key => !numberInRange(quote[key], 0, 100))) return 'percentages'
  if (quote.pricing_mode === 'global' && !numberInRange(quote.global_price, 0)) return 'amounts'
  if (quote.quote_items.some(item => !numberInRange(item.quantity, 0) || (quote.pricing_mode !== 'global' && !numberInRange(item.unit_price, 0)))) return 'amounts'
  return null
}
