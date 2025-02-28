'use server'

import { createClient } from '@/lib/supabase/server'

import { Payment } from './types'

export async function getPaymentById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        payment_methods (
          id,
          name
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching Payment:', error)
    throw error
  }
}

export async function updatePayment(id: string, data: Partial<Payment>) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('payments').update(data).eq('id', id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error updating payment:', error)
    throw error
  }
}
