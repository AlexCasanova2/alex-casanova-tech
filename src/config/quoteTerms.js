export const exampleQuoteTerms = {
  es: `1. Alcance
El presupuesto incluye únicamente los servicios y entregables descritos. Cualquier funcionalidad, página o servicio adicional se valorará por separado y requerirá aprobación previa.

2. Forma de pago
50 % al aceptar el presupuesto y 50 % antes de la entrega final o publicación. Los servicios recurrentes se facturarán mensualmente según lo acordado.

3. Plazos y materiales
El calendario se acordará al iniciar el proyecto, una vez recibido el anticipo y los materiales necesarios. El cliente facilitará textos, imágenes, accesos y comentarios en los plazos acordados. Los retrasos en su entrega podrán modificar la fecha de finalización.

4. Revisiones
Se incluyen dos rondas de revisión sobre los entregables definidos. Las revisiones adicionales o los cambios de alcance se presupuestarán antes de ejecutarse.

5. Costes externos
Dominio, alojamiento, licencias, herramientas de pago y otros servicios de terceros no están incluidos salvo indicación expresa. Los impuestos y retenciones aplicables se detallan en el resumen económico.

6. Entrega y soporte
La entrega final y los accesos se facilitarán una vez completado el pago. Se incluye la corrección de errores de implementación relacionados con el alcance acordado durante los 30 días posteriores a la entrega. El mantenimiento y las nuevas funcionalidades se contratarán por separado.

7. SEO y resultados
Los trabajos de SEO se realizarán conforme al alcance descrito. No se garantizan posiciones concretas, volúmenes de tráfico ni ventas, ya que dependen también de factores externos.

8. Validez y aceptación
La oferta es válida hasta la fecha indicada en el presupuesto. El inicio del trabajo requiere la aceptación escrita del alcance, el importe y estas condiciones.`,
  ca: `1. Abast
El pressupost inclou únicament els serveis i lliurables descrits. Qualsevol funcionalitat, pàgina o servei addicional es valorarà per separat i requerirà aprovació prèvia.

2. Forma de pagament
50 % en acceptar el pressupost i 50 % abans del lliurament final o la publicació. Els serveis recurrents es facturaran mensualment segons el que s’hagi acordat.

3. Terminis i materials
El calendari s’acordarà a l’inici del projecte, un cop rebuts la bestreta i els materials necessaris. El client facilitarà textos, imatges, accessos i comentaris en els terminis acordats. Els retards en el lliurament podran modificar la data de finalització.

4. Revisions
S’inclouen dues rondes de revisió dels lliurables definits. Les revisions addicionals o els canvis d’abast es pressupostaran abans d’executar-se.

5. Costos externs
El domini, l’allotjament, les llicències, les eines de pagament i altres serveis de tercers no estan inclosos llevat que s’indiqui expressament. Els impostos i les retencions aplicables es detallen al resum econòmic.

6. Lliurament i suport
El lliurament final i els accessos es facilitaran un cop completat el pagament. S’inclou la correcció d’errors d’implementació relacionats amb l’abast acordat durant els 30 dies posteriors al lliurament. El manteniment i les noves funcionalitats es contractaran per separat.

7. SEO i resultats
Els treballs de SEO es realitzaran segons l’abast descrit. No es garanteixen posicions concretes, volums de trànsit ni vendes, ja que també depenen de factors externs.

8. Validesa i acceptació
L’oferta és vàlida fins a la data indicada al pressupost. L’inici del treball requereix l’acceptació escrita de l’abast, l’import i aquestes condicions.`,
  en: `1. Scope
This quote includes only the services and deliverables described. Additional features, pages or services will be quoted separately and require prior approval.

2. Payment
50% upon acceptance and 50% before final delivery or launch. Recurring services will be invoiced monthly as agreed.

3. Timeline and materials
The schedule will be agreed at kickoff once the deposit and required materials have been received. The client will provide text, images, access credentials and feedback within the agreed timeframes. Delays in providing these may affect the completion date.

4. Revisions
Two rounds of revisions to the defined deliverables are included. Additional revisions or scope changes will be quoted before work begins on them.

5. External costs
Domain names, hosting, licences, paid tools and other third-party services are excluded unless explicitly stated. Applicable taxes and withholding are shown in the financial summary.

6. Delivery and support
Final deliverables and access credentials will be provided once payment is complete. Corrections to implementation errors within the agreed scope are included for 30 days after delivery. Maintenance and new features require a separate agreement.

7. SEO and results
SEO work will follow the described scope. Specific rankings, traffic volumes or sales are not guaranteed, as they also depend on external factors.

8. Validity and acceptance
This offer is valid until the date stated in the quote. Work begins following written acceptance of the scope, price and these terms.`
}

export function fillEmptyQuoteTerms(terms = {}) {
  return Object.fromEntries(Object.entries(exampleQuoteTerms).map(([language, example]) => [
    language, typeof terms?.[language] === 'string' && terms[language].trim() ? terms[language] : example
  ]))
}
