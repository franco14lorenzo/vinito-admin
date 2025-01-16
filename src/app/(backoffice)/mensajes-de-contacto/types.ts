export interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  status: 'unread' | 'read'
  created_at: string
  updated_at: string
}

export interface ContactParams {
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending: boolean
  }
  filters?: {
    name?: string
    email?: string
    status?: 'unread' | 'read'
  }
  visibleColumns?: string[]
  search?: string
}
