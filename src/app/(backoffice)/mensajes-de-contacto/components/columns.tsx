'use client'

import { ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { formatDate } from '@/lib/utils'

import { STATUS } from '../constants'
import { Contact } from '../types'

export type ContactColumn = ColumnDef<Contact, unknown> & {
  accessorKey?: keyof Contact
}

const columnsDefinition: ContactColumn[] = [
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = STATUS.find((s) => s.value === row.getValue('status'))
      const isUnread = row.getValue('status') === 'unread'
      const isAnswered = row.getValue('status') === 'answered'
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center justify-center ${
                  isUnread
                    ? 'font-semibold'
                    : isAnswered
                    ? 'font-extralight text-gray-400'
                    : ''
                }`}
              >
                {status?.icon && (
                  <div className="relative">
                    <status.icon className="mr-2 h-4 w-4" />
                    {isUnread && (
                      <div className="absolute -top-0.5 right-1 grid h-2 w-2 place-content-center rounded-full bg-red-500">
                        <div className="relative z-10 size-0.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status?.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <div
        className={`${
          row.getValue('status') === 'unread'
            ? 'font-semibold'
            : row.getValue('status') === 'answered'
            ? 'font-extralight text-gray-400'
            : ''
        }`}
      >
        {row.getValue('name')}
      </div>
    )
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Correo Electrónico',
    cell: ({ row }) => (
      <div
        className={`${
          row.getValue('status') === 'unread'
            ? 'font-semibold'
            : row.getValue('status') === 'answered'
            ? 'font-extralight text-gray-400'
            : ''
        }`}
      >
        {row.getValue('email')}
      </div>
    )
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Teléfono',
    cell: ({ row }) => (
      <div
        className={`${
          row.getValue('status') === 'unread'
            ? 'font-semibold'
            : row.getValue('status') === 'answered'
            ? 'font-extralight text-gray-400'
            : ''
        }`}
      >
        {row.getValue('phone')}
      </div>
    )
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: 'Mensaje',
    cell: ({ row }) => (
      <div
        className={`${
          row.getValue('status') === 'unread'
            ? 'font-semibold'
            : row.getValue('status') === 'answered'
            ? 'font-extralight text-gray-400'
            : ''
        }`}
      >
        {row.getValue('message')}
      </div>
    )
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader<Contact> column={column} label="Fecha de Creación" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div
        className={`px-4 ${
          row.getValue('status') === 'unread'
            ? 'font-semibold'
            : row.getValue('status') === 'answered'
            ? 'font-extralight text-gray-400'
            : ''
        }`}
      >
        {formatDate(row.getValue('created_at'))}
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false
  }
]

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
