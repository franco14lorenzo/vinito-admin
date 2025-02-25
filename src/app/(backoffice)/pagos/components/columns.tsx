'use client'

import { ColumnDef } from '@tanstack/react-table'

import Link from 'next/link'

import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

import { PAYMENTS_STATUS_LABELS, STATUS_VARIANTS } from '../constants'
import { Payment } from '../types'

export type PaymentColumn = ColumnDef<Payment, unknown> & {
  accessorKey?: keyof Payment
}

const columnsDefinition: PaymentColumn[] = [
  {
    id: 'order_id',
    accessorKey: 'order_id',
    header: 'Orden ID',
    cell: ({ row }) => (
      <Button variant="link" className="p-0" asChild>
        <Link
          href={`ordenes?page=1&status=pending%2Cprocessing%2Cshipped%2Cdelivered%2Ccancelled&search=${row.getValue(
            'order_id'
          )}`}
        >
          {row.getValue('order_id')}
        </Link>
      </Button>
    )
  },
  {
    id: 'payment_method_id',
    accessorKey: 'payment_method_id',
    header: 'Método de Pago',
    cell: ({ row }) => {
      const paymentMethod = (
        row.original as Payment & { payment_methods: { name: string } }
      ).payment_methods
      return <div>{paymentMethod?.name || 'N/A'}</div>
    }
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <SortableHeader<Payment> column={column} label="Monto" />
    ),
    cell: ({ row }) => (
      <div className="w-full px-4 font-mono font-medium">
        {formatCurrency(Number(row.getValue('amount')))}
      </div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof STATUS_VARIANTS
      const variant = STATUS_VARIANTS[status]

      return (
        <Badge variant={variant}>
          {
            PAYMENTS_STATUS_LABELS.find((label) => label.value === status)
              ?.label
          }
        </Badge>
      )
    }
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader<Payment> column={column} label="Creado" />
    ),
    cell: ({ row }) => (
      <div className="px-4">{formatDate(row.getValue('created_at'))}</div>
    )
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <SortableHeader<Payment> column={column} label="Actualizado" />
    ),
    cell: ({ row }) => (
      <div className="px-4">{formatDate(row.getValue('updated_at'))}</div>
    )
  },
  {
    id: 'updated_by',
    accessorKey: 'updated_by',
    header: 'Actualizado por',
    cell: ({ row }) => {
      const admin = row.original.admin_updated
      return <div>{admin ? `${admin.name} ${admin.surname}` : 'N/A'}</div>
    }
  },
  {
    id: 'actions',
    enableHiding: false
  }
]

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
