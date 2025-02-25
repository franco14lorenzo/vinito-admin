export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type PaymentType = 'cash_on_delivery' | 'bank_transfer'

export type PaymentMethod = {
  id: number
  name: string
  description?: string
  type: PaymentType
}

export type Payment = {
  id: number
  order_id: string
  payment_method_id: number
  amount: number
  status: PaymentStatus
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  // Related entities
  payment_method?: PaymentMethod
}

export type Admin = {
  id: number
  name: string
  surname: string
  email: string
}

export type Wine = {
  id: number
  name: string
  winery: string
  year: number
  variety: string
}

export type TastingWine = {
  wine: Wine
}

export type Tasting = {
  id: number
  name: string
  short_description?: string
  price: number
  image?: string | null
  wines?: TastingWine[]
}

export type OrderTasting = {
  tasting_id: number
  quantity: number
  tasting: Tasting
}

export type Order = {
  id: string
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
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
  payment_id?: number
  customer?: {
    id: string
    name: string
    surname: string
    email: string
    phone: string
  }
  accommodation?: {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
  }
  delivery_schedule?: {
    name: string
    start_time: string
    end_time: string
  }
  payments?: Payment[]
  created_by_admin?: Admin
  updated_by_admin?: Admin
  order_tastings?: OrderTasting[]
}

export interface OrderParams {
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
  filters?:
    | {
        status?: OrderStatus | OrderStatus[]
        customer_id?: string
        delivery_date?: string
        delivery_schedule_id?: number
      }
    | {
        status: string[]
      }
  visibleColumns?: string[]
  search?: string
}
