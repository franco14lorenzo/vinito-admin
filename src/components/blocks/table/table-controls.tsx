'use client'

import React, { useEffect, useState } from 'react'
import { Column, Header, Table } from '@tanstack/react-table'
import { ChevronDown, Columns3, PlusCircle } from 'lucide-react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface FilterType {
  id: string
  label: string
  options: Array<{
    value: string
    label: string
    className?: string
  }>
  defaultSelected?: string[]
}

interface TableControlsProps<TData> {
  table: Table<TData>
  filters?: FilterType[]
  renderFilterBadge?: (value: string) => React.ReactNode
}

export function TableControls<TData>({
  table,
  filters = [],
  renderFilterBadge
}: TableControlsProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  )
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    const statusParam = searchParams.get('status')
    const defaultStatuses =
      filters.find((filter) => filter.id === 'status')?.defaultSelected || []
    return statusParam ? statusParam.split(',') : defaultStatuses
  })

  const getColumnLabel = (column: Column<TData, unknown>) => {
    const header = column.columnDef.header
    if (typeof header === 'string') return header
    if (typeof header === 'function') {
      const props = header({
        column,
        header: column.columnDef.header as unknown as Header<TData, unknown>,
        table
      })
      return React.isValidElement(props) &&
        'props' in props &&
        typeof props.props === 'object' &&
        props.props !== null &&
        'label' in (props.props as object)
        ? (props.props as { label: string }).label
        : column.id
    }
    return column.id
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (searchValue) {
        current.set('search', searchValue)
      } else {
        current.delete('search')
      }
      current.set('page', '1')
      router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }, 300)

    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  useEffect(() => {
    if (filters.length === 0) return
    const statusParam = searchParams.get('status')
    if (!statusParam) {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      const defaultStatuses = filters.find((filter) => filter.id === 'status')
        ?.defaultSelected || ['active', 'inactive', 'draft']
      current.set('status', defaultStatuses.join(','))
      router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }
  }, [searchParams, router, pathname, filters])

  const handleColumnVisibilityChange = (columnId: string, value: boolean) => {
    const visibleColumns = table
      .getAllColumns()
      .filter((column) => {
        if (column.id === columnId) return value
        return column.getIsVisible()
      })
      .map((column) => column.id)
      .filter(Boolean)

    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('columns', visibleColumns.join(','))
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

  const handleFilterChange = (
    filterId: string,
    option: string,
    checked?: boolean
  ) => {
    let filterValue: string[] = [...selectedStatuses]
    if (checked === undefined) {
      filterValue = selectedStatuses.includes(option)
        ? filterValue.filter((s) => s !== option)
        : [...filterValue, option]
    } else {
      filterValue = checked
        ? [...filterValue, option]
        : filterValue.filter((s) => s !== option)
    }

    setSelectedStatuses(filterValue)
    table
      .getColumn(filterId)
      ?.setFilterValue(filterValue.length ? filterValue : undefined)

    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (filterValue.length) {
      current.set(filterId, filterValue.join(','))
    } else {
      current.delete(filterId)
    }
    current.set('page', '1')
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

  return (
    <div className="flex-none">
      <div className="flex flex-col items-center gap-2 py-4 md:flex-row">
        <Input
          placeholder="Buscar"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full flex-shrink-0 flex-grow md:max-w-44"
        />

        {filters.map((filter) => (
          <DropdownMenu key={filter.id}>
            <DropdownMenuTrigger asChild>
              <ScrollArea className="max-w-full place-self-start md:place-self-center">
                <Button
                  variant="outline"
                  className="flex w-fit items-center border-dashed"
                >
                  <PlusCircle className="h-4 w-4" />
                  {filter.label}
                  {selectedStatuses.length > 0 && (
                    <>
                      <div
                        data-orientation="vertical"
                        role="none"
                        className="mx-2 h-4 w-[1px] shrink-0 bg-border"
                      />
                      {selectedStatuses.map((statusValue) =>
                        renderFilterBadge ? (
                          renderFilterBadge(statusValue)
                        ) : (
                          <StatusBadge
                            key={statusValue}
                            status={
                              statusValue as 'active' | 'inactive' | 'draft'
                            }
                          />
                        )
                      )}
                    </>
                  )}
                </Button>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-fit px-2">
              {filter.options.map((option) => {
                const isChecked = selectedStatuses.includes(option.value)
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange(filter.id, option.value)}
                    className="flex items-center"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          filter.id,
                          option.value,
                          checked === true
                        )
                      }
                      className="mr-0.5"
                    />
                    {renderFilterBadge ? (
                      renderFilterBadge(option.value)
                    ) : (
                      <span className={option.className}>{option.label}</span>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto w-full md:w-fit">
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
                    {getColumnLabel(column)}
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
