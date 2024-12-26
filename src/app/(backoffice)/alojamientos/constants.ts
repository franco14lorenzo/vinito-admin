export const DEFAULT_COLUMNS = [
  'name',
  'address',
  'status',
  'qr_code',
  'latitude',
  'longitude',
  'created_at',
  'updated_at'
]

export const DEFAULT_ORDER = {
  column: 'updated_at',
  ascending: false
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
