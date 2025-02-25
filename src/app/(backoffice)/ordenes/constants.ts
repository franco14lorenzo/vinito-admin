export const REQUIRED_COLUMNS = [
  'id',
  'status',
  'customer',
  'delivery',
  'amounts',
  'payment',
  'created_at',
  'updated_at',
  'actions'
]

export const DEFAULT_COLUMNS = [
  'id',
  'status',
  'customer',
  'delivery',
  'amounts',
  'payment',
  'created_at',
  'updated_at',
  'actions'
]

export const DISABLED_COLUMNS = []

export const SORTABLE_COLUMNS = {
  delivery: 'delivery_date',
  created_at: 'created_at',
  updated_at: 'updated_at'
}

export const DEFAULT_ORDER = {
  column: 'created_at',
  ascending: false
}

export const STATUS_FILTERS = [
  { label: 'Pendiente', value: 'pending', variant: 'warning' },
  { label: 'Procesando', value: 'processing', variant: 'purple' },
  { label: 'Enviado', value: 'shipped', variant: 'blue' },
  { label: 'Entregado', value: 'delivered', variant: 'success' },
  { label: 'Cancelado', value: 'cancelled', variant: 'destructive' }
]

export const STATUS_VARIANTS = {
  pending: 'warning',
  processing: 'purple',
  shipped: 'blue',
  delivered: 'success',
  cancelled: 'destructive'
}

export const FILTERS = [
  {
    id: 'status',
    table: 'orders',
    label: 'Estados',
    options: STATUS_FILTERS,
    defaultSelected: ['pending', 'processing', 'shipped']
  }
]
