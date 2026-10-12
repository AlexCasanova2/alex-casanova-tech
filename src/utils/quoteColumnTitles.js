const titles = {
  es:{item_description:'Concepto',item_price:'Importe',extra_description:'Extra',extra_price:'Precio',extra_original:'Precio original',extra_final:'Precio final'},
  ca:{item_description:'Concepte',item_price:'Import',extra_description:'Extra',extra_price:'Preu',extra_original:'Preu original',extra_final:'Preu final'},
  en:{item_description:'Description',item_price:'Amount',extra_description:'Extra',extra_price:'Price',extra_original:'Original price',extra_final:'Final price'}
}

export function defaultQuoteColumnTitles(language = 'es', pricingMode = 'itemized') {
  const defaults = titles[language] || titles.es
  return {...defaults, item_price:pricingMode === 'global' ? defaults.extra_price : defaults.item_price}
}

export function normalizeQuoteColumnTitles(value) {
  return Object.fromEntries(Object.keys(titles.es)
    .filter(key => typeof value?.[key] === 'string' && value[key].trim())
    .map(key => [key, value[key].trim()]))
}

export function resolveQuoteColumnTitles(quote) {
  return {...defaultQuoteColumnTitles(quote.language, quote.pricing_mode), ...normalizeQuoteColumnTitles(quote.column_titles)}
}
