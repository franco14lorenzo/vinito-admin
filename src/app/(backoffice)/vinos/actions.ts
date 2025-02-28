'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWineById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching Wine:', error)
    throw error
  }
}

type WineData = {
  name: string
  description?: string
  winery: string
  year: number
  variety: string
  volume_ml: number
  price: number
  cost_usd_blue: number
  status: 'draft' | 'active' | 'inactive'
  stock?: number
  image?: string | null
}

export async function createWine(data: WineData, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('wines')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        created_by: adminId
      })
      .select()

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error creating Wine:', error)
    throw error
  }
}

export async function updateWine(id: string, data: WineData, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('wines')
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
    console.error('Error updating Wine:', error)
    throw error
  }
}

export async function deleteWine(id: number, adminId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('wines')
      .update({
        status: 'deleted',
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error deleting Wine:', error)
    throw error
  }
}

export async function uploadImage(file: File) {
  const supabase = await createClient()

  const bucket = 'wines'
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(`${bucket}/${filePath}`, file)

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from('images').getPublicUrl(`${bucket}/${filePath}`)
  console.log('🚀 ~ uploadImage ~ publicUrl:', publicUrl)

  return publicUrl
}

export async function getWine(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

type StockMovementData = {
  wine_id: number
  quantity: number
  type: 'entry' | 'out'
  notes?: string
}

export async function createStockMovement(
  data: StockMovementData,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { data: currentWine, error: wineError } = await supabase
      .from('wines')
      .select('stock')
      .eq('id', data.wine_id)
      .single()

    if (wineError) throw new Error(wineError.message)

    const currentStock = currentWine.stock || 0
    const stockChange = data.type === 'entry' ? data.quantity : -data.quantity

    if (data.type === 'out' && currentStock < data.quantity) {
      throw new Error('No hay suficiente stock disponible')
    }

    const newStock = currentStock + stockChange

    const { error: updateError } = await supabase
      .from('wines')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', data.wine_id)

    if (updateError) throw new Error(updateError.message)

    const { error: movementError } = await supabase
      .from('wine_stock_movements')
      .insert({
        ...data,
        created_by: adminId,
        created_at: new Date().toISOString()
      })
      .select()

    if (movementError) throw new Error(movementError.message)

    return { success: true }
  } catch (error) {
    console.error('Error managing stock:', error)
    throw error
  }
}
