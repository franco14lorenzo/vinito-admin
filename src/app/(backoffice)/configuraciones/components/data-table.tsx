'use client'

import * as React from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  ColumnsDefinition,
  SettingColumn
} from '@/app/(backoffice)/configuraciones/components/columns'
import { Setting } from '@/app/(backoffice)/configuraciones/types'
import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

import { useCreateSetting } from './edit-setting-context'

interface DataTableProps {
  columns: ColumnsDefinition
  data: Setting[]
  pageCount: number
  totalRecords?: number
}

export function DataTable({
  columns,
  data,
  pageCount,
  totalRecords
}: DataTableProps) {
  const { handleOpenChange } = useCreateSetting()

  const handleEdit = (id: string | number) => {
    handleOpenChange(true, String(id))
  }

  const table = useReactTable({
    data,
    columns: columns.map((column: SettingColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const setting = row.original as Setting
            return (
              <TableActionsDropdown
                id={setting.id}
                onEdit={() => handleEdit(setting.id)}
              />
            )
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
      <TableControls<Setting> table={table} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords || 0} />
    </div>
  )
}
