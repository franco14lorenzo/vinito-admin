'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
  Amphora,
  Building,
  CalendarDaysIcon,
  CircleDollarSign,
  ClockIcon,
  CreditCardIcon,
  ExternalLink,
  MailIcon,
  PhoneIcon,
  Receipt,
  UserIcon
} from 'lucide-react'

import Link from 'next/link'

import { Order } from '@/app/(backoffice)/ordenes/types'
import {
  PAYMENTS_STATUS_LABELS,
  STATUS_VARIANTS
} from '@/app/(backoffice)/pagos/constants'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

import { STATUS_FILTERS } from '../constants'

export type OrderColumn = ColumnDef<Order>
export type ColumnsDefinition = OrderColumn[]

export const columns: ColumnsDefinition = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="scrollbar-none max-w-[100px] overflow-x-auto p-2 py-4">
        <span className="block whitespace-nowrap font-mono text-xs text-gray-500">
          {row.original.id}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof STATUS_FILTERS
      const statusConfig = STATUS_FILTERS.find(
        (filter) => filter.value === status
      )
      return (
        <Badge
          variant={statusConfig?.variant as BadgeProps['variant']}
          className="mt-4"
        >
          {statusConfig?.label}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'customer',
    header: 'Cliente',
    cell: ({ row }) => {
      const customer = row.original.customer
      const note = row.original.customer_note
      return customer ? (
        <div className="flex flex-col items-start gap-1 p-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 pb-2">
              <Button variant="link" className="px-0 font-medium">
                <Link
                  href={`/listado-de-clientes?page=1&search=${customer.id}`}
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-3 w-3 text-gray-400" />
                  <span className="font-medium">
                    {customer.name} {customer.surname}
                  </span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500">{customer.phone}</span>
            </div>
          </div>
          {note && (
            <div className="flex flex-col pt-2">
              <span className="text-xs font-medium text-gray-500">Nota:</span>
              <span className="line-clamp-2 text-sm text-gray-600">{note}</span>
            </div>
          )}
        </div>
      ) : (
        '-'
      )
    }
  },
  {
    accessorKey: 'delivery',
    header: ({ column }) => <SortableHeader column={column} label="Entrega" />,
    cell: ({ row }) => {
      const schedule = row.original.delivery_schedule
      const accommodation = row.original.accommodation

      return (
        <div className="flex flex-col gap-1 p-2">
          {accommodation && (
            <div className="flex flex-col pb-2">
              <Button
                variant="link"
                size="sm"
                asChild
                className="w-fit px-0 text-sm font-medium"
              >
                <Link
                  href={`/alojamientos?page=1&search=${accommodation.id}&status=active%2Cinactive%2Cdraft`}
                >
                  <Building className="h-3 w-3 text-gray-400" />
                  <span>{accommodation.name}</span>
                </Link>
              </Button>

              {/*  <span className="text-sm text-gray-500">
                {accommodation.address}
              </span> */}
            </div>
          )}
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
            <span>{formatDate(row.original.delivery_date).split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="whitespace-nowrap">
              {schedule ? `${schedule.name}` : '-'}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'order_tastings',
    header: 'Degustaciones',
    cell: ({ row }) => {
      const orderTastings = row.original.order_tastings
      if (!orderTastings?.length)
        return <span className="text-sm text-gray-500">Sin degustaciones</span>

      return (
        <div className="flex flex-col gap-2 px-2 pt-1">
          {orderTastings.map((ot) => {
            const tasting = ot.tasting
            return (
              <div key={tasting.id}>
                <div className="flex items-center justify-between gap-2">
                  <Button variant="link" className="p-0">
                    <Link
                      href={`/degustaciones?search=${tasting.id}`}
                      className="flex items-center gap-2"
                    >
                      <Amphora className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{tasting.name}</span>
                    </Link>
                  </Button>
                  <Badge variant="secondary" className="h-5">
                    x{ot.quantity}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      )
    }
  },
  {
    accessorKey: 'payment',
    header: 'Pago',
    cell: ({ row }) => {
      const payment = row.original.payments?.[0]
      const status = payment?.status
      const variant = status ? STATUS_VARIANTS[status] : 'default'
      const total = row.original.total_amount

      return (
        <div className="space-y-2 p-2">
          <div className="flex items-center justify-start gap-2">
            <div className="flex items-center gap-1.5">
              <CircleDollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Total:</span>
            </div>
            <span className="text-base font-semibold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="flex items-center justify-start gap-2">
            <div className="flex items-center gap-1.5">
              <CreditCardIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span className="text-sm text-gray-600">
                {payment?.payment_method?.name || 'Sin método'}
              </span>
            </div>
            {status ? (
              <Badge variant={variant} className="h-6">
                {
                  PAYMENTS_STATUS_LABELS.find(
                    (label: { value: string | undefined }) =>
                      label.value === status
                  )?.label
                }
              </Badge>
            ) : (
              <Badge variant="secondary" className="h-6">
                Sin pago
              </Badge>
            )}
          </div>

          {payment && (
            <Button
              variant="link"
              size="sm"
              className="w-fit px-0 text-sm"
              asChild
            >
              <Link
                href={`/pagos?page=1&status=pending%2Ccompleted%2Cfailed%2Crefunded&search=${payment.id}`}
              >
                <div className="flex items-center gap-1.5">
                  <Receipt className="h-4 w-4" />
                  <span>Ver detalles</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <SortableHeader column={column} label="Creado" />,
    cell: ({ row }) => {
      const admin = row.original.created_by_admin
      return (
        <div className="flex flex-col p-2">
          <span className="font-medium">
            {formatDate(row.original.created_at)}
          </span>
          {admin && (
            <span className="text-sm text-gray-500">
              por {admin.name} {admin.surname}
            </span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <SortableHeader column={column} label="Actualizado" />
    ),
    cell: ({ row }) => {
      const admin = row.original.updated_by_admin
      return (
        <div className="flex flex-col p-2">
          <span className="font-medium">
            {formatDate(row.original.updated_at)}
          </span>
          {admin && (
            <span className="text-sm text-gray-500">
              por {admin.name} {admin.surname}
            </span>
          )}
        </div>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false
  }
]
