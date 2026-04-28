<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase'

const user = ref(null)
const email = ref('')
const password = ref('')
const isLoggingIn = ref(false)
const errorMessage = ref('')

// Tabs
const activeTab = ref('add') // 'add' | 'manage'
const projectsList = ref([])

// Form state
const newProject = ref({
  title: '',
  description: '',
  content: '',
  category: '',
  tags: '',
  url: ''
})

const isEditing = ref(false)
const editingId = ref(null)

const coverImageFile = ref(null)
const coverImagePreview = ref(null)
const isSaving = ref(false)
const successMessage = ref('')
const contentTextarea = ref(null)

const fetchProjects = async () => {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (data) projectsList.value = data
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
    fetchProjects()
  }

  supabase.auth.onAuthStateChange((_, session) => {
    if (session) {
      user.value = session.user
      // Only fetch if projects list is empty to avoid double fetching on mount
      if (projectsList.value.length === 0) fetchProjects()
    } else {
      user.value = null
    }
  })
})

const handleLogin = async () => {
  isLoggingIn.value = true
  errorMessage.value = ''
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    user.value = data.user
    fetchProjects()
  }
  isLoggingIn.value = false
}

// handleLogout has been moved to App.vue

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverImageFile.value = file
    coverImagePreview.value = URL.createObjectURL(file)
  }
}

const uploadImageToBucket = async (file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath)
  return data.publicUrl
}

const insertImageToContent = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const publicUrl = await uploadImageToBucket(file)
    insertFormat(`\n![Descripción de la imagen](${publicUrl})\n`)
  } catch (error) {
    alert('Error al subir imagen al contenido: ' + error.message)
  }
  
  e.target.value = ''
}

const insertFormat = (prefix, suffix = '') => {
  const textarea = contentTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = newProject.value.content || ''
  const selectedText = text.substring(start, end)
  
  const before = text.substring(0, start)
  const after = text.substring(end)
  
  newProject.value.content = before + prefix + selectedText + suffix + after
  
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, end + prefix.length)
  }, 0)
}

const loadForEdit = (project) => {
  newProject.value = {
    title: project.title,
    description: project.description,
    content: project.content || '',
    category: project.category,
    tags: project.tags ? project.tags.join(', ') : '',
    url: project.url || ''
  }
  isEditing.value = true
  editingId.value = project.id
  coverImagePreview.value = project.image
  coverImageFile.value = null
  activeTab.value = 'add'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  isEditing.value = false
  editingId.value = null
  newProject.value = { title: '', description: '', content: '', category: '', tags: '', url: '' }
  coverImageFile.value = null
  coverImagePreview.value = null
}

const deleteProject = async (id) => {
  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return
  
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) {
    alert('Error deleting project: ' + error.message)
  } else {
    fetchProjects()
  }
}

