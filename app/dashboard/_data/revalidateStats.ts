'use server'
import { revalidatePath } from 'next/cache'

/**
 * @function revalidateStats
 * @description Força a revalidação do cache das estatísticas
 */
export async function revalidateStats() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/insights')
}

export default revalidateStats 