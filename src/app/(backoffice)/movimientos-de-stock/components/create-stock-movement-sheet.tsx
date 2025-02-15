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

import { createStockMovement, getWineList } from '../actions'
import { TYPE_FILTERS } from '../constants'

import { useCreateStockMovement } from './create-stock-movement-context'

const formSchema = z.object({
  wine_id: z.coerce.number().min(1, 'Wine is required'),
  quantity: z.coerce.number().min(1, 'Quantity is required'),
  type: z.enum(['entry', 'out']),
  notes: z.string().optional()
})

type Wine = {
  id: number
  name: string
}

export function CreateStockMovementSheet({
  adminId
}: {
  adminId?: string | null
}) {
  const router = useRouter()
  const [wines, setWines] = useState<Wine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isCreateOpen, handleOpenChange } = useCreateStockMovement()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wine_id: 0,
      quantity: 1,
      type: 'entry',
      notes: ''
    }
  })

  useEffect(() => {
    async function loadWines() {
      try {
        const { data } = await getWineList()
        setWines(data || [])
      } catch (error) {
        console.error('Error fetching wines:', error)
        toast.error('Error loading wines')
      }
    }

    if (isCreateOpen) {
      loadWines()
    }
  }, [isCreateOpen])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminId) {
      toast.error('No se pudo obtener el ID del admin')
      return
    }

    setIsLoading(true)
    try {
      await createStockMovement({
        ...values,
        created_by: Number(adminId)
      })
      toast.success('Movimiento de stock creado correctamente')
      router.refresh()
      form.reset()
      handleOpenChange(false)
    } catch (error) {
      toast.error('Error al crear el movimiento de stock')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isCreateOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Crear Movimiento de Stock</SheetTitle>
          <SheetDescription className="sr-only">
            Crea un nuevo movimiento de stock
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
                name="wine_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vino</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wines.map((wine) => (
                          <SelectItem key={wine.id} value={wine.id.toString()}>
                            {wine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_FILTERS.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-4" />
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Movimiento'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
