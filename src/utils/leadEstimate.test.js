import { describe, expect, it } from 'vitest'
import { defaultLeadPricing } from '../config/leadPricing.js'
import { calculateLeadEstimate } from './leadEstimate.js'

describe('calculateLeadEstimate', () => {
  it('calculates the 700 EUR base before VAT', () => {
    expect(calculateLeadEstimate({ projectType:'new', pages:'one' }, defaultLeadPricing)).toMatchObject({ netMin:700, netMax:805, vatMin:147, totalMin:847 })
  })

  it('adds selected scope and separates monthly maintenance', () => {
    const estimate = calculateLeadEstimate({ projectType:'redesign', pages:'small', extras:['cms'], extraLanguage:true, maintenance:true }, defaultLeadPricing)
    expect(estimate.netMin).toBe(2000)
    expect(estimate.monthly).toBe(75)
  })

  it('requires a custom valuation for projects outside the rules', () => {
    expect(calculateLeadEstimate({ projectType:'other', pages:'one' }, defaultLeadPricing).custom).toBe(true)
    expect(calculateLeadEstimate({ projectType:'new', pages:'custom' }, defaultLeadPricing).custom).toBe(true)
  })
})
