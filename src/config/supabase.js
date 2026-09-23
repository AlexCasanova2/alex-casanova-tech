import { createClient } from '@supabase/supabase-js'

// Public pages remain renderable during previews even when CRM credentials are absent.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'preview-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
