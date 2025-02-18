/* eslint-disable camelcase */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, ImageOff, Loader2Icon, UploadIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import {
  createTasting,
  getTastingById,
  updateTasting,
  uploadImage
} from '@/app/(backoffice)/degustaciones/actions'
import { useCreateTasting } from '@/app/(backoffice)/degustaciones/components/create-tasting-context'
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
import { Textarea } from '@/components/ui/textarea'

import { Wine, WineSearch } from './wine-search'

interface CreateTastingSheetProps {
  adminId?: string | null
}

const tastingFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  pairings: z.string().optional(),
  price: z.number().min(0, 'El precio es requerido'),
  status: z.enum(['draft', 'active', 'inactive']),
  stock: z.number().optional(),
  image: z
    .union([
      z.string(),
      z.custom<File>().refine((file) => {
        if (!file) return true
        return (
          file instanceof File &&
          ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
        )
      }, 'Must be a valid image file'),
      z.null()
    ])
    .optional(),
  wine_ids: z.array(z.number()).optional()
})

type TastingFormValues = z.infer<typeof tastingFormSchema>

export function CreateTastingSheet({ adminId }: CreateTastingSheetProps) {
  const router = useRouter()
  const { isCreateOpen, isEditOpen, handleOpenChange } = useCreateTasting()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [selectedWines, setSelectedWines] = useState<Wine[]>([])

  const form = useForm<TastingFormValues>({
    resolver: zodResolver(tastingFormSchema),
    defaultValues: {
      name: '',
      short_description: '',
      long_description: '',
      pairings: '',
      price: 0,
      status: 'draft',
      stock: 0,
      image: '',
      wine_ids: []
    }
  })

  useEffect(() => {
    const fetchTasting = async () => {
      if (isEditOpen) {
        try {
          const { data } = await getTastingById(isEditOpen)
          const { status, image, stock, ...rest } = data
          if (status === 'deleted') {
            toast.error('La degustación no existe')
            handleOpenChange(false)
            return
          }

          // Extraer los vinos de tasting_wines y configurar selectedWines
          const wines = data.tasting_wines
            .map((tw) => tw.wine)
            .filter(
              (wine: Wine | null): wine is Wine =>
                wine !== null && wine !== undefined
            )
          setSelectedWines(wines as Wine[])

          form.reset({
            ...rest,
            status: status || 'draft',
            image: image || '',
            stock: stock || 0,
            wine_ids: wines.map((w) => w?.id),
            short_description: rest.short_description || undefined,
            long_description: rest.long_description || undefined,
            pairings: rest.pairings || undefined
          })

          setImagePreview(image || null)
        } catch (error) {
          console.error('Error fetching tasting:', error)
          toast.error('Se produjo un error al cargar la degustación')
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (isEditOpen) {
      fetchTasting()
    } else {
      form.reset({
        name: '',
        short_description: '',
        long_description: '',
        pairings: '',
        price: 0,
        status: 'draft',
        stock: 0,
        image: '',
        wine_ids: []
      })

      setSelectedWines([]) // Limpiar los vinos seleccionados
      setImagePreview(null)
    }
  }, [isEditOpen, form, handleOpenChange])

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }
  ) => {
    const file = e.target?.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    try {
      setIsImageLoading(true)

      const objectUrl = URL.createObjectURL(file)
      setImagePreview(objectUrl)

      form.setValue('image', file)
      setIsImageLoading(false)
    } catch (error) {
      console.error('Error handling image:', error)
      toast.error('Error al procesar la imagen')
      setIsImageLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const onSubmit = async (data: TastingFormValues) => {
    setIsSubmitting(true)
    try {
      let imagePath: string | null = null

      if (data.image instanceof File) {
        imagePath = await uploadImage(data.image)
      } else if (typeof data.image === 'string') {
        imagePath = data.image
      }

      const tastingData = {
        ...data,
        image: imagePath
      }

      if (isEditOpen) {
        await updateTasting(isEditOpen, tastingData, Number(adminId))
        toast.success('Degustación actualizada correctamente')
      } else {
        await createTasting(tastingData, Number(adminId))
        toast.success('Degustación creada correctamente')
      }
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Se produjo un error al guardar la degustación')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet
      open={isCreateOpen || Boolean(isEditOpen)}
      onOpenChange={handleOpenChange}
    >
      <SheetContent className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>
            {isEditOpen ? 'Editar Degustación' : 'Crear Degustación'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isEditOpen
              ? 'Edita los detalles de la degustación.'
              : 'Crea una nueva degustación.'}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1 overflow-y-auto">
          {isEditOpen && isLoading ? (
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
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
                    name="wine_ids"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Vinos</FormLabel>
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 gap-2">
                            <WineSearch
                              selectedWines={selectedWines}
                              onWineSelect={(wine: Wine) => {
                                const newSelection = [...selectedWines, wine]
                                setSelectedWines(newSelection)
                                field.onChange(newSelection.map((w) => w.id))
                              }}
                            />
                            {selectedWines.map((wine) => (
                              <div
                                key={wine.id}
                                className="group flex items-center gap-2 rounded-md border bg-card/50 p-2 transition-colors hover:bg-accent/50"
                              >
                                {wine.image ? (
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                                    <Image
                                      src={wine.image}
                                      alt={wine.name}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
                                    <ImageOff className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-medium">
                                      {wine.name}
                                    </span>
                                    {wine.cost_usd_blue && (
                                      <span className="shrink-0 text-xs font-semibold">
                                        USD{' '}
                                        {wine.cost_usd_blue.toLocaleString(
                                          'es-AR',
                                          {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2
                                          }
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="truncate">
                                      {wine.winery}
                                    </span>
                                    <span>·</span>
                                    <span className="truncate">
                                      {wine.variety}
                                    </span>
                                    <span>·</span>
                                    <span className="shrink-0">
                                      {wine.year}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const newSelection = selectedWines.filter(
                                      (w) => w.id !== wine.id
                                    )
                                    setSelectedWines(newSelection)
                                    field.onChange(
                                      newSelection.map((w) => w.id)
                                    )
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de venta (ARS)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value === 0 ? '' : field.value}
                            onChange={(e) => {
                              const value =
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value)
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción corta</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[100px]"
                            placeholder="Descripción breve de la degustación..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="long_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción larga</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[150px]"
                            placeholder="Descripción detallada de la degustación..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pairings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maridajes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[100px]"
                            placeholder="Sugerencias de maridaje..."
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
                          defaultValue={field.value}
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
                    control={form.control}
                    name="image"
                    render={({ field: { value } }) => (
                      <FormItem>
                        <FormLabel>Imagen</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <input
                              id="image-input"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={isImageLoading}
                            />
                            <div
                              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors ${
                                isImageLoading
                                  ? 'opacity-50'
                                  : 'hover:bg-gray-100'
                              } ${imagePreview ? 'p-0' : 'p-6'}`}
                              onClick={() =>
                                document.getElementById('image-input')?.click()
                              }
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!isImageLoading) {
                                  const file = e.dataTransfer.files?.[0]
                                  if (file) {
                                    handleImageChange({
                                      target: { files: [file] }
                                    } as unknown as React.ChangeEvent<HTMLInputElement>)
                                  }
                                }
                              }}
                            >
                              {isImageLoading ? (
                                <div className="flex flex-col items-center justify-center">
                                  <Loader2Icon className="h-8 w-8 animate-spin text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">
                                    Cargando imagen...
                                  </p>
                                </div>
                              ) : imagePreview ||
                                (typeof value === 'string' && value) ? (
                                <div className="relative h-full w-full">
                                  <img
                                    src={
                                      imagePreview ||
                                      (typeof value === 'string' ? value : '')
                                    }
                                    alt="Preview"
                                    className="h-full w-full rounded-lg object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                                    <p className="text-center text-sm text-white">
                                      Click o arrastra para cambiar la imagen
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <ImageIcon className="mb-4 h-12 w-12" />
                                  <div className="flex items-center gap-1">
                                    <UploadIcon className="h-4 w-4" />
                                    <span>Sube una imagen</span>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-500">
                                    o arrastra y suelta aquí
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    PNG, JPG o WEBP (max. 5MB)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
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
                    <Button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="w-32"
                    >
                      {isSubmitting ? (
                        <Spinner size={16} />
                      ) : isEditOpen ? (
                        'Actualizar'
                      ) : (
                        'Crear'
                      )}
                    </Button>
                  </SheetFooter>
                </div>
              </form>
            </Form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
