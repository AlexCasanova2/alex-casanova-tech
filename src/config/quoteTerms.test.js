import { describe, expect, it } from 'vitest'
import { exampleQuoteTerms, fillEmptyQuoteTerms } from './quoteTerms'

describe('shared settings and quote terms', () => {
  it('fills all languages when Supabase settings contain empty values', () => {
    expect(fillEmptyQuoteTerms({es:'',ca:' ',en:null})).toEqual(exampleQuoteTerms)
  })
  it('preserves saved custom conditions verbatim and fills missing languages', () => {
    const custom='Pago al finalizar.\nTres revisiones.'
    expect(fillEmptyQuoteTerms({es:custom})).toEqual({...exampleQuoteTerms,es:custom})
  })
  it('supports absent settings without sharing mutable objects', () => {
    const terms=fillEmptyQuoteTerms(null)
    terms.es='Changed only in this quote'
    expect(fillEmptyQuoteTerms().es).toBe(exampleQuoteTerms.es)
  })
})
