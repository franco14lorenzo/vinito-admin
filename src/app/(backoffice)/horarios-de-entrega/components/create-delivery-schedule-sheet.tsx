'use client'

import { useEffect, useState } from 'react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useRouter } from 'next/navigation'

import { useCreateDeliverySchedule } from '@/app/(backoffice)/horarios-de-entrega/components/create-delivery-schedule-context'
import { StatusBadge } from '@/components/status-badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

import {
  createDeliverySchedule,
  getDeliveryScheduleById,
  updateDeliverySchedule
} from '../actions'

interface CreateDeliveryScheduleSheetProps {
  adminId?: string | null
}

const deliveryScheduleFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  start_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
      'La hora de inicio debe estar en formato HH:MM:SS'
    )
    .min(1, 'La hora de inicio es requerida'),
  end_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
      'La hora de fin debe estar en formato HH:MM:SS'
    )
    .min(1, 'La hora de fin es requerida'),
  status: z.enum(['draft', 'active', 'inactive'])
})

type DeliveryScheduleFormValues = z.infer<typeof deliveryScheduleFormSchema>

export function CreateDeliveryScheduleSheet({
  adminId
}: Omit<CreateDeliveryScheduleSheetProps, 'editId'>) {
  const router = useRouter()
  const { isCreateOpen, isEditOpen, handleOpenChange } =
    useCreateDeliverySchedule()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DeliveryScheduleFormValues>({
    resolver: zodResolver(deliveryScheduleFormSchema),
    defaultValues: {
      name: '',
      start_time: '',
      end_time: '',
      status: 'draft'
    }
  })

  useEffect(() => {
    if (isEditOpen) {
      setIsLoading(true)
      const fetchDeliverySchedule = async () => {
        try {
          const { data } = await getDeliveryScheduleById(isEditOpen)
          const { status, ...rest } = data
          if (status === 'deleted') {
            toast.error('El horario de entrega ha sido eliminado')
            handleOpenChange(false)
            return
          }
          form.reset({ status, ...rest })
        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al cargar el horario de entrega')
        } finally {
          setIsLoading(false)
        }
      }
      fetchDeliverySchedule()
    } else {
      form.reset({
        name: '',
        start_time: '',
        end_time: '',
        status: 'draft'
      })
    }
  }, [isEditOpen, form, handleOpenChange])

  const onSubmit = async (data: DeliveryScheduleFormValues) => {
    if (!adminId) {
      toast.error('No se pudo identificar el usuario')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditOpen) {
        await updateDeliverySchedule(isEditOpen, data, Number(adminId))
      } else {
        await createDeliverySchedule(data, Number(adminId))
      }

      toast.success(
        `Horario de entrega ${
          isEditOpen ? 'actualizado' : 'creado'
        } correctamente`
      )
      handleOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        `No se pudo ${
          isEditOpen ? 'actualizar' : 'crear'
        } el horario de entrega`
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
            field: ControllerRenderProps<DeliveryScheduleFormValues, 'name'>
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
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Inicio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="time"
                  step="1"
                  placeholder="HH:MM:SS"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de Fin</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="time"
                  step="1"
                  placeholder="HH:MM:SS"
                  disabled={isLoading}
                />
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
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">
                    <StatusBadge status="draft" />
                  </SelectItem>
                  <SelectItem value="active">
                    <StatusBadge status="active" />
                  </SelectItem>
                  <SelectItem value="inactive">
                    <StatusBadge status="inactive" />
                  </SelectItem>
                </SelectContent>
              </Select>
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
            {isEditOpen
              ? 'Editar Horario de Entrega'
              : 'Crear nuevo Horario de Entrega'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isEditOpen
              ? 'Edita los detalles del horario de entrega existente.'
              : 'Completa el formulario para crear un nuevo horario de entrega.'}
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
                  className="w-[200px]"
                >
                  {isSubmitting || isLoading ? (
                    <Spinner size={16} />
                  ) : isEditOpen ? (
                    'Actualizar horario de entrega'
                  ) : (
                    'Crear horario de entrega'
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
