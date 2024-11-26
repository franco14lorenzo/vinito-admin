'use client'

import { useEffect, useState } from 'react'
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import { ChevronDown, Columns3, PlusCircle } from 'lucide-react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox' // Import Shadcn Checkbox
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  currentPage?: number
}

export function DataTable({
  columns,
  data,
  pageCount,
  currentPage = 1
}: DataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = useState<SortingState>([])
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
    }
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

  const table = useReactTable({
    data,
    columns,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
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

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Buscar"
          value={
            (table.getColumn('question')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('question')?.setFilterValue(event.target.value)
          }
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
                    /*   <span
                      key={statusItem}
                      className="inline-flex items-center rounded-sm border border-transparent bg-secondary px-1 py-0.5 text-xs font-normal text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {statusItem.charAt(0).toUpperCase() + statusItem.slice(1)}
                    </span> */
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
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => {
                      column.toggleVisibility(!!value)
                      handleColumnVisibilityChange(column.id!, !!value)
                    }}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
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
