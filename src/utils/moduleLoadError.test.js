import { describe, expect, it } from 'vitest'
import { isModuleLoadError } from './moduleLoadError'

describe('isModuleLoadError', () => {
  it.each([
    'Failed to fetch dynamically imported module: https://example.com/assets/quotePdf-old.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
    'Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".'
  ])('recognizes a failed module download: %s', message => {
    expect(isModuleLoadError(new TypeError(message))).toBe(true)
  })

  it('does not mask PDF generation errors', () => {
    expect(isModuleLoadError(new Error('Invalid PDF data'))).toBe(false)
    expect(isModuleLoadError(null)).toBe(false)
  })
})
