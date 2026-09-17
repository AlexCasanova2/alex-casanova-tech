<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../../config/supabase'
import { calculateLineTotal, calculateQuoteTotals, formatCurrency } from '../../utils/quoteCalculations'
import { validateQuoteValues } from '../../utils/quoteValidation'
import { detailedServices } from '../../config/quoteServices'
import { fillEmptyQuoteTerms } from '../../config/quoteTerms'
import { saveQuoteWithCompatibility, PRICING_MIGRATION } from '../../utils/saveQuote'

const { locale } = useI18n()
const words = {
  es:{title:'Presupuestos',subtitle:'De la primera cifra al sí definitivo.',new:'Nuevo presupuesto',all:'Todos',draft:'Borrador',sent:'Enviado',accepted:'Aceptado',rejected:'Rechazado',expired:'Caducado',search:'Buscar número, título o cliente',empty:'No hay presupuestos con estos filtros.',client:'Cliente',date:'Fecha',valid:'Válido hasta',amount:'Total',status:'Estado',actions:'Acciones',edit:'Editar',pdf:'PDF',archive:'Archivar',back:'Volver',document:'Documento',quoteTitle:'Título del presupuesto',language:'Idioma',notes:'Notas para el cliente',terms:'Condiciones',items:'Conceptos',description:'Descripción',quantity:'Cantidad',unit:'Unidad',price:'Precio',lineTotal:'Importe',addLine:'Añadir concepto vacío',summary:'Resumen',subtotal:'Subtotal',discount:'Descuento',vat:'IVA',withholding:'IRPF',total:'Total',save:'Guardar presupuesto',saving:'Guardando...',download:'Descargar PDF',choose:'Selecciona un cliente',units:'ud.',days:'días',active:'En curso',archived:'Archivados',restore:'Restaurar',saved:'Presupuesto guardado.',quickItems:'Conceptos rápidos',quickHelp:'Añade una base profesional y adapta después alcance y precio.',addPreset:'Añadir',removeItem:'Eliminar concepto',requiredTitle:'Escribe un título para el presupuesto.',requiredClient:'Selecciona un cliente.',requiredItems:'Completa la descripción de todos los conceptos.'},
  ca:{title:'Pressupostos',subtitle:'De la primera xifra al sí definitiu.',new:'Nou pressupost',all:'Tots',draft:'Esborrany',sent:'Enviat',accepted:'Acceptat',rejected:'Rebutjat',expired:'Caducat',search:'Cerca número, títol o client',empty:'No hi ha pressupostos amb aquests filtres.',client:'Client',date:'Data',valid:'Vàlid fins',amount:'Total',status:'Estat',actions:'Accions',edit:'Editar',pdf:'PDF',archive:'Arxivar',back:'Tornar',document:'Document',quoteTitle:'Títol del pressupost',language:'Idioma',notes:'Notes per al client',terms:'Condicions',items:'Conceptes',description:'Descripció',quantity:'Quantitat',unit:'Unitat',price:'Preu',lineTotal:'Import',addLine:'Afegir concepte buit',summary:'Resum',subtotal:'Subtotal',discount:'Descompte',vat:'IVA',withholding:'IRPF',total:'Total',save:'Desar pressupost',saving:'Desant...',download:'Descarregar PDF',choose:'Selecciona un client',units:'u.',days:'dies',active:'En curs',archived:'Arxivats',restore:'Restaurar',saved:'Pressupost desat.',quickItems:'Conceptes ràpids',quickHelp:'Afegeix una base professional i adapta després abast i preu.',addPreset:'Afegir',removeItem:'Eliminar concepte',requiredTitle:'Escriu un títol per al pressupost.',requiredClient:'Selecciona un client.',requiredItems:'Completa la descripció de tots els conceptes.'},
  en:{title:'Quotes',subtitle:'From the first figure to the final yes.',new:'New quote',all:'All',draft:'Draft',sent:'Sent',accepted:'Accepted',rejected:'Rejected',expired:'Expired',search:'Search number, title or client',empty:'No quotes match these filters.',client:'Client',date:'Date',valid:'Valid until',amount:'Total',status:'Status',actions:'Actions',edit:'Edit',pdf:'PDF',archive:'Archive',back:'Back',document:'Document',quoteTitle:'Quote title',language:'Language',notes:'Client notes',terms:'Terms',items:'Items',description:'Description',quantity:'Quantity',unit:'Unit',price:'Price',lineTotal:'Amount',addLine:'Add empty item',summary:'Summary',subtotal:'Subtotal',discount:'Discount',vat:'VAT',withholding:'Withholding',total:'Total',save:'Save quote',saving:'Saving...',download:'Download PDF',choose:'Select a client',units:'unit',days:'days',active:'Active',archived:'Archived',restore:'Restore',saved:'Quote saved.',quickItems:'Quick items',quickHelp:'Add a professional starting point, then adjust scope and price.',addPreset:'Add',removeItem:'Remove item',requiredTitle:'Enter a quote title.',requiredClient:'Select a client.',requiredItems:'Complete every item description.'}
}
const c = computed(() => words[locale.value] || words.es)
const pricingCopy = computed(() => ({
  es: { label:'Cómo se presupuesta', itemized:'Precio por concepto', global:'Precio global', amount:'Precio global antes de impuestos (€)', help:'Los conceptos detallan el trabajo incluido. El descuento y los impuestos se aplican al precio global.' },
  ca: { label:'Com es pressuposta', itemized:'Preu per concepte', global:'Preu global', amount:'Preu global abans d’impostos (€)', help:'Els conceptes detallen el treball inclòs. El descompte i els impostos s’apliquen al preu global.' },
  en: { label:'Pricing method', itemized:'Price per item', global:'Fixed project price', amount:'Project price before tax (€)', help:'Items describe the included scope. Discount and taxes apply to the project price.' }
}[locale.value] || {}))
const serviceSearch = ref('')
const serviceCategory = ref('all')
const showAllServices = ref(false)
const catalogCopy = computed(() => ({
  es: { all:'Todos', web:'Desarrollo web', design:'Diseño y estrategia', seo:'SEO', support:'Soporte y analítica', more:'Ver todos los conceptos', less:'Ver menos', empty:'No hay conceptos que coincidan.', reset:'Limpiar filtros' },
  ca: { all:'Tots', web:'Desenvolupament web', design:'Disseny i estratègia', seo:'SEO', support:'Suport i analítica', more:'Veure tots els conceptes', less:'Veure menys', empty:'No hi ha conceptes coincidents.', reset:'Netejar filtres' },
  en: { all:'All', web:'Web development', design:'Design and strategy', seo:'SEO', support:'Support and analytics', more:'Show all items', less:'Show less', empty:'No matching items.', reset:'Clear filters' }
}[locale.value] || {}))
const categoryCodes = {
  web:['WEB','LAND','SHOP','HOME','PAGE','CMS','FORM','API'],
  design:['UX','BRIEF','MAP','WIRE','UI'],
  seo:['SEO','SEO+','KEY','META','SCHEMA','LOCAL','REDIR'],
  support:['PERF','CARE','DATA','QA','LAUNCH']
}
watch([serviceSearch, serviceCategory], () => { showAllServices.value = false })
const serviceCatalog = computed(() => {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const query = normalize(serviceSearch.value.trim())
  return [...presetCatalog.value, ...detailedServices(form.value.language || locale.value)]
    .filter(service => serviceCategory.value === 'all' || categoryCodes[serviceCategory.value].includes(service.code))
    .filter(service => normalize(`${service.code} ${service.title} ${service.description}`).includes(query))
})
const visibleServices = computed(() => showAllServices.value ? serviceCatalog.value : serviceCatalog.value.slice(0, 6))
const presetCatalog = computed(() => ({
  es: [
    { code:'WEB', title:'Web corporativa', description:'Diseño y desarrollo de sitio web corporativo responsive, optimizado para todos los dispositivos y preparado para la gestión de contenidos.', unit:'proyecto' },
    { code:'LAND', title:'Landing page', description:'Diseño y desarrollo de landing page orientada a conversión, con estructura de contenidos, formularios y analítica básica.', unit:'proyecto' },
    { code:'SHOP', title:'Tienda online', description:'Diseño y desarrollo de ecommerce con catálogo, carrito, pasarela de pago, configuración de envíos y formación de uso.', unit:'proyecto' },
    { code:'UX', title:'Diseño UX/UI', description:'Arquitectura de información, wireframes, diseño visual responsive y prototipo navegable de alta fidelidad.', unit:'proyecto' },
    { code:'SEO', title:'Auditoría SEO técnica', description:'Análisis técnico SEO, indexación, arquitectura, metadatos, enlazado interno y plan priorizado de mejoras.', unit:'auditoría' },
    { code:'SEO+', title:'SEO mensual', description:'Seguimiento SEO mensual, investigación de palabras clave, optimización de contenidos e informe de evolución.', unit:'mes' },
    { code:'PERF', title:'Core Web Vitals', description:'Auditoría y optimización de rendimiento, carga, estabilidad visual y métricas Core Web Vitals.', unit:'servicio' },
    { code:'CARE', title:'Mantenimiento web', description:'Actualizaciones, copias de seguridad, monitorización, soporte técnico y pequeñas mejoras evolutivas.', unit:'mes' },
    { code:'DATA', title:'Analítica digital', description:'Configuración de GA4, Google Tag Manager, Search Console, eventos y panel básico de medición.', unit:'servicio' }
  ],
  ca: [
    { code:'WEB', title:'Web corporativa', description:'Disseny i desenvolupament de lloc web corporatiu responsive, optimitzat per a tots els dispositius i preparat per gestionar continguts.', unit:'projecte' },
    { code:'LAND', title:'Landing page', description:'Disseny i desenvolupament de landing page orientada a conversió, amb estructura de continguts, formularis i analítica bàsica.', unit:'projecte' },
    { code:'SHOP', title:'Botiga online', description:'Disseny i desenvolupament d’ecommerce amb catàleg, cistella, passarel·la de pagament, enviaments i formació.', unit:'projecte' },
    { code:'UX', title:'Disseny UX/UI', description:'Arquitectura de la informació, wireframes, disseny visual responsive i prototip navegable d’alta fidelitat.', unit:'projecte' },
    { code:'SEO', title:'Auditoria SEO tècnica', description:'Anàlisi tècnica SEO, indexació, arquitectura, metadades, enllaçat intern i pla prioritzat de millores.', unit:'auditoria' },
    { code:'SEO+', title:'SEO mensual', description:'Seguiment SEO mensual, recerca de paraules clau, optimització de continguts i informe d’evolució.', unit:'mes' },
    { code:'PERF', title:'Core Web Vitals', description:'Auditoria i optimització de rendiment, càrrega, estabilitat visual i mètriques Core Web Vitals.', unit:'servei' },
    { code:'CARE', title:'Manteniment web', description:'Actualitzacions, còpies de seguretat, monitorització, suport tècnic i petites millores evolutives.', unit:'mes' },
    { code:'DATA', title:'Analítica digital', description:'Configuració de GA4, Google Tag Manager, Search Console, esdeveniments i panell bàsic de mesura.', unit:'servei' }
  ],
  en: [
    { code:'WEB', title:'Corporate website', description:'Design and development of a responsive corporate website, optimized for every device and ready for content management.', unit:'project' },
    { code:'LAND', title:'Landing page', description:'Conversion-focused landing page design and development, including content structure, forms and basic analytics.', unit:'project' },
    { code:'SHOP', title:'Online store', description:'Ecommerce design and development with catalogue, cart, payment gateway, shipping setup and training.', unit:'project' },
    { code:'UX', title:'UX/UI design', description:'Information architecture, wireframes, responsive visual design and a high-fidelity interactive prototype.', unit:'project' },
    { code:'SEO', title:'Technical SEO audit', description:'Technical SEO, indexing, architecture, metadata and internal linking review with a prioritized action plan.', unit:'audit' },
    { code:'SEO+', title:'Monthly SEO', description:'Monthly SEO tracking, keyword research, content optimization and progress reporting.', unit:'month' },
    { code:'PERF', title:'Core Web Vitals', description:'Performance, loading and visual stability audit and optimization focused on Core Web Vitals.', unit:'service' },
    { code:'CARE', title:'Web maintenance', description:'Updates, backups, monitoring, technical support and small continuous improvements.', unit:'month' },
    { code:'DATA', title:'Digital analytics', description:'GA4, Google Tag Manager, Search Console, event tracking and basic measurement dashboard setup.', unit:'service' }
  ]
}[form.value.language || locale.value] || []))
const localeCode = computed(() => ({es:'es-ES',ca:'ca-ES',en:'en-IE'}[locale.value] || 'es-ES'))
const localDate = value => `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`
const today = () => localDate(new Date())
const addDays = (date, days) => { const value = new Date(`${date}T12:00:00`); value.setDate(value.getDate()+Number(days || 30)); return localDate(value) }
const blankItem = () => ({description:'',quantity:1,unit:'ud.',unit_price:0})
const defaultSettings = () => ({quote_prefix:'PRE',default_language:'es',currency:'EUR',default_vat_percentage:21,default_withholding_percentage:0,default_validity_days:30,default_terms:fillEmptyQuoteTerms(),issuer_snapshot:{}})

