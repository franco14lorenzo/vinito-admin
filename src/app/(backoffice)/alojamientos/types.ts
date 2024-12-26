export type AccommodationStatus = 'draft' | 'active' | 'inactive'

export type Accommodation = {
  id: string
  name: string
  address: string
  status: AccommodationStatus
  qr_code: string
  latitude?: number
  longitude?: number
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
}

export interface AccommodationParams {
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
    address?: string
    status?: AccommodationStatus | AccommodationStatus[]
  }
  visibleColumns?: string[]
  search?: string
}
