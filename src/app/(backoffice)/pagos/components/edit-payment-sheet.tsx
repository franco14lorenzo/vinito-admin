'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useRouter } from 'next/navigation'

import {
  PAYMENTS_STATUS_LABELS,
  STATUS_VARIANTS
} from '@/app/(backoffice)/pagos/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

import { getPaymentById, updatePayment } from '../actions'
import { PaymentStatus } from '../types'

import { useEditPayment } from './edit-payment-context'

const formSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'refunded'])
})

export function EditPaymentSheet({ adminId }: { adminId?: string | null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isEditOpen, handleOpenChange } = useEditPayment()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'pending'
    }
  })

  useEffect(() => {
    if (isEditOpen) {
      setIsLoading(true)
      async function loadPayment() {
        try {
          const { data } = await getPaymentById(isEditOpen)
          form.reset({
            status: data.status as PaymentStatus
          })
        } catch (error) {
          console.error('Error fetching payment:', error)
          toast.error('Error fetching payment')
        } finally {
          setIsLoading(false)
        }
      }

      loadPayment()
    }
  }, [isEditOpen, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminId) {
      toast.error('No se pudo obtener el ID del admin')
      return
    }

    setIsSubmitting(true)
    try {
      if (!isEditOpen) {
        throw new Error('No se pudo obtener el ID del pago')
      }
      const payload = {
        ...values,
        updated_at: new Date().toISOString(),
        updated_by: Number(adminId)
      }

      await updatePayment(isEditOpen, payload)

      toast.success('Pago actualizado correctamente')
      router.refresh()
    } catch (error) {
      toast.error('Ocurrió un error al actualizar el pago')
    } finally {
      setIsSubmitting(false)
    }

    form.reset()
    handleOpenChange(false)
  }

  return (
    <Sheet open={!!isEditOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Editar Pago</SheetTitle>
          <SheetDescription className="sr-only">
            Edita el estado de un pago
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col justify-between"
          >
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENTS_STATUS_LABELS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <Badge variant={STATUS_VARIANTS[status.value]}>
                              {status.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <Separator className="my-4" />
              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading || isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                  {isSubmitting
                    ? 'Actualizando...'
                    : isLoading
                    ? 'Cargando...'
                    : 'Actualizar Pago'}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
