'use client'

import { type ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'

import { type PaymentMethod } from '../types'

export type PaymentMethodColumn = ColumnDef<PaymentMethod, unknown> & {
  accessorKey?: keyof PaymentMethod
}

export const columnsDefinition: PaymentMethodColumn[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Tipo'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Descripción'
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <SortableHeader<PaymentMethod> column={column} label="Actualizado" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="px-4">{formatDate(row.getValue('updated_at'))}</div>
    )
  },
  {
    id: 'actions',
    enableHiding: false
  }
]

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
