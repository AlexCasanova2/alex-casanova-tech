import { describe, expect, it } from 'vitest'
import { isAllowedOrigin } from './leads.js'

describe('lead origin validation', () => {
  it('allows the new domain with and without www', () => {
    expect(isAllowedOrigin('https://alexcasanova.es')).toBe(true)
    expect(isAllowedOrigin('https://www.alexcasanova.es')).toBe(true)
  })

  it('rejects the old domain and unrelated origins', () => {
    expect(isAllowedOrigin('https://alexcasanova.tech')).toBe(false)
    expect(isAllowedOrigin('https://other.example')).toBe(false)
  })

  it('preserves local and preview requests', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('https://portfolio-preview.vercel.app')).toBe(true)
    expect(isAllowedOrigin(undefined)).toBe(true)
  })
})
