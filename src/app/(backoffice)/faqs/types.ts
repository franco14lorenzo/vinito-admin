export type FAQStatus = 'draft' | 'active' | 'inactive'

export type FAQ = {
  id: number
  question: string
  answer: string
  order: number
  status: FAQStatus
  created_at: string
  updated_at: string
}

export interface FAQParams {
  create?: string
  edit?: string
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
  filters?: {
    question?: string
    answer?: string
    order?: number
    status?: FAQStatus | FAQStatus[]
  }
  visibleColumns?: string[]
  search?: string
}
