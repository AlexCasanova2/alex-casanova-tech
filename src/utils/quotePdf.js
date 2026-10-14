import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calculateQuoteTotals, formatCurrency } from './quoteCalculations'
import { resolveQuoteColumnTitles } from './quoteColumnTitles'
import { resolveMaintenanceDescription } from './quoteMaintenance'

const text = {
  es: { quote:'PRESUPUESTO', issue:'Fecha', valid:'Válido hasta', client:'CLIENTE', description:'Concepto', quantity:'Cantidad', unit:'Unidad', price:'Precio', amount:'Importe', subtotal:'Subtotal', discount:'Descuento', vat:'IVA', withholding:'IRPF', total:'TOTAL', maintenance:'Mantenimiento opcional', maintenanceNote:'Mensual + IVA. No incluido en el total del proyecto.', notes:'NOTAS', terms:'CONDICIONES', page:'Página' },
  ca: { quote:'PRESSUPOST', issue:'Data', valid:'Vàlid fins', client:'CLIENT', description:'Concepte', quantity:'Quantitat', unit:'Unitat', price:'Preu', amount:'Import', subtotal:'Subtotal', discount:'Descompte', vat:'IVA', withholding:'IRPF', total:'TOTAL', maintenance:'Manteniment opcional', maintenanceNote:'Mensual + IVA. No inclòs en el total del projecte.', notes:'NOTES', terms:'CONDICIONS', page:'Pàgina' },
  en: { quote:'QUOTE', issue:'Date', valid:'Valid until', client:'CLIENT', description:'Description', quantity:'Quantity', unit:'Unit', price:'Price', amount:'Amount', subtotal:'Subtotal', discount:'Discount', vat:'VAT', withholding:'Withholding', total:'TOTAL', maintenance:'Optional maintenance', maintenanceNote:'Monthly + VAT. Not included in the project total.', notes:'NOTES', terms:'TERMS', page:'Page' }
}

const localeCodes = { es:'es-ES', ca:'ca-ES', en:'en-IE' }
const maintenanceText = {
  es:{title:'Mantenimiento mensual',included:'El importe mensual se incluye en el total, antes de impuestos.',separate:'Servicio opcional. Importe mensual antes de impuestos, no incluido en el total.',suffix:'/mes'},
  ca:{title:'Manteniment mensual',included:'L’import mensual s’inclou en el total, abans d’impostos.',separate:'Servei opcional. Import mensual abans d’impostos, no inclòs en el total.',suffix:'/mes'},
  en:{title:'Monthly maintenance',included:'The monthly fee is included in the total, before tax.',separate:'Optional service. Monthly fee before tax, not included in the total.',suffix:'/month'}
}
const formatDate = (date, language) => date ? new Intl.DateTimeFormat(localeCodes[language]).format(new Date(`${date}T12:00:00`)) : '—'
const addressLines = entity => [typeof entity?.address === 'string' ? entity.address : entity?.address?.line1, [entity?.address?.postal_code || entity?.postal_code, entity?.address?.city || entity?.city].filter(Boolean).join(' '), entity?.address?.country || entity?.country].filter(Boolean)

