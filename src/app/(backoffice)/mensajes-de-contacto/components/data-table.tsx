'use client'

import * as React from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  ColumnsDefinition,
  ContactColumn
} from '@/app/(backoffice)/mensajes-de-contacto/components/columns'
import { Contact } from '@/app/(backoffice)/mensajes-de-contacto/types'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

import { TableActionsContactMessagesDropdown } from './table-actions-dropdown'

interface DataTableProps {
  columns: ColumnsDefinition
  data: Contact[]
  pageCount: number
  totalRecords?: number
}

export function DataTable({
  columns,
  data,
  pageCount,
  totalRecords
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns: columns.map((column: ContactColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const contact = row.original as Contact
            return <TableActionsContactMessagesDropdown id={contact.id} />
          }
        }
      }
      return column
    }),
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <div className="flex h-full flex-col">
      <TableControls<Contact> table={table} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords || 0} />
    </div>
  )
}
