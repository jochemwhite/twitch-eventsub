import type { Database } from '@/types/supabase'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY!)


export function createSupabaseClient(supabaseAccessToken: string) {
  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
      cookies: {
        get: undefined,
        set: undefined,
        remove: undefined
      }
    }
  )
}