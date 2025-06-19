'use server'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES } from './defaultCategories'

/**
 * Busca ou cria categorias padrÃ£o para o usuÃ¡rio
 */
export async function ensureDefaultCategories(userId: string) {
  const supabase = await createClient()
  
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('name')
    .eq('user_id', userId)
  
  const existingNames = existingCategories?.map(cat => cat.name) || []
  
  const categoriesToCreate = DEFAULT_CATEGORIES.filter(
    cat => !existingNames.includes(cat.name)
  )
  
  if (categoriesToCreate.length > 0) {
    const { error } = await supabase
      .from('categories')
      .insert(
        categoriesToCreate.map(cat => ({
          user_id: userId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon
        }))
      )
    
    if (error) {
      throw error
    }
    
  }
  
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) {
    throw error
  }
  
  return allCategories || []
} 
