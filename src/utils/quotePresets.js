const normalize = value => String(value || '').normalize('NFC').trim().toLowerCase()

// Titles are the first line of a preset's saved description. Match all languages
// so reopening a quote or switching document language cannot reinsert the preset.
export function addedPresetCodes(items, catalog) {
  const titles = new Set((items || []).map(item => normalize(item.description?.split(/\r?\n/)[0])))
  return new Set(catalog.filter(preset => titles.has(normalize(preset.title))).map(preset => preset.code))
}
