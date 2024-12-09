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
import { Copy, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { deleteFAQ } from '@/app/(backoffice)/faqs/actions'
import type {
  ColumnsDefinition,
  FAQColumn
} from '@/app/(backoffice)/faqs/components/columns'
import { useCreateFAQ } from '@/app/(backoffice)/faqs/components/create-faq-context'
import { TableContent } from '@/app/(backoffice)/faqs/components/table-content'
import { TableControls } from '@/app/(backoffice)/faqs/components/table-controls'
import { TablePagination } from '@/app/(backoffice)/faqs/components/table-pagination'
import type { FAQ } from '@/app/(backoffice)/faqs/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { STATUS_FILTERS } from '../constants'

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

  const handleEdit = (id: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('edit', String(id))
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
    handleOpenChange(true, String(id)) // Pass editId to handleOpenChange
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteFAQ(id, Number(adminId))
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(String(faq.id))
                      toast.success('ID copiado al portapapeles')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(faq.id)}>
                    <Pencil className="h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(faq.id)}>
                    <Trash className="h-4 w-4" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      <TableControls table={table} defaultSelectedStatuses={STATUS_FILTERS} />

      <TableContent table={table} />

      <TablePagination pageCount={pageCount} totalRecords={totalRecords} />
    </div>
  )
}
