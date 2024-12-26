'use client'

import { ColumnDef } from '@tanstack/react-table'

import type { Accommodation } from '@/app/(backoffice)/alojamientos/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'

export type AccommodationColumn = ColumnDef<Accommodation, unknown> & {
  accessorKey?: keyof Accommodation
}

const columnsDefinition: AccommodationColumn[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <SortableHeader<Accommodation> column={column} label="Nombre" />
    ),
    enableSorting: true
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: 'Dirección',
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.getValue('address')}</div>
    )
  },
  {
    id: 'qr_code',
    accessorKey: 'qr_code',
    header: 'Código QR',
    cell: ({ row }) => (
      <div className="max-w-[200px]">{row.getValue('qr_code')}</div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader<Accommodation> column={column} label="Creado" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="px-4">{formatDate(row.getValue('created_at'))}</div>
    )
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <SortableHeader<Accommodation> column={column} label="Actualizado" />
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
