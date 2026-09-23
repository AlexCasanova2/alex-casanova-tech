<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../../config/supabase'
import { defaultLeadPricing, normalizePricing, pricingFields } from '../../config/leadPricing'

const leads = ref([])
const tab = ref('pipeline')
const statusFilter = ref('all')
const selected = ref(null)
const errorMessage = ref('')
const message = ref('')
const isSaving = ref(false)
const pricing = ref(normalizePricing(defaultLeadPricing))
const activeVersion = ref(null)
const statuses = [['new','Nuevo'],['contacted','Contactado'],['qualified','Cualificado'],['quoted','Presupuestado'],['won','Ganado'],['lost','Perdido']]
const statusLabel = value => statuses.find(item => item[0] === value)?.[1] || value
const visibleLeads = computed(() => statusFilter.value === 'all' ? leads.value.filter(item => !item.archived_at) : leads.value.filter(item => item.status === statusFilter.value && !item.archived_at))
const money = value => new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(value || 0)
const getPath = path => path.split('.').reduce((value, key) => value[key], pricing.value)
const setPath = (path, value) => {
  const keys = path.split('.'); let target = pricing.value
  keys.slice(0, -1).forEach(key => { target = target[key] })
  target[keys.at(-1)] = Number(value)
}

async function fetchData() {
  errorMessage.value = ''
  const [leadResult, priceResult] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending:false }),
    supabase.from('lead_pricing_versions').select('*').eq('is_active', true).maybeSingle()
  ])
  if (leadResult.error) errorMessage.value = leadResult.error.message
  else leads.value = leadResult.data || []
  if (priceResult.error) errorMessage.value = priceResult.error.message
  else if (priceResult.data) { activeVersion.value = priceResult.data; pricing.value = normalizePricing(priceResult.data.config) }
}

async function updateLead(patch) {
  if (!selected.value) return
  const { data, error } = await supabase.from('leads').update(patch).eq('id', selected.value.id).select().single()
  if (error) { errorMessage.value = error.message; return }
  const index = leads.value.findIndex(item => item.id === data.id)
  leads.value[index] = data; selected.value = data; message.value = 'Lead actualizado.'
}

async function publishPricing() {
  if (isSaving.value) return
  isSaving.value = true; errorMessage.value = ''; message.value = ''
  const config = normalizePricing(pricing.value)
  const { data, error } = await supabase.rpc('publish_lead_pricing', { p_config:config })
  if (error) errorMessage.value = error.message
  else { activeVersion.value = data; pricing.value = normalizePricing(data.config); message.value = `Tarifa ${data.version} publicada. Las solicitudes anteriores conservan su cálculo.` }
  isSaving.value = false
}

async function convertLead() {
  if (!selected.value || isSaving.value) return
  isSaving.value = true; errorMessage.value = ''; message.value = ''
  try {
    const existingResult = await supabase.from('clients').select('*').ilike('email', selected.value.email).limit(1)
    if (existingResult.error) throw existingResult.error
    let client = existingResult.data?.[0]
    if (!client) {
      const result = await supabase.from('clients').insert({ name:selected.value.company || selected.value.name, email:selected.value.email, language:selected.value.language, notes:`Lead web: ${selected.value.name}`, address:{} }).select().single()
      if (result.error) throw result.error
      client = result.data
    }
    const { data:settings, error:settingsError } = await supabase.from('crm_settings').select('*').maybeSingle()
    if (settingsError) throw settingsError
    const issueDate = new Date()
    const validUntil = new Date(issueDate); validUntil.setDate(validUntil.getDate() + (settings?.default_validity_days || 30))
    const estimateItems = selected.value.estimate_snapshot?.items || []
    const items = (estimateItems.length ? estimateItems : [{ label:'Proyecto web a valorar', amount:0 }]).map((item, position) => ({ description:item.label, quantity:1, unit:'servicio', unit_price:Number(item.amount) || 0, position }))
    const quote = {
      client_id:client.id, title:`Propuesta web · ${selected.value.company || selected.value.name}`, status:'draft', language:selected.value.language, currency:'EUR',
      issue_date:issueDate.toISOString().slice(0,10), valid_until:validUntil.toISOString().slice(0,10), client_snapshot:{ name:client.name, email:client.email }, issuer_snapshot:settings?.issuer_snapshot || {},
      notes:selected.value.message || '', terms:settings?.default_terms?.[selected.value.language] || '', discount_percentage:0, vat_percentage:settings?.default_vat_percentage ?? 21, withholding_percentage:settings?.default_withholding_percentage ?? 0, pricing_mode:'itemized', global_price:0
    }
    const { data:savedQuote, error:quoteError } = await supabase.rpc('save_quote_priced', { p_quote:quote, p_items:items })
    if (quoteError) throw quoteError
    await updateLead({ client_id:client.id, quote_id:savedQuote.id, status:'quoted' })
    message.value = `Cliente y borrador ${savedQuote.quote_number} creados.`
  } catch (error) { errorMessage.value = error.message }
  finally { isSaving.value = false }
}

