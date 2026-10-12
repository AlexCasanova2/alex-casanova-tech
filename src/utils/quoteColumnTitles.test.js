import { describe, expect, it } from 'vitest'
import { defaultQuoteColumnTitles, normalizeQuoteColumnTitles, resolveQuoteColumnTitles } from './quoteColumnTitles'

describe('quote column titles', () => {
  it.each([['es','Concepto','Precio'],['ca','Concepte','Preu'],['en','Description','Price']])('uses language defaults for global quotes (%s)', (language, description, price) => {
    expect(defaultQuoteColumnTitles(language,'global')).toMatchObject({item_description:description,item_price:price,extra_price:price})
  })
  it('preserves existing itemized amount headings and falls back for unsupported languages', () => {
    expect(defaultQuoteColumnTitles('ca').item_price).toBe('Import')
    expect(defaultQuoteColumnTitles('unknown').item_price).toBe('Importe')
  })
  it('trims overrides, drops empty and unknown keys and does not mutate the source', () => {
    const input={item_description:'  Serveis  ',item_price:'  ',extra_price:null,extra_original:42,unknown:'Ignored'}
    expect(normalizeQuoteColumnTitles(input)).toEqual({item_description:'Serveis'})
    expect(input.item_description).toBe('  Serveis  ')
    expect(normalizeQuoteColumnTitles(null)).toEqual({})
  })
  it('combines custom headings with language defaults without fixing defaults in another language', () => {
    const column_titles={item_description:'Serveis',item_price:''}
    expect(resolveQuoteColumnTitles({language:'ca',pricing_mode:'global',column_titles})).toMatchObject({item_description:'Serveis',item_price:'Preu'})
    expect(resolveQuoteColumnTitles({language:'en',pricing_mode:'global',column_titles})).toMatchObject({item_description:'Serveis',item_price:'Price'})
    expect(resolveQuoteColumnTitles({language:'ca',column_titles:{}}).item_description).toBe('Concepte')
  })
})
