'use client'

import { useEffect, useState } from 'react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useRouter } from 'next/navigation'

import {
  createAccommodation,
  getAccommodationById,
  updateAccommodation
} from '@/app/(backoffice)/alojamientos/actions'
import { useCreateAccommodation } from '@/app/(backoffice)/alojamientos/components/create-accommodation-context'
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

interface CreateAccommodationSheetProps {
  adminId?: string | null
}

const accommodationFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  status: z.enum(['draft', 'active', 'inactive']),
  latitude: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), 'Debe ser un número válido')
    .transform((val) => (val ? Number(val) : undefined)),
  longitude: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), 'Debe ser un número válido')
    .transform((val) => (val ? Number(val) : undefined))
})

type AccommodationFormValues = z.input<typeof accommodationFormSchema>

export function CreateAccommodationSheet({
  adminId
}: Omit<CreateAccommodationSheetProps, 'editId'>) {
  const router = useRouter()
  const { isCreateOpen, isEditOpen, handleOpenChange } =
    useCreateAccommodation()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: {
      name: '',
      address: '',
      status: 'draft',
      latitude: '',
      longitude: ''
    }
  })

  useEffect(() => {
    if (isEditOpen) {
      setIsLoading(true)
      const fetchAccommodation = async () => {
        try {
          const { data } = await getAccommodationById(isEditOpen)
          const { status, latitude, longitude, ...rest } = data
          if (status === 'deleted') {
            toast.error('El alojamiento ha sido eliminado')
            handleOpenChange(false)
            return
          }
          form.reset({
            status,
            ...rest,
            latitude: latitude?.toString() ?? '',
            longitude: longitude?.toString() ?? ''
          })
        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al cargar la información del alojamiento')
        } finally {
          setIsLoading(false)
        }
      }
      fetchAccommodation()
    } else {
      form.reset({
        name: '',
        address: '',
        status: 'draft',
        latitude: '',
        longitude: ''
      })
    }
  }, [isEditOpen, form, handleOpenChange])

  const onSubmit = async (data: AccommodationFormValues) => {
    if (!adminId) {
      toast.error('No se pudo identificar el usuario')
      return
    }

    const formattedData = {
      ...data,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined
    }

    setIsSubmitting(true)
    try {
      if (isEditOpen) {
        await updateAccommodation(isEditOpen, formattedData, Number(adminId))
      } else {
        await createAccommodation(formattedData, Number(adminId))
      }

      toast.success(
        `Alojamiento ${isEditOpen ? 'actualizada' : 'creada'} correctamente`
      )
      handleOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        `No se pudo ${isEditOpen ? 'actualizar' : 'crear'} el alojamiento`
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
        </div>
      )
    }

    return (
      <div className="flex flex-col space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({
            field
          }: {
            field: ControllerRenderProps<AccommodationFormValues, 'name'>
          }) => (
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
          name="address"
          control={form.control}
          render={({
            field
          }: {
            field: ControllerRenderProps<AccommodationFormValues, 'address'>
          }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: Dpto. 1, Piso 2, Calle Falsa 123, Springfield, EEUU"
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
        <FormField
          name="latitude"
          control={form.control}
          render={({
            field
          }: {
            field: ControllerRenderProps<AccommodationFormValues, 'latitude'>
          }) => (
            <FormItem>
              <FormLabel>Latitud</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="any"
                  placeholder="Ej: -34.603722"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="longitude"
          control={form.control}
          render={({
            field
          }: {
            field: ControllerRenderProps<AccommodationFormValues, 'longitude'>
          }) => (
            <FormItem>
              <FormLabel>Longitud</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="any"
                  placeholder="Ej: -58.381592"
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
      open={!!isCreateOpen || !!isEditOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isEditOpen ? 'Editar Alojamiento' : 'Crear Alojamiento'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isEditOpen
              ? 'Edita la información de la Accommodation'
              : 'Completa la información para crear una nueva Alojamiento'}
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
                  className="w-44"
                >
                  {isSubmitting || isLoading ? (
                    <Spinner size={16} />
                  ) : isEditOpen ? (
                    'Actualizar alojamiento'
                  ) : (
                    'Crear alojamiento'
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
