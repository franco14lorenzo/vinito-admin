'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink, MapPin } from 'lucide-react'

import type { Accommodation } from '@/app/(backoffice)/alojamientos/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
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
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    enableSorting: true
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: 'Dirección',
    cell: ({ row }) => (
      <div className="max-w-[500px] text-sm">{row.getValue('address')}</div>
    )
  },
  {
    id: 'coordinates',
    header: 'Ubicación',
    cell: ({ row }) => {
      const accommodation = row.original
      const lat = accommodation.latitude
      const lng = accommodation.longitude
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-start gap-2 px-0 text-muted-foreground hover:text-primary"
                asChild
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4" />
                  <div className="flex flex-col text-xs">
                    <span>LAT: {lat}</span>
                    <span>LNG: {lng}</span>
                  </div>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver en Google Maps</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    id: 'qr_code',
    accessorKey: 'qr_code',
    header: () => <div className="px-4">QR</div>,
    cell: ({ row }) => {
      const qrCode = row.getValue('qr_code')
      return qrCode ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a target="_blank" href={qrCode as string}>
                  <ExternalLink className="h-4 w-4" />
                  Ver QR
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir código QR en nueva pestaña</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-sm text-muted-foreground">No disponible</span>
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
