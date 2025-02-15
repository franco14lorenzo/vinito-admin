'use client'

import { type ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

import { type WineStockMovement } from '../types'

export type StockMovementColumn = ColumnDef<WineStockMovement, unknown> & {
  accessorKey?: keyof WineStockMovement
}

export const typeLabels = {
  entry: 'Entrada',
  out: 'Salida'
} as const

export const typeVariants = {
  entry: 'success',
  out: 'destructive'
} as const

export const columnsDefinition: StockMovementColumn[] = [
  {
    id: 'wine',
    header: 'Vino',
    cell: ({ row }) => row.original.wine?.name
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: 'Cantidad'
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as keyof typeof typeLabels
      return <Badge variant={typeVariants[type]}>{typeLabels[type]}</Badge>
    }
  },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: 'Notas'
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader<WineStockMovement> column={column} label="Fecha" />
    ),
    enableSorting: true,
    cell: ({ row }) => formatDate(row.getValue('created_at'))
  },
  {
    id: 'created_by',
    accessorKey: 'created_by',
    header: 'Creado por',
    cell: ({ row }) => {
      const admin = row.original.created_by
      return admin ? `${admin.name} ${admin.surname}` : ''
    }
  },
  {
    id: 'actions',
    enableHiding: false
  }
]

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