async function loadImage(url) {
  if (!url) return null
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

export async function generateQuotePdf(quote) {
  const language = quote.language || 'es'
  const t = text[language] || text.es
  const locale = localeCodes[language] || localeCodes.es
  const issuer = quote.issuer_snapshot || {}
  const client = quote.client_snapshot || {}
  const items = [...(quote.quote_items || [])].sort((a,b) => a.position - b.position)
  const globalPricing = quote.pricing_mode === 'global'
  const columns = resolveQuoteColumnTitles(quote)
  const totals = calculateQuoteTotals(items, { discountPercentage:quote.discount_percentage, vatPercentage:quote.vat_percentage, withholdingPercentage:quote.withholding_percentage, pricingMode:quote.pricing_mode, globalPrice:quote.global_price, extras:quote.extras, maintenanceMonthly:quote.maintenance_monthly, maintenanceInTotal:quote.maintenance_in_total })
  const money = value => formatCurrency(value, locale, quote.currency || 'EUR')
  const doc = new jsPDF({ unit:'mm', format:'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const tableWidth = pageWidth - 32
  const priceWidth = 42
  const twoColumnStyles = {0:{cellWidth:tableWidth - priceWidth},1:{cellWidth:priceWidth,halign:'right'}}
  const logo = await loadImage(issuer.logo_url)
  const wrapLines = (lines, width) => lines.flatMap(line => doc.splitTextToSize(String(line), width))

  doc.setFillColor(18,18,18)
  doc.rect(0,0,pageWidth,46,'F')
  doc.setTextColor(255,255,255)
  if (logo) {
    try { doc.addImage(logo, undefined, 16, 12, 30, 18, undefined, 'FAST') } catch { /* Keep the PDF usable if the logo format is unsupported. */ }
  }
  doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.text(t.quote, 16, logo ? 38 : 24)
  doc.setFontSize(12); doc.text(quote.quote_number || 'BORRADOR', pageWidth - 16, 20, { align:'right' })
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(190,190,190)
  doc.text(`${t.issue}: ${formatDate(quote.issue_date, language)}`, pageWidth - 16, 28, { align:'right' })
  doc.text(`${t.valid}: ${formatDate(quote.valid_until, language)}`, pageWidth - 16, 34, { align:'right' })

  doc.setTextColor(25,25,25); doc.setFont('helvetica','bold'); doc.setFontSize(10)
  doc.text(issuer.name || '', 16, 59)
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(90,90,90)
  const issuerLines = [issuer.tax_id, ...addressLines(issuer), issuer.email, issuer.phone, issuer.website].filter(Boolean)
  doc.text(wrapLines(issuerLines, 78), 16, 65, { lineHeightFactor:1.4 })
  doc.setFont('helvetica','bold'); doc.setTextColor(25,25,25); doc.text(t.client, 112, 59)
  doc.setFontSize(10); doc.text(client.name || '', 112, 66)
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(90,90,90)
  doc.text(wrapLines([client.tax_id, ...addressLines(client), client.email, client.phone].filter(Boolean), 78), 112, 72, { lineHeightFactor:1.4 })

  doc.setTextColor(25,25,25); doc.setFont('helvetica','bold'); doc.setFontSize(14)
  const titleLines = doc.splitTextToSize(quote.title || t.quote, 177)
  doc.text(titleLines, 16, 100)
  autoTable(doc, {
    startY:106 + Math.max(0, titleLines.length - 1) * 6,
    margin:{ left:16, right:16 },
    head:[[columns.item_description, columns.item_price]],
    body:items.map((item, index) => [item.description, globalPricing
      ? (index === 0 ? money(quote.global_price) : '')
      : money(Number(item.quantity)*Number(item.unit_price))]),
    styles:{ font:'helvetica', fontSize:8.5, cellPadding:3.2, lineColor:[225,225,225], lineWidth:.1, textColor:[35,35,35] },
    headStyles:{ fillColor:[18,18,18], textColor:[255,255,255], fontStyle:'bold' },
    alternateRowStyles:{ fillColor:[247,247,244] },
    columnStyles:twoColumnStyles,
    didDrawPage:data => { if (data.pageNumber > 1) { doc.setFontSize(8); doc.setTextColor(130,130,130); doc.text(`${quote.quote_number} · ${t.page} ${data.pageNumber}`, pageWidth - 16, 12, {align:'right'}) } }
  })

  let y = doc.lastAutoTable.finalY + 9
  if (quote.extras?.length) {
    const hasDiscount = extra => extra.discounted_price != null
      && Number(extra.discounted_price) < Number(extra.original_price)
    const showDiscount = quote.extras.some(hasDiscount)
    const labels = showDiscount
      ? [columns.extra_description, columns.extra_original, columns.extra_final]
      : [columns.extra_description, columns.extra_price]
    autoTable(doc, {
      startY:y, margin:{left:16,right:16}, head:[labels],
      body:quote.extras.map(extra => showDiscount
        ? [extra.description, hasDiscount(extra) ? money(extra.original_price) : '', money(extra.discounted_price ?? extra.original_price)]
        : [extra.description, money(extra.discounted_price ?? extra.original_price)]),
      styles:{fontSize:8.5,cellPadding:3.2}, headStyles:{fillColor:[18,18,18]},
      columnStyles:showDiscount
        ? {0:{cellWidth:tableWidth - priceWidth * 2},1:{cellWidth:priceWidth,halign:'right'},2:{cellWidth:priceWidth,halign:'right'}}
        : twoColumnStyles
    })
    y = doc.lastAutoTable.finalY + 9
  }
  const maintenance = maintenanceText[language] || maintenanceText.es
  if (globalPricing && quote.maintenance_monthly != null) {
    autoTable(doc, {
      startY:y, margin:{left:16,right:16}, pageBreak:'avoid',
      head:[[maintenance.title, columns.item_price]],
      body:[[`${resolveMaintenanceDescription(quote)}\n${quote.maintenance_in_total ? maintenance.included : maintenance.separate}`, `${money(quote.maintenance_monthly)} ${maintenance.suffix}`]],
      styles:{fontSize:8.5,cellPadding:3.2}, headStyles:{fillColor:[18,18,18]},
      columnStyles:twoColumnStyles
    })
    y = doc.lastAutoTable.finalY + 9
  }
  const ensureSpace = amount => { if (y + amount > 280) { doc.addPage(); y = 20 } }
  ensureSpace(48)
  const summary = [[columns.item_description,money(totals.subtotal)]]
  if (Number(quote.discount_percentage)) summary.push([`${t.discount} (${quote.discount_percentage}%)`, `-${money(totals.discountAmount)}`])
  if (quote.extras?.length) summary.push([columns.extra_description, money(totals.extrasTotal)])
  if (globalPricing && quote.maintenance_in_total && quote.maintenance_monthly != null) {
    summary.push([maintenance.title, `${money(quote.maintenance_monthly)} ${maintenance.suffix}`])
  }
  if (Number(quote.vat_percentage)) summary.push([`${t.vat} (${quote.vat_percentage}%)`, money(totals.vatAmount)])
  if (Number(quote.withholding_percentage)) summary.push([`${t.withholding} (${quote.withholding_percentage}%)`, `-${money(totals.withholdingAmount)}`])
  summary.push([t.total,money(totals.total)])
  autoTable(doc, { startY:y, margin:{left:112,right:16}, body:summary, theme:'plain', styles:{fontSize:9,cellPadding:2,halign:'right'}, columnStyles:{0:{fontStyle:'normal'},1:{fontStyle:'bold'}}, didParseCell:data => { if (data.row.index === summary.length-1) { data.cell.styles.fillColor=[215,255,79]; data.cell.styles.textColor=[15,15,15]; data.cell.styles.fontSize=11 } } })
  y = doc.lastAutoTable.finalY + 12
  for (const [heading, content] of [[t.notes, quote.notes],[t.terms, quote.terms]]) {
    if (!content) continue
    ensureSpace(14); doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(35,35,35); doc.text(heading,16,y); y += 5
    doc.setFont('helvetica','normal'); doc.setTextColor(95,95,95)
    const lines = doc.splitTextToSize(content,177)
    while (lines.length) {
      const availableLines = Math.max(1, Math.floor((280 - y) / 4.2))
      const pageLines = lines.splice(0, availableLines)
      doc.text(pageLines,16,y,{lineHeightFactor:1.35}); y += pageLines.length*4.2+7
      if (lines.length) { doc.addPage(); y = 20 }
    }
  }
  doc.save(`${quote.quote_number || 'presupuesto'}-${(client.name || 'cliente').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.pdf`)
}
