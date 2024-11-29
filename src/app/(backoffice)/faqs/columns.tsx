'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export type FAQStatus = 'draft' | 'active' | 'inactive' | 'deleted'

export type FAQ = {
  id: number
  question: string
  answer: string
  order: number
  status: FAQStatus
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
    header: ({ column }) => {
      const isAsc = column.getIsSorted() === 'asc'
      const isDesc = column.getIsSorted() === 'desc'

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              Orden{isAsc && <ArrowDown className="h-4 w-4" />}
              {isDesc && <ArrowUp className="h-4 w-4" />}
              {!isAsc && !isDesc && <ArrowUp className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
              disabled={isAsc}
              className="flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Ascendente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
              disabled={isDesc}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Descendente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('order')}</div>
    )
  },
  {
    id: 'question',
    accessorKey: 'question',
    header: 'Pregunta',
    enableSorting: true
  },
  {
    id: 'answer',
    accessorKey: 'answer',
    header: 'Respuesta',
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.getValue('answer')}</div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />
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
            <DropdownMenuItem>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash className="h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export function StatusBadge({ status }: { status: FAQStatus }) {
  const statusConfig = {
    active: {
      label: 'Activo',
      icon: CheckCircle2,
      variant: 'success'
    },
    draft: {
      label: 'Borrador',
      icon: Clock,
      variant: 'secondary'
    },
    inactive: {
      label: 'Inactivo',
      icon: AlertCircle,
      variant: 'warning'
    },
    deleted: {
      label: 'Eliminado',
      icon: XCircle,
      variant: 'destructive'
    }
  }

  const config = statusConfig[status]
  if (!config) return null // Add this check

  const Icon = config.icon

  return (
    <Badge
      variant={
        config.variant as 'success' | 'warning' | 'secondary' | 'destructive'
      }
      className="gap-1"
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </Badge>
  )
}

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
