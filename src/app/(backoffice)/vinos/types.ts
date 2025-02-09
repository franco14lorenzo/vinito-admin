export type WineStatus = 'draft' | 'active' | 'inactive'

export type Wine = {
  id: number
  name: string
  description?: string
  winery: string
  year: number
  variety: string
  volume_ml: number
  price: number
  cost_usd_blue: number
  status: WineStatus
  created_at: string
  updated_at: string
  stock?: number
  image?: string
  sold?: number
}

export interface WineParams {
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
    winery?: string
    year?: number
    status?: WineStatus | WineStatus[]
  }
  visibleColumns?: string[]
  search?: string
}
