'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateStoreTag } from '@/lib/utils'

type PaymentMethodData = {
  name: string
  description?: string
  status: 'active' | 'inactive'
  updated_at: string
  updated_by: number
}

export async function getPaymentMethodById(id: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data }
  } catch (error) {
    console.error('Error fetching payment method:', error)
    throw error
  }
}

export async function updatePaymentMethod(
  id: string,
  payload: PaymentMethodData
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('payment_methods')
      .update(payload)
      .eq('id', id)

    if (error) throw error

    revalidateStoreTag('payment_methods')

    return { success: true }
  } catch (error) {
    console.error('Error updating payment method:', error)
    throw error
  }
}
