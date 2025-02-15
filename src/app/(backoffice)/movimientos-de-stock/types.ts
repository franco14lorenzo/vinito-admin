export type StockMovementType = 'entry' | 'out'

export interface WineStockMovement {
  id: number
  wine_id: number
  quantity: number
  type: StockMovementType
  notes?: string
  created_at: string
  created_by_id: string
  wine?: {
    name: string
  }
  created_by?: {
    name: string
    surname: string
  }
}

export interface StockMovementParams {
  page?: number
  perPage?: number
  visibleColumns?: string[]
  search?: string
  orderBy?: {
    column: string
    ascending: boolean
  }
  filters?: {
    type?: StockMovementType | StockMovementType[]
  }
}
