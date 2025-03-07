'use client'

import { useState } from 'react'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  Copy,
  MoreHorizontalIcon,
  RotateCcw,
  XCircleIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { updatePaymentStatus } from '@/app/(backoffice)/pagos/actions'
import { PaymentStatus } from '@/app/(backoffice)/pagos/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'

interface TableActionsDropdownProps {
  id: string
  status: PaymentStatus
  adminId: number
  onEdit?: () => void
  onStatusChange?: () => void
}

export function TableActionsDropdown({
  id,
  status,
  adminId,
  onEdit,
  onStatusChange
}: TableActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusDialog, setShowStatusDialog] =
    useState<PaymentStatus | null>(null)

  const handleStatusChange = async (newStatus: PaymentStatus) => {
    setIsLoading(true)
    try {
      await updatePaymentStatus(id, newStatus, adminId)
      toast.success(`Estado actualizado a "${newStatus}" correctamente`)
      onStatusChange?.()
      setShowStatusDialog(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado')
    } finally {
      setIsLoading(false)
    }
  }

  const statusActions = {
    pending: [
      {
        label: 'Marcar como completado',
        icon: CheckCircleIcon,
        onClick: () => setShowStatusDialog('completed'),
        color: 'text-green-500'
      },
      {
        label: 'Marcar como fallido',
        icon: XCircleIcon,
        onClick: () => setShowStatusDialog('failed'),
        color: 'text-red-500'
      }
    ],
    completed: [
      {
        label: 'Reembolsar',
        icon: RotateCcw,
        onClick: () => setShowStatusDialog('refunded'),
        color: 'text-amber-500'
      }
    ],
    failed: [
      {
        label: 'Marcar como completado',
        icon: CheckCircleIcon,
        onClick: () => setShowStatusDialog('completed'),
        color: 'text-green-500'
      },
      {
        label: 'Marcar como pendiente',
        icon: AlertCircleIcon,
        onClick: () => setShowStatusDialog('pending'),
        color: 'text-blue-500'
      }
    ],
    refunded: []
  }

  const actions = statusActions[status] || []
  const statusLabels: Record<PaymentStatus, string> = {
    pending: 'pendiente',
    completed: 'completado',
    failed: 'fallido',
    refunded: 'reembolsado'
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontalIcon className="h-4 w-4" />
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

          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}

          {actions.length > 0 && <DropdownMenuSeparator />}

          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              disabled={isLoading}
              className={action.color}
            >
              {isLoading ? (
                <Spinner size={16} className="mr-2" />
              ) : (
                <action.icon className="mr-2 h-4 w-4" />
              )}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!showStatusDialog}
        onOpenChange={(open) => !open && setShowStatusDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar estado del pago</AlertDialogTitle>
            <AlertDialogDescription>
              {showStatusDialog === 'completed' && (
                <>¿Confirmas que el pago ha sido completado correctamente?</>
              )}
              {showStatusDialog === 'failed' && (
                <>¿Confirmas que el pago ha fallado?</>
              )}
              {showStatusDialog === 'pending' && (
                <>¿Confirmas que quieres cambiar el estado a pendiente?</>
              )}
              {showStatusDialog === 'refunded' && (
                <>¿Confirmas que has realizado el reembolso de este pago?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                showStatusDialog && handleStatusChange(showStatusDialog)
              }
              className={
                showStatusDialog === 'completed'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : showStatusDialog === 'failed' ||
                    showStatusDialog === 'refunded'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size={16} className="mr-2" />
                  Procesando...
                </>
              ) : (
                `Confirmar cambio a ${
                  showStatusDialog ? statusLabels[showStatusDialog] : ''
                }`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
