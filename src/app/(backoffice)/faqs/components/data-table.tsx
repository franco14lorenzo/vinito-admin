'use client'

import { useEffect, useState } from 'react'
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

import type {
  ColumnsDefinition,
  FAQColumn
} from '@/app/(backoffice)/faqs/components/columns'
import { useCreateFAQ } from '@/app/(backoffice)/faqs/components/create-faq-context'
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
import { createClient } from '@/lib/supabase/client'

import { TableContent } from './table-content'
import { TableControls } from './table-controls'
import { TablePagination } from './table-pagination'

interface DataTableProps {
  columns: ColumnsDefinition
  data: FAQ[]
  pageCount: number
  totalRecords: number
  adminId: string
}

const supabase = createClient()

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

  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setColumnFilters((prev) => [
        ...prev.filter((filter) => filter.id !== 'status'),
        { id: 'status', value: statusParam.split(',') }
      ])
    } else {
      // Set default selected statuses if no status parameter exists
      const defaultStatuses = ['active', 'inactive', 'draft']
      setColumnFilters((prev) => [
        ...prev.filter((filter) => filter.id !== 'status'),
        { id: 'status', value: defaultStatuses }
      ])
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      current.set('status', defaultStatuses.join(','))
      router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }
  }, [searchParams, router, pathname])

  // Initialize currentPage as state
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get('page') || 1)
  )

  // Update currentPage when searchParams change
  useEffect(() => {
    const page = Number(searchParams.get('page') || 1)
    setCurrentPage(page)
  }, [searchParams])

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('page', String(page))
    if (!current.has('perPage')) {
      current.set('perPage', '10')
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

  const handlePerPageChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('perPage', value)
    current.set('page', '1')
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

  const handleColumnVisibilityChange = (columnId: string, value: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: value
    }))

    const visibleColumns = table
      .getAllColumns()
      .filter((column) => {
        if (column.id === columnId) return value
        return column.getIsVisible()
      })
      .map((column) => {
        const def = column.columnDef as FAQColumn
        return String(column.id ?? def.accessorKey ?? '')
      })
      .filter(Boolean)

    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('columns', visibleColumns.join(','))
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
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

    current.set('page', '1') // Reset to first page when sorting changes
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

  const { handleOpenChange } = useCreateFAQ() // Use context

  const handleEdit = (id: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('edit', String(id))
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
    handleOpenChange(true, String(id)) // Pass editId to handleOpenChange
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('faqs')
      .update({
        status: 'deleted',
        updated_by: Number(adminId),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('Error eliminando la FAQ')
      return
    }

    toast.success('FAQ eliminada correctamente')
    router.refresh()
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
        pageIndex: currentPage - 1,
        pageSize: Number(searchParams.get('perPage') || 10)
      }
    }
  })

  const selectedStatuses =
    (table.getColumn('status')?.getFilterValue() as string[]) || []

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (searchValue) {
        current.set('search', searchValue)
      } else {
        current.delete('search')
      }
      router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchValue, router, pathname, searchParams])

  const startRecord =
    (currentPage - 1) * Number(searchParams.get('perPage') || 10) + 1
  const endRecord = Math.min(
    currentPage * Number(searchParams.get('perPage') || 10),
    totalRecords
  )

  return (
    <div className="flex h-full flex-col">
      <TableControls
        table={table}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        selectedStatuses={selectedStatuses}
        handleColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <TableContent table={table} />

      <TablePagination
        currentPage={currentPage}
        pageCount={pageCount}
        startRecord={startRecord}
        endRecord={endRecord}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  )
}
