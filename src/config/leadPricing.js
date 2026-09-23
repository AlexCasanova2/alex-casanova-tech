export const defaultLeadPricing = Object.freeze({
  currency: 'EUR',
  vatPercentage: 21,
  basePrice: 700,
  rangePercentage: 15,
  maintenanceMonthly: 75,
  pages: { one: 0, small: 500, medium: 1100 },
  projectType: { new: 0, redesign: 250 },
  extras: { cms: 250, blog: 300, booking: 450, integration: 400, copywriting: 350, branding: 450, extraLanguage: 300 },
  urgencyPercentage: 25
})

export const pricingFields = [
  ['basePrice', 'Web base (una página)'],
  ['pages.small', 'Web de hasta 5 páginas'],
  ['pages.medium', 'Web de hasta 10 páginas'],
  ['projectType.redesign', 'Rediseño sobre la base'],
  ['extras.cms', 'Gestor de contenidos'],
  ['extras.blog', 'Blog'],
  ['extras.booking', 'Reservas'],
  ['extras.integration', 'Integración externa'],
  ['extras.copywriting', 'Redacción de contenidos'],
  ['extras.branding', 'Identidad visual'],
  ['extras.extraLanguage', 'Idioma adicional'],
  ['maintenanceMonthly', 'Mantenimiento mensual']
]

export function normalizePricing(input = {}) {
  const number = (value, fallback, max = 100000) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : fallback
  }
  return {
    currency: 'EUR',
    vatPercentage: number(input.vatPercentage, defaultLeadPricing.vatPercentage, 100),
    basePrice: number(input.basePrice, defaultLeadPricing.basePrice),
    rangePercentage: number(input.rangePercentage, defaultLeadPricing.rangePercentage, 100),
    maintenanceMonthly: number(input.maintenanceMonthly, defaultLeadPricing.maintenanceMonthly),
    pages: {
      one: 0,
      small: number(input.pages?.small, defaultLeadPricing.pages.small),
      medium: number(input.pages?.medium, defaultLeadPricing.pages.medium)
    },
    projectType: {
      new: 0,
      redesign: number(input.projectType?.redesign, defaultLeadPricing.projectType.redesign)
    },
    extras: Object.fromEntries(Object.entries(defaultLeadPricing.extras).map(([key, fallback]) => [key, number(input.extras?.[key], fallback)])),
    urgencyPercentage: number(input.urgencyPercentage, defaultLeadPricing.urgencyPercentage, 100)
  }
}
