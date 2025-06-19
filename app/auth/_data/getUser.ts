import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export default cache(async () => {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return null
    }
    return user
  } catch (error) {
    // ... existing code ...
    return null
  }
}) 