import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calculateQuoteTotals, formatCurrency } from './quoteCalculations'

const text = {
  es: { quote:'PRESUPUESTO', issue:'Fecha', valid:'Válido hasta', client:'CLIENTE', description:'Concepto', quantity:'Cantidad', unit:'Unidad', price:'Precio', amount:'Importe', subtotal:'Subtotal', discount:'Descuento', vat:'IVA', withholding:'IRPF', total:'TOTAL', notes:'NOTAS', terms:'CONDICIONES', page:'Página' },
  ca: { quote:'PRESSUPOST', issue:'Data', valid:'Vàlid fins', client:'CLIENT', description:'Concepte', quantity:'Quantitat', unit:'Unitat', price:'Preu', amount:'Import', subtotal:'Subtotal', discount:'Descompte', vat:'IVA', withholding:'IRPF', total:'TOTAL', notes:'NOTES', terms:'CONDICIONS', page:'Pàgina' },
  en: { quote:'QUOTE', issue:'Date', valid:'Valid until', client:'CLIENT', description:'Description', quantity:'Quantity', unit:'Unit', price:'Price', amount:'Amount', subtotal:'Subtotal', discount:'Discount', vat:'VAT', withholding:'Withholding', total:'TOTAL', notes:'NOTES', terms:'TERMS', page:'Page' }
}

const localeCodes = { es:'es-ES', ca:'ca-ES', en:'en-IE' }
const formatDate = (date, language) => date ? new Intl.DateTimeFormat(localeCodes[language]).format(new Date(`${date}T12:00:00`)) : '—'
const addressLines = entity => [entity?.address?.line1 || entity?.address, [entity?.address?.postal_code || entity?.postal_code, entity?.address?.city || entity?.city].filter(Boolean).join(' '), entity?.address?.country || entity?.country].filter(Boolean)

async function loadImage(url) {
  if (!url) return null
  try {
    const response = await fetch(url)
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
  const totals = calculateQuoteTotals(items, { discountPercentage:quote.discount_percentage, vatPercentage:quote.vat_percentage, withholdingPercentage:quote.withholding_percentage })
  const money = value => formatCurrency(value, locale, quote.currency || 'EUR')
  const doc = new jsPDF({ unit:'mm', format:'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
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
    head:[[t.description,t.quantity,t.unit,t.price,t.amount]],
    body:items.map(item => [item.description, Number(item.quantity).toLocaleString(locale), item.unit, money(item.unit_price), money(Number(item.quantity)*Number(item.unit_price))]),
    styles:{ font:'helvetica', fontSize:8.5, cellPadding:3.2, lineColor:[225,225,225], lineWidth:.1, textColor:[35,35,35] },
    headStyles:{ fillColor:[18,18,18], textColor:[255,255,255], fontStyle:'bold' },
    alternateRowStyles:{ fillColor:[247,247,244] },
    columnStyles:{ 0:{cellWidth:82},1:{halign:'right'},2:{halign:'center'},3:{halign:'right'},4:{halign:'right'} },
    didDrawPage:data => { if (data.pageNumber > 1) { doc.setFontSize(8); doc.setTextColor(130,130,130); doc.text(`${quote.quote_number} · ${t.page} ${data.pageNumber}`, pageWidth - 16, 12, {align:'right'}) } }
  })

  let y = doc.lastAutoTable.finalY + 9
  const ensureSpace = amount => { if (y + amount > 280) { doc.addPage(); y = 20 } }
  ensureSpace(48)
  const summary = [[t.subtotal,money(totals.subtotal)]]
  if (Number(quote.discount_percentage)) summary.push([`${t.discount} (${quote.discount_percentage}%)`, `-${money(totals.discountAmount)}`])
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
