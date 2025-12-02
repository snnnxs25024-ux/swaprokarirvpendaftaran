import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fcffounmjkfzyvcyipct.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZmZvdW5tamtmenl2Y3lpcGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTY2MzEsImV4cCI6MjA4MDIzMjYzMX0.qcLvqnclXiYPGnyHwmpAfqUrEdfgMcuezIRhUk9DEZc'

export const supabase = createClient(supabaseUrl, supabaseKey)