'use client'

import { ColumnDef } from '@tanstack/react-table'

import type { Customer } from '@/app/(backoffice)/listado-de-clientes/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { formatDate } from '@/lib/utils'

export type CustomerColumn = ColumnDef<Customer, unknown> & {
  accessorKey?: keyof Customer
}

const columnsDefinition: CustomerColumn[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Nombre',
    enableSorting: true
  },
  {
    id: 'surname',
    accessorKey: 'surname',
    header: 'Apellido',
    enableSorting: true
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Teléfono',
    enableSorting: true
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader<Customer> column={column} label="Creado" />
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
      <SortableHeader<Customer> column={column} label="Actualizado" />
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
