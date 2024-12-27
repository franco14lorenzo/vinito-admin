export type DeliveryScheduleStatus = 'draft' | 'active' | 'inactive'

export type DeliverySchedule = {
  id: number
  name: string
  start_time: string
  end_time: string
  status: DeliveryScheduleStatus
  created_at: string
  updated_at: string
}

export interface DeliveryScheduleParams {
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
    status?: DeliveryScheduleStatus | DeliveryScheduleStatus[]
  }
  visibleColumns?: string[]
  search?: string
}
