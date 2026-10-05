import { describe, expect, it } from 'vitest'
import { redesignEnquiryMessage } from './redesignEnquiry'

describe('redesign enquiry CRM message', () => {
  it('includes the current URL, objectives and client qualification in the contact message', () => {
    const message = redesignEnquiryMessage({currentWebsite:'https://example.com',message:'Mejorar contactos',timeline:'Este trimestre',budget:'Necesito orientación'})
    expect(message).toContain('Solicitud de rediseño web')
    expect(message).toContain('Web actual: https://example.com')
    expect(message).toContain('Objetivos: Mejorar contactos')
    expect(message).toContain('Plazo deseado: Este trimestre')
    expect(message).toContain('Presupuesto orientativo del cliente: Necesito orientación')
  })
  it('omits optional empty fields without inserting undefined text', () => {
    const message = redesignEnquiryMessage({currentWebsite:'https://example.com',message:'Renovar diseño'})
    expect(message).not.toMatch(/Plazo deseado|Presupuesto orientativo|undefined/)
  })
})
