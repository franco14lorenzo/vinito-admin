'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateStoreTag } from '@/lib/utils'

export async function getDeliveryScheduleById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('delivery_schedules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching delivery schedule:', error)
    throw error
  }
}

type DeliveryScheduleData = {
  name: string
  start_time: string
  end_time: string
  status: 'draft' | 'active' | 'inactive'
}

export async function createDeliverySchedule(
  data: DeliveryScheduleData,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('delivery_schedules')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        created_by: adminId
      })
      .select()

    if (error) throw new Error(error.message)

    revalidateStoreTag('delivery_schedules')

    return { success: true }
  } catch (error) {
    console.error('Error creating delivery schedule:', error)
    throw error
  }
}

export async function updateDeliverySchedule(
  id: string,
  data: DeliveryScheduleData,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('delivery_schedules')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)

    revalidateStoreTag('delivery_schedules')

    return { success: true }
  } catch (error) {
    console.error('Error updating delivery schedule:', error)
    throw error
  }
}

export async function deleteDeliverySchedule(id: number, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('delivery_schedules')
      .update({
        status: 'deleted',
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidateStoreTag('delivery_schedules')

    return { success: true }
  } catch (error) {
    console.error('Error deleting delivery schedule:', error)
    throw error
  }
}
