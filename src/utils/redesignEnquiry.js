export function redesignEnquiryMessage(form) {
  return [
    'Solicitud de rediseño web',
    `Web actual: ${form.currentWebsite}`,
    `Objetivos: ${form.message}`,
    form.timeline && `Plazo deseado: ${form.timeline}`,
    form.budget && `Presupuesto orientativo del cliente: ${form.budget}`
  ].filter(Boolean).join('\n\n')
}
