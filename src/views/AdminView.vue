<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase'

const user = ref(null)
const email = ref('')
const password = ref('')
const isLoggingIn = ref(false)
const errorMessage = ref('')

// Form state
const newProject = ref({
  title: '',
  description: '',
  category: '',
  tags: '',
  image: ''
})
const isSaving = ref(false)
const successMessage = ref('')

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
  }
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
  }
  isLoggingIn.value = false
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
}

const submitProject = async () => {
  isSaving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  // Convert comma separated tags to array
  const tagsArray = newProject.value.tags.split(',').map(t => t.trim()).filter(t => t)

  const { error } = await supabase
    .from('projects')
    .insert([
      { 
        title: newProject.value.title,
        description: newProject.value.description,
        category: newProject.value.category,
        image: newProject.value.image,
        tags: tagsArray
      }
    ])

  if (error) {
    errorMessage.value = error.message
  } else {
    successMessage.value = '¡Proyecto añadido con éxito!'
    newProject.value = { title: '', description: '', category: '', tags: '', image: '' }
  }
  isSaving.value = false
}
</script>

<template>
  <main class="page-wrapper container fade-in">
    <div v-if="!user" class="admin-login">
      <h1>Admin Access</h1>
      <p>Please log in to manage your portfolio.</p>
      
      <form @submit.prevent="handleLogin" class="form">
        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
        
        <div class="input-group">
          <label>Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" required />
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>

    <div v-else class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <button @click="handleLogout" class="btn btn-outline">Logout</button>
      </div>
      
      <div class="form-container">
        <h2>Add New Project</h2>
        
        <form @submit.prevent="submitProject" class="form">
          <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>
          <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

          <div class="input-group">
            <label>Title</label>
            <input type="text" v-model="newProject.title" required />
          </div>

          <div class="input-group">
            <label>Description</label>
            <textarea v-model="newProject.description" rows="3" required></textarea>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Category (e.g. SaaS, Landing)</label>
              <input type="text" v-model="newProject.category" required />
            </div>
            
            <div class="input-group">
              <label>Tags (comma separated)</label>
              <input type="text" v-model="newProject.tags" placeholder="Vue, Tailwind, Node" />
            </div>
          </div>

          <div class="input-group">
            <label>Image URL</label>
            <input type="url" v-model="newProject.image" placeholder="https://images.unsplash..." required />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Publish Project' }}
          </button>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-login {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 40px;
}

.admin-login h1 {
  margin-bottom: 8px;
}

.admin-login p {
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--bg-secondary);
  padding: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .input-row {
    grid-template-columns: 1fr 1fr;
  }
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

input, textarea {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--text-primary);
}

.error-msg {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.success-msg {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.form-container {
  max-width: 800px;
}

.form-container h2 {
  margin-bottom: 24px;
}
</style>
