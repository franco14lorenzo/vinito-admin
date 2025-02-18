/* eslint-disable camelcase */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateStoreTag } from '@/lib/utils'

export async function getTastingById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tastings')
      .select(
        `
        *,
        tasting_wines (
          wine_id,
          wine:wines (
            id,
            name,
            winery,
            variety,
            year,
            image,
            stock,
            cost_usd_blue,
            reserved_stock
          )
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
    console.error('Error fetching Tasting:', error)
    throw error
  }
}

type TastingData = {
  name: string
  short_description?: string
  long_description?: string
  pairings?: string
  price: number
  status: 'draft' | 'active' | 'inactive'
  stock?: number
  image?: string | null
  wine_ids?: number[]
}

export async function createTasting(data: TastingData, adminId: number) {
  const supabase = await createClient()

  try {
    const { wine_ids, ...tastingData } = data
    const slug = data.name.toLowerCase().replace(/\s/g, '-')

    const { data: tasting, error } = await supabase
      .from('tastings')
      .insert({
        ...tastingData,
        slug,
        created_at: new Date().toISOString(),
        created_by: adminId
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    if (wine_ids && wine_ids.length > 0) {
      const tastingWines = wine_ids.map((wine_id) => ({
        tasting_id: tasting.id,
        wine_id
      }))

      const { error: winesError } = await supabase
        .from('tasting_wines')
        .insert(tastingWines)

      if (winesError) throw new Error(winesError.message)
    }

    revalidateStoreTag('tastings')

    return { success: true }
  } catch (error) {
    console.error('Error creating Tasting:', error)
    throw error
  }
}

export async function updateTasting(
  id: string,
  data: TastingData,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { wine_ids, ...tastingData } = data
    const slug = data.name.toLowerCase().replace(/\s/g, '-')

    const { error } = await supabase
      .from('tastings')
      .update({
        ...tastingData,
        slug,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    if (wine_ids !== undefined) {
      const { error: deleteError } = await supabase
        .from('tasting_wines')
        .delete()
        .eq('tasting_id', id)

      if (deleteError) throw new Error(deleteError.message)

      if (wine_ids.length > 0) {
        const tastingWines = wine_ids.map((wine_id) => ({
          tasting_id: parseInt(id),
          wine_id
        }))

        const { error: insertError } = await supabase
          .from('tasting_wines')
          .insert(tastingWines)

        if (insertError) throw new Error(insertError.message)
      }
    }

    revalidateStoreTag('tastings')

    return { success: true }
  } catch (error) {
    console.error('Error updating Tasting:', error)
    throw error
  }
}

export async function deleteTasting(id: number, adminId: number) {
  const supabase = await createClient()

  try {
    const { data: tasting, error: fetchError } = await supabase
      .from('tastings')
      .select(
        `
        *,
        tasting_wines (
          wine_id,
          wine:wines (
            id,
            reserved_stock
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    const currentStock = tasting.stock || 0

    for (const { wine } of tasting.tasting_wines) {
      if (!wine) continue

      const { error: updateWineError } = await supabase
        .from('wines')
        .update({
          reserved_stock: Math.max(
            0,
            (wine.reserved_stock || 0) - currentStock
          ),
          updated_at: new Date().toISOString(),
          updated_by: adminId
        })
        .eq('id', wine.id)

      if (updateWineError) throw new Error(updateWineError.message)
    }

    const { error } = await supabase
      .from('tastings')
      .update({
        status: 'deleted',
        stock: 0,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidateStoreTag('tastings')

    return { success: true }
  } catch (error) {
    console.error('Error deleting Tasting:', error)
    throw error
  }
}

export async function uploadImage(file: File) {
  const supabase = await createClient()

  const bucket = 'tastings'
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

  return publicUrl
}

export async function searchWines(query: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('wines')
      .select(
        'id, name, winery, variety, year, image, stock, reserved_stock, cost_usd_blue'
      )
      .eq('status', 'active')
      .or(
        `name.ilike.%${query}%, variety.ilike.%${query}%, winery.ilike.%${query}%`
      )
      .order('name')
      .limit(10)

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error searching wines:', error)
    throw error
  }
}

export async function updateTastingStock(
  id: number,
  newStock: number,
  adminId: number
) {
  const supabase = await createClient()

  try {
    // Start a transaction
    const { data: tasting, error: tastingError } = await supabase
      .from('tastings')
      .select(
        `
        *,
        tasting_wines (
          wine_id,
          wine:wines (
            id,
            reserved_stock
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (tastingError) throw new Error(tastingError.message)

    const currentStock = tasting.stock || 0
    const stockDifference = newStock - currentStock

    // If there's no change in stock, return early
    if (stockDifference === 0) return { success: true }

    // For each wine in the tasting, update its reserved stock and create a movement
    for (const { wine } of tasting.tasting_wines) {
      if (!wine) continue
      // Update wine's reserved stock
      const { error: updateWineError } = await supabase
        .from('wines')
        .update({
          reserved_stock: (wine.reserved_stock || 0) + stockDifference,
          updated_at: new Date().toISOString(),
          updated_by: adminId
        })
        .eq('id', wine.id)

      if (updateWineError) throw new Error(updateWineError.message)
    }

    // Update tasting stock
    const { error: updateTastingError } = await supabase
      .from('tastings')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)

    if (updateTastingError) throw new Error(updateTastingError.message)

    revalidateStoreTag('tastings')

    return { success: true }
  } catch (error) {
    console.error('Error updating Tasting stock:', error)
    throw error
  }
}
