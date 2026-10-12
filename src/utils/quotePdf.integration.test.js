import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { jsPDF } from 'jspdf'
import { generateQuotePdf } from './quotePdf'

describe('real quote PDF generation', () => {
  let document
  let originalSave

  beforeEach(() => {
    originalSave = jsPDF.API.save
    // Captura el documento real sin descargar ni escribir archivos.
    jsPDF.API.save = function () { document = this; return this }
  })
  afterEach(() => {
    if (originalSave === undefined) delete jsPDF.API.save
    else jsPDF.API.save = originalSave
  })

  it('renders custom headings and a single global price without changing totals', async () => {
    await generateQuotePdf({
      language:'ca',pricing_mode:'global',global_price:275,
      column_titles:{item_description:'Serveis',item_price:'Quota',extra_description:'Millores',extra_price:'Cost'},
      quote_items:[{description:'SEO',position:0},{description:'Auditoria',position:1}],
      extras:[{description:'Hemeroteca',original_price:450}],
      maintenance_monthly:100,maintenance_in_total:true
    })
    const pdf = document.output()
    expect(pdf).toMatch(/^%PDF-/)
    for (const heading of ['Serveis','Quota','Millores','Cost']) expect(pdf).toContain(`(${heading})`)
    expect(pdf).not.toContain('(Preu original)')
    expect(pdf).not.toContain('(Preu final)')
    expect((pdf.match(/275,00/g) || []).length).toBe(2)
    expect(pdf).toContain('825,00')
    expect(document.getNumberOfPages()).toBe(1)
  })
})
