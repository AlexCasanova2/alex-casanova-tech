import { normalizePricing } from '../config/leadPricing.js'

const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100

export function calculateLeadEstimate(answers = {}, rawPricing = {}) {
  const pricing = normalizePricing(rawPricing)
  const custom = answers.projectType === 'other' || answers.pages === 'custom'
  if (custom) return { custom: true, currency: pricing.currency, vatPercentage: pricing.vatPercentage, items: [] }

  const items = [{ code: 'BASE', label: 'Web corporativa base', amount: pricing.basePrice }]
  const add = (code, label, amount) => {
    if (amount > 0) items.push({ code, label, amount })
  }

  add('TYPE', 'Rediseño de web existente', pricing.projectType[answers.projectType] || 0)
  add('PAGES', answers.pages === 'small' ? 'Hasta 5 páginas' : 'Hasta 10 páginas', pricing.pages[answers.pages] || 0)
  for (const extra of Array.isArray(answers.extras) ? answers.extras : []) {
    const labels = { cms:'Gestor de contenidos', blog:'Blog', booking:'Sistema de reservas', integration:'Integración externa', copywriting:'Redacción de contenidos', branding:'Identidad visual' }
    if (labels[extra]) add(extra.toUpperCase(), labels[extra], pricing.extras[extra] || 0)
  }
  if (answers.extraLanguage) add('LANG', 'Idioma adicional', pricing.extras.extraLanguage)

  let netMin = items.reduce((sum, item) => sum + item.amount, 0)
  if (answers.timeline === 'urgent') {
    const urgency = roundMoney(netMin * pricing.urgencyPercentage / 100)
    add('URGENT', 'Prioridad de entrega', urgency)
    netMin += urgency
  }
  const netMax = roundMoney(netMin * (1 + pricing.rangePercentage / 100))
  const vatMin = roundMoney(netMin * pricing.vatPercentage / 100)
  const vatMax = roundMoney(netMax * pricing.vatPercentage / 100)

  return {
    custom: false,
    currency: pricing.currency,
    vatPercentage: pricing.vatPercentage,
    netMin: roundMoney(netMin),
    netMax,
    vatMin,
    vatMax,
    totalMin: roundMoney(netMin + vatMin),
    totalMax: roundMoney(netMax + vatMax),
    monthly: answers.maintenance ? pricing.maintenanceMonthly : 0,
    items
  }
}
