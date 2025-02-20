'use client'

import { useState } from 'react'
import {
  ColumnFiltersState,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

import { DEFAULT_ORDER, FILTERS } from '../constants'
import { Payment } from '../types'

import { ColumnsDefinition, PaymentColumn } from './columns'
import { useEditPayment } from './edit-payment-context'

interface DataTableProps {
  columns: ColumnsDefinition
  data: Payment[]
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
  const { handleOpenChange } = useEditPayment()

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    return sortBy
      ? [{ id: sortBy, desc: sortOrder === 'desc' }]
      : [{ id: DEFAULT_ORDER.column, desc: !DEFAULT_ORDER.ascending }]
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const columnsFromParams = searchParams.get('columns') || ''
      const columnsArray = columnsFromParams.split(',').filter(Boolean)
      const visibilityState: VisibilityState = {}

      if (columnsArray.length > 0) {
        columns.forEach((column: PaymentColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          visibilityState[columnId] = columnsArray.includes(columnId)
        })
      } else {
        columns.forEach((column: PaymentColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''

          if (['actions'].includes(columnId)) {
            visibilityState[columnId] = false
          } else {
            visibilityState[columnId] = true
          }
        })
      }

      return visibilityState
    }
  )

  const handleEdit = (id: string | number) => {
    handleOpenChange(true, String(id))
  }

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue

    setSorting(newSorting)
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (newSorting.length > 0) {
      const sortItem = newSorting[0]
      if (sortItem && sortItem.id) {
        current.set('sortBy', sortItem.id)
        current.set('sortOrder', sortItem.desc ? 'desc' : 'asc')
      }
    } else {
      current.delete('sortBy')
      current.delete('sortOrder')
    }

    current.set('page', '1')
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

  const table = useReactTable({
    data,
    columns: columns.map((column: PaymentColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const payment = row.original as Payment
            return (
              <TableActionsDropdown
                id={payment.id}
                onEdit={() => handleEdit(payment.id)}
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
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: Number(searchParams.get('page') || 1) - 1,
        pageSize: Number(searchParams.get('perPage') || 10)
      }
    }
  })

  return (
    <div className="flex h-full flex-col">
      <TableControls<Payment> table={table} filters={FILTERS} />
      <TableContent table={table} />
      <TablePagination pageCount={pageCount} totalRecords={totalRecords || 0} />
    </div>
  )
}
