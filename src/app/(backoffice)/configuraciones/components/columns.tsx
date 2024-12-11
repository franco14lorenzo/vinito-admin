'use client'

import { ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { formatDate } from '@/lib/utils'

import { Setting } from '../types'

export type SettingColumn = ColumnDef<Setting, unknown> & {
  accessorKey?: keyof Setting
}

const columnsDefinition: SettingColumn[] = [
  {
    id: 'key',
    accessorKey: 'key',
    header: 'Clave'
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: 'Valor'
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
      <SortableHeader<Setting> column={column} label="Actualizado" />
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
