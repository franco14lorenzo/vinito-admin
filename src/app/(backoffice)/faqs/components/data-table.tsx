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
import { toast } from 'sonner'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { deleteFAQ } from '@/app/(backoffice)/faqs/actions'
import type {
  ColumnsDefinition,
  FAQColumn
} from '@/app/(backoffice)/faqs/components/columns'
import { useCreateFAQ } from '@/app/(backoffice)/faqs/components/create-faq-context'
import { STATUS_FILTERS } from '@/app/(backoffice)/faqs/constants'
import type { FAQ } from '@/app/(backoffice)/faqs/types'
import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

interface DataTableProps {
  columns: ColumnsDefinition
  data: FAQ[]
  pageCount: number
  totalRecords: number
  adminId: string
}

export function DataTable({
  columns,
  data,
  pageCount,
  totalRecords,
  adminId
}: DataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { handleOpenChange } = useCreateFAQ()

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    return sortBy
      ? [{ id: sortBy, desc: sortOrder === 'desc' }]
      : [{ id: 'order', desc: false }]
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const columnsFromParams = searchParams.get('columns') || ''
      const columnsArray = columnsFromParams.split(',').filter(Boolean)
      const visibilityState: VisibilityState = {}

      if (columnsArray.length > 0) {
        columns.forEach((column: FAQColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          visibilityState[columnId] = columnsArray.includes(columnId)
        })
      } else {
        columns.forEach((column: FAQColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          visibilityState[columnId] = true
        })
      }

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

  const handleDelete = async (id: string | number) => {
    try {
      await deleteFAQ(Number(id), Number(adminId))
      toast.success('FAQ eliminada correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error eliminando la FAQ')
    }
  }

  const table = useReactTable({
    data,
    columns: columns.map((column: FAQColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const faq = row.original as FAQ
            return (
              <TableActionsDropdown
                id={faq.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

  const filters = [
    {
      id: 'status',
      label: 'Estados',
      options: STATUS_FILTERS,
      defaultSelected: ['active', 'inactive', 'draft']
    }
  ]

  return (
    <div className="flex h-full flex-col">
      <TableControls<FAQ> table={table} filters={filters} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords} />
    </div>
  )
}
