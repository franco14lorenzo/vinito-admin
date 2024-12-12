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

import {
  DEFAULT_ORDER,
  FILTERS
} from '@/app/(backoffice)/metodos-de-pago/constants'
import type { PaymentMethod } from '@/app/(backoffice)/metodos-de-pago/types'
import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

/* import { deletePaymentMethod } from '../actions' */
import type { ColumnsDefinition, PaymentMethodColumn } from './columns'
import { useEditPaymentMethod } from './edit-payment-method-context'

interface DataTableProps {
  columns: ColumnsDefinition
  data: PaymentMethod[]
  pageCount: number
  totalRecords: number
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

  const { handleOpenChange } = useEditPaymentMethod()

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

      columns.forEach((column: PaymentMethodColumn) => {
        const columnId = column.id ?? column.accessorKey ?? ''
        visibilityState[columnId] =
          columnsArray.length === 0 || columnsArray.includes(columnId)
      })

      return visibilityState
    }
  )

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

  const handleEdit = (id: string | number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('edit', String(id))
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
    handleOpenChange(true, String(id))
  }

  /*  const handleDelete = async (id: string | number) => {
    try {
      await deletePaymentMethod(Number(id))
      toast.success('Método de pago eliminado correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error eliminando el método de pago')
    }
  } */

  const table = useReactTable({
    data,
    columns: columns.map((column: PaymentMethodColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const paymentMethod = row.original as PaymentMethod
            return (
              <TableActionsDropdown
                id={paymentMethod.id}
                onEdit={handleEdit}
                /*    onDelete={handleDelete} */
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
      <TableControls table={table} filters={FILTERS} />
      <TableContent table={table} />
      <TablePagination pageCount={pageCount} totalRecords={totalRecords} />
    </div>
  )
}
