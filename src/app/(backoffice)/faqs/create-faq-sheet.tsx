'use client'

import { useEffect } from 'react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
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
import { createClient } from '@/lib/supabase/client'

import { StatusBadge } from './columns'
import { useCreateFAQ } from './CreateFAQContext'

interface CreateFAQSheetProps {
  editId?: string
  adminId?: string | null
}

const faqFormSchema = z.object({
  question: z.string().min(1, 'La pregunta es requerida'),
  answer: z.string().min(1, 'La respuesta es requerida'),
  order: z.coerce.number().optional(), // Allow order to be optional
  status: z.enum(['draft', 'active', 'inactive', 'deleted'])
})

type FAQFormValues = z.infer<typeof faqFormSchema>

const supabase = createClient()

export function CreateFAQSheet({ editId, adminId }: CreateFAQSheetProps) {
  const { isCreateOpen, handleOpenChange } = useCreateFAQ()

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: '',
      answer: '',
      order: undefined, // Set default value to undefined
      status: 'draft'
    }
  })

  useEffect(() => {
    if (editId) {
      const fetchFAQ = async () => {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('id', editId)
          .single()

        if (error) {
          console.error('Error fetching FAQ:', error)
          return
        }

        const { status, ...rest } = data

        form.reset({ status, ...rest })
      }
      fetchFAQ()
    } else {
      form.reset({
        question: '',
        answer: '',
        order: undefined, // Set default value to undefined
        status: 'draft'
      })
    }
  }, [editId, form])

  const onSubmit = async (data: FAQFormValues) => {
    try {
      if (editId) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question: data.question,
            answer: data.answer,
            order: data.order ?? undefined, // Use undefined if order is not provided
            status: data.status,
            updated_at: new Date().toISOString(),
            updated_by: Number(adminId)
          })
          .eq('id', editId)
          .select()

        if (error) {
          console.error('Error updating FAQ:', error)
          toast.error('No se pudo actualizar la FAQ')
          return
        }
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert({
            ...data,
            order: data.order ?? undefined, // Use undefined if order is not provided
            created_at: new Date().toISOString(),
            created_by: Number(adminId) // Add adminId to create operation
          })
          .select()

        if (error) {
          console.error('Error creating FAQ:', error)
          toast.error('No se pudo crear la FAQ')
          return
        }
      }

      toast.success(`FAQ ${editId ? 'actualizada' : 'creada'} correctamente`)
      handleOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocurrió un error inesperado')
    }
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
                      <Input {...field} placeholder="Ingresa la pregunta" />
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
                        value={field.value ?? ''} // Set value to empty string if undefined
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Por defecto"
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                        <SelectItem value="deleted">
                          <StatusBadge status="deleted" />
                        </SelectItem>
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
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editId ? 'Actualizar' : 'Crear'} FAQ
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
