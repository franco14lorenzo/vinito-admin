'use client'

import { useEffect, useState } from 'react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useRouter } from 'next/navigation'

import { useCreateCustomer } from '@/app/(backoffice)/listado-de-clientes/components/create-customer-context'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

import { createCustomer, getCustomerById, updateCustomer } from '../actions'

interface CreateCustomerSheetProps {
  adminId?: string | null
}

const customerFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  surname: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('El email es inválido'),
  phone: z.string().min(1, 'El teléfono es requerido')
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export function CreateCustomerSheet({
  adminId
}: Omit<CreateCustomerSheetProps, 'editId'>) {
  const router = useRouter()
  const { isCreateOpen, isEditOpen, handleOpenChange } = useCreateCustomer()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: ''
    }
  })

  useEffect(() => {
    if (isEditOpen) {
      setIsLoading(true)
      const fetchCustomer = async () => {
        try {
          const { data } = await getCustomerById(isEditOpen)
          form.reset(data)
        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al cargar el cliente')
        } finally {
          setIsLoading(false)
        }
      }
      fetchCustomer()
    } else {
      form.reset({
        name: '',
        surname: '',
        email: '',
        phone: ''
      })
    }
  }, [isEditOpen, form])

  const onSubmit = async (data: CustomerFormValues) => {
    if (!adminId) {
      toast.error('No se pudo identificar el usuario')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditOpen) {
        await updateCustomer(isEditOpen, data, Number(adminId))
      } else {
        await createCustomer(data, Number(adminId))
      }

      toast.success(
        `Cliente ${isEditOpen ? 'actualizado' : 'creado'} correctamente`
      )
      handleOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        `No se pudo ${isEditOpen ? 'actualizar' : 'crear'} el cliente`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormContent = () => {
    if (isEditOpen && isLoading) {
      return (
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({
            field
          }: {
            field: ControllerRenderProps<CustomerFormValues, 'name'>
          }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingresa el nombre"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingresa el apellido"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingresa el email"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingresa el teléfono"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )
  }

  return (
    <Sheet
      open={isCreateOpen || !!isEditOpen}
      onOpenChange={(open) => handleOpenChange(open)}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isEditOpen ? 'Editar Cliente' : 'Crear nuevo Cliente'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isEditOpen
              ? 'Edita los detalles del cliente existente.'
              : 'Completa el formulario para crear un nuevo cliente.'}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col justify-between"
          >
            {renderFormContent()}
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
                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-32"
                >
                  {isSubmitting || isLoading ? (
                    <Spinner size={16} />
                  ) : isEditOpen ? (
                    'Actualizar Cliente'
                  ) : (
                    'Crear Cliente'
                  )}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
