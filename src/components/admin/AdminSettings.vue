<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../../config/supabase'

const { locale } = useI18n()
const emit = defineEmits(['settings-saved'])
const labels = {
  es: { title:'Ajustes', subtitle:'La identidad que viajará con cada presupuesto.', identity:'Identidad fiscal', defaults:'Valores predeterminados', terms:'Condiciones por idioma', name:'Nombre o razón social', tax:'NIF / CIF', email:'Email', phone:'Teléfono', web:'Web', address:'Dirección', city:'Ciudad', postal:'Código postal', country:'País', logo:'URL del logotipo', prefix:'Prefijo', language:'Idioma', vat:'IVA (%)', irpf:'IRPF (%)', validity:'Validez (días)', save:'Guardar ajustes', saving:'Guardando...', saved:'Ajustes guardados.' },
  ca: { title:'Configuració', subtitle:'La identitat que viatjarà amb cada pressupost.', identity:'Identitat fiscal', defaults:'Valors predeterminats', terms:'Condicions per idioma', name:'Nom o raó social', tax:'NIF / CIF', email:'Email', phone:'Telèfon', web:'Web', address:'Adreça', city:'Ciutat', postal:'Codi postal', country:'País', logo:'URL del logotip', prefix:'Prefix', language:'Idioma', vat:'IVA (%)', irpf:'IRPF (%)', validity:'Validesa (dies)', save:'Desar configuració', saving:'Desant...', saved:'Configuració desada.' },
  en: { title:'Settings', subtitle:'The identity that travels with every quote.', identity:'Business identity', defaults:'Default values', terms:'Terms by language', name:'Name or company', tax:'Tax ID', email:'Email', phone:'Phone', web:'Website', address:'Address', city:'City', postal:'Postal code', country:'Country', logo:'Logo URL', prefix:'Prefix', language:'Language', vat:'VAT (%)', irpf:'Withholding (%)', validity:'Validity (days)', save:'Save settings', saving:'Saving...', saved:'Settings saved.' }
}
const c = computed(() => labels[locale.value] || labels.es)
const form = ref({ id:null, quote_prefix:'PRE', default_language:'es', currency:'EUR', default_vat_percentage:21, default_withholding_percentage:0, default_validity_days:30, default_terms:{es:'',ca:'',en:''}, issuer_snapshot:{name:'',tax_id:'',email:'',phone:'',website:'',logo_url:'',address:'',city:'',postal_code:'',country:'España'} })
const isSaving = ref(false)
const message = ref('')
const errorMessage = ref('')

const fetchSettings = async () => {
  const { data, error } = await supabase.from('crm_settings').select('*').maybeSingle()
  if (error) errorMessage.value = error.message
  if (data) form.value = { ...form.value, ...data, default_terms:{...form.value.default_terms,...data.default_terms}, issuer_snapshot:{...form.value.issuer_snapshot,...data.issuer_snapshot} }
}

const saveSettings = async () => {
  if (isSaving.value) return
  isSaving.value = true; message.value = ''; errorMessage.value = ''
  try {
  const payload = { quote_prefix:form.value.quote_prefix.trim().toUpperCase(), default_language:form.value.default_language, currency:'EUR', default_vat_percentage:Number(form.value.default_vat_percentage), default_withholding_percentage:Number(form.value.default_withholding_percentage), default_validity_days:Number(form.value.default_validity_days), default_terms:form.value.default_terms, issuer_snapshot:form.value.issuer_snapshot }
  const { data, error } = await supabase.from('crm_settings').upsert(payload, { onConflict:'owner_id' }).select().single()
  if (error) errorMessage.value = error.message
  else { form.value.id = data.id; message.value = c.value.saved; emit('settings-saved', data) }
  } catch (error) { errorMessage.value = error.message }
  finally { isSaving.value = false }
}
onMounted(fetchSettings)
</script>

