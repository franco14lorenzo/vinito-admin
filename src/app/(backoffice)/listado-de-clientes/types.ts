export type Customer = {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface CustomerParams {
  create?: string
  edit?: string
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
  filters?: {
    name?: string
    surname?: string
    email?: string
    phone?: string
  }
  visibleColumns?: string[]
  search?: string
}
