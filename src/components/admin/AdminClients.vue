<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../../config/supabase'

const { locale } = useI18n()
const emit = defineEmits(['client-saved'])
const copy = {
  es: { title: 'Clientes', subtitle: 'Tu agenda comercial y fiscal.', add: 'Nuevo cliente', search: 'Buscar por nombre, email o NIF', empty: 'Aún no hay clientes.', archived: 'Archivados', active: 'Activos', edit: 'Editar', archive: 'Archivar', restore: 'Restaurar', details: 'Datos del cliente', newDetails: 'Nuevo cliente', name: 'Nombre o razón social', tax: 'NIF / CIF', email: 'Email', phone: 'Teléfono', address: 'Dirección', city: 'Ciudad', postal: 'Código postal', country: 'País', language: 'Idioma', notes: 'Notas internas', save: 'Guardar cliente', saving: 'Guardando...', cancel: 'Cancelar', created: 'Cliente creado correctamente.', updated: 'Cliente actualizado correctamente.' },
  ca: { title: 'Clients', subtitle: 'La teva agenda comercial i fiscal.', add: 'Nou client', search: 'Cerca per nom, email o NIF', empty: 'Encara no hi ha clients.', archived: 'Arxivats', active: 'Actius', edit: 'Editar', archive: 'Arxivar', restore: 'Restaurar', details: 'Dades del client', newDetails: 'Nou client', name: 'Nom o raó social', tax: 'NIF / CIF', email: 'Email', phone: 'Telèfon', address: 'Adreça', city: 'Ciutat', postal: 'Codi postal', country: 'País', language: 'Idioma', notes: 'Notes internes', save: 'Desar client', saving: 'Desant...', cancel: 'Cancel·lar', created: 'Client creat correctament.', updated: 'Client actualitzat correctament.' },
  en: { title: 'Clients', subtitle: 'Your commercial and billing contacts.', add: 'New client', search: 'Search by name, email or tax ID', empty: 'No clients yet.', archived: 'Archived', active: 'Active', edit: 'Edit', archive: 'Archive', restore: 'Restore', details: 'Client details', newDetails: 'New client', name: 'Name or company', tax: 'Tax ID', email: 'Email', phone: 'Phone', address: 'Address', city: 'City', postal: 'Postal code', country: 'Country', language: 'Language', notes: 'Internal notes', save: 'Save client', saving: 'Saving...', cancel: 'Cancel', created: 'Client created successfully.', updated: 'Client updated successfully.' }
}
const c = computed(() => copy[locale.value] || copy.es)

const clients = ref([])
const search = ref('')
const showArchived = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const toastMessage = ref('')
let toastTimer

const emptyForm = () => ({ id: null, name: '', tax_id: '', email: '', phone: '', language: 'es', notes: '', address: { line1: '', city: '', postal_code: '', country: 'España' } })
const form = ref(emptyForm())

const filteredClients = computed(() => {
  const query = search.value.trim().toLowerCase()
  return clients.value.filter(client => {
    const archiveMatch = showArchived.value ? client.archived_at : !client.archived_at
    const searchMatch = !query || [client.name, client.email, client.tax_id].some(value => value?.toLowerCase().includes(query))
    return archiveMatch && searchMatch
  })
})

const fetchClients = async () => {
  const { data, error } = await supabase.from('clients').select('*').order('name')
  if (error) errorMessage.value = error.message
  else clients.value = data || []
}

const openNew = () => {
  form.value = emptyForm()
  isEditing.value = true
  errorMessage.value = ''
}

const openEdit = client => {
  form.value = { ...emptyForm(), ...client, address: { ...emptyForm().address, ...(client.address || {}) } }
  isEditing.value = true
  errorMessage.value = ''
}

const closeForm = () => {
  isEditing.value = false
  form.value = emptyForm()
}

const showToast = message => {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 4000)
}

const upsertLocalClient = client => {
  const index = clients.value.findIndex(item => item.id === client.id)
  if (index === -1) clients.value.push(client)
  else clients.value[index] = client
  clients.value.sort((a, b) => a.name.localeCompare(b.name))
}

