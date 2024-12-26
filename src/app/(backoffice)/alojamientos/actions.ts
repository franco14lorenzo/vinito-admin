'use server'

import QRCode from 'qrcode'

import { type Accommodation } from '@/app/(backoffice)/alojamientos/types'
import { createClient } from '@/lib/supabase/server'
import { getStoreBaseUrl } from '@/lib/utils'

type AccommodationData = {
  name: string
  address: string
  status: 'active' | 'inactive' | 'draft'
}

export async function createAccommodation(
  formData: AccommodationData,
  adminId: number
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('accommodations')
      .insert({
        ...formData,
        created_by: adminId,
        updated_by: adminId
      })
      .select()

    if (error) throw error

    const storeAccessLink = `${getStoreBaseUrl(
      process.env.NEXT_PUBLIC_ENVIRONMENT as string
    )}/?accommodation_id=${data[0].id}`

    try {
      const qrBuffer = await QRCode.toBuffer(storeAccessLink)

      const qrName = `${data[0].id}.png`
      const { error: uploadError } = await supabase.storage
        .from('qr_codes')
        .upload(qrName, qrBuffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) throw uploadError
      const qrUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr_codes/${qrName}`

      const { error: updateError } = await supabase
        .from('accommodations')
        .update({
          qr_code: qrUrl
        })
        .eq('id', data[0].id)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error:', error)
      throw new Error('No se puedo generar el código QR')
    }

    return { message: 'Alojamiento creado correctamente' }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('No se pudo crear el alojamiento')
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

    return { message: 'Alojamiento actualizada correctamente' }
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

    return { message: 'Alojamiento eliminada correctamente' }
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
    throw new Error('No se pudo obtener el alojamiento')
  }
}
