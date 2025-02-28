'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCustomerById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw error
  }
}

type CustomerData = {
  name: string
  surname: string
  email: string
  phone: string
}

export async function createCustomer(data: CustomerData, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('customers')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        created_by: adminId
      })
      .select()

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

export async function updateCustomer(
  id: string,
  data: CustomerData,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('customers')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error updating customer:', error)
    throw error
  }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('customers').delete().eq('id', id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw error
  }
}
