'use client'

import { useState } from 'react'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  Copy,
  MoreHorizontalIcon,
  PackageIcon,
  TruckIcon
} from 'lucide-react'
import { toast } from 'sonner'

import {
  cancelOrder,
  getOrderPayment,
  updateOrderStatus,
  updatePaymentStatus
} from '@/app/(backoffice)/ordenes/actions'
import {
  ORDER_ERRORS,
  type OrderError
} from '@/app/(backoffice)/ordenes/errors'
import { OrderStatus } from '@/app/(backoffice)/ordenes/types'
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
  status: OrderStatus
  adminId: number
  onStatusChange?: () => void
}

export function TableActionsDropdown({
  id,
  status,
  adminId,
  onStatusChange
}: TableActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsLoading(true)
    try {
      if (newStatus === 'delivered') {
        // Verificar el estado del pago
        const payment = await getOrderPayment(id)

        if (payment?.status !== 'completed') {
          setShowPaymentDialog(true)
          setIsLoading(false)
          return
        }
      }

      await updateOrderStatus(id, newStatus, adminId)
      toast.success('Estado actualizado correctamente')
      onStatusChange?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeliveryWithPayment = async () => {
    setIsLoading(true)
    try {
      // Actualizar el estado del pago
      await updatePaymentStatus(id, 'completed', adminId)
      // Actualizar el estado de la orden
      await updateOrderStatus(id, 'delivered', adminId)

      toast.success('Orden entregada y pago completado')
      onStatusChange?.()
      setShowPaymentDialog(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (shouldRefundPayment = false) => {
    setIsLoading(true)
    try {
      const result = await cancelOrder(id, adminId, shouldRefundPayment)

      if ('error' in result) {
        const error = result.error as OrderError
        if (error.code === ORDER_ERRORS.REFUND_REQUIRED) {
          setShowRefundDialog(true)
          setShowCancelDialog(false)
          setIsLoading(false)
          return
        }
        throw error
      }

      toast.success('Orden cancelada correctamente')
      onStatusChange?.()
      setShowCancelDialog(false)
      setShowRefundDialog(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cancelar la orden')
    } finally {
      setIsLoading(false)
    }
  }

  const statusActions = {
    pending: [
      {
        label: 'Procesar',
        icon: PackageIcon,
        onClick: () => handleStatusChange('processing')
      }
    ],
    processing: [
      {
        label: 'Enviar',
        icon: TruckIcon,
        onClick: () => handleStatusChange('shipped')
      }
    ],
    shipped: [
      {
        label: 'Entregar',
        icon: CheckCircleIcon,
        onClick: () => handleStatusChange('delivered')
      }
    ]
  }

  const actions = statusActions[status as keyof typeof statusActions] || []

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="mt-2 h-8 w-8 p-0">
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
          {actions.length > 0 && <DropdownMenuSeparator />}
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size={16} className="mr-2" />
              ) : (
                <action.icon className="mr-2 h-4 w-4" />
              )}
              {action.label}
            </DropdownMenuItem>
          ))}
          {status !== 'cancelled' && status !== 'delivered' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCancelDialog(true)}
                disabled={isLoading}
                className="text-destructive"
              >
                <AlertCircleIcon className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La orden será cancelada y el
              stock será devuelto a las degustaciones y vinos correspondientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelOrder(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size={16} className="mr-2" />
                  Cancelando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reembolso</AlertDialogTitle>
            <AlertDialogDescription>
              Esta orden tiene un pago completado. ¿Confirmas que has realizado
              el reembolso y deseas proceder con la cancelación?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, revisar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelOrder(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size={16} className="mr-2" />
                  Procesando...
                </>
              ) : (
                'Sí, confirmar reembolso y cancelar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar pago y entrega</AlertDialogTitle>
            <AlertDialogDescription>
              El pago de esta orden aún no está marcado como completado.
              ¿Confirmas que has recibido el pago y deseas marcar la orden como
              entregada?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeliveryWithPayment}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirmar pago y entrega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