const quotes = ref([]), clients = ref([]), settings = ref(defaultSettings())
const mode = ref('list'), filter = ref('all'), search = ref(''), showArchived = ref(false)
const isSaving = ref(false), isGenerating = ref(false), errorMessage = ref(''), successMessage = ref('')
const validationAttempted = ref(false)
const form = ref({})
const savedPricingMode = ref('itemized')
watch(() => settings.value.default_terms, (terms, previousTerms) => {
  if (mode.value !== 'edit' || form.value.id) return
  // A delayed settings response may update a new quote, but never replace custom text.
  if (!form.value.terms || Object.values(previousTerms || {}).includes(form.value.terms)) {
    form.value.terms = terms[form.value.language] || ''
  }
})

const makeForm = () => { const issue = today(); const language=settings.value.default_language || 'es'; return {id:null,quote_number:null,title:'Proyecto digital',client_id:'',status:'draft',language,currency:'EUR',issue_date:issue,valid_until:addDays(issue,settings.value.default_validity_days),client_snapshot:{},issuer_snapshot:{...settings.value.issuer_snapshot},notes:'',terms:settings.value.default_terms?.[language] || '',discount_percentage:0,vat_percentage:settings.value.default_vat_percentage,withholding_percentage:settings.value.default_withholding_percentage,quote_items:[blankItem()]} }
const totals = computed(() => calculateQuoteTotals(form.value.quote_items, {discountPercentage:form.value.discount_percentage,vatPercentage:form.value.vat_percentage,withholdingPercentage:form.value.withholding_percentage,pricingMode:form.value.pricing_mode,globalPrice:form.value.global_price}))
const money = value => formatCurrency(value, localeCode.value, 'EUR')
const statusLabel = status => c.value[status] || status
const isExpired = quote => quote.status === 'sent' && quote.valid_until && quote.valid_until < today()
const quoteClientName = quote => quote.client_snapshot?.name || clients.value.find(client => client.id === quote.client_id)?.name || '—'

