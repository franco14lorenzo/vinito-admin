'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select'

interface TablePaginationProps {
  currentPage: number
  pageCount: number
  startRecord: number
  endRecord: number
  totalRecords: number
  onPageChange: (page: number) => void
  onPerPageChange: (value: string) => void
}

export function TablePagination({
  currentPage,
  pageCount,
  startRecord,
  endRecord,
  totalRecords,
  onPageChange,
  onPerPageChange
}: TablePaginationProps) {
  const searchParams = useSearchParams()

  return (
    <div className="flex-none pt-4">
      <div className="flex w-full items-center justify-end">
        <div className="flex items-center space-x-2">
          <Select
            value={searchParams.get('perPage') || '10'}
            onValueChange={onPerPageChange}
          >
            <SelectTrigger className="h-8 w-fit text-xs text-muted-foreground">
              <span className="font-semibold">
                {searchParams.get('perPage') || '10'}
              </span>{' '}
              por página
            </SelectTrigger>
            <SelectContent side="top" className="text-xs">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem
                  className="text-xs"
                  key={pageSize}
                  value={pageSize.toString()}
                >
                  {pageSize} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 rounded-md border border-input pl-2">
            <div className="text-xs text-muted-foreground">
              <span className="mr-1 font-semibold">
                {startRecord}-{endRecord}
              </span>
              de {totalRecords}
            </div>

            <div className="flex items-center border-l border-input">
              <Button
                className="aspect-square p-0"
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                className="aspect-square p-0"
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= pageCount}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
