export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: number | string
  order_id: string
  payment_method_id: number
  amount: number
  status: PaymentStatus
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  payment_methods?: {
    id: number
    name: string
  }
  admin_created?: {
    name: string
    surname: string
  }
  admin_updated?: {
    name: string
    surname: string
  }
}

export interface PaymentParams {
  create?: string
  edit?: string
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending: boolean
  }
  filters?: {
    status?: PaymentStatus | PaymentStatus[]
    payment_method_id?: number
  }
  visibleColumns?: string[]
  search?: string
}
