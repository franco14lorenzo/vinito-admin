export type PaymentMethodStatus = 'active' | 'inactive'
export type PaymentType = 'cash_on_delivery' | 'card' | 'transfer'

export interface PaymentMethod {
  id: number
  name: string
  status: PaymentMethodStatus
  description?: string
  type: PaymentType
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface PaymentMethodParams {
  edit?: string
  page?: number
  perPage?: number
  visibleColumns?: string[]
  search?: string
  orderBy?: {
    column: string
    ascending: boolean
  }
  filters?: {
    status?: PaymentMethodStatus | PaymentMethodStatus[]
  }
}
