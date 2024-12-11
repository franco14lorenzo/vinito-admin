'use client'

import { useEffect, useState } from 'react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useCreateFAQ } from '@/app/(backoffice)/faqs/components/create-faq-context'
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
import { Textarea } from '@/components/ui/textarea'

import { createFAQ, getFAQById, updateFAQ } from '../actions'

interface CreateFAQSheetProps {
  editId?: string
  adminId?: string | null
}

const faqFormSchema = z.object({
  question: z.string().min(1, 'La pregunta es requerida'),
  answer: z.string().min(1, 'La respuesta es requerida'),
  order: z.coerce.number().optional(),
  status: z.enum(['draft', 'active', 'inactive'])
})

type FAQFormValues = z.infer<typeof faqFormSchema>

export function CreateFAQSheet({ editId, adminId }: CreateFAQSheetProps) {
  const { isCreateOpen, handleOpenChange } = useCreateFAQ()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: '',
      answer: '',
      order: undefined,
      status: 'draft'
    }
  })

  useEffect(() => {
    if (editId) {
      setIsLoading(true)
      const fetchFAQ = async () => {
        try {
          const { data } = await getFAQById(editId)
          const { status, ...rest } = data
          if (status === 'deleted') {
            toast.error('La FAQ ha sido eliminada')
            handleOpenChange(false)
            return
          }
          form.reset({ status, ...rest })
        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al cargar la FAQ')
        } finally {
          setIsLoading(false)
        }
      }
      fetchFAQ()
    } else {
      form.reset({
        question: '',
        answer: '',
        order: undefined,
        status: 'draft'
      })
    }
  }, [editId, form, handleOpenChange])

  const onSubmit = async (data: FAQFormValues) => {
    if (!adminId) {
      toast.error('No se pudo identificar el usuario')
      return
    }

    setIsSubmitting(true)
    try {
      if (editId) {
        await updateFAQ(editId, data, Number(adminId))
      } else {
        await createFAQ(data, Number(adminId))
      }

      toast.success(`FAQ ${editId ? 'actualizada' : 'creada'} correctamente`)
      handleOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error:', error)
      toast.error(`No se pudo ${editId ? 'actualizar' : 'crear'} la FAQ`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormContent = () => {
    if (editId && isLoading) {
      return (
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-32 w-full" />
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
          name="question"
          render={({
            field
          }: {
            field: ControllerRenderProps<FAQFormValues, 'question'>
          }) => (
            <FormItem>
              <FormLabel>Pregunta</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingresa la pregunta"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Respuesta</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="h-32"
                  placeholder="Ingresa la respuesta"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Por defecto"
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
    <Sheet open={isCreateOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{editId ? 'Editar FAQ' : 'Crear nueva FAQ'}</SheetTitle>
          <SheetDescription className="sr-only">
            {editId
              ? 'Edita los detalles de la FAQ existente.'
              : 'Completa el formulario para crear una nueva FAQ.'}
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
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading || isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                  {isSubmitting
                    ? 'Guardando...'
                    : isLoading
                    ? 'Cargando...'
                    : editId
                    ? 'Actualizar'
                    : 'Crear'}{' '}
                  FAQ
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
