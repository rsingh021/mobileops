// supabase.js — Creates and exports a single Supabase client for the whole app.
// Import { supabase } from here whenever you need to read or write the database.

import { createClient } from '@supabase/supabase-js'

// Vite exposes environment variables prefixed with VITE_ via import.meta.env.
// These values come from your .env file and are never committed to git.
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient connects to your Supabase project.
// The anon key is safe to use in the browser — it only has the permissions
// you set in Supabase's Row Level Security policies.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)