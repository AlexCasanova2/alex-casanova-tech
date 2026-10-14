import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsPDF } from 'jspdf'
import { generateQuotePdf } from './quotePdf'

const renderedTables = vi.hoisted(() => [])
vi.mock('jspdf-autotable', async importOriginal => {
  const original = await importOriginal()
  return {...original, default:(document, options) => {
    const result = original.default(document, options)
    renderedTables.push(document.lastAutoTable)
    return result
  }}
})

describe('real quote PDF generation', () => {
  let document
  let originalSave

  beforeEach(() => {
    renderedTables.length = 0
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
    const summary = renderedTables.at(-1)
    expect(summary.body.map(row => row.cells[0].text.join(' '))).toEqual(['Serveis','Millores','Manteniment mensual','TOTAL'])
    expect((pdf.match(/\(Serveis\)/g) || []).length).toBe(2)
    expect((pdf.match(/\(Millores\)/g) || []).length).toBe(2)
    expect(document.getNumberOfPages()).toBe(1)
  })
  it('renders custom maintenance paragraphs using the real PDF engine', async () => {
    await generateQuotePdf({language:'es',pricing_mode:'global',global_price:275,
      quote_items:[{description:'SEO'}],maintenance_monthly:100,maintenance_in_total:true,
      maintenance_description:'Copias de seguridad\nActualizaciones y soporte'
    })
    const pdf = document.output()
    expect(pdf).toContain('(Copias de seguridad)')
    expect(pdf).toContain('(Actualizaciones y soporte)')
    expect(pdf).not.toContain('Servicio de mantenimiento mensual')
    expect(pdf).toContain('375,00')
    expect(renderedTables[1].columns.at(-1).width).toBeCloseTo(42)
  })
  it.each([null,350])('renders aligned columns and indefinite maintenance using the real layout engine (extra discount %s)', async discounted_price => {
    await generateQuotePdf({
      language:'ca',pricing_mode:'global',global_price:275,quote_items:[{description:'SEO mensual'}],
      extras:[{description:'Hemeroteca',original_price:450,discounted_price}],
      maintenance_monthly:100,maintenance_in_total:true
    })
    const [items, extras, maintenance] = renderedTables
    const priceColumns = [items.columns.at(-1),extras.columns.at(-1),maintenance.columns.at(-1)]
    for (const column of priceColumns) expect(column.width).toBeCloseTo(42)
    const priceStarts = [items,extras,maintenance].map(table => table.settings.margin.left
      + table.columns.slice(0,-1).reduce((width,column) => width + column.width,0))
    expect(priceStarts[0]).toBeCloseTo(priceStarts[1])
    expect(priceStarts[0]).toBeCloseTo(priceStarts[2])
    const pdf = document.output()
    expect(pdf).toContain('(Manteniment mensual)')
    expect(pdf).toContain('durada indefinida')
    expect(pdf).toContain('/mes')
    expect(pdf).not.toContain('1 mes')
    expect(pdf).toContain(discounted_price == null ? '825,00' : '725,00')
  })
})