onMounted(fetchData)
</script>

<template>
  <section class="leads-section fade-in">
    <header class="heading"><div><span class="eyebrow">CRM / LEADS</span><h2>Captación</h2><p>De la primera visita al presupuesto.</p></div><div class="tabs"><button :class="{active:tab === 'pipeline'}" @click="tab = 'pipeline'">Pipeline</button><button :class="{active:tab === 'pricing'}" @click="tab = 'pricing'">Tarifas</button></div></header>
    <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p><p v-if="message" class="notice success">{{ message }}</p>

    <template v-if="tab === 'pipeline'">
      <div class="filters"><button :class="{active:statusFilter === 'all'}" @click="statusFilter = 'all'">Todos <span>{{ leads.filter(item => !item.archived_at).length }}</span></button><button v-for="status in statuses" :key="status[0]" :class="{active:statusFilter === status[0]}" @click="statusFilter = status[0]">{{ status[1] }}</button></div>
      <div class="lead-layout">
        <div class="lead-list"><button v-for="lead in visibleLeads" :key="lead.id" :class="['lead-row',{active:selected?.id === lead.id}]" @click="selected = lead"><span class="source">{{ lead.source === 'configurator' ? 'CALC' : 'CONTACTO' }}</span><strong>{{ lead.company || lead.name }}</strong><small>{{ lead.email }}</small><span class="estimate">{{ lead.estimate_snapshot?.custom ? 'A medida' : money(lead.estimate_snapshot?.netMin) }}</span><span :class="['status',lead.status]">{{ statusLabel(lead.status) }}</span></button><div v-if="!visibleLeads.length" class="empty">Todavía no hay leads con este filtro.</div></div>
        <aside v-if="selected" class="lead-detail"><div class="detail-head"><div><span class="eyebrow">{{ new Date(selected.created_at).toLocaleDateString('es-ES') }}</span><h3>{{ selected.name }}</h3><a :href="`mailto:${selected.email}`">{{ selected.email }}</a></div><button aria-label="Cerrar" @click="selected = null">×</button></div><dl><div><dt>Empresa</dt><dd>{{ selected.company || '—' }}</dd></div><div><dt>Web</dt><dd><a v-if="selected.website" :href="selected.website" target="_blank">{{ selected.website }}</a><span v-else>—</span></dd></div><div><dt>Origen</dt><dd>{{ selected.attribution?.utm_source || selected.source }}</dd></div><div><dt>Estimación</dt><dd>{{ selected.estimate_snapshot?.custom ? 'Personalizada' : `${money(selected.estimate_snapshot?.netMin)} – ${money(selected.estimate_snapshot?.netMax)} + IVA` }}</dd></div></dl><p v-if="selected.message" class="lead-message">{{ selected.message }}</p><label>Estado<select :value="selected.status" @change="updateLead({ status:$event.target.value })"><option v-for="status in statuses" :key="status[0]" :value="status[0]">{{ status[1] }}</option></select></label><label>Próxima acción<input :value="selected.next_action_at?.slice(0,16)" type="datetime-local" @change="updateLead({ next_action_at:$event.target.value ? new Date($event.target.value).toISOString() : null })"></label><label>Notas internas<textarea :value="selected.notes" rows="4" @change="updateLead({ notes:$event.target.value || null })"></textarea></label><button v-if="!selected.quote_id" class="btn btn-primary" :disabled="isSaving" @click="convertLead">{{ isSaving ? 'Creando…' : 'Crear cliente y presupuesto' }}</button><p v-else class="converted">✓ Convertido a cliente y presupuesto</p></aside>
      </div>
    </template>

    <form v-else class="pricing" @submit.prevent="publishPricing"><div class="pricing-intro"><span class="version">VERSIÓN ACTIVA / {{ activeVersion?.version || 'BASE' }}</span><h3>Precios del estimador</h3><p>Publicar crea una versión nueva. Los leads anteriores no cambian.</p></div><div class="pricing-grid"><label v-for="field in pricingFields" :key="field[0]"><span>{{ field[1] }}</span><div><input :value="getPath(field[0])" type="number" min="0" step="1" required @input="setPath(field[0], $event.target.value)"><b>€</b></div></label><label><span>Margen superior del rango</span><div><input v-model.number="pricing.rangePercentage" type="number" min="0" max="100"><b>%</b></div></label><label><span>Recargo urgente</span><div><input v-model.number="pricing.urgencyPercentage" type="number" min="0" max="100"><b>%</b></div></label><label><span>IVA informativo</span><div><input v-model.number="pricing.vatPercentage" type="number" min="0" max="100"><b>%</b></div></label></div><div class="pricing-preview"><span>Ejemplo base</span><strong>{{ money(pricing.basePrice) }} + IVA</strong><small>{{ money(pricing.basePrice * (1 + pricing.vatPercentage / 100)) }} con IVA</small></div><button class="btn btn-primary" :disabled="isSaving">{{ isSaving ? 'Publicando…' : 'Publicar nueva tarifa' }}</button></form>
  </section>
