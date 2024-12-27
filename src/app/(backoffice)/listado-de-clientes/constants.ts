export const DEFAULT_COLUMNS = [
  'name',
  'surname',
  'email',
  'phone',
  'created_at',
  'updated_at'
]

export const DEFAULT_ORDER = {
  column: 'created_at',
  ascending: true
}

export const FILTERS = [
  {
    id: 'name',
    label: 'Nombre',
    options: [],
    defaultSelected: []
  },
  {
    id: 'surname',
    label: 'Apellido',
    options: [],
    defaultSelected: []
  },
  {
    id: 'email',
    label: 'Email',
    options: [],
    defaultSelected: []
  },
  {
    id: 'phone',
    label: 'Teléfono',
    options: [],
    defaultSelected: []
  }
]
