'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStockMovementById(id: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('wine_stock_movements')
      .select('*, wine:wines(name)')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data }
  } catch (error) {
    console.error('Error fetching stock movement:', error)
    throw error
  }
}

export async function getWineList() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('wines')
      .select('id, name')
      .order('name')

    if (error) throw error

    return { data }
  } catch (error) {
    console.error('Error fetching wines:', error)
    throw error
  }
}

export async function createStockMovement(data: {
  wine_id: number
  quantity: number
  type: 'entry' | 'out'
  notes?: string
  created_by: number
}) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('wine_stock_movements').insert([data])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error creating stock movement:', error)
    throw error
  }
}
