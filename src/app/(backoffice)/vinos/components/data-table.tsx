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

import { deleteWine } from '@/app/(backoffice)/vinos/actions'
import {
  ColumnsDefinition,
  WineColumn
} from '@/app/(backoffice)/vinos/components/columns'
import { useCreateWine } from '@/app/(backoffice)/vinos/components/create-wine-context'
import { DISABLED_COLUMNS, FILTERS } from '@/app/(backoffice)/vinos/constants'
import { Wine } from '@/app/(backoffice)/vinos/types'
import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

interface DataTableProps {
  columns: ColumnsDefinition
  data: Wine[]
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

  const { handleOpenChange } = useCreateWine()

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    return sortBy
      ? [{ id: sortBy, desc: sortOrder === 'desc' }]
      : [{ id: 'year', desc: false }]
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const columnsFromParams = searchParams.get('columns') || ''
      const columnsArray = columnsFromParams.split(',').filter(Boolean)
      const visibilityState: VisibilityState = {}

      if (columnsArray.length > 0) {
        columns.forEach((column: WineColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          visibilityState[columnId] = columnsArray.includes(columnId)
        })
      } else {
        columns.forEach((column: WineColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          // Definimos las columnas que queremos ocultar por defecto
          if (DISABLED_COLUMNS.includes(columnId)) {
            visibilityState[columnId] = false
          } else {
            visibilityState[columnId] = true
          }
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
    handleOpenChange(true, String(id))
  }

  const handleDelete = async (id: string | number) => {
    try {
      await deleteWine(Number(id), Number(adminId))
      toast.success('Wine deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error deleting the wine')
    }
  }

  const table = useReactTable({
    data,
    columns: columns.map((column: WineColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const wine = row.original as Wine
            return (
              <TableActionsDropdown
                id={wine.id}
                onEdit={() => handleEdit(wine.id)}
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

  return (
    <div className="flex h-full flex-col">
      <TableControls<Wine> table={table} filters={FILTERS} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords} />
    </div>
  )
}
