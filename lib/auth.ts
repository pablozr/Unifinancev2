import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export { default as getUser } from '@/app/auth/_data/getUser'

export const getSession = cache(async () => {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      return null
    }
    return session
  } catch (error) {
    return null
  }
})

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
}

export async function requireAuthServer() {
  try {
    const getUserFn = (await import('@/app/auth/_data/getUser')).default
    const user = await getUserFn()
    
    if (!user) {
      redirect('/login')
    }
    
    return user
  } catch {
    const getUserFn = (await import('@/app/auth/_data/getUser')).default
    const user = await getUserFn()
    
    if (!user) {
      redirect('/login')
    }
    
    return user
  }
}

export async function redirectIfAuthenticated() {
  const getUserFn = (await import('@/app/auth/_data/getUser')).default
  const user = await getUserFn()
  if (user) redirect('/dashboard')
}
