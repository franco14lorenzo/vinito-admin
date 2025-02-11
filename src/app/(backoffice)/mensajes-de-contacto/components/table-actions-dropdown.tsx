'use client'

import { useState } from 'react'
import {
  Copy,
  Mail,
  MailCheck,
  MailOpen,
  MoreHorizontal,
  Trash
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

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

import { updateContactStatus } from '../actions'

interface TableActionsDropdownProps {
  id: number | string
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
}

export function TableActionsContactMessagesDropdown({
  id,
  onDelete
}: TableActionsDropdownProps) {
  const router = useRouter()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
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
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="inline-flex w-full cursor-pointer items-center justify-between"
            onClick={() => {
              updateContactStatus(String(id), 'read')
              toast.success('Mensaje marcado como leído')
              router.refresh()
            }}
          >
            Marcar como leído <MailOpen className="h-4 w-4" />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="inline-flex w-full cursor-pointer items-center justify-between"
            onClick={() => {
              updateContactStatus(String(id), 'answered')
              toast.success('Mensaje marcado como respondido')
              router.refresh()
            }}
          >
            Marcar como respondido <MailCheck className="h-4 w-4" />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="inline-flex w-full cursor-pointer items-center justify-between"
            onClick={() => {
              updateContactStatus(String(id), 'unread')
              toast.success('Mensaje marcado como no leído')
              router.refresh()
            }}
          >
            Marcar como no leído <Mail className="h-4 w-4" />
          </DropdownMenuItem>

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