const filteredQuotes = computed(() => {
  const query=search.value.trim().toLowerCase()
  return quotes.value.filter(quote => {
    const archivedMatch=showArchived.value ? quote.archived_at : !quote.archived_at
    const statusMatch=filter.value==='all' || quote.status===filter.value
    const text=[quote.quote_number,quote.title,quoteClientName(quote)].join(' ').toLowerCase()
    return archivedMatch && statusMatch && (!query || text.includes(query))
  })
})
const metrics = computed(() => ({draft:quotes.value.filter(q=>!q.archived_at&&q.status==='draft').length,sent:quotes.value.filter(q=>!q.archived_at&&q.status==='sent').length,accepted:quotes.value.filter(q=>!q.archived_at&&q.status==='accepted').reduce((sum,q)=>sum+Number(q.total),0)}))

const fetchData = async () => {
  errorMessage.value=''
  const [quoteResult,clientResult,settingsResult] = await Promise.all([
    supabase.from('quotes').select('*, quote_items(*)').order('created_at',{ascending:false}),
    supabase.from('clients').select('*').order('name'),
    supabase.from('crm_settings').select('*').maybeSingle()
  ])
  const error=quoteResult.error||clientResult.error||settingsResult.error
  if(error) errorMessage.value=error.message
  if (!quoteResult.error) quotes.value=quoteResult.data||[]
  if (!clientResult.error) clients.value=clientResult.data||[]
  if(settingsResult.data) settings.value={...defaultSettings(),...settingsResult.data,default_terms:fillEmptyQuoteTerms(settingsResult.data.default_terms),issuer_snapshot:settingsResult.data.issuer_snapshot||{}}
}

const upsertClient = client => {
  const index=clients.value.findIndex(item=>item.id===client.id)
  if(index===-1) clients.value.push(client)
  else clients.value[index]=client
  clients.value.sort((a,b)=>a.name.localeCompare(b.name))
}

const updateSettings = value => { settings.value = {...structuredClone(value), default_terms:fillEmptyQuoteTerms(value.default_terms)} }
defineExpose({ upsertClient, updateSettings })

const openNew = () => { form.value={...makeForm(),pricing_mode:'itemized',global_price:0}; savedPricingMode.value='itemized'; mode.value='edit'; successMessage.value=''; errorMessage.value=''; validationAttempted.value=false; window.scrollTo({top:0,behavior:'smooth'}) }
const openEdit = quote => { savedPricingMode.value=quote.pricing_mode||'itemized'; form.value={...quote,pricing_mode:savedPricingMode.value,global_price:quote.global_price||0,client_snapshot:{...(quote.client_snapshot||{})},issuer_snapshot:{...(quote.issuer_snapshot||{})},quote_items:[...(quote.quote_items||[])].sort((a,b)=>a.position-b.position).map(item=>({...item}))}; if(!form.value.quote_items.length) form.value.quote_items=[blankItem()]; mode.value='edit'; errorMessage.value=''; validationAttempted.value=false; window.scrollTo({top:0,behavior:'smooth'}) }
const selectClient = () => { const client=clients.value.find(item=>item.id===form.value.client_id); if(!client) return; const defaultTerms=Object.values(settings.value.default_terms||{}); const usesDefault=!form.value.terms||defaultTerms.includes(form.value.terms); form.value.client_snapshot={name:client.name,tax_id:client.tax_id,email:client.email,phone:client.phone,address:client.address}; form.value.language=client.language||form.value.language; if(usesDefault) form.value.terms=settings.value.default_terms?.[form.value.language]||'' }
const changeLanguage = () => { const defaultTerms=Object.values(settings.value.default_terms||{}); if(!form.value.terms||defaultTerms.includes(form.value.terms)) form.value.terms=settings.value.default_terms?.[form.value.language]||'' }
const addItem = () => form.value.quote_items.push(blankItem())
const addPreset = preset => {
  const item={description:`${preset.title}\n${preset.description}`,quantity:1,unit:preset.unit,unit_price:0}
  const onlyItem=form.value.quote_items.length===1 ? form.value.quote_items[0] : null
  if(onlyItem&&!onlyItem.description.trim()&&!Number(onlyItem.unit_price)) form.value.quote_items[0]=item
  else form.value.quote_items.push(item)
}
const removeItem = index => { if(form.value.quote_items.length>1) form.value.quote_items.splice(index,1) }

