export const DEFAULT_COLUMNS = [
  'order_id',
  'payment_method_id',
  'amount',
  'status',
  'created_at',
  'updated_at',
  'updated_by'
]

export const DEFAULT_ORDER = {
  column: 'updated_at',
  ascending: false
}

export const FILTERS = [
  {
    id: 'status',
    table: 'payments',
    label: 'Estados',
    options: [
      { value: 'pending', label: 'Pendiente' },
      { value: 'completed', label: 'Completado' },
      { value: 'failed', label: 'Fallido' },
      { value: 'refunded', label: 'Reembolsado' }
    ],
    defaultSelected: ['pending', 'completed', 'failed', 'refunded']
  }
]

export const STATUS_VARIANTS = {
  pending: 'outline',
  completed: 'success',
  failed: 'destructive',
  refunded: 'warning'
} as const

export const PAYMENTS_STATUS_LABELS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'completed', label: 'Completado' },
  { value: 'failed', label: 'Fallido' },
  { value: 'refunded', label: 'Reembolsado' }
] as const
