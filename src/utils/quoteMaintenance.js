const descriptions = {
  es:'Servicio de mantenimiento mensual de duración indefinida.',
  ca:'Servei de manteniment mensual de durada indefinida.',
  en:'Monthly maintenance service with an indefinite duration.'
}

export function defaultMaintenanceDescription(language = 'es') {
  return descriptions[language] || descriptions.es
}

export function resolveMaintenanceDescription(quote) {
  return typeof quote.maintenance_description === 'string' && quote.maintenance_description.trim()
    ? quote.maintenance_description.trim() : defaultMaintenanceDescription(quote.language)
}
