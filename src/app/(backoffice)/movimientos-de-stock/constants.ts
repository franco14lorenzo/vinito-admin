export const DEFAULT_COLUMNS = [
  'wine',
  'quantity',
  'type',
  'notes',
  'created_at',
  'created_by'
]

export const DEFAULT_ORDER = {
  column: 'created_at',
  ascending: false
}

export const TYPE_FILTERS = [
  { label: 'Entrada', value: 'entry' },
  { label: 'Salida', value: 'out' }
]

export const FILTERS = [
  {
    id: 'type',
    label: 'Tipo',
    options: TYPE_FILTERS,
    defaultSelected: ['entry', 'out']
  }
]
