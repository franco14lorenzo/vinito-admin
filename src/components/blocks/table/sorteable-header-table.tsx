'use client'
import { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface SortableHeaderProps<T> {
  column: Column<T>
  label: string
}

function SortableHeader<T>({ column, label }: SortableHeaderProps<T>) {
  const isAsc = column.getIsSorted() === 'asc'
  const isDesc = column.getIsSorted() === 'desc'
  const isSorted = isAsc || isDesc

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'} className="flex items-center gap-1">
          {label}
          <div className="ml-1 flex items-center">
            {isAsc && <ArrowUp className="h-4 w-4 text-muted-foreground/30" />}
            {isDesc && (
              <ArrowDown className="h-4 w-4 text-muted-foreground/30" />
            )}
            {!isSorted && <ArrowUp className="h-4 w-4" />}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => column.toggleSorting(false)}
          disabled={isAsc}
          className="flex items-center gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          Ascendente
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => column.toggleSorting(true)}
          disabled={isDesc}
          className="flex items-center gap-2"
        >
          <ArrowDown className="h-4 w-4" />
          Descendente
        </DropdownMenuItem>
        {isSorted && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => column.clearSorting()}
              className="flex items-center gap-2"
            >
              Quitar orden
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SortableHeader
