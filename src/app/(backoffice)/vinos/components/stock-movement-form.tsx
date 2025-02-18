'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageOff } from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { SheetFooter } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

import { createStockMovement, getWine } from '../actions'
import { Wine } from '../types'

const formSchema = z.object({
  quantity: z.number().min(1),
  type: z.enum(['entry', 'out']),
  notes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface StockMovementFormProps {
  wineId: number
  adminId: number
  onSuccess?: () => void
}

export function StockMovementForm({
  wineId,
  adminId,
  onSuccess
}: StockMovementFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [wine, setWine] = useState<Wine | null>(null)
  const [loadingWine, setLoadingWine] = useState(true)

  useEffect(() => {
    async function loadWine() {
      try {
        const wineData = await getWine(wineId)
        setWine(wineData as Wine)
      } catch (error) {
        toast.error('Error al cargar los datos del vino')
      } finally {
        setLoadingWine(false)
      }
    }

    loadWine()
  }, [wineId])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      type: 'entry'
    }
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await createStockMovement(
        {
          wine_id: wineId,
          ...data
        },
        adminId
      )
      toast.success('Movimiento de stock creado exitosamente')
      form.reset()
      router.refresh()
      onSuccess?.()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al crear el movimiento de stock. ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingWine) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!wine) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">No se encontró el vino</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-between space-y-6">
      <Card className="shadow-none">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {wine.image ? (
              <div className="relative h-32 w-32 flex-shrink-0">
                <Image
                  src={wine.image}
                  alt={wine.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            ) : (
              <div className="grid h-32 w-32 flex-shrink-0 place-content-center rounded-md bg-gray-100">
                <ImageOff className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{wine.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {wine.winery} · {wine.variety} · {wine.year}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Stock actual</p>
                <p className="text-2xl font-bold">{wine.stock || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col justify-between space-y-6"
        >
          <div className="flex flex-1 flex-col space-y-4">
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
                        <SelectValue placeholder="Seleccionar tipo de movimiento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entry">
                        <Badge variant="success">Entrada</Badge>
                      </SelectItem>
                      <SelectItem value="out">
                        <Badge variant="destructive">Salida</Badge>
                      </SelectItem>
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
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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

          <div className="flex flex-col">
            <Separator className="my-4" />

            <SheetFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear movimiento'}
              </Button>
            </SheetFooter>
          </div>
        </form>
      </Form>
    </div>
  )
}
