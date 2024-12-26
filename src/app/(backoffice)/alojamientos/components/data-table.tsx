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

import { deleteAccommodation } from '@/app/(backoffice)/alojamientos/actions'
import type {
  AccommodationColumn,
  ColumnsDefinition
} from '@/app/(backoffice)/alojamientos/components/columns'
import { useCreateAccommodation } from '@/app/(backoffice)/alojamientos/components/create-accommodation-context'
import { FILTERS } from '@/app/(backoffice)/alojamientos/constants'
import type { Accommodation } from '@/app/(backoffice)/alojamientos/types'
import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

interface DataTableProps {
  columns: ColumnsDefinition
  data: Accommodation[]
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

  const { handleOpenChange } = useCreateAccommodation()

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    return sortBy
      ? [{ id: sortBy, desc: sortOrder === 'desc' }]
      : [{ id: 'name', desc: false }]
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const columnsFromParams = searchParams.get('columns') || ''
      const columnsArray = columnsFromParams.split(',').filter(Boolean)
      const visibilityState: VisibilityState = {}

      if (columnsArray.length > 0) {
        columns.forEach((column: AccommodationColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          visibilityState[columnId] = columnsArray.includes(columnId)
        })
      } else {
        columns.forEach((column: AccommodationColumn) => {
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
    handleOpenChange(true, String(id))
  }

  const handleDelete = async (id: string | number) => {
    try {
      await deleteAccommodation(String(id), Number(adminId))
      toast.success('Accommodation eliminada correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error eliminando la Accommodation')
    }
  }

  const table = useReactTable({
    data,
    columns: columns.map((column: AccommodationColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const accommodation = row.original as Accommodation
            return (
              <TableActionsDropdown
                id={accommodation.id}
                onEdit={() => handleEdit(accommodation.id)}
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
      <TableControls<Accommodation> table={table} filters={FILTERS} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords} />
    </div>
  )
}
