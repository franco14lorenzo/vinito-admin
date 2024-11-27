'use client'

import { useEffect, useState } from 'react'
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import { ChevronDown, Columns3, PlusCircle } from 'lucide-react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox' // Import Shadcn Checkbox
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import type { ColumnsDefinition, FAQ, FAQColumn, FAQStatus } from './columns'
import { StatusBadge } from './columns'

interface DataTableProps {
  columns: ColumnsDefinition
  data: FAQ[]
  pageCount: number
}

export function DataTable({ columns, data, pageCount }: DataTableProps) {
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

  const table = useReactTable({
    data,
    columns,
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

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Buscar"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex w-fit items-center border-dashed"
            >
              <PlusCircle className="h-4 w-4" />
              Estados
              {selectedStatuses.length > 0 ? (
                <>
                  <div
                    data-orientation="vertical"
                    role="none"
                    className="mx-2 h-4 w-[1px] shrink-0 bg-border"
                  />
                  {selectedStatuses.map((statusItem) => (
                    <StatusBadge
                      status={statusItem as FAQStatus}
                      key={statusItem}
                    />
                  ))}
                </>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-fit px-2">
            {['active', 'draft', 'inactive', 'deleted'].map((status) => {
              const isChecked = selectedStatuses.includes(status)

              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => {
                    let filterValue: string[] = [...selectedStatuses]
                    if (isChecked) {
                      filterValue = filterValue.filter((s) => s !== status)
                    } else {
                      filterValue.push(status)
                    }

                    table
                      .getColumn('status')
                      ?.setFilterValue(
                        filterValue.length ? filterValue : undefined
                      )

                    const current = new URLSearchParams(
                      Array.from(searchParams.entries())
                    )
                    if (filterValue.length) {
                      current.set('status', filterValue.join(','))
                    } else {
                      current.delete('status')
                    }
                    current.set('page', '1')
                    router.push(`${pathname}?${current.toString()}`, {
                      scroll: false
                    })
                  }}
                  className="flex items-center"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let filterValue: string[] = [...selectedStatuses]
                      if (checked) {
                        filterValue.push(status)
                      } else {
                        filterValue = filterValue.filter((s) => s !== status)
                      }

                      table
                        .getColumn('status')
                        ?.setFilterValue(
                          filterValue.length ? filterValue : undefined
                        )

                      const current = new URLSearchParams(
                        Array.from(searchParams.entries())
                      )
                      if (filterValue.length) {
                        current.set('status', filterValue.join(','))
                      } else {
                        current.delete('status')
                      }
                      current.set('page', '1')
                      router.push(`${pathname}?${current.toString()}`, {
                        scroll: false
                      })
                    }}
                    className="mr-0.5"
                  />
                  <StatusBadge status={status as FAQStatus} />
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Columns3 className="h-4 w-4" />
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                if (column.id === 'order') return null
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="flex items-center capitalize"
                    onClick={() => {
                      const newValue = !column.getIsVisible()
                      column.toggleVisibility(newValue)
                      handleColumnVisibilityChange(column.id!, newValue)
                    }}
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) => {
                        column.toggleVisibility(!!checked)
                        handleColumnVisibilityChange(column.id!, !!checked)
                      }}
                      className="mr-2"
                    />
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Registros por página</p>
            <Select
              value={searchParams.get('perPage') || '10'}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                {searchParams.get('perPage') || '10'}
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
