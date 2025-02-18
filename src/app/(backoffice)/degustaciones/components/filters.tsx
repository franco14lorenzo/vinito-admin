'use client'

import React from 'react'
import { ChevronDown, PlusCircle } from 'lucide-react'

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

import { TastingStatus } from '../types'

import { useFilters } from './filters-context'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activa' },
  { value: 'inactive', label: 'Inactiva' }
] as const

export function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } =
    useFilters()

  const handleStatusChange = (status: TastingStatus) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter((s) => s !== status)
      : [...statusFilter, status]

    setStatusFilter(newStatusFilter)

    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (newStatusFilter.length > 0) {
      current.set('status', newStatusFilter.join(','))
    } else {
      current.delete('status')
    }
    router.push(`${pathname}?${current.toString()}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)

    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (value) {
      current.set('search', value)
    } else {
      current.delete('search')
    }
    router.push(`${pathname}?${current.toString()}`)
  }

  return (
    <div className="flex flex-col items-center gap-2 py-4 md:flex-row">
      <Input
        placeholder="Buscar degustaciones..."
        value={searchTerm}
        onChange={handleSearchChange}
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
              Estado
              {statusFilter.length > 0 && (
                <>
                  <div
                    data-orientation="vertical"
                    role="none"
                    className="mx-2 h-4 w-[1px] shrink-0 bg-border"
                  />
                  {statusFilter.map((status) => (
                    <StatusBadge
                      key={status}
                      status={status as 'draft' | 'active' | 'inactive'}
                    />
                  ))}
                </>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-fit px-2">
          {STATUS_OPTIONS.map((option) => {
            const isChecked = statusFilter.includes(option.value)
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className="flex items-center"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleStatusChange(option.value)}
                  className="mr-2"
                />
                <StatusBadge status={option.value} />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
