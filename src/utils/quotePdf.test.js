import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateQuotePdf } from './quotePdf'
import autoTable from 'jspdf-autotable'

vi.mock('jspdf', () => ({
  jsPDF:class {
    constructor() {
      this.internal = {pageSize:{getWidth:() => 210}}
      this.lastAutoTable = {finalY:130}
    }
    splitTextToSize(value) { return [value] }
    setFillColor() {} rect() {} setTextColor() {} setFont() {}
    setFontSize() {} text() {} addPage() {} save() {}
  }
}))
vi.mock('jspdf-autotable', () => ({default:vi.fn()}))

describe('quote PDF presentation', () => {
  beforeEach(() => vi.mocked(autoTable).mockClear())
  it.each([['es','Precio'],['ca','Preu'],['en','Price']])('shows a single price for undiscounted extras in %s', async (language, priceLabel) => {
    await generateQuotePdf({language,quote_items:[],extras:[
      {description:'Extra sin descuento',original_price:50,discounted_price:null},
      {description:'Extra antiguo',original_price:100},
      {description:'Extra con precio igual',original_price:75,discounted_price:75}
    ]})
    const tables = vi.mocked(autoTable).mock.calls.map(call => call[1])
    expect(tables[1].head).toEqual([['Extra',priceLabel]])
    expect(tables[1].body.every(row => row.length === 2)).toBe(true)
    expect(tables[1].body.map(row => row[1])).toEqual(expect.arrayContaining([
      expect.stringContaining('50'),expect.stringContaining('100'),expect.stringContaining('75')
    ]))
    expect(tables[2].body.at(-1)[1]).toContain('225')
  })
  it('does not duplicate undiscounted prices when mixing extras with and without discounts', async () => {
    await generateQuotePdf({language:'ca',quote_items:[],extras:[
      {description:'Extra normal',original_price:50,discounted_price:null},
      {description:'Extra rebaixat',original_price:100,discounted_price:80},
      {description:'Extra gratuït',original_price:20,discounted_price:0}
    ]})
    const tables = vi.mocked(autoTable).mock.calls.map(call => call[1])
    expect(tables[1].head).toEqual([['Extra','Preu original','Preu final']])
    expect(tables[1].body[0][1]).toBe('')
    expect(tables[1].body[0][2]).toContain('50,00')
    expect(tables[1].body[1][1]).toContain('100,00')
    expect(tables[1].body[1][2]).toContain('80,00')
    expect(tables[1].body[2][2]).toContain('0,00')
    expect(tables[2].body.at(-1)[1]).toContain('130,00')
  })
  it.each([true,false])('reflects monthly maintenance inclusion (%s) in the PDF total', async maintenance_in_total => {
    await generateQuotePdf({
      language:'es',pricing_mode:'global',global_price:1000,vat_percentage:21,
      maintenance_monthly:60,maintenance_in_total,quote_items:[]
    })
    const summary = vi.mocked(autoTable).mock.calls.at(-1)[1].body
    expect(summary.some(row => row[0] === 'Mantenimiento (1 mes)')).toBe(maintenance_in_total)
    expect(summary.at(-1)[1].replace(/[.\s]/g,'')).toBe(maintenance_in_total ? '1282,60€' : '1210,00€')
  })

  it('omits units and quantities and shows original/final extra prices and the correct total', async () => {
    await generateQuotePdf({
      language:'es',pricing_mode:'global',global_price:2000,discount_percentage:10,vat_percentage:0,
      quote_items:[{description:'Web incluida',quantity:1,unit:'proyecto',unit_price:500}],
      extras:[{description:'Landing extra',original_price:500,discounted_price:350}]
    })
    const tables = vi.mocked(autoTable).mock.calls.map(call => call[1])
    expect(tables[0].head).toEqual([['Concepto','Precio']])
    expect(tables[0].body[0][0]).toBe('Web incluida')
    expect(tables[0].body[0][1].replace(/[.\s]/g,'')).toBe('2000,00€')
    expect(tables[1].head).toEqual([['Extra','Precio original','Precio final']])
    expect(tables[1].body[0][1]).toContain('500,00')
    expect(tables[1].body[0][2]).toContain('350,00')
    expect(tables[2].body.at(-1)[1].replace(/[.\s]/g,'')).toBe('2150,00€')
  })

  it('preserves amounts of older itemized quotes with multiple units', async () => {
    await generateQuotePdf({language:'es',quote_items:[{description:'Servicio',quantity:3,unit_price:100}]})
    const table = vi.mocked(autoTable).mock.calls[0][1]
    expect(table.head).toEqual([['Concepto','Importe']])
    expect(table.body[0][1]).toContain('300,00')
  })
  it('shows the global price only once, ignoring individual prices and preserving the total', async () => {
    await generateQuotePdf({language:'ca',pricing_mode:'global',global_price:275,quote_items:[
      {description:'SEO mensual',quantity:1,unit_price:999,position:1},
      {description:'Auditoria',quantity:3,unit_price:500,position:0}
    ]})
    const tables = vi.mocked(autoTable).mock.calls.map(call => call[1])
    expect(tables[0].head).toEqual([['Concepte','Preu']])
    expect(tables[0].body[0][0]).toBe('Auditoria')
    expect(tables[0].body[0][1]).toContain('275,00')
    expect(tables[0].body[1]).toEqual(['SEO mensual',''])
    expect(tables[1].body.at(-1)[1]).toContain('275,00')
  })
  it.each([null,80])('uses custom column titles in item and extra tables (discount %s)', async discounted_price => {
    await generateQuotePdf({language:'ca',pricing_mode:'global',global_price:275,
      column_titles:{item_description:'Serveis',item_price:'Quota',extra_description:'Millores',extra_price:'Cost',extra_original:'Abans',extra_final:'Ara'},
      quote_items:[{description:'SEO',quantity:1,unit_price:0}],
      extras:[{description:'Extra',original_price:100,discounted_price}]
    })
    const tables = vi.mocked(autoTable).mock.calls.map(call => call[1])
    expect(tables[0].head).toEqual([['Serveis','Quota']])
    expect(tables[1].head).toEqual([discounted_price == null ? ['Millores','Cost'] : ['Millores','Abans','Ara']])
    expect(tables[2].body.at(-1)[1]).toContain(discounted_price == null ? '375,00' : '355,00')
  })
})
