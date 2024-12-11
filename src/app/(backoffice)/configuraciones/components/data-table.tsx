'use client'

import * as React from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { handleOpenChange } = useCreateSetting()

  const handleEdit = (id: string | number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('edit', String(id))
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
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
            return <TableActionsDropdown id={setting.id} onEdit={handleEdit} />
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
