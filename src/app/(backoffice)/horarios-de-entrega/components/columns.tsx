'use client'

import { ColumnDef } from '@tanstack/react-table'

import type { DeliverySchedule } from '@/app/(backoffice)/horarios-de-entrega/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'

export type DeliveryScheduleColumn = ColumnDef<DeliverySchedule, unknown> & {
  accessorKey?: keyof DeliverySchedule
}

const columnsDefinition: DeliveryScheduleColumn[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Nombre',
    enableSorting: true
  },
  {
    id: 'start_time',
    accessorKey: 'start_time',
    header: 'Hora de Inicio',
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('start_time')}</div>
    )
  },
  {
    id: 'end_time',
    accessorKey: 'end_time',
    header: 'Hora de Fin',
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('end_time')}</div>
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
      <SortableHeader<DeliverySchedule> column={column} label="Creado" />
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
      <SortableHeader<DeliverySchedule> column={column} label="Actualizado" />
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
