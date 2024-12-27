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

import { deleteDeliverySchedule } from '@/app/(backoffice)/horarios-de-entrega/actions'
import type {
  ColumnsDefinition,
  DeliveryScheduleColumn
} from '@/app/(backoffice)/horarios-de-entrega/components/columns'
import { useCreateDeliverySchedule } from '@/app/(backoffice)/horarios-de-entrega/components/create-delivery-schedule-context'
import { FILTERS } from '@/app/(backoffice)/horarios-de-entrega/constants'
import type { DeliverySchedule } from '@/app/(backoffice)/horarios-de-entrega/types'
import { TableActionsDropdown } from '@/components/blocks/table/table-actions-dropdown'
import { TableContent } from '@/components/blocks/table/table-content'
import { TableControls } from '@/components/blocks/table/table-controls'
import { TablePagination } from '@/components/blocks/table/table-pagination'

interface DataTableProps {
  columns: ColumnsDefinition
  data: DeliverySchedule[]
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

  const { handleOpenChange } = useCreateDeliverySchedule()

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
        columns.forEach((column: DeliveryScheduleColumn) => {
          const columnId = column.id ?? column.accessorKey ?? ''
          visibilityState[columnId] = columnsArray.includes(columnId)
        })
      } else {
        columns.forEach((column: DeliveryScheduleColumn) => {
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
      await deleteDeliverySchedule(Number(id), Number(adminId))
      toast.success('Horario de entrega eliminado correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error eliminando el horario de entrega')
    }
  }

  const table = useReactTable({
    data,
    columns: columns.map((column: DeliveryScheduleColumn) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }) => {
            const schedule = row.original as DeliverySchedule
            return (
              <TableActionsDropdown
                id={schedule.id}
                onEdit={() => handleEdit(schedule.id)}
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
      <TableControls<DeliverySchedule> table={table} filters={FILTERS} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords} />
    </div>
  )
}
