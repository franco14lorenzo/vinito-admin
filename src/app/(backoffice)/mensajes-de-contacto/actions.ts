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
