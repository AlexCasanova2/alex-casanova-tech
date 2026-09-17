import { describe, it, expect } from 'vitest'
import { validateQuoteValues } from './quoteValidation'

const quote = () => ({ issue_date: '2026-09-17', valid_until: '2026-10-17', discount_percentage: 0, vat_percentage: 21, withholding_percentage: 15, quote_items: [{ quantity: 1.5, unit_price: 0 }] })
describe('quote validation', () => {
  it('validates the global amount including zero', () => {
    expect(validateQuoteValues({...quote(),pricing_mode:'global',global_price:0})).toBeNull()
    for (const global_price of ['', null, -10, Infinity]) {
      expect(validateQuoteValues({...quote(),pricing_mode:'global',global_price})).toBe('amounts')
    }
  })
  it('allows fractional quantities and free items', () => expect(validateQuoteValues(quote())).toBeNull())
  it('rejects empty, negative and non-finite amounts', () => {
    for (const value of ['', null, -1, Infinity, 'invalid']) {
      const valueQuote = quote()
      valueQuote.quote_items[0].unit_price = value
      expect(validateQuoteValues(valueQuote)).toBe('amounts')
    }
  })
  it('rejects impossible dates and expiry before issue', () => {
    expect(validateQuoteValues({ ...quote(), issue_date: '2026-02-30' })).toBe('dates')
    expect(validateQuoteValues({ ...quote(), valid_until: '2026-09-01' })).toBe('dates')
  })
  it('preserves the year of a numbered quote', () => expect(validateQuoteValues({ ...quote(), quote_year: 2025 })).toBe('year'))
  it('rejects percentages outside the allowed range', () => expect(validateQuoteValues({ ...quote(), vat_percentage: 101 })).toBe('percentages'))
})
