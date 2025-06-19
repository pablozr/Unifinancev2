'use server'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES } from './defaultCategories'

/**
 * Busca ou cria categorias padrão para o usuário
 */
export async function ensureDefaultCategories(userId: string) {
  const supabase = await createClient()
  
  // Verificar categorias existentes
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('name')
    .eq('user_id', userId)
  
  const existingNames = existingCategories?.map(cat => cat.name) || []
  
  // Criar categorias que não existem
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
      console.error('Erro ao criar categorias padrão:', error)
      throw error
    }
    
    console.log(`✅ Criadas ${categoriesToCreate.length} categorias padrão`)
  }
  
  // Retornar todas as categorias do usuário
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