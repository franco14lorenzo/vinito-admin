'use client'

import { useState } from 'react'
import { Copy, MoreHorizontal, Package, Pencil, Trash } from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

import { StockMovementForm } from './stock-movement-form'

interface TableActionsDropdownProps {
  id: number | string
  adminId: number
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
}

export function TableActionsDropdown({
  id,
  adminId,
  onEdit,
  onDelete
}: TableActionsDropdownProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStockSheet, setShowStockSheet] = useState(false)

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
            onClick={() => {
              navigator.clipboard.writeText(String(id))
              toast.success('ID copiado al portapapeles')
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowStockSheet(true)}>
            <Package className="mr-2 h-4 w-4" />
            Gestionar Stock
          </DropdownMenuItem>
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Vino
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
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

      <Sheet open={showStockSheet} onOpenChange={setShowStockSheet}>
        <SheetContent className='className="flex flex-col'>
          <SheetHeader>
            <SheetTitle>Gestionar Stock</SheetTitle>
          </SheetHeader>

          <StockMovementForm
            wineId={Number(id)}
            adminId={adminId}
            onSuccess={() => setShowStockSheet(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
