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

  it('omits units and quantities and shows original/final extra prices and the correct total', async () => {
    await generateQuotePdf({
      language:'es',pricing_mode:'global',global_price:2000,discount_percentage:10,vat_percentage:0,
      quote_items:[{description:'Web incluida',quantity:1,unit:'proyecto',unit_price:500}],
      extras:[{description:'Landing extra',original_price:500,discounted_price:350}]
    })
    const tables = vi.mocked(autoTable).mock.calls.map(call => call[1])
    expect(tables[0].head).toEqual([['Concepto']])
    expect(tables[0].body).toEqual([['Web incluida']])
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
})
