function finiteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function roundMoney(value) {
  const number = finiteNumber(value)
  const rounded = Math.sign(number) * Math.round((Math.abs(number) + Number.EPSILON) * 100) / 100
  return Object.is(rounded, -0) ? 0 : rounded
}

export function calculateLineTotal(quantity, unitPrice) {
  return roundMoney(finiteNumber(quantity) * finiteNumber(unitPrice))
}

export function calculateQuoteTotals(
  items = [],
  { discountPercentage = 0, vatPercentage = 0, withholdingPercentage = 0, pricingMode = 'itemized', globalPrice = 0 } = {},
) {
  const safeItems = Array.isArray(items) ? items : []
  const subtotal = roundMoney(
    pricingMode === 'global' ? finiteNumber(globalPrice) : safeItems.reduce(
      (sum, item) => sum + calculateLineTotal(item?.quantity, item?.unitPrice ?? item?.unit_price),
      0,
    ),
  )
  const discountAmount = roundMoney(subtotal * finiteNumber(discountPercentage) / 100)
  const base = roundMoney(subtotal - discountAmount)
  const vatAmount = roundMoney(base * finiteNumber(vatPercentage) / 100)
  const withholdingAmount = roundMoney(base * finiteNumber(withholdingPercentage) / 100)
  const total = roundMoney(base + vatAmount - withholdingAmount)

  return { subtotal, discountAmount, base, vatAmount, withholdingAmount, total }
}

export function formatCurrency(amount, locale = 'es-ES', currency = 'EUR') {
  const value = roundMoney(amount)

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
}
