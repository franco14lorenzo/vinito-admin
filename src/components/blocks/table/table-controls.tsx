'use client'

import React, { useEffect, useState } from 'react'
import { Column, Header, Table } from '@tanstack/react-table'
import { ChevronDown, Columns3, PlusCircle } from 'lucide-react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  STATUS_FILTERS as ORDER_STATUS_LABELS,
  STATUS_VARIANTS
} from '@/app/(backoffice)/ordenes/constants'
import {
  PAYMENTS_STATUS_LABELS,
  STATUS_VARIANTS as PAYMENTS_STATUS_VARIANTS
} from '@/app/(backoffice)/pagos/constants'
import { PaymentStatus } from '@/app/(backoffice)/pagos/types'
import { StatusBadge } from '@/components/status-badge'
import { Badge, BadgeProps } from '@/components/ui/badge'
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
  table?: string
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
  const [selectedFilterValues, setSelectedFilterValues] = useState<
    Record<string, string[]>
  >(() => {
    const initialFilters: Record<string, string[]> = {}
    filters.forEach((filter) => {
      const filterParam = searchParams.get(filter.id)
      const defaultValues = filter.defaultSelected || []
      initialFilters[filter.id] = filterParam
        ? filterParam.split(',')
        : defaultValues
    })
    return initialFilters
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

    const firstFilter = filters[0]
    if (!firstFilter) return

    const filterParam = searchParams.get(firstFilter.id)
    if (!filterParam) {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      const defaultValues = firstFilter.defaultSelected || []

      if (defaultValues.length > 0) {
        current.set(firstFilter.id, defaultValues.join(','))
        router.push(`${pathname}?${current.toString()}`, { scroll: false })
      }
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
    let filterValue: string[] = [...(selectedFilterValues[filterId] || [])]
    if (checked === undefined) {
      filterValue = filterValue.includes(option)
        ? filterValue.filter((s) => s !== option)
        : [...filterValue, option]
    } else {
      filterValue = checked
        ? [...filterValue, option]
        : filterValue.filter((s) => s !== option)
    }

    setSelectedFilterValues((prev) => ({
      ...prev,
      [filterId]: filterValue
    }))

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

        {filters.map((filter) => {
          const selectedValuesForFilter = selectedFilterValues[filter.id] || []

          return (
            <DropdownMenu key={filter.id}>
              <DropdownMenuTrigger asChild>
                <ScrollArea className="max-w-full place-self-start md:place-self-center">
                  <Button
                    variant="outline"
                    className="flex w-fit items-center border-dashed"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {filter.label}
                    {selectedValuesForFilter.length > 0 && (
                      <>
                        <div
                          data-orientation="vertical"
                          role="none"
                          className="mx-2 h-4 w-[1px] shrink-0 bg-border"
                        />
                        {selectedValuesForFilter.map((filterValue) => {
                          if (renderFilterBadge) {
                            return renderFilterBadge(filterValue)
                          }

                          if (filter.id === 'type') {
                            return (
                              <Badge
                                key={filterValue}
                                variant={
                                  filterValue === 'entry'
                                    ? 'success'
                                    : 'destructive'
                                }
                              >
                                {filterValue === 'entry' ? 'Entrada' : 'Salida'}
                              </Badge>
                            )
                          }

                          if (filter?.table === 'payments') {
                            return (
                              <Badge
                                key={filterValue}
                                variant={
                                  PAYMENTS_STATUS_VARIANTS[
                                    filterValue as PaymentStatus
                                  ]
                                }
                              >
                                {
                                  PAYMENTS_STATUS_LABELS.find(
                                    (status) => status.value === filterValue
                                  )?.label
                                }
                              </Badge>
                            )
                          }

                          if (filter?.table === 'orders') {
                            return (
                              <Badge
                                key={filterValue}
                                variant={
                                  STATUS_VARIANTS[
                                    filterValue as keyof typeof STATUS_VARIANTS
                                  ] as BadgeProps['variant']
                                }
                              >
                                {
                                  ORDER_STATUS_LABELS.find(
                                    (status) => status.value === filterValue
                                  )?.label
                                }
                              </Badge>
                            )
                          }

                          if (filter.id === 'status') {
                            return (
                              <StatusBadge
                                key={filterValue}
                                status={
                                  filterValue as 'active' | 'inactive' | 'draft'
                                }
                              />
                            )
                          }

                          const option = filter.options.find(
                            (opt) => opt.value === filterValue
                          )
                          return (
                            <span
                              key={filterValue}
                              className={option?.className}
                            >
                              {option?.label || filterValue}
                            </span>
                          )
                        })}
                      </>
                    )}
                  </Button>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-fit px-2">
                {filter.options.map((option) => {
                  const isChecked = selectedValuesForFilter.includes(
                    option.value
                  )
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() =>
                        handleFilterChange(filter.id, option.value)
                      }
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
                      {filter?.table === 'payments' ? (
                        <Badge
                          variant={
                            PAYMENTS_STATUS_VARIANTS[
                              option.value as PaymentStatus
                            ]
                          }
                        >
                          {
                            PAYMENTS_STATUS_LABELS.find(
                              (status) => status.value === option.value
                            )?.label
                          }
                        </Badge>
                      ) : filter?.table === 'orders' ? (
                        <Badge
                          variant={
                            STATUS_VARIANTS[
                              option.value as keyof typeof STATUS_VARIANTS
                            ] as BadgeProps['variant']
                          }
                        >
                          {
                            ORDER_STATUS_LABELS.find(
                              (status) => status.value === option.value
                            )?.label
                          }
                        </Badge>
                      ) : renderFilterBadge ? (
                        renderFilterBadge(option.value)
                      ) : (
                        <span className={option.className}>{option.label}</span>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}

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
