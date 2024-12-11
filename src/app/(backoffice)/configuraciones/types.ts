export interface Setting {
  id: number
  key: string
  value: string
  description: string | null
  updated_at: string
  updated_by: number | null
}

export interface SettingParams {
  create?: string
  edit?: string
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending: boolean
  }
  filters?: {
    key?: string
    value?: string
    description?: string
  }
  visibleColumns?: string[]
  search?: string
}
