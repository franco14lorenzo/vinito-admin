'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export type FAQ = {
  id: number
  question: string
  answer: string
  order: number
  status: 'draft' | 'active' | 'inactive' | 'deleted'
  created_at: string
}

// Definir el tipo específico para las columnas
export type FAQColumn = ColumnDef<FAQ, unknown> & {
  accessorKey?: keyof FAQ
}

// Modificar la definición de columnas para usar el tipo específico
const columnsDefinition: FAQColumn[] = [
  {
    id: 'order',
    accessorKey: 'order',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  {
    id: 'question',
    accessorKey: 'question',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Pregunta
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  {
    id: 'answer',
    accessorKey: 'answer',
    header: 'Respuesta',
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">{row.getValue('answer')}</div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <div className="capitalize">{status}</div>
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const faq = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(faq.id))}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit FAQ</DropdownMenuItem>
            <DropdownMenuItem>Delete FAQ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