const saveQuote = async () => {
  if (isSaving.value) return
  validationAttempted.value=true
  if(!form.value.title?.trim()){ errorMessage.value=c.value.requiredTitle; return }
  if(!form.value.client_id){ errorMessage.value=c.value.requiredClient; return }
  if(!form.value.quote_items.length||form.value.quote_items.some(item=>!item.description.trim())){ errorMessage.value=c.value.requiredItems; return }
  const validationError = validateQuoteValues(form.value)
  if (validationError) {
    const messages = {
      es: { dates:'Revisa las fechas: la validez debe ser posterior o igual a la emisión.', year:'Un presupuesto numerado debe mantener su año de emisión.', percentages:'Los porcentajes deben estar entre 0 y 100.', amounts:'Introduce cantidades y precios válidos, iguales o mayores que cero.' },
      ca: { dates:'Revisa les dates: la validesa ha de ser posterior o igual a l’emissió.', year:'Un pressupost numerat ha de mantenir l’any d’emissió.', percentages:'Els percentatges han d’estar entre 0 i 100.', amounts:'Introdueix quantitats i preus vàlids, iguals o superiors a zero.' },
      en: { dates:'Check the dates: expiry must be on or after the issue date.', year:'A numbered quote must keep its issue year.', percentages:'Percentages must be between 0 and 100.', amounts:'Enter valid quantities and prices greater than or equal to zero.' }
    }
    errorMessage.value = (messages[locale.value] || messages.es)[validationError]
    return
  }
  const items=form.value.quote_items.map((item,index)=>({description:item.description.trim(),quantity:Number(item.quantity),unit:item.unit||c.value.units,unit_price:Number(item.unit_price),position:index}))
  if (form.value.pricing_mode === 'global') {
    items.forEach(item => { if (!Number.isFinite(item.unit_price) || item.unit_price < 0) item.unit_price = 0 })
  }
  isSaving.value=true; errorMessage.value=''; successMessage.value=''
  const payload={id:form.value.id,client_id:form.value.client_id,title:form.value.title,status:form.value.status,language:form.value.language,currency:'EUR',issue_date:form.value.issue_date,valid_until:form.value.valid_until,client_snapshot:form.value.client_snapshot,issuer_snapshot:form.value.issuer_snapshot,notes:form.value.notes,terms:form.value.terms,discount_percentage:Number(form.value.discount_percentage),vat_percentage:Number(form.value.vat_percentage),withholding_percentage:Number(form.value.withholding_percentage)}
  try {
    payload.pricing_mode = form.value.pricing_mode || 'itemized'
    payload.global_price = Number(form.value.global_price || 0)
    const {data,error}=await saveQuoteWithCompatibility(supabase,payload,items,savedPricingMode.value)
    if(error) throw error
    // Preserve the saved ID even if refreshing the list fails, preventing duplicate inserts.
    form.value = { ...form.value, ...data, quote_items: items }
    savedPricingMode.value = data.pricing_mode || 'itemized'
    successMessage.value=c.value.saved
    await fetchData()
  } catch (error) {
    if (error.code === 'PRICING_MIGRATION_REQUIRED') {
      const messages = {
        es:`Para guardar precios globales falta activar la función en Supabase. Ejecuta ${PRICING_MIGRATION} en el editor SQL. Si ya la aplicaste, ejecuta NOTIFY pgrst, 'reload schema'; y vuelve a guardar. Tu presupuesto sigue en el formulario.`,
        ca:`Per desar preus globals cal activar la funció a Supabase. Executa ${PRICING_MIGRATION} a l’editor SQL. Si ja l’has aplicat, executa NOTIFY pgrst, 'reload schema'; i torna a desar. El pressupost continua al formulari.`,
        en:`Global pricing requires the Supabase function. Run ${PRICING_MIGRATION} in the SQL editor. If already applied, run NOTIFY pgrst, 'reload schema'; and save again. Your quote remains in the form.`
      }
      errorMessage.value = messages[locale.value] || messages.es
    } else errorMessage.value=error.message
  }
  finally { isSaving.value=false }
}

const updateStatus = async (quote,status) => { const {error}=await supabase.from('quotes').update({status}).eq('id',quote.id); if(error) errorMessage.value=error.message; else await fetchData() }
const toggleArchive = async quote => { const {error}=await supabase.from('quotes').update({archived_at:quote.archived_at?null:new Date().toISOString()}).eq('id',quote.id); if(error) errorMessage.value=error.message; else await fetchData() }
const downloadPdf = async quote => { isGenerating.value=true; errorMessage.value=''; try{const { generateQuotePdf }=await import('../../utils/quotePdf'); await generateQuotePdf(quote)}catch(error){errorMessage.value=error.message}finally{isGenerating.value=false} }
onMounted(fetchData)
</script>

