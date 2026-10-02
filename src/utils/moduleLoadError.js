export const isModuleLoadError = error => {
  const message = String(error?.message || '')
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script/i.test(message)
}