const submitProject = async () => {
  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    let coverUrl = coverImagePreview.value
    
    // Si hay un archivo nuevo, lo subimos
    if (coverImageFile.value) {
      coverUrl = await uploadImageToBucket(coverImageFile.value)
    } else if (!isEditing.value) {
      throw new Error('Debes seleccionar una imagen de portada')
    }

    const tagsArray = newProject.value.tags.split(',').map(t => t.trim()).filter(t => t)

    const payload = { 
      title: newProject.value.title,
      description: newProject.value.description,
      content: newProject.value.content,
      category: newProject.value.category,
      image: coverUrl,
      tags: tagsArray,
      url: newProject.value.url || null
    }

    if (isEditing.value) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editingId.value)
      if (error) throw error
      successMessage.value = '¡Proyecto actualizado con éxito!'
    } else {
      const { error } = await supabase.from('projects').insert([payload])
      if (error) throw error
      successMessage.value = '¡Proyecto publicado con éxito!'
    }

    cancelEdit()
    fetchProjects()
    
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSaving.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <main class="page-wrapper container fade-in">
    <div v-if="!user" class="admin-login">
      <h1>Admin Access</h1>
      <p>Please log in to manage your portfolio.</p>
      
      <form @submit.prevent="handleLogin" class="form login-form">
        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
        
        <div class="input-group">
          <label>Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" required />
        </div>
        
        <button type="submit" class="btn btn-primary" style="margin-top: 16px;" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Authenticating...' : 'Login securely' }}
        </button>
      </form>
    </div>

    <div v-else class="admin-dashboard">
      <div class="dashboard-header">
        <div>
          <h1>Workspace</h1>
          <p class="subtitle">Create and manage your case studies.</p>
        </div>
      </div>
      
      <div class="tabs">
        <button :class="['tab-btn', { active: activeTab === 'add' }]" @click="activeTab = 'add'">
          {{ isEditing ? '✏️ Edit Project' : '✨ Add New Project' }}
        </button>
        <button :class="['tab-btn', { active: activeTab === 'manage' }]" @click="activeTab = 'manage'">
          🗂️ Manage Projects
        </button>
      </div>

      <!-- ADD / EDIT SECTION -->
      <form v-if="activeTab === 'add'" @submit.prevent="submitProject" class="pro-layout fade-in">
        <div v-if="successMessage" class="success-msg full-width">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-msg full-width">{{ errorMessage }}</div>

        <div class="form-main">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
              <h2 class="card-title" style="border: none; padding: 0; margin: 0;">Project Details</h2>
              <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-small">Cancel Edit</button>
            </div>
            
            <div class="input-group">
              <label>Title</label>
              <input type="text" v-model="newProject.title" placeholder="e.g. Next-Gen Analytics Dashboard" required class="title-input" />
            </div>

            <div class="input-group mt-24">
              <label>Short Description <span class="help-text">(Displays on grid)</span></label>
              <textarea v-model="newProject.description" rows="2" placeholder="Brief summary of the project..." required></textarea>
            </div>

            <div class="input-group mt-24">
              <div class="content-label-row">
                <label>Case Study Content</label>
                <div class="content-toolbar">
                  <button type="button" @click="insertFormat('**', '**')" class="toolbar-btn" title="Bold">B</button>
                  <button type="button" @click="insertFormat('_', '_')" class="toolbar-btn italic" title="Italic">I</button>
                  <button type="button" @click="insertFormat('## ')" class="toolbar-btn" title="Heading 2">H2</button>
                  <button type="button" @click="insertFormat('- ')" class="toolbar-btn" title="List">• List</button>
                  <div class="divider"></div>
                  <div class="upload-inline-btn">
                    <input type="file" @change="insertImageToContent" accept="image/*" id="inline-image" hidden />
                    <label for="inline-image" class="toolbar-btn image-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      Insert Media
                    </label>
                  </div>
                </div>
              </div>
              <textarea ref="contentTextarea" v-model="newProject.content" rows="18" class="editor-textarea" placeholder="Write your case study using Markdown..."></textarea>
            </div>
          </div>
        </div>

        <div class="form-sidebar">
          <div class="card publish-card">
            <h3 class="card-title">Publishing</h3>
            <p class="help-text mb-16">{{ isEditing ? 'Update the live project.' : 'The project will be live instantly.' }}</p>
            <button type="submit" class="btn btn-primary w-full" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : (isEditing ? 'Update Project' : 'Publish Project') }}
            </button>
          </div>

          <div class="card">
            <h3 class="card-title">Cover Image</h3>
            <div class="input-group">
              <input type="file" @change="handleCoverChange" accept="image/*" :required="!isEditing" id="cover-upload" hidden />
              <label for="cover-upload" class="upload-area" :class="{ 'has-image': coverImagePreview }">
                <img v-if="coverImagePreview" :src="coverImagePreview" class="cover-preview" />
                <div v-else class="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Click to upload cover</span>
                </div>
              </label>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">Metadata</h3>
            <div class="input-group">
              <label>Category</label>
              <input type="text" v-model="newProject.category" placeholder="SaaS, Design, Web..." required />
            </div>
            
            <div class="input-group mt-20">
              <label>Tags</label>
              <input type="text" v-model="newProject.tags" placeholder="Vue, Figma, Node" />
              <span class="help-text">Separate with commas</span>
            </div>

            <div class="input-group mt-20">
              <label>External URL</label>
              <input type="url" v-model="newProject.url" placeholder="https://" />
            </div>
          </div>
        </div>
      </form>

      <!-- MANAGE SECTION -->
      <div v-if="activeTab === 'manage'" class="manage-section fade-in">
        <div class="card">
          <div v-if="projectsList.length === 0" style="padding: 32px; text-align: center; color: var(--text-secondary);">
            No projects found. Add your first one!
          </div>
          
          <div class="project-list">
            <div v-for="p in projectsList" :key="p.id" class="project-list-item">
              <img :src="p.image" class="list-thumb" />
              <div class="list-info">
                <h4>{{ p.title }}</h4>
                <span>{{ p.category }} • {{ new Date(p.created_at).toLocaleDateString() }}</span>
              </div>
              <div class="list-actions">
                <button @click="loadForEdit(p)" class="btn-small">Edit</button>
                <button @click="deleteProject(p.id)" class="btn-small danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Base Layout */
.admin-login {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 60px;
}
.login-form {
  background: var(--bg-secondary);
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  margin-top: 32px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.subtitle {
  color: var(--text-secondary);
  margin-top: 4px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.tab-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--text-primary);
  color: var(--bg-color);
}

/* Manage List */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-list-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.project-list-item:hover {
  border-color: var(--text-primary);
}

.list-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.list-info {
  flex: 1;
}

.list-info h4 {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.list-info span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.list-actions {
  display: flex;
  gap: 8px;
}

.btn-small.danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-small.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

/* Pro Architecture Layout */
.pro-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: start;
}

@media (min-width: 950px) {
  .pro-layout {
    grid-template-columns: 1fr 340px;
  }
}

.full-width {
  grid-column: 1 / -1;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cards */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

/* Forms & Inputs */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mt-16 { margin-top: 16px; }
.mt-20 { margin-top: 20px; }
.mt-24 { margin-top: 24px; }
.mb-16 { margin-bottom: 16px; }
.w-full { width: 100%; justify-content: center; }

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
}

input, textarea {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color var(--transition-fast);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--text-primary);
}

.title-input {
  font-size: 1.25rem;
  font-weight: 500;
  padding: 16px;
}

/* Editor Toolbar */
.content-label-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 600px) {
  .content-label-row {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
}

.content-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  border-bottom: none;
  margin-bottom: -8px;
  z-index: 2;
  position: relative;
}

.toolbar-btn {
  background: transparent;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.toolbar-btn.italic { font-style: italic; }

.divider {
  width: 1px;
  height: 16px;
  background: var(--border-color);
  margin: 0 4px;
}

.editor-textarea {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  line-height: 1.6;
}

/* Upload Area */
.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-fast);
  aspect-ratio: 4/3;
}

.upload-area:hover {
  border-color: var(--text-primary);
  border-style: solid;
}

.upload-area.has-image {
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.upload-placeholder svg {
  color: var(--text-secondary);
  opacity: 0.7;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Messages & Utilities */
.btn-small {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.btn-small:hover {
  background: var(--bg-secondary);
}

.error-msg, .success-msg {
  padding: 16px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
}
.error-msg {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.success-msg {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
</style>
