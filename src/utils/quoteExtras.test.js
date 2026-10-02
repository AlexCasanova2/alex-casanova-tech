import { describe, expect, it } from 'vitest'
import { validateQuoteValues } from './quoteValidation'

const quote = {issue_date:'2026-10-02',discount_percentage:0,vat_percentage:21,withholding_percentage:0,quote_items:[{quantity:1,unit_price:100}]}

describe('extra price validation', () => {
  it.each([
    {description:'Landing',original_price:500,discounted_price:350},
    {description:'Landing',original_price:500,discounted_price:0},
    {description:'Landing',original_price:500,discounted_price:null}
  ])('accepts an independently priced extra', extra => {
    expect(validateQuoteValues({...quote,extras:[extra]})).toBeNull()
  })
  it.each([
    {description:' ',original_price:500},
    {description:'Landing',original_price:-1},
    {description:'Landing',original_price:500,discounted_price:501},
    {description:'Landing',original_price:500,discounted_price:''},
    {description:'Landing',original_price:Infinity}
  ])('rejects invalid extras', extra => {
    expect(validateQuoteValues({...quote,extras:[extra]})).toBe('extras')
  })
})
