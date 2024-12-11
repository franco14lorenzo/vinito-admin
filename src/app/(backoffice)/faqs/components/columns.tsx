'use client'

import { ColumnDef } from '@tanstack/react-table'

import type { FAQ } from '@/app/(backoffice)/faqs/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'

export type FAQColumn = ColumnDef<FAQ, unknown> & {
  accessorKey?: keyof FAQ
}

const columnsDefinition: FAQColumn[] = [
  {
    id: 'order',
    accessorKey: 'order',
    header: ({ column }) => (
      <SortableHeader<FAQ> column={column} label="Orden" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('order')}</div>
    )
  },
  {
    id: 'question',
    accessorKey: 'question',
    header: 'Pregunta',
    enableSorting: true
  },
  {
    id: 'answer',
    accessorKey: 'answer',
    header: 'Respuesta',
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.getValue('answer')}</div>
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
      <SortableHeader<FAQ> column={column} label="Creado" />
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
      <SortableHeader<FAQ> column={column} label="Actualizado" />
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
