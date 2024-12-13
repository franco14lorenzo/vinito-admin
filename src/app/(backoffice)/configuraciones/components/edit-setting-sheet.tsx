'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useRouter } from 'next/navigation'

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
import { Textarea } from '@/components/ui/textarea'

import { getSettingById, updateSetting } from '../actions'

import { useCreateSetting } from './edit-setting-context'

const formSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional()
})

export function EditSettingSheet({ adminId }: { adminId?: string | null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isEditOpen, handleOpenChange } = useCreateSetting()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: '',
      value: '',
      description: ''
    }
  })

  useEffect(() => {
    if (isEditOpen) {
      setIsLoading(true)
      async function loadSetting() {
        try {
          const { data } = await getSettingById(isEditOpen)

          form.reset({
            ...data,
            description: data.description ?? undefined
          })
        } catch (error) {
          console.error('Error fetching setting:', error)
          toast.error('Error fetching setting')
        } finally {
          setIsLoading(false)
        }
      }

      loadSetting()
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
        throw new Error('No se pudo obtener el ID del setting')
      }
      const payload = {
        ...values,
        updated_at: new Date().toISOString(),
        updated_by: Number(adminId)
      }

      await updateSetting(isEditOpen, payload)

      toast.success('Setting actualizado correctamente')
      router.refresh()
    } catch (error) {
      toast.error('Ocurrió un error al actualizar el setting')
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
          <SheetTitle>{'Editar Setting'}</SheetTitle>
          <SheetDescription className="sr-only">
            Edita un setting de la aplicación
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
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
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
                    : 'Actualizar Setting'}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
