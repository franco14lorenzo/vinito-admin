import { Wine } from '../vinos/types'

export type TastingStatus = 'draft' | 'active' | 'inactive' | 'deleted'

export type TastingWine = {
  wine_id: number
  tasting_id: number
  wine: Wine
}

export interface Tasting {
  id: number
  name: string
  short_description: string | null
  long_description: string | null
  pairings: string | null
  price: number
  stock: number
  status: TastingStatus
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  image: string | null
  slug: string
  sold: number | null
  tasting_wines: TastingWine[]
}

export interface TastingParams {
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending: boolean
  }
  filters?: {
    name?: string
    status?: TastingStatus[]
  }
  search?: string
}
