export const DEFAULT_COLUMNS = [
  'name',
  'type',
  'status',
  'description',
  'updated_at'
]

export const DEFAULT_ORDER = {
  column: 'updated_at',
  ascending: false
}

export const STATUS_FILTERS = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' }
]

export const FILTERS = [
  {
    id: 'status',
    label: 'Estados',
    options: STATUS_FILTERS,
    defaultSelected: ['active', 'inactive']
  }
]
