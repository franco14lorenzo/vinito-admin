'use client'

import { useEffect, useState } from 'react'
import { Table } from '@tanstack/react-table'
import { ChevronDown, Columns3, PlusCircle } from 'lucide-react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { StatusBadge } from '@/app/(backoffice)/faqs/components/columns'
import { STATUS_FILTERS } from '@/app/(backoffice)/faqs/constants'
import type { FAQ, FAQStatus } from '@/app/(backoffice)/faqs/types'
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

interface TableControlsProps {
  table: Table<FAQ>
  defaultSelectedStatuses?: string[]
}

export function TableControls({
  table,
  defaultSelectedStatuses = ['active', 'inactive', 'draft']
}: TableControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  )
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    const statusParam = searchParams.get('status')
    return statusParam ? statusParam.split(',') : defaultSelectedStatuses
  })

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
  }, [searchValue, router, pathname, searchParams])

  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (!statusParam) {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      current.set('status', defaultSelectedStatuses.join(','))
      router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }
  }, [searchParams, router, pathname, defaultSelectedStatuses])

  const handleStatusChange = (status: string, checked?: boolean) => {
    let filterValue: string[] = [...selectedStatuses]
    if (checked === undefined) {
      filterValue = selectedStatuses.includes(status)
        ? filterValue.filter((s) => s !== status)
        : [...filterValue, status]
    } else {
      filterValue = checked
        ? [...filterValue, status]
        : filterValue.filter((s) => s !== status)
    }

    setSelectedStatuses(filterValue)
    table
      .getColumn('status')
      ?.setFilterValue(filterValue.length ? filterValue : undefined)

    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (filterValue.length) {
      current.set('status', filterValue.join(','))
    } else {
      current.delete('status')
    }
    current.set('page', '1')
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
  }

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

  return (
    <div className="flex-none">
      <div className="flex flex-col items-center gap-2 py-4 md:flex-row">
        <Input
          placeholder="Buscar"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full flex-shrink-0 flex-grow md:max-w-44"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ScrollArea className="max-w-full place-self-start md:place-self-center">
              <Button
                variant="outline"
                className="flex w-fit items-center border-dashed"
              >
                <PlusCircle className="h-4 w-4" />
                Estados
                {selectedStatuses.length > 0 && (
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
                )}
              </Button>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-fit px-2">
            {STATUS_FILTERS.map((status) => {
              const isChecked = selectedStatuses.includes(status)
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="flex items-center"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleStatusChange(status, checked === true)
                    }
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
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
