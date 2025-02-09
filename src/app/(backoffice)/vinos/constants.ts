export const REQUIRED_COLUMNS = [
  'id',
  'image',
  'name',
  'winery',
  'variety',
  'description',
  'year',
  'volume_ml',
  'price',
  'cost_usd_blue',
  'stock',
  'sold',
  'status',
  'created_at',
  'updated_at'
]

export const DEFAULT_COLUMNS = [
  'image',
  'name',
  'winery',
  'variety',
  'year',
  'description',
  'volume_ml',
  'price',
  'cost_usd_blue',
  'stock',
  'sold',
  'status',
  'created_at',
  'updated_at'
]

export const DISABLED_COLUMNS = ['created_at', 'updated_at', 'volume_ml']

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
