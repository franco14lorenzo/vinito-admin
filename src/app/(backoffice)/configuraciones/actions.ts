'use server'

import { createClient } from '@/lib/supabase/server'

type SettingData = {
  key: string
  value: string
  description?: string
  updated_at: string
  updated_by: number
}

export async function getSettingById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching Setting:', error)
    throw error
  }
}

export async function updateSetting(id: string, data: SettingData) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('settings').update(data).eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    console.error('Error updating setting:', error)
    throw error
  }
}
