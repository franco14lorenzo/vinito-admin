'use client'

import { useState } from 'react'
import { Copy, Link, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getStoreBaseUrl } from '@/lib/utils'

interface TableActionsDropdownProps {
  id: number | string
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
}

export function TableActionsDropdown({
  id,
  onEdit,
  onDelete
}: TableActionsDropdownProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const accessStoreUrl = `${getStoreBaseUrl(
    process.env.NEXT_PUBLIC_ENVIRONMENT as string
  )}/?accommodation_id=${id}`

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            className="inline-flex w-full cursor-pointer items-center justify-between"
            onClick={() => {
              navigator.clipboard.writeText(String(id))
              toast.success('ID copiado al portapapeles')
            }}
          >
            Copiar ID
            <Copy className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="inline-flex w-full cursor-pointer items-center justify-between"
            onClick={() => {
              navigator.clipboard.writeText(String(accessStoreUrl))
              toast.success('Link copiado al portapapeles')
            }}
          >
            Copiar Link
            <Link className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {onEdit && (
            <DropdownMenuItem
              className="inline-flex w-full cursor-pointer items-center justify-between"
              onClick={() => onEdit(id)}
            >
              Editar <Pencil className="h-4 w-4" />
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              className="inline-flex w-full cursor-pointer items-center justify-between text-red-500 hover:text-red-700 focus:bg-red-100 focus:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              Eliminar <Trash className="h-4 w-4" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el registro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                onDelete?.(id)
                setShowDeleteDialog(false)
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
