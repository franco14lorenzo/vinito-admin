'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'

import { getPaymentMethodById, updatePaymentMethod } from '../actions'

import { useEditPaymentMethod } from './edit-payment-method-context'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive'])
})

export function EditPaymentMethodSheet({
  adminId,
  editId
}: {
  adminId?: string | null
  editId?: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isEditOpen, handleOpenChange } = useEditPaymentMethod()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active'
    }
  })

  useEffect(() => {
    if (editId) {
      setIsLoading(true)
      async function loadPaymentMethod(id: string) {
        try {
          const { data } = await getPaymentMethodById(id)
          form.reset({
            ...data,
            status:
              data.status === 'active' || data.status === 'inactive'
                ? data.status
                : 'inactive',
            description: data.description ?? undefined
          })
        } catch (error) {
          console.error('Error fetching payment method:', error)
          toast.error('Error fetching payment method')
        } finally {
          setIsLoading(false)
        }
      }

      loadPaymentMethod(editId)
    }
  }, [editId, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminId) {
      toast.error('No se pudo obtener el ID del admin')
      return
    }

    setIsSubmitting(true)
    try {
      if (!editId) {
        throw new Error('No se pudo obtener el ID del método de pago')
      }
      const payload = {
        ...values,
        updated_at: new Date().toISOString(),
        updated_by: Number(adminId)
      }

      await updatePaymentMethod(editId, payload)
      toast.success('Método de pago actualizado correctamente')
    } catch (error) {
      toast.error('Ocurrió un error al actualizar el método de pago')
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
          <SheetTitle>{'Editar Método de Pago'}</SheetTitle>
          <SheetDescription className="sr-only">
            Edita un método de pago
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col"></div>
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
                  : 'Actualizar Método de Pago'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
