'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'

import type { Accommodation } from '@/app/(backoffice)/alojamientos/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export type AccommodationColumn = ColumnDef<Accommodation, unknown> & {
  accessorKey?: keyof Accommodation
}

const columnsDefinition: AccommodationColumn[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <SortableHeader<Accommodation> column={column} label="Nombre" />
    ),
    enableSorting: true
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: 'Dirección',
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.getValue('address')}</div>
    )
  },
  {
    id: 'qr_code',
    accessorKey: 'qr_code',
    header: () => <div className="px-4">QR</div>,
    cell: ({ row }) => {
      console.log(row.getValue('qr_code'))
      return (
        <>
          {row.getValue('qr_code') ? (
            <Button variant="outline" asChild>
              <a target="_blank" href={row.getValue('qr_code')}>
                <ExternalLink className="h-6 w-6" />
                Ver
              </a>
            </Button>
          ) : null}
        </>
      )
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />
  },
  {
    id: 'latitude',
    accessorKey: 'latitude',
    header: 'Latitud',
    cell: ({ row }) => <div className="px-4">{row.getValue('latitude')}</div>
  },
  {
    id: 'longitude',
    accessorKey: 'longitude',
    header: 'Longitud',
    cell: ({ row }) => <div className="px-4">{row.getValue('longitude')}</div>
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader<Accommodation> column={column} label="Creado" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="px-4">{formatDate(row.getValue('created_at'))}</div>
    )
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <SortableHeader<Accommodation> column={column} label="Actualizado" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="px-4">{formatDate(row.getValue('updated_at'))}</div>
    )
  },
  {
    id: 'actions',
    enableHiding: false
  }
]

export const columns = columnsDefinition

export type ColumnsDefinition = typeof columnsDefinition
