'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ImageOff } from 'lucide-react'

import Image from 'next/image'

import { Wine } from '@/app/(backoffice)/vinos/types'
import SortableHeader from '@/components/blocks/table/sorteable-header-table'
import { StatusBadge } from '@/components/status-badge'

export type WineColumn = ColumnDef<Wine, unknown> & {
  accessorKey?: keyof Wine
}

const columnsDefinition: WineColumn[] = [
  {
    id: 'image',
    accessorKey: 'image',
    header: 'Imagen',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          {row.original.image ? (
            <Image
              src={row.original.image}
              alt={row.original.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-md"
            />
          ) : (
            <div className="grid h-16 w-16 place-content-center rounded-md bg-gray-100">
              <ImageOff className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-sm text-gray-500">{row.original.winery}</span>
          </div>
        </div>
      )
    }
  },
  {
    id: 'variety',
    accessorKey: 'variety',
    header: 'Detalles',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.variety}</span>
        <span className="text-sm text-gray-500">{row.original.year}</span>
        <span className="text-sm text-gray-500">
          {row.original.volume_ml}ml
        </span>
      </div>
    )
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Descripción',
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <span className="line-clamp-2 text-sm">
          {row.original.description ? (
            row.original.description
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </span>
      </div>
    )
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Precio" />
    },
    cell: ({ row }) => {
      return (
        <div className="flex h-full flex-1 flex-col gap-1 px-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">Costo USD</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'USD'
                }).format(row.original.cost_usd_blue)}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">
              Precio venta
            </span>
            <span className="text-sm text-gray-600">
              ARS {new Intl.NumberFormat('es-AR').format(row.original.price)}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Inventario" />
    },
    cell: ({ row }) => {
      const totalStock = row.original.stock || 0
      const inTastingStock = row.original.reserved_stock || 0
      const tastingPercentage =
        totalStock > 0 ? (inTastingStock / totalStock) * 100 : 0

      return (
        <div className="flex flex-col gap-2 px-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">Stock</span>
            <div className="flex items-center gap-1">
              <span className="text-base font-semibold">
                {row.original.stock} u.
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${tastingPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {inTastingStock} u. en venta
              </span>
            </div>
          </div>

          <div className="flex flex-col border-t pt-2">
            <span className="text-xs font-medium text-gray-500">
              Histórico de ventas
            </span>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700">
                {row.original.sold} u.
              </span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Fechas" />
    },
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span>
          Actualizado:{' '}
          {new Date(row.original.updated_at).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
        <span className="text-gray-500">
          Creado:{' '}
          {new Date(row.original.created_at).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
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
