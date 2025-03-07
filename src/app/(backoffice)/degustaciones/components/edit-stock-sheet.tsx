'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BadgeAlert, ImageOff, Package2Icon, Zap } from 'lucide-react'
import { toast } from 'sonner'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

import { getTastingById, updateTastingStock } from '../actions'
import { Tasting } from '../types'

type FormValues = {
  stock: number
}

export function EditStockSheet({
  open,
  onOpenChange,
  tastingId,
  currentStock,
  adminId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tastingId: number
  currentStock: number
  adminId: number
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tasting, setTasting] = useState<Tasting | null>(null)
  const [loadingTasting, setLoadingTasting] = useState(true)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFocus = () => {
    inputRef.current?.select()
  }

  const minAvailableStock =
    tasting?.tasting_wines?.reduce((min, { wine }) => {
      const availableStock = (wine.stock || 0) - (wine.reserved_stock || 0)
      return Math.min(min, availableStock)
    }, Infinity) || 0

  const maxPossibleStock = currentStock + minAvailableStock

  const form = useForm<FormValues>({
    defaultValues: {
      stock: currentStock
    },
    resolver: (values) => {
      const errors: Record<string, { message: string }> = {}
      if (values.stock > maxPossibleStock) {
        errors.stock = {
          message: `El stock no puede ser mayor a ${maxPossibleStock} unidades (limitado por el stock actual + disponible de los vinos)`
        }
      }
      return {
        values,
        errors
      }
    }
  })

  useEffect(() => {
    async function loadTasting() {
      try {
        const { data } = await getTastingById(String(tastingId))
        setTasting(data as Tasting)
      } catch (error) {
        toast.error('Error al cargar los datos de la degustación')
      } finally {
        setLoadingTasting(false)
      }
    }

    if (open) {
      loadTasting()
    }
  }, [tastingId, open])

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      await updateTastingStock(tastingId, data.stock, adminId)
      toast.success('Stock actualizado correctamente')
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error('Error al actualizar el stock')
    } finally {
      setIsLoading(false)
    }
  }

  function setMaxStock() {
    form.setValue('stock', maxPossibleStock)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>Gestionar stock</SheetTitle>
          <SheetDescription className="sr-only">
            Actualiza el stock de la degustación teniendo en cuenta el stock
            disponible de los vinos incluidos.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1 overflow-y-auto">
          {loadingTasting ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : !tasting ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                No se encontró la degustación
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col gap-4">
              <div className="flex-none">
                <Card className="shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {tasting.image ? (
                        <div className="relative h-24 w-24 flex-shrink-0">
                          <Image
                            src={tasting.image}
                            alt={tasting.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid h-24 w-24 flex-shrink-0 place-content-center rounded-md bg-gray-100">
                          <ImageOff className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">
                            {tasting.name}
                          </h3>
                          {tasting.short_description && (
                            <p className="text-sm text-muted-foreground">
                              {tasting.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="px-2 pt-1.5">
                        <div className="flex items-center gap-1 text-sm font-medium leading-none text-muted-foreground">
                          <Package2Icon className="h-3 w-3" />
                          <span>Stock</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <p className="text-3xl font-semibold tracking-tight">
                            {tasting.stock}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            un.
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex h-full flex-col"
                >
                  <div className="flex-1">
                    <div className="space-y-4 pb-4">
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          {tasting.tasting_wines.map(({ wine }) => {
                            const availableStock =
                              (wine.stock || 0) - (wine.reserved_stock || 0)
                            const isLimiting =
                              availableStock === minAvailableStock

                            return (
                              <div
                                key={wine.id}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors',
                                  isLimiting &&
                                    'border-destructive/50 bg-destructive/5'
                                )}
                              >
                                {wine.image ? (
                                  <div className="relative h-12 w-12 flex-shrink-0">
                                    <Image
                                      src={wine.image}
                                      alt={wine.name}
                                      fill
                                      className="rounded object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="grid h-12 w-12 flex-shrink-0 place-content-center rounded bg-gray-100">
                                    <ImageOff className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex flex-1 flex-col gap-1">
                                  <div className="flex items-center justify-between">
                                    <Button
                                      variant="link"
                                      className="h-fit p-0 font-medium"
                                      asChild
                                    >
                                      <Link
                                        href={`/vinos/?wine_id=${wine.id}&page=1&status=active%2Cinactive%2Cdraft`}
                                      >
                                        {wine.name}
                                      </Link>
                                    </Button>
                                    {isLimiting && (
                                      <BadgeAlert className="h-5 text-red-600" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">
                                      Stock disponible:
                                    </span>
                                    <span
                                      className={cn(
                                        'font-semibold',
                                        isLimiting &&
                                          'font-semibold text-destructive'
                                      )}
                                    >
                                      {availableStock} un.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <p className="p-2 text-sm text-muted-foreground">
                          <BadgeAlert className="-mt-0.5 mr-1 inline-block h-4 w-4" />
                          El stock máximo de la degustación está limitado por el
                          stock actual de la degustación y el stock minimo
                          disponible de los vinos incluidos.
                        </p>
                      </div>

                      <div className="rounded-lg border bg-card p-4">
                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Nuevo stock</FormLabel>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={setMaxStock}
                                  disabled={minAvailableStock === 0}
                                  className="h-7 gap-1.5"
                                >
                                  <Zap className="h-3 w-3" />
                                  Usar máximo ({maxPossibleStock})
                                </Button>
                              </div>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    onFocus={handleFocus}
                                    type="number"
                                    ref={(e) => {
                                      field.ref(e)
                                      inputRef.current = e
                                    }}
                                    max={maxPossibleStock}
                                    min={0}
                                    value={
                                      field.value === 0 ? '0' : field.value
                                    }
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ''
                                          ? 0
                                          : parseInt(e.target.value, 10)
                                      field.onChange(value)
                                    }}
                                  />
                                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    / {maxPossibleStock} un.
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-none pt-6">
                    <Separator className="mb-4" />
                    <SheetFooter>
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          form.watch('stock') > maxPossibleStock ||
                          form.watch('stock') === currentStock
                        }
                      >
                        {isLoading ? 'Actualizando...' : 'Actualizar stock'}
                      </Button>
                    </SheetFooter>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
