'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function logout() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      redirect('/login')
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
    }
  } catch {
  }

  redirect('/login')
} 
