import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schemas - we'll use these as reference for our data structure
export const schemas = {
  project: {
    id: 'string',
    name: 'string', 
    description: 'string',
    owner_id: 'string',
    created_at: 'string'
  },
  task: {
    id: 'string',
    title: 'string',
    description: 'string',
    status: 'todo | in-progress | completed',
    priority: 'low | medium | high', 
    project_id: 'string',
    assignee_id: 'string | null',
    due_date: 'string | null',
    created_at: 'string'
  },
  user: {
    id: 'string',
    email: 'string',
    full_name: 'string',
    avatar_url: 'string | null'
  }
}