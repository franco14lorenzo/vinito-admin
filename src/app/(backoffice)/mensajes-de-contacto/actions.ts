'use server'

import { createClient } from '@/lib/supabase/server'

export async function getContactById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching Contact:', error)
    throw error
  }
}

export async function updateContactStatus(
  id: string,
  status: 'deleted' | 'read' | 'unread' | 'answered'
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error updating Contact:', error)
    throw error
  }
}
