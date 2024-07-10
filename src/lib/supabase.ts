import { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)