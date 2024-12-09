'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFAQById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    throw error
  }
}

type FAQData = {
  question: string
  answer: string
  order?: number
  status: 'draft' | 'active' | 'inactive' | 'deleted'
}

export async function createFAQ(data: FAQData, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('faqs')
      .insert({
        ...data,
        order: data.order ?? undefined,
        created_at: new Date().toISOString(),
        created_by: adminId
      })
      .select()

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    console.error('Error creating FAQ:', error)
    throw error
  }
}

export async function updateFAQ(id: string, data: FAQData, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('faqs')
      .update({
        ...data,
        order: data.order ?? undefined,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    console.error('Error updating FAQ:', error)
    throw error
  }
}

export async function deleteFAQ(id: number, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('faqs')
      .update({
        status: 'deleted',
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    throw error
  }
}
