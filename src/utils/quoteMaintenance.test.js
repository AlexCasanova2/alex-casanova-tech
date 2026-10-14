import { describe, expect, it } from 'vitest'
import { defaultMaintenanceDescription, resolveMaintenanceDescription } from './quoteMaintenance'

describe('maintenance content', () => {
  it.each([['es','duración indefinida'],['ca','durada indefinida'],['en','indefinite duration']])('uses the language default for empty content (%s)', (language, duration) => {
    for (const maintenance_description of [undefined,null,'','   ']) {
      expect(resolveMaintenanceDescription({language,maintenance_description})).toContain(duration)
    }
    expect(defaultMaintenanceDescription(language)).toContain(duration)
  })
  it('preserves custom text and line breaks when the quote language changes', () => {
    const maintenance_description='  Copias de seguridad\nActualizaciones y soporte  '
    expect(resolveMaintenanceDescription({language:'ca',maintenance_description})).toBe('Copias de seguridad\nActualizaciones y soporte')
    expect(resolveMaintenanceDescription({language:'en',maintenance_description})).toBe('Copias de seguridad\nActualizaciones y soporte')
  })
  it('falls back to Spanish for unsupported languages and malformed content', () => {
    expect(resolveMaintenanceDescription({language:'unknown',maintenance_description:42})).toBe(defaultMaintenanceDescription('es'))
  })
})