const saveClient = async () => {
  isSaving.value = true
  errorMessage.value = ''
  const isUpdate = Boolean(form.value.id)
  const payload = {
    name: form.value.name.trim(),
    tax_id: form.value.tax_id.trim() || null,
    email: form.value.email.trim() || null,
    phone: form.value.phone.trim() || null,
    language: form.value.language,
    notes: form.value.notes.trim() || null,
    address: form.value.address
  }
  const query = form.value.id
    ? supabase.from('clients').update(payload).eq('id', form.value.id)
    : supabase.from('clients').insert(payload)
  const { data, error } = await query.select().single()
  if (error) errorMessage.value = error.message
  else {
    upsertLocalClient(data)
    emit('client-saved', data)
    closeForm()
    showToast(isUpdate ? c.value.updated : c.value.created)
  }
  isSaving.value = false
}

const toggleArchive = async client => {
  const { data, error } = await supabase.from('clients').update({ archived_at: client.archived_at ? null : new Date().toISOString() }).eq('id', client.id).select().single()
  if (error) errorMessage.value = error.message
  else {
    upsertLocalClient(data)
    emit('client-saved', data)
  }
}

onMounted(fetchClients)
onUnmounted(() => clearTimeout(toastTimer))
</script>

<template>
  <section class="crm-section fade-in">
    <header class="section-heading">
      <div><span class="eyebrow">CRM / 01</span><h2>{{ c.title }}</h2><p>{{ c.subtitle }}</p></div>
      <button class="btn btn-primary" @click="openNew">+ {{ c.add }}</button>
    </header>

    <div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>

    <div class="client-tools">
      <input v-model="search" type="search" :placeholder="c.search" />
      <div class="filter-toggle">
        <button :class="{ active: !showArchived }" @click="showArchived = false">{{ c.active }}</button>
        <button :class="{ active: showArchived }" @click="showArchived = true">{{ c.archived }}</button>
      </div>
    </div>

    <div v-if="filteredClients.length" class="client-grid">
      <article v-for="client in filteredClients" :key="client.id" class="client-card">
        <div class="client-monogram">{{ client.name.slice(0, 2).toUpperCase() }}</div>
        <div class="client-copy">
          <h3>{{ client.name }}</h3>
          <p>{{ client.email || client.tax_id || '—' }}</p>
          <span>{{ [client.address?.city, client.address?.country].filter(Boolean).join(', ') }}</span>
        </div>
        <div class="client-actions">
          <button class="pill" @click="openEdit(client)">{{ c.edit }}</button>
          <button class="pill muted" @click="toggleArchive(client)">{{ client.archived_at ? c.restore : c.archive }}</button>
        </div>
      </article>
    </div>
    <div v-else class="empty-state"><strong>00</strong><p>{{ c.empty }}</p></div>

    <Teleport to="body">
      <div v-if="isEditing" class="drawer-backdrop">
        <form class="client-drawer" role="dialog" aria-modal="true" :aria-label="form.id ? c.details : c.newDetails" @submit.prevent="saveClient">
          <div class="drawer-head"><div><span class="eyebrow">CRM / CLIENT</span><h3>{{ form.id ? c.details : c.newDetails }}</h3></div><button type="button" class="close" :aria-label="c.cancel" @click="closeForm">×</button></div>
          <div class="field wide"><label>{{ c.name }}</label><input v-model="form.name" required autofocus /></div>
          <div class="field"><label>{{ c.tax }}</label><input v-model="form.tax_id" /></div>
          <div class="field"><label>{{ c.language }}</label><select v-model="form.language"><option value="es">Castellano</option><option value="ca">Català</option><option value="en">English</option></select></div>
          <div class="field"><label>{{ c.email }}</label><input v-model="form.email" type="email" /></div>
          <div class="field"><label>{{ c.phone }}</label><input v-model="form.phone" type="tel" /></div>
          <div class="field wide"><label>{{ c.address }}</label><input v-model="form.address.line1" /></div>
          <div class="field"><label>{{ c.city }}</label><input v-model="form.address.city" /></div>
          <div class="field"><label>{{ c.postal }}</label><input v-model="form.address.postal_code" /></div>
          <div class="field wide"><label>{{ c.country }}</label><input v-model="form.address.country" /></div>
          <div class="field wide"><label>{{ c.notes }}</label><textarea v-model="form.notes" rows="4"></textarea></div>
          <div v-if="errorMessage" class="notice error wide">{{ errorMessage }}</div>
          <footer class="drawer-actions"><button type="button" class="pill muted" @click="closeForm">{{ c.cancel }}</button><button class="btn btn-primary" :disabled="isSaving">{{ isSaving ? c.saving : c.save }}</button></footer>
        </form>
      </div>

      <Transition name="toast">
        <div v-if="toastMessage" class="success-toast" role="status">
          <span class="toast-check">✓</span>
          <span>{{ toastMessage }}</span>
          <button type="button" aria-label="Cerrar" @click="toastMessage = ''">×</button>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.crm-section{--crm-accent:#d7ff4f}.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:32px}.section-heading h2{font-size:clamp(2.4rem,5vw,4.5rem);margin:6px 0}.section-heading p{margin:0}.eyebrow{font-size:.7rem;letter-spacing:.18em;color:var(--text-secondary);font-weight:700}.notice{padding:14px 16px;border:1px solid;border-radius:10px;margin-bottom:18px}.notice.error{color:#ef4444;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25)}.client-tools{display:grid;grid-template-columns:1fr auto;gap:16px;margin-bottom:22px}.client-tools input,.field input,.field textarea,.field select{width:100%;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:10px;padding:13px 15px;font:inherit}.filter-toggle{display:flex;padding:4px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:100px}.filter-toggle button{border:0;background:transparent;color:var(--text-secondary);padding:8px 14px;border-radius:100px;cursor:pointer}.filter-toggle button.active{background:var(--text-primary);color:var(--bg-color)}.client-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.client-card{display:grid;grid-template-columns:52px 1fr;gap:16px;padding:20px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:16px}.client-monogram{width:52px;height:52px;display:grid;place-items:center;border-radius:50%;background:var(--crm-accent);color:#111;font-weight:800}.client-copy h3{font-size:1.05rem;margin:4px 0 6px}.client-copy p{font-size:.88rem;margin:0}.client-copy span{font-size:.75rem;color:var(--text-secondary)}.client-actions{grid-column:2;display:flex;gap:8px}.pill{border:1px solid var(--border-color);border-radius:100px;padding:7px 13px;background:var(--bg-color);color:var(--text-primary);cursor:pointer}.pill.muted{color:var(--text-secondary)}.empty-state{border:1px dashed var(--border-color);border-radius:20px;padding:64px;text-align:center}.empty-state strong{font-size:4rem;color:var(--border-color)}.drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:300;display:flex;justify-content:flex-end}.client-drawer{width:min(620px,100%);height:100%;overflow:auto;background:var(--bg-color);padding:40px;display:grid;grid-template-columns:1fr 1fr;align-content:start;gap:20px;border-left:1px solid var(--border-color)}.drawer-head{grid-column:1/-1;display:flex;justify-content:space-between;align-items:start;margin-bottom:12px}.drawer-head h3{font-size:2rem;margin-top:6px}.close{border:0;background:none;color:var(--text-secondary);font-size:2rem;cursor:pointer}.field{display:flex;flex-direction:column;gap:7px}.field.wide,.drawer-actions{grid-column:1/-1}.field label{font-size:.78rem;font-weight:600}.drawer-actions{display:flex;justify-content:flex-end;align-items:center;gap:12px;padding-top:12px}@media(max-width:700px){.section-heading{align-items:start;flex-direction:column}.client-tools{grid-template-columns:1fr}.client-grid{grid-template-columns:1fr}.client-drawer{padding:28px 20px;grid-template-columns:1fr}.field,.field.wide,.drawer-actions,.drawer-head{grid-column:1}.client-actions{grid-column:1/-1}}
.drawer-backdrop{display:block;background:var(--bg-color);overflow-y:auto}
.client-drawer{width:100%;min-height:100%;height:auto;border:0;padding:56px max(24px,calc((100vw - 900px)/2));align-content:start}
.drawer-head{padding-bottom:22px;border-bottom:1px solid var(--border-color);margin-bottom:8px}
.drawer-head h3{font-size:clamp(2rem,5vw,3.5rem)}
.success-toast{position:fixed;right:28px;bottom:28px;z-index:500;display:flex;align-items:center;gap:12px;max-width:min(420px,calc(100vw - 32px));padding:14px 16px;background:var(--text-primary);color:var(--bg-color);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.22);font-weight:600}
.toast-check{display:grid;place-items:center;width:26px;height:26px;flex:none;border-radius:50%;background:var(--crm-accent);color:#111}
.success-toast button{margin-left:auto;border:0;background:transparent;color:inherit;font-size:1.25rem;cursor:pointer;opacity:.65}
.toast-enter-active,.toast-leave-active{transition:opacity .2s ease,transform .3s cubic-bezier(.16,1,.3,1)}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(12px)}
@media(max-width:700px){.client-drawer{padding:32px 20px}.success-toast{right:16px;bottom:16px}}
</style>
