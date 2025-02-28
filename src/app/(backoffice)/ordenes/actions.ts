'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateStoreTag } from '@/lib/utils'

import { ORDER_ERRORS, type OrderError } from './errors'
import { OrderStatus } from './types'

export async function getOrderById(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        customer:customers(name, surname, email, phone),
        accommodation:accommodations(name, address),
        delivery_schedule:delivery_schedules(name, start_time, end_time),
        payment:payments!orders_payment_id_fkey(payment_method_id, amount, status)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error) {
    console.error('Error fetching Order:', error)
    throw error
  }
}

type OrderData = {
  status: OrderStatus
  customer_id: string
  customer_note?: string
  accommodation_id?: string
  delivery_date: string
  delivery_schedule_id: number
  total_amount: number
  discount_amount?: number
  shipping_amount?: number
  tax_amount?: number
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error updating Order status:', error)
    throw error
  }
}

export async function updateOrder(
  id: string,
  data: OrderData,
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error updating Order:', error)
    throw error
  }
}

type TastingWithWines = {
  quantity: number
  tasting: {
    id: number
    stock: number
    sold: number
    slug: string
    wines?: {
      wine: {
        id: number
        stock: number
        reserved_stock: number
        sold: number
      }
    }[]
  }
}

async function getOrderTastings(orderId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('order_tastings')
      .select(
        `
        quantity,
        tasting:tastings (
          id,
          stock,
          sold,
          wines:tasting_wines (
            wine:wines (
              id,
              stock,
              reserved_stock,
              sold
            )
          )
        )
      `
      )
      .eq('order_id', orderId)

    if (error) throw new Error(error.message)

    return data as unknown as TastingWithWines[]
  } catch (error) {
    console.error('Error fetching order tastings:', error)
    throw error
  }
}

async function updateTastingStock(
  tastingId: number,
  stockChange: number,
  soldChange: number,
  adminId: number,
  slug: string
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('tastings')
      .update({
        stock: stockChange,
        sold: soldChange,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', tastingId)

    if (error) throw new Error(error.message)

    revalidateStoreTag('tastings')
    revalidateStoreTag(slug)
  } catch (error) {
    console.error('Error updating tasting stock:', error)
    throw error
  }
}

async function updateWineStock(
  wineId: number,
  stockChange: number,
  reservedStockChange: number,
  soldChange: number,
  adminId: number,
  orderId?: string,
  stockToReturn?: number
) {
  const supabase = await createClient()

  try {
    const { error: updateError } = await supabase
      .from('wines')
      .update({
        stock: stockChange,
        reserved_stock: reservedStockChange,
        sold: soldChange,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', wineId)

    if (updateError) throw new Error(updateError.message)

    const { error: movementError } = await supabase
      .from('wine_stock_movements')
      .insert({
        wine_id: wineId,
        quantity: stockToReturn || 0,
        type: 'entry',
        order_id: orderId,
        created_by: adminId,
        updated_by: adminId,
        notes: orderId ? 'Movimiento por cancelación de orden' : undefined
      })

    if (movementError) throw new Error(movementError.message)
  } catch (error) {
    console.error('Error updating wine stock:', error)
    throw error
  }
}

async function getOrderPaymentDetails(orderId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, status, amount')
      .eq('order_id', orderId)
      .single()

    if (error) throw new Error(error.message)

    return data
  } catch (error) {
    console.error('Error fetching payment details:', error)
    throw error
  }
}

export async function cancelOrder(
  id: string,
  adminId: number,
  shouldRefundPayment: boolean
) {
  const supabase = await createClient()

  try {
    const payment = await getOrderPaymentDetails(id)
    if (payment && payment.status === 'completed' && !shouldRefundPayment) {
      return {
        error: {
          code: ORDER_ERRORS.REFUND_REQUIRED,
          message:
            'Debe confirmar el reembolso del pago antes de cancelar la orden'
        } as OrderError
      }
    }

    const orderTastings = await getOrderTastings(id)

    for (const orderTasting of orderTastings) {
      const { quantity, tasting } = orderTasting

      if (!tasting) continue

      const newTastingStock = tasting.stock + quantity
      const newTastingSold = (tasting.sold || 0) - quantity
      await updateTastingStock(
        tasting.id,
        newTastingStock,
        newTastingSold,
        adminId,
        tasting.slug
      )

      if (tasting.wines) {
        for (const tastingWine of tasting.wines) {
          const { wine } = tastingWine
          if (!wine) continue

          const stockToReturn = quantity
          const newWineStock = wine.stock + stockToReturn
          const newReservedStock = wine.reserved_stock + stockToReturn
          const newWineSold = (wine.sold || 0) - stockToReturn

          await updateWineStock(
            wine.id,
            newWineStock,
            newReservedStock,
            newWineSold,
            adminId,
            id,
            stockToReturn
          )
        }
      }
      revalidateStoreTag(tasting.slug)
    }

    if (payment && payment.status === 'completed' && shouldRefundPayment) {
      await updatePaymentStatus(id, 'refunded', adminId)
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidateStoreTag('tastings')

    return { success: true }
  } catch (error) {
    console.error('Error cancelling Order:', error)
    throw new Error('Error al cancelar la orden')
  }
}

export async function getOrder(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:customers(name, surname, email, phone),
      accommodation:accommodations(name, address),
      delivery_schedule:delivery_schedules(name, start_time, end_time),
      payment:payments!orders_payment_id_fkey(payment_method_id, amount, status)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

export async function updatePaymentStatus(
  orderId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  adminId: number
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('order_id', orderId)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

export async function getOrderPayment(orderId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status')
      .eq('order_id', orderId)
      .single()

    if (error) throw new Error(error.message)

    return data
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw error
  }
}
