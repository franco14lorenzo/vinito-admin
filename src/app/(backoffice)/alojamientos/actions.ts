'use server'

import { revalidatePath } from 'next/cache'

import { type Accommodation } from '@/app/(backoffice)/alojamientos/types'
import { createClient } from '@/lib/supabase/server'

type AccommodationData = {
  name: string
  address: string
  qr_code: string
  status: 'active' | 'inactive' | 'draft'
}

export async function createAccommodation(
  data: AccommodationData,
  adminId: number
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('accommodations').insert({
      ...data,
      created_by: adminId,
      updated_by: adminId
    })

    if (error) throw error

    revalidatePath('/accommodations')
    return { message: 'Accommodation creada correctamente' }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('No se pudo crear la Accommodation')
  }
}

export async function updateAccommodation(
  id: string,
  data: Partial<Accommodation>,
  adminId: number
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('accommodations')
      .update({
        ...data,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/accommodations')
    return { message: 'Accommodation actualizada correctamente' }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('No se pudo actualizar la Accommodation')
  }
}

export async function deleteAccommodation(id: string, adminId: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('accommodations')
      .update({
        status: 'deleted',
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/accommodations')
    return { message: 'Accommodation eliminada correctamente' }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('No se pudo eliminar la Accommodation')
  }
}

export async function getAccommodationById(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('No se pudo obtener la Accommodation')
  }
}