<template>
  <section class="quotes-section fade-in">
    <template v-if="mode==='list'">
      <header class="section-heading"><div><span class="eyebrow">CRM / 02</span><h2>{{ c.title }}</h2><p>{{ c.subtitle }}</p></div><button class="btn btn-primary" @click="openNew">+ {{ c.new }}</button></header>
      <div class="metric-strip"><div><span>{{ c.draft }}</span><strong>{{ metrics.draft.toString().padStart(2,'0') }}</strong></div><div><span>{{ c.sent }}</span><strong>{{ metrics.sent.toString().padStart(2,'0') }}</strong></div><div class="metric-wide"><span>{{ c.accepted }}</span><strong>{{ money(metrics.accepted) }}</strong></div></div>
      <div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
      <div class="quote-tools"><input v-model="search" type="search" :placeholder="c.search"/><div class="status-filters"><button v-for="item in ['all','draft','sent','accepted','rejected']" :key="item" :class="{active:filter===item}" @click="filter=item">{{ statusLabel(item) }}</button></div><button class="archive-filter" :class="{active:showArchived}" @click="showArchived=!showArchived">{{ showArchived?c.active:c.archived }}</button></div>
      <div class="quote-table">
        <div class="table-head"><span># / {{ c.document }}</span><span>{{ c.client }}</span><span>{{ c.date }}</span><span>{{ c.status }}</span><span>{{ c.amount }}</span><span></span></div>
        <article v-for="quote in filteredQuotes" :key="quote.id" class="quote-row">
          <div class="quote-name"><strong>{{ quote.quote_number }}</strong><small>{{ quote.title }}</small></div><span class="row-client" :data-label="c.client">{{ quoteClientName(quote) }}</span><span class="row-date" :data-label="c.date">{{ new Date(`${quote.issue_date}T12:00:00`).toLocaleDateString(localeCode) }}</span>
          <select :value="quote.status" :aria-label="`${c.status} ${quote.quote_number}`" :class="['status-select',quote.status]" @change="updateStatus(quote,$event.target.value)"><option value="draft">{{ c.draft }}</option><option value="sent">{{ c.sent }}</option><option value="accepted">{{ c.accepted }}</option><option value="rejected">{{ c.rejected }}</option></select>
          <strong class="row-total" :data-label="c.total">{{ money(quote.total) }}</strong>
          <div class="row-actions"><span v-if="isExpired(quote)" class="expired">{{ c.expired }}</span><button @click="openEdit(quote)">{{ c.edit }}</button><button @click="downloadPdf(quote)" :disabled="isGenerating">{{ c.pdf }}</button><button @click="toggleArchive(quote)">{{ quote.archived_at?c.restore:c.archive }}</button></div>
        </article>
        <div v-if="!filteredQuotes.length" class="empty-state">{{ c.empty }}</div>
      </div>
    </template>

    <template v-else>
      <header class="editor-header"><button type="button" class="back-button" @click="mode='list'">← {{ c.back }}</button><div class="document-id"><span>{{ form.quote_number || c.draft }}</span><small>{{ form.client_snapshot?.name || c.choose }}</small></div><div class="editor-actions"><button v-if="form.id" type="button" class="button-outline" :disabled="isGenerating" @click="downloadPdf(form)">{{ c.download }}</button><button type="submit" form="quote-editor" class="btn btn-primary" :disabled="isSaving">{{ isSaving?c.saving:c.save }}</button></div></header>
      <div v-if="successMessage" class="notice success">{{ successMessage }}</div><div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
      <form id="quote-editor" class="workbench" novalidate @submit.prevent="saveQuote">
        <div class="side-card pricing-card">
          <label for="pricing-mode">{{ pricingCopy.label }}</label>
          <select id="pricing-mode" v-model="form.pricing_mode"><option value="itemized">{{ pricingCopy.itemized }}</option><option value="global">{{ pricingCopy.global }}</option></select>
          <template v-if="form.pricing_mode === 'global'">
            <label for="global-price">{{ pricingCopy.amount }}</label>
            <input id="global-price" v-model.number="form.global_price" type="number" min="0" step="0.01" inputmode="decimal" />
            <p>{{ pricingCopy.help }}</p>
          </template>
        </div>
        <div class="document-sheet">
          <div class="sheet-top"><div><span class="eyebrow">{{ c.document }}</span><textarea v-model="form.title" rows="2" :class="['title-input',{invalid:validationAttempted&&!form.title?.trim()}]" :aria-label="c.quoteTitle"></textarea></div><div class="number-stamp">{{ form.quote_number || 'AUTO' }}</div></div>
          <div class="meta-grid"><label><span>{{ c.client }}</span><select v-model="form.client_id" :class="{invalid:validationAttempted&&!form.client_id}" @change="selectClient"><option value="">{{ c.choose }}</option><option v-for="client in clients" :key="client.id" :value="client.id" :disabled="client.archived_at && client.id !== form.client_id">{{ client.name }}{{ client.archived_at ? ` · ${c.archived}` : '' }}</option></select></label><label><span>{{ c.language }}</span><select v-model="form.language" @change="changeLanguage"><option value="es">ES</option><option value="ca">CA</option><option value="en">EN</option></select></label><label><span>{{ c.date }}</span><input v-model="form.issue_date" type="date" :aria-label="c.date"/></label><label><span>{{ c.valid }}</span><input v-model="form.valid_until" type="date" :aria-label="c.valid"/></label></div>
          <div class="items-title"><h3>{{ c.items }}</h3><span>{{ form.quote_items.length.toString().padStart(2,'0') }}</span></div>
          <div class="preset-library">
            <div class="preset-heading"><div><span class="eyebrow">{{ c.quickItems }}</span><p>{{ c.quickHelp }}</p></div><span class="catalog-count" aria-live="polite">{{ serviceCatalog.length }}</span></div>
            <input v-model="serviceSearch" class="service-search" type="search" :aria-label="c.quickItems" :placeholder="`${c.quickItems}: web, SEO, CMS…`" />
            <div class="catalog-filters" :aria-label="c.quickItems" role="group">
              <button v-for="category in ['all','web','design','seo','support']" :key="category" type="button" :aria-pressed="serviceCategory === category" @click="serviceCategory = category">{{ catalogCopy[category] }}</button>
            </div>
            <div class="preset-track">
              <button v-for="preset in visibleServices" :key="preset.code" type="button" class="preset-card" :title="preset.description" @click="addPreset(preset)">
                <span class="preset-code">{{ preset.code }}</span>
                <strong>{{ preset.title }}</strong>
                <small>{{ preset.description }}</small>
                <span class="preset-add">+ {{ c.addPreset }}</span>
              </button>
            </div>
            <div v-if="!serviceCatalog.length" class="catalog-empty" role="status">
              <p>{{ catalogCopy.empty }}</p>
              <button type="button" @click="serviceSearch = ''; serviceCategory = 'all'">{{ catalogCopy.reset }}</button>
            </div>
            <button v-if="serviceCatalog.length > 6" type="button" class="catalog-expand" :aria-expanded="showAllServices" @click="showAllServices = !showAllServices">{{ showAllServices ? catalogCopy.less : `${catalogCopy.more} (${serviceCatalog.length})` }} {{ showAllServices ? '−' : '+' }}</button>
          </div>
          <div class="line-head"><span>{{ c.description }}</span><span>{{ c.quantity }}</span><span>{{ c.unit }}</span><span>{{ c.price }}</span><span>{{ c.lineTotal }}</span><span></span></div>
          <div v-for="(item,index) in form.quote_items" :key="item.id||index" :class="['line-item',{invalidRow:validationAttempted&&!item.description.trim(), 'global-line':form.pricing_mode === 'global'}]">
            <label class="line-control description-control"><span class="mobile-field-label">{{ c.description }}</span><textarea v-model="item.description" rows="3" :aria-label="c.description"></textarea></label>
            <label class="line-control"><span class="mobile-field-label">{{ c.quantity }}</span><input v-model.number="item.quantity" type="number" min="0" step="0.01" :aria-label="c.quantity"/></label>
            <label class="line-control"><span class="mobile-field-label">{{ c.unit }}</span><input v-model="item.unit" :aria-label="c.unit"/></label>
            <label v-if="form.pricing_mode !== 'global'" class="line-control price-control"><span class="mobile-field-label">{{ c.price }}</span><div><input v-model.number="item.unit_price" type="number" min="0" step="0.01" :aria-label="c.price"/><span>€</span></div></label>
            <div v-if="form.pricing_mode !== 'global'" class="line-total-control"><span class="mobile-field-label">{{ c.lineTotal }}</span><strong>{{ money(calculateLineTotal(item.quantity,item.unit_price)) }}</strong></div>
            <button type="button" class="remove-item" :aria-label="c.removeItem" @click="removeItem(index)">×</button>
          </div>
          <button type="button" class="add-line" @click="addItem">+ {{ c.addLine }}</button>
          <div class="text-fields"><label><span>{{ c.notes }}</span><textarea v-model="form.notes" rows="4"></textarea></label><label><span>{{ c.terms }}</span><textarea v-model="form.terms" rows="4"></textarea></label></div>
        </div>
        <aside class="quote-sidebar">
          <div class="side-card"><span class="eyebrow">{{ c.status }}</span><select v-model="form.status" :class="['large-status',form.status]"><option value="draft">{{ c.draft }}</option><option value="sent">{{ c.sent }}</option><option value="accepted">{{ c.accepted }}</option><option value="rejected">{{ c.rejected }}</option></select></div>
          <div class="side-card totals-card"><h3>{{ c.summary }}</h3><label><span>{{ c.discount }} (%)</span><input v-model.number="form.discount_percentage" type="number" min="0" max="100" step="0.01"/></label><label><span>{{ c.vat }} (%)</span><input v-model.number="form.vat_percentage" type="number" min="0" max="100" step="0.01"/></label><label><span>{{ c.withholding }} (%)</span><input v-model.number="form.withholding_percentage" type="number" min="0" max="100" step="0.01"/></label><div class="sum-row"><span>{{ c.subtotal }}</span><strong>{{ money(totals.subtotal) }}</strong></div><div v-if="totals.discountAmount" class="sum-row"><span>{{ c.discount }}</span><strong>-{{ money(totals.discountAmount) }}</strong></div><div class="sum-row"><span>{{ c.vat }}</span><strong>{{ money(totals.vatAmount) }}</strong></div><div v-if="totals.withholdingAmount" class="sum-row"><span>{{ c.withholding }}</span><strong>-{{ money(totals.withholdingAmount) }}</strong></div><div class="grand-total"><span>{{ c.total }}</span><strong>{{ money(totals.total) }}</strong></div></div>
        </aside>
        <footer class="mobile-save-bar">
          <div><span>{{ c.total }}</span><strong>{{ money(totals.total) }}</strong></div>
          <button type="submit" class="btn btn-primary" :disabled="isSaving">{{ isSaving ? c.saving : c.save }}</button>
        </footer>
      </form>
    </template>
  </section>