</template>

<style scoped>
.leads-section{--lime:#d7ff4f}.heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:30px}.heading h2{font-size:clamp(2rem,4vw,3.5rem);margin:6px 0}.heading p{margin:0}.eyebrow{font:700 .68rem monospace;letter-spacing:.16em;color:var(--text-secondary)}.tabs,.filters{display:flex;gap:4px;padding:4px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:100px}.tabs button,.filters button{border:0;background:transparent;color:var(--text-secondary);padding:9px 14px;border-radius:100px;cursor:pointer}.tabs button.active,.filters button.active{background:var(--text-primary);color:var(--bg-color)}.filters{margin-bottom:20px;overflow-x:auto;border-radius:12px}.filters button{white-space:nowrap}.filters span{opacity:.65}.notice{padding:13px 16px;border:1px solid;border-radius:9px;margin-bottom:16px}.notice.error{color:#ef4444;border-color:#ef444455}.notice.success{color:#10b981;border-color:#10b98155}.lead-layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px;align-items:start}.lead-list{display:grid;gap:8px}.lead-row{display:grid;grid-template-columns:75px 1fr auto;gap:4px 14px;padding:17px;text-align:left;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:12px;cursor:pointer}.lead-row.active{border-color:var(--lime)}.lead-row .source{font:700 .6rem monospace;color:#111;background:var(--lime);padding:4px 6px;justify-self:start}.lead-row strong{grid-column:2}.lead-row small{grid-column:2;color:var(--text-secondary)}.estimate{grid-column:3;grid-row:1;font-weight:700}.status{grid-column:3;grid-row:2;font-size:.68rem;text-transform:uppercase;color:var(--text-secondary)}.status.won{color:#10b981}.status.lost{color:#ef4444}.lead-detail{position:sticky;top:95px;padding:24px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:15px}.detail-head{display:flex;justify-content:space-between;gap:15px}.detail-head h3{margin:5px 0}.detail-head button{border:0;background:transparent;color:var(--text-primary);font-size:1.5rem;cursor:pointer}.lead-detail dl{margin:24px 0}.lead-detail dl div{display:flex;justify-content:space-between;gap:15px;padding:9px 0;border-top:1px solid var(--border-color);font-size:.78rem}.lead-detail dt{color:var(--text-secondary)}.lead-detail dd{text-align:right;overflow-wrap:anywhere}.lead-message{font-size:.88rem;padding:15px;background:var(--bg-color);border-radius:9px;margin-bottom:18px}.lead-detail label{display:flex;flex-direction:column;gap:6px;margin-top:13px;font-size:.72rem;color:var(--text-secondary)}.lead-detail input,.lead-detail select,.lead-detail textarea{width:100%;padding:11px;background:var(--bg-color);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;font:inherit}.lead-detail .btn{width:100%;margin-top:20px}.converted{color:#10b981;font-size:.8rem;margin-top:20px}.empty{padding:40px;text-align:center;border:1px dashed var(--border-color);color:var(--text-secondary)}.pricing{display:grid;grid-template-columns:1fr 240px;gap:24px}.pricing-intro{grid-column:1/-1}.pricing-intro h3{font-size:2rem;margin:10px 0}.version{font:700 .65rem monospace;color:var(--lime)}.pricing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pricing-grid label{padding:15px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px}.pricing-grid label>span{display:block;font-size:.72rem;color:var(--text-secondary);margin-bottom:8px}.pricing-grid label div{display:flex;align-items:center}.pricing-grid input{width:100%;background:transparent;color:var(--text-primary);border:0;font-size:1.2rem;font-weight:700;outline:0}.pricing-preview{align-self:start;position:sticky;top:95px;padding:25px;background:var(--lime);color:#111;border-radius:12px}.pricing-preview span,.pricing-preview small{display:block}.pricing-preview strong{display:block;font-size:1.6rem;margin:15px 0}.pricing .btn{grid-column:1/-1;justify-self:end}.empty{border-radius:12px}
@media(max-width:900px){.lead-layout,.pricing{grid-template-columns:1fr}.lead-detail,.pricing-preview{position:static}.pricing-preview{grid-row:2}.pricing-grid{grid-template-columns:1fr}.heading{align-items:flex-start;flex-direction:column}.filters{border-radius:10px}}
</style>