<template>
  <section class="settings-section fade-in">
    <header><span class="eyebrow">CRM / 03</span><h2>{{ c.title }}</h2><p>{{ c.subtitle }}</p></header>
    <form class="settings-grid" @submit.prevent="saveSettings">
      <div class="settings-card identity-card">
        <div class="card-index">01</div><h3>{{ c.identity }}</h3>
        <div class="fields two">
          <label class="wide"><span>{{ c.name }}</span><input v-model="form.issuer_snapshot.name" required /></label>
          <label><span>{{ c.tax }}</span><input v-model="form.issuer_snapshot.tax_id" /></label>
          <label><span>{{ c.email }}</span><input v-model="form.issuer_snapshot.email" type="email" /></label>
          <label><span>{{ c.phone }}</span><input v-model="form.issuer_snapshot.phone" /></label>
          <label><span>{{ c.web }}</span><input v-model="form.issuer_snapshot.website" type="url" /></label>
          <label class="wide"><span>{{ c.address }}</span><input v-model="form.issuer_snapshot.address" /></label>
          <label><span>{{ c.city }}</span><input v-model="form.issuer_snapshot.city" /></label>
          <label><span>{{ c.postal }}</span><input v-model="form.issuer_snapshot.postal_code" /></label>
          <label><span>{{ c.country }}</span><input v-model="form.issuer_snapshot.country" /></label>
          <label class="wide"><span>{{ c.logo }}</span><input v-model="form.issuer_snapshot.logo_url" type="url" placeholder="https://" /></label>
        </div>
      </div>
      <div class="settings-card">
        <div class="card-index">02</div><h3>{{ c.defaults }}</h3>
        <div class="fields">
          <label><span>{{ c.prefix }}</span><input v-model="form.quote_prefix" maxlength="20" required /></label>
          <label><span>{{ c.language }}</span><select v-model="form.default_language"><option value="es">Castellano</option><option value="ca">Català</option><option value="en">English</option></select></label>
          <label><span>{{ c.vat }}</span><input v-model.number="form.default_vat_percentage" type="number" min="0" max="100" step="0.01" /></label>
          <label><span>{{ c.irpf }}</span><input v-model.number="form.default_withholding_percentage" type="number" min="0" max="100" step="0.01" /></label>
          <label><span>{{ c.validity }}</span><input v-model.number="form.default_validity_days" type="number" min="1" max="365" /></label>
        </div>
      </div>
      <div class="settings-card terms-card">
        <div class="card-index">03</div><h3>{{ c.terms }}</h3>
        <div class="terms-grid"><label><span>ES</span><textarea v-model="form.default_terms.es" rows="6"></textarea></label><label><span>CA</span><textarea v-model="form.default_terms.ca" rows="6"></textarea></label><label><span>EN</span><textarea v-model="form.default_terms.en" rows="6"></textarea></label></div>
      </div>
      <div v-if="message" class="notice success">{{ message }}</div><div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
      <div class="save-row"><button class="btn btn-primary" :disabled="isSaving">{{ isSaving ? c.saving : c.save }}</button></div>
    </form>
  </section>
</template>

<style scoped>
.settings-section{--yellow:#ffd84d}.settings-section>header{margin-bottom:34px}.settings-section h2{font-size:clamp(2.4rem,5vw,4.5rem);margin:6px 0}.settings-section header p{margin:0}.eyebrow{font-size:.7rem;letter-spacing:.18em;color:var(--text-secondary);font-weight:700}.settings-grid{display:grid;grid-template-columns:1.45fr .75fr;gap:18px}.settings-card{position:relative;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:18px;padding:28px;overflow:hidden}.settings-card h3{font-size:1.2rem;margin-bottom:25px}.card-index{position:absolute;right:18px;top:8px;font-size:4.5rem;font-weight:800;line-height:1;color:var(--border-color)}.identity-card{grid-row:span 2}.terms-card{grid-column:1/-1}.fields{display:grid;gap:17px}.fields.two{grid-template-columns:1fr 1fr}.fields label,.terms-grid label{display:flex;flex-direction:column;gap:7px}.fields label.wide{grid-column:1/-1}.fields span,.terms-grid span{font-size:.75rem;font-weight:650;color:var(--text-secondary)}input,select,textarea{width:100%;background:var(--bg-color);color:var(--text-primary);border:1px solid var(--border-color);border-radius:9px;padding:12px 14px;font:inherit}input:focus,select:focus,textarea:focus{outline:none;border-color:var(--text-primary)}.terms-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.save-row{grid-column:1/-1;display:flex;justify-content:flex-end}.notice{grid-column:1/-1;padding:14px 16px;border-radius:10px;border:1px solid}.notice.success{color:#10b981;background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.25)}.notice.error{color:#ef4444;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25)}@media(max-width:800px){.settings-grid{grid-template-columns:1fr}.identity-card{grid-row:auto}.terms-grid,.fields.two{grid-template-columns:1fr}.fields label.wide{grid-column:1}.terms-card{grid-column:1}.save-row{grid-column:1}}
</style>
