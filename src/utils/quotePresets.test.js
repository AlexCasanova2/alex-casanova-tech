import { describe, expect, it } from 'vitest'
import { addedPresetCodes } from './quotePresets'

const catalog=[{code:'WEB',title:'Web corporativa'},{code:'WEB',title:'Corporate website'},{code:'SEO',title:'Auditoría SEO técnica'}]
describe('preset availability', () => {
  it('recognizes persisted lines across languages regardless of price or quantity', () => {
    const items=[{description:'Corporate website\nCustom scope',quantity:3,unit_price:500}]
    expect([...addedPresetCodes(items,catalog)]).toEqual(['WEB'])
  })
  it('normalizes whitespace and casing and supports Windows line endings', () => {
    expect([...addedPresetCodes([{description:'  WEB CORPORATIVA \r\nDescripción'}],catalog)]).toEqual(['WEB'])
  })
  it('reenables a preset after its line is removed', () => {
    const items=[{description:'Web corporativa\nDescripción'}]
    expect(addedPresetCodes(items,catalog).has('WEB')).toBe(true)
    items.splice(0,1)
    expect(addedPresetCodes(items,catalog).has('WEB')).toBe(false)
  })
  it('does not match unrelated custom descriptions', () => {
    expect(addedPresetCodes([{description:'Web corporativa adicional'},{description:''}],catalog).size).toBe(0)
  })
})
