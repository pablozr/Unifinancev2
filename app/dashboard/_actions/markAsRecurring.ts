'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  transactionIds: z.array(z.string().uuid()),
  isRecurring: z.boolean(),
})

export async function markAsRecurring(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    transactionIds: formData.getAll('transactionIds'),
    isRecurring: formData.get('isRecurring') === 'true',
  })

  if (!validatedFields.success) {
    return {
      message: 'Invalid data provided.',
    }
  }

  const { transactionIds, isRecurring } = validatedFields.data

  if (transactionIds.length === 0) {
    return {
      message: 'No transactions selected.',
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .update({ is_recurring: isRecurring })
    .in('id', transactionIds)
    .select()

  if (error) {
    console.error('Error updating transactions:', error)
    return {
      message: 'Failed to update transactions.',
    }
  }

  revalidatePath('/dashboard')

  return {
    message: `Successfully updated ${data.length} transactions.`,
  }
} 