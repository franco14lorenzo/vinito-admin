export const DEFAULT_COLUMNS = [
  'name',
  'start_time',
  'end_time',
  'status',
  'created_at',
  'updated_at'
]

export const DEFAULT_ORDER = {
  column: 'name',
  ascending: true
}

export const STATUS_FILTERS = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Borrador', value: 'draft' }
]

export const FILTERS = [
  {
    id: 'status',
    label: 'Estados',
    options: STATUS_FILTERS,
    defaultSelected: ['active', 'inactive', 'draft']
  }
]
