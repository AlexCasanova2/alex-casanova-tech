import { describe, expect, it } from 'vitest'

import {
  calculateLineTotal,
  calculateQuoteTotals,
  formatCurrency,
} from './quoteCalculations.js'

describe('calculateLineTotal', () => {
  it('multiplies decimal quantities and rounds to cents', () => {
    expect(calculateLineTotal(1.5, 19.999)).toBe(30)
    expect(calculateLineTotal(0.1, 0.2)).toBe(0.02)
  })

  it('treats non-finite inputs as zero', () => {
    expect(calculateLineTotal(Infinity, 10)).toBe(0)
    expect(calculateLineTotal(2, Number.NaN)).toBe(0)
  })
})

describe('calculateQuoteTotals', () => {
  it('uses the project price instead of summing items in global mode', () => {
    expect(calculateQuoteTotals([{quantity:10,unit_price:999}], {
      pricingMode:'global', globalPrice:1000, discountPercentage:10, vatPercentage:21, withholdingPercentage:15
    })).toEqual({subtotal:1000,discountAmount:100,base:900,vatAmount:189,withholdingAmount:135,total:954})
  })
  it('ignores the saved project price when returning to itemized mode', () => {
    expect(calculateQuoteTotals([{quantity:2,unit_price:100}], {pricingMode:'itemized',globalPrice:1000}).total).toBe(200)
  })
  it('applies discount before VAT and IRPF withholding', () => {
    expect(calculateQuoteTotals(
      [
        { quantity: 2, unitPrice: 50 },
        { quantity: 1, unit_price: 25.55 },
      ],
      { discountPercentage: 10, vatPercentage: 21, withholdingPercentage: 15 },
    )).toEqual({
      subtotal: 125.55,
      discountAmount: 12.56,
      base: 112.99,
      vatAmount: 23.73,
      withholdingAmount: 16.95,
      total: 119.77,
    })
  })

  it('sums individually rounded line totals', () => {
    expect(calculateQuoteTotals([
      { quantity: 1, unitPrice: 0.105 },
      { quantity: 1, unitPrice: 0.105 },
    ])).toEqual({
      subtotal: 0.22,
      discountAmount: 0,
      base: 0.22,
      vatAmount: 0,
      withholdingAmount: 0,
      total: 0.22,
    })
  })

  it('returns safe zero totals for missing or malformed data', () => {
    expect(calculateQuoteTotals(null, {
      discountPercentage: Infinity,
      vatPercentage: Number.NaN,
      withholdingPercentage: 'invalid',
    })).toEqual({
      subtotal: 0,
      discountAmount: 0,
      base: 0,
      vatAmount: 0,
      withholdingAmount: 0,
      total: 0,
    })
  })
})

describe('formatCurrency', () => {
  it('formats EUR using the requested locale and two decimals', () => {
    expect(formatCurrency(1234.5, 'en-IE')).toBe('€1,234.50')
  })

  it('formats non-finite values as zero', () => {
    expect(formatCurrency(Number.NaN, 'en-IE')).toBe('€0.00')
  })

  it('falls back safely for invalid formatting options', () => {
    expect(formatCurrency(10, 'not-a-locale', 'INVALID')).toContain('10,00')
  })
})