</template>

<style scoped>
.quotes-section{--lime:#d7ff4f}.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:30px}.section-heading h2{font-size:clamp(2.4rem,5vw,4.5rem);margin:6px 0}.section-heading p{margin:0}.eyebrow{font-size:.68rem;letter-spacing:.18em;color:var(--text-secondary);font-weight:700;text-transform:uppercase}.metric-strip{display:grid;grid-template-columns:160px 160px 1fr;border:1px solid var(--border-color);border-radius:16px;overflow:hidden;margin-bottom:18px}.metric-strip>div{padding:18px 20px;background:var(--bg-secondary);display:flex;flex-direction:column;border-right:1px solid var(--border-color)}.metric-strip>div:last-child{border:0}.metric-strip span{font-size:.72rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em}.metric-strip strong{font-size:1.8rem;margin-top:5px}.metric-wide strong{color:var(--lime)}.quote-tools{display:grid;grid-template-columns:minmax(180px,1fr) auto auto;gap:10px;margin-bottom:14px}.quote-tools>input{background:var(--bg-secondary);border:1px solid var(--border-color);color:var(--text-primary);padding:11px 14px;border-radius:10px}.status-filters{display:flex;background:var(--bg-secondary);border:1px solid var(--border-color);padding:3px;border-radius:10px}.status-filters button,.archive-filter{border:0;background:transparent;color:var(--text-secondary);padding:8px 11px;border-radius:7px;cursor:pointer}.status-filters button.active,.archive-filter.active{background:var(--text-primary);color:var(--bg-color)}.archive-filter{border:1px solid var(--border-color);background:var(--bg-secondary)}.quote-table{border:1px solid var(--border-color);border-radius:16px;overflow:hidden}.table-head,.quote-row{display:grid;grid-template-columns:1.25fr 1fr .7fr .75fr .7fr 1.15fr;align-items:center;gap:12px;padding:13px 16px}.table-head{background:var(--bg-secondary);font-size:.67rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary)}.quote-row{border-top:1px solid var(--border-color);min-height:72px}.quote-row>span{font-size:.82rem;color:var(--text-secondary)}.quote-name{display:flex;flex-direction:column;gap:3px}.quote-name small{color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.status-select,.large-status{border:1px solid var(--border-color);background:var(--bg-color);color:var(--text-primary);border-radius:100px;padding:7px 9px}.status-select.accepted,.large-status.accepted{color:#10b981}.status-select.rejected,.large-status.rejected{color:#ef4444}.status-select.sent,.large-status.sent{color:#60a5fa}.row-total{text-align:right}.row-actions{display:flex;justify-content:flex-end;gap:5px;flex-wrap:wrap}.row-actions button,.button-outline{border:1px solid var(--border-color);background:transparent;color:var(--text-secondary);padding:6px 9px;border-radius:100px;cursor:pointer;font-size:.72rem}.expired{font-size:.65rem;color:#f59e0b;background:rgba(245,158,11,.1);padding:5px 7px;border-radius:100px}.empty-state{padding:60px;text-align:center;color:var(--text-secondary)}.notice{padding:13px 16px;border:1px solid;border-radius:10px;margin-bottom:16px}.notice.error{color:#ef4444;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25)}.notice.success{color:#10b981;background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.25)}.editor-header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:22px}.back-button{justify-self:start;border:0;background:none;color:var(--text-secondary);cursor:pointer}.document-id{text-align:center;display:flex;flex-direction:column}.document-id span{font-weight:700}.document-id small{color:var(--text-secondary)}.editor-actions{justify-self:end;display:flex;gap:9px}.button-outline{padding:11px 17px;color:var(--text-primary)}.workbench{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px;align-items:start}.document-sheet,.side-card{background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:18px}.document-sheet{padding:30px}.sheet-top{display:flex;justify-content:space-between;gap:20px;padding-bottom:26px;border-bottom:1px solid var(--border-color)}.title-input{display:block;background:transparent!important;border:0!important;padding:7px 0!important;font-size:clamp(1.7rem,4vw,3rem)!important;font-weight:600;letter-spacing:-.04em;max-width:600px}.number-stamp{border:1px solid var(--border-color);padding:9px 12px;height:max-content;border-radius:8px;font-family:monospace}.meta-grid{display:grid;grid-template-columns:2fr .6fr 1fr 1fr;gap:12px;padding:24px 0}.meta-grid label,.text-fields label,.totals-card label{display:flex;flex-direction:column;gap:6px}.meta-grid span,.text-fields span,.totals-card label span{font-size:.68rem;text-transform:uppercase;letter-spacing:.07em;color:var(--text-secondary)}input,select,textarea{background:var(--bg-color);border:1px solid var(--border-color);border-radius:8px;padding:10px;color:var(--text-primary);font:inherit;min-width:0}textarea{resize:vertical}.items-title{display:flex;justify-content:space-between;align-items:end;margin:12px 0}.items-title h3{font-size:1.25rem}.items-title span{font-size:2.5rem;font-weight:700;color:var(--border-color)}.line-head,.line-item{display:grid;grid-template-columns:minmax(160px,2.5fr) .65fr .6fr .8fr .85fr 28px;gap:8px;align-items:center}.line-head{font-size:.63rem;color:var(--text-secondary);text-transform:uppercase;padding:0 4px 7px}.line-item{padding:9px 0;border-top:1px solid var(--border-color)}.line-item strong{text-align:right;font-size:.85rem}.line-item button{border:0;background:none;color:var(--text-secondary);font-size:1.3rem;cursor:pointer}.add-line{width:100%;margin-top:10px;padding:11px;border:1px dashed var(--border-color);border-radius:9px;background:transparent;color:var(--text-secondary);cursor:pointer}.text-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:28px}.quote-sidebar{display:flex;flex-direction:column;gap:14px;position:sticky;top:110px}.side-card{padding:20px}.large-status{width:100%;margin-top:10px;font-size:1rem}.totals-card h3{margin-bottom:18px}.totals-card label{margin-bottom:10px}.sum-row{display:flex;justify-content:space-between;font-size:.8rem;padding:7px 0;color:var(--text-secondary)}.grand-total{margin:13px -20px -20px;padding:20px;background:var(--lime);color:#111;border-radius:0 0 17px 17px;display:flex;justify-content:space-between;align-items:center}.grand-total strong{font-size:1.25rem}@media(max-width:960px){.quote-tools{grid-template-columns:1fr}.status-filters{overflow:auto}.table-head{display:none}.quote-row{grid-template-columns:1fr 1fr}.row-actions{grid-column:1/-1;justify-content:flex-start}.workbench{grid-template-columns:1fr}.quote-sidebar{position:static;display:grid;grid-template-columns:1fr 1fr}.meta-grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.section-heading{align-items:start;flex-direction:column}.metric-strip{grid-template-columns:1fr 1fr}.metric-wide{grid-column:1/-1}.quote-row{grid-template-columns:1fr}.row-total{text-align:left}.editor-header{grid-template-columns:1fr auto}.document-id{display:none}.editor-actions{gap:5px}.document-sheet{padding:20px 14px}.sheet-top{align-items:start}.number-stamp{font-size:.7rem}.meta-grid,.text-fields,.quote-sidebar{grid-template-columns:1fr}.line-head{display:none}.line-item{grid-template-columns:1fr 1fr}.line-item textarea{grid-column:1/-1}.line-item strong{text-align:left}.line-item button{justify-self:end}.quote-sidebar{display:grid}}
.document-sheet,.meta-grid,.meta-grid label,.text-fields label,.line-item>*{min-width:0}
.document-sheet input,.document-sheet select,.document-sheet textarea,.quote-sidebar input,.quote-sidebar select{width:100%}
@media(max-width:650px){.document-sheet{width:100%}.meta-grid,.text-fields,.quote-sidebar{grid-template-columns:minmax(0,1fr)}.line-item{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
.preset-library{margin:0 0 28px;padding:18px;background:var(--bg-color);border:1px solid var(--border-color);border-radius:14px;overflow:hidden}
.preset-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:14px}
.preset-heading p{font-size:.78rem;margin:4px 0 0;line-height:1.45}
.scroll-hint{color:var(--text-secondary);font-size:1.25rem}
.preset-track{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(210px,1fr);gap:10px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x proximity;scrollbar-width:thin;scrollbar-color:var(--border-color) transparent}
.preset-card{position:relative;display:flex;flex-direction:column;align-items:flex-start;min-height:172px;padding:16px;text-align:left;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:11px;cursor:pointer;scroll-snap-align:start;transition:transform var(--transition-fast),border-color var(--transition-fast),background var(--transition-fast)}
.preset-card:hover{transform:translateY(-2px);border-color:var(--text-secondary)}
.preset-code{display:inline-flex;margin-bottom:14px;padding:4px 7px;border-radius:5px;background:var(--lime);color:#111;font:700 .62rem/1 monospace;letter-spacing:.06em}
.preset-card strong{font-size:.9rem;margin-bottom:7px}
.preset-card small{display:-webkit-box;overflow:hidden;color:var(--text-secondary);font-size:.72rem;line-height:1.45;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.preset-add{margin-top:auto;padding-top:12px;color:var(--text-primary);font-size:.72rem;font-weight:700}
.meta-grid label>span,.text-fields label>span,.mobile-field-label{font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary)}
.meta-grid input,.meta-grid select,.line-control input,.line-control textarea,.text-fields textarea{background:var(--bg-color);border:1px solid var(--border-color);border-radius:10px;padding:12px 13px;transition:border-color var(--transition-fast),box-shadow var(--transition-fast),background var(--transition-fast)}
.meta-grid input:hover,.meta-grid select:hover,.line-control input:hover,.line-control textarea:hover,.text-fields textarea:hover{border-color:var(--text-secondary)}
.meta-grid input:focus,.meta-grid select:focus,.line-control input:focus,.line-control textarea:focus,.text-fields textarea:focus{outline:0;border-color:var(--text-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--text-primary) 10%,transparent)}
.line-head{padding:0 13px 8px}
.line-item{margin-bottom:10px;padding:12px;background:var(--bg-color);border:1px solid var(--border-color);border-radius:12px;transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}
.line-item:focus-within{border-color:var(--text-secondary);box-shadow:0 8px 24px rgba(0,0,0,.06)}
.line-control{display:block}
.line-control textarea{display:block;min-height:92px;line-height:1.45;resize:vertical}
.line-control input{min-height:46px}
.mobile-field-label{display:none;margin:0 0 6px}
.price-control>div{position:relative}
.price-control>div>span{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-secondary);font-weight:700;pointer-events:none}
.price-control input{padding-right:30px}
.line-total-control{display:flex;justify-content:flex-end;align-items:center;min-height:46px;text-align:right}
.line-total-control strong{font-variant-numeric:tabular-nums}
.remove-item{display:grid;place-items:center;width:28px;height:28px;padding:0;border-radius:50%!important;transition:background var(--transition-fast),color var(--transition-fast)}
.remove-item:hover{background:rgba(239,68,68,.1)!important;color:#ef4444!important}
.add-line{margin-top:4px!important;padding:14px!important;border-radius:11px!important;font-weight:650}
.add-line:hover{border-color:var(--text-primary)!important;color:var(--text-primary)!important;background:var(--bg-color)!important}
.text-fields{padding-top:8px}
.text-fields textarea{min-height:126px;line-height:1.55}
.invalid{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,.1)!important}
.line-item.invalidRow{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.08)}
@media(max-width:650px){.preset-library{margin-left:-4px;margin-right:-4px;padding:14px}.preset-track{grid-auto-columns:minmax(78vw,1fr)}.line-item{padding:14px;gap:12px}.description-control{grid-column:1/-1}.mobile-field-label{display:block}.line-total-control{justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:5px;text-align:left}.remove-item{align-self:end;justify-self:end}.text-fields{gap:18px}}
/* Keep the editor usable within the admin's 1100px container, not just the viewport. */
.sheet-top>div:first-child{min-width:0;flex:1}
.title-input{font-size:clamp(1.4rem,2.5vw,2rem)!important;max-width:100%}
.number-stamp{flex-shrink:0}
.meta-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.line-head{display:none}
.line-item{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 28px;gap:12px;align-items:end}
.description-control{grid-column:1/-1}
.mobile-field-label{display:block}
.line-total-control{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.line-control textarea{min-height:110px}
.preset-track{min-width:0;max-width:100%;grid-auto-columns:220px}
.editor-header{grid-template-columns:auto minmax(0,1fr) auto;gap:12px}
.editor-actions{flex-wrap:wrap;justify-content:flex-end;min-width:0}
.editor-actions .btn{font-size:.85rem}
.quote-row>*{min-width:0;overflow-wrap:anywhere}
.metric-wide strong{color:var(--text-primary)}
@media(max-width:650px){
  .meta-grid{grid-template-columns:minmax(0,1fr)}
  .line-item{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .line-total-control{align-items:flex-start}
  .editor-header{grid-template-columns:auto minmax(0,1fr)}
  .editor-actions{justify-self:stretch}
  .title-input{font-size:1.4rem!important}
}
.pricing-card{display:flex;flex-direction:column;gap:12px}
.pricing-card label{font-size:.8rem;font-weight:600}
.pricing-card p{font-size:.78rem;line-height:1.5;margin:0}
.pricing-card input{font-size:1.25rem;font-variant-numeric:tabular-nums}
.service-search{margin-bottom:14px}
.line-item.global-line{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 28px}
.preset-track{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible;scroll-snap-type:none;padding:0}
.preset-card{min-width:0;min-height:150px;padding:14px}
.preset-card:focus-visible,.catalog-filters button:focus-visible,.catalog-expand:focus-visible{outline:2px solid var(--text-primary);outline-offset:3px}
.preset-code{margin-bottom:10px}
.catalog-count{padding:4px 9px;border-radius:6px;background:var(--bg-secondary);font-size:.8rem;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.catalog-filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.catalog-filters button{padding:8px 11px;border:1px solid var(--border-color);border-radius:100px;background:transparent;color:var(--text-secondary);font:inherit;font-size:.72rem;cursor:pointer}
.catalog-filters button[aria-pressed="true"]{background:var(--text-primary);color:var(--bg-color);border-color:var(--text-primary)}
.catalog-expand{width:100%;margin-top:14px;padding:12px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary);color:var(--text-primary);cursor:pointer;font:inherit;font-size:.8rem}
.catalog-empty{text-align:center;padding:20px 0}
.catalog-empty p{font-size:.85rem;margin-bottom:12px}
.catalog-empty button{border:0;background:transparent;color:var(--text-primary);text-decoration:underline;cursor:pointer}
@media(max-width:650px){.preset-track{grid-template-columns:minmax(0,1fr);grid-auto-columns:auto}.preset-card{min-height:0}.preset-card small{-webkit-line-clamp:2}.preset-code{margin-bottom:8px}}
/* Responsive workbench: keep document fields readable before adding a sidebar. */
.section-heading h2{font-size:clamp(2rem,4vw,3.5rem)}
.section-heading p{font-size:1rem}
.metric-strip{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr)}
.metric-strip strong{font-size:clamp(1.35rem,3vw,1.8rem);overflow-wrap:anywhere}
.quote-tools{grid-template-columns:minmax(0,1fr) auto}
.quote-tools>input{grid-column:1/-1;min-width:0;font-size:1rem}
.status-filters{flex-wrap:wrap;gap:4px;overflow:visible}
.status-filters button,.archive-filter,.row-actions button,.button-outline,.back-button{min-height:44px;font-size:.8rem}
.workbench{grid-template-columns:minmax(0,1fr) 270px;gap:20px}
.pricing-card{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);align-items:center}
.pricing-card p{grid-column:1/-1}
.pricing-card input,.pricing-card select{width:100%;font-size:1rem}
.document-sheet{padding:clamp(16px,2.5vw,28px)}
.sheet-top{gap:12px;align-items:start;flex-wrap:wrap;padding-bottom:18px}
.number-stamp{max-width:100%;overflow-wrap:anywhere;font-size:.8rem}
.meta-grid{padding-block:20px}
.document-sheet input,.document-sheet select,.document-sheet textarea,.quote-sidebar input,.quote-sidebar select{font-size:1rem;min-height:44px}
.document-sheet .title-input{line-height:1.3;resize:vertical;field-sizing:content;min-height:2.6em;white-space:pre-wrap;overflow-wrap:anywhere}
.line-control{min-width:0}
.line-item{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;padding:14px}
.line-item.global-line{grid-template-columns:repeat(2,minmax(0,1fr))}
.line-item .remove-item{grid-column:2;justify-self:end;width:44px;height:44px;min-height:44px}
.line-total-control{align-items:flex-start;text-align:left;overflow-wrap:anywhere}
.line-total-control strong{font-size:1rem;text-align:left}
.text-fields{grid-template-columns:minmax(0,1fr)}
.preset-library{margin-inline:0;padding:14px}
.catalog-filters button,.catalog-expand,.catalog-empty button{min-height:44px}
.preset-card{min-width:0;overflow-wrap:anywhere}
.quote-sidebar{min-width:0;top:100px;align-self:start}
.sum-row,.grand-total{gap:12px;flex-wrap:wrap;overflow-wrap:anywhere}
.sum-row strong,.grand-total strong{font-variant-numeric:tabular-nums}
.mobile-save-bar{display:none}
@media(max-width:1049px){
  .workbench{grid-template-columns:minmax(0,1fr)}
  .quote-sidebar{position:static;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start}
  .quote-sidebar .totals-card{grid-column:2;grid-row:1 / span 2}
  .mobile-save-bar{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 0 max(16px,env(safe-area-inset-bottom));border-top:1px solid var(--border-color)}
  .mobile-save-bar>div{display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere}
  .mobile-save-bar span{font-size:.75rem;color:var(--text-secondary)}
  .mobile-save-bar strong{font-size:1.25rem;font-variant-numeric:tabular-nums}
}
@media(max-width:960px){
  .quote-table{border:0;overflow:visible;display:grid;gap:12px}
  .quote-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:18px;border:1px solid var(--border-color);border-radius:14px;background:var(--bg-secondary)}
  .quote-name{grid-column:1/-1}.quote-name small{white-space:normal;overflow:visible}
  .row-client::before,.row-date::before,.row-total::before{content:attr(data-label);display:block;font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary);margin-bottom:4px}
  .status-select{min-width:0;min-height:44px;width:100%;font-size:1rem}
  .row-total{text-align:right;overflow-wrap:anywhere}
  .row-actions{border-top:1px solid var(--border-color);padding-top:12px;gap:8px}
  .row-actions button{flex:1;background:var(--bg-color)}
}
@media(max-width:650px){
  .section-heading{gap:16px;margin-bottom:24px}.section-heading>.btn{width:100%}
  .metric-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-wide{grid-column:1/-1;border-top:1px solid var(--border-color)!important}
  .metric-strip>div{padding:14px}
  .quote-tools{grid-template-columns:minmax(0,1fr)}
  .quote-tools>input{grid-column:1}
  .status-filters button{flex:1 1 auto}
  .editor-header{grid-template-columns:minmax(0,1fr);gap:12px}
  .editor-actions{justify-self:stretch;width:100%;display:flex;gap:8px}
  .editor-actions>*{flex:1 1 auto}
  .document-id{display:none}
  .sheet-top{flex-direction:column-reverse;align-items:stretch}
  .sheet-top .number-stamp{align-self:flex-start}
  .title-input{font-size:1.4rem!important}
  .pricing-card{grid-template-columns:minmax(0,1fr);padding:18px}
  .quote-sidebar{grid-template-columns:minmax(0,1fr)}
  .quote-sidebar .totals-card{grid-column:1;grid-row:auto}
  .mobile-save-bar{align-items:stretch}.mobile-save-bar .btn{flex:1 1 180px}
  .empty-state{padding:32px 16px}
}
@media(max-height:760px){.quote-sidebar{position:static}}
</style>
