/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2Icon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'

import { useRouter } from 'next/navigation'

import {
  createWine,
  getWineById,
  updateWine,
  uploadImage
} from '@/app/(backoffice)/vinos/actions'
import { useCreateWine } from '@/app/(backoffice)/vinos/components/create-wine-context'
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

interface CreateWineSheetProps {
  adminId?: string | null
}

const wineFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  winery: z.string().min(1, 'Winery is required'),
  year: z.number().min(1900, 'Year is required'),
  variety: z.string().min(1, 'Variety is required'),
  volume_ml: z.number().min(1, 'Volume is required'),
  price: z.number().min(0, 'Price is required'),
  cost_usd_blue: z.number().min(0, 'Cost is required'),
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
    .optional()
})

type WineFormValues = z.infer<typeof wineFormSchema>

export function CreateWineSheet({
  adminId
}: Omit<CreateWineSheetProps, 'editId'>) {
  const router = useRouter()
  const { isCreateOpen, isEditOpen, handleOpenChange } = useCreateWine()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)

  const form = useForm<WineFormValues>({
    resolver: zodResolver(wineFormSchema),
    defaultValues: {
      name: '',
      description: '',
      winery: '',
      year: new Date().getFullYear(),
      variety: '',
      volume_ml: 750,
      price: 0,
      cost_usd_blue: 0,
      status: 'draft',
      image: ''
    }
  })

  useEffect(() => {
    if (isEditOpen) {
      setIsLoading(true)
      const fetchWine = async () => {
        try {
          const { data } = await getWineById(isEditOpen)
          const { status, description, image, stock, ...rest } = data
          if (status === 'deleted') {
            toast.error('This wine is deleted')
            handleOpenChange(false)
            return
          }
          form.reset({
            ...rest,
            status: status || 'draft',
            description: description || '',
            image: image || '',
            stock: stock || 0
          })
          // Set image preview if there's an existing image
          setImagePreview(image || null)
        } catch (error) {
          console.error('Error fetching wine:', error)
          toast.error('Error fetching wine data')
        } finally {
          setIsLoading(false)
        }
      }
      fetchWine()
    } else {
      form.reset({
        name: '',
        description: '',
        winery: '',
        year: new Date().getFullYear(),
        variety: '',
        volume_ml: 750,
        price: 0,
        cost_usd_blue: 0,
        status: 'draft',
        image: ''
      })
      // Reset image preview when sheet is closed
      setImagePreview(null)
    }
  }, [isEditOpen, form, handleOpenChange])

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }
  ) => {
    console.log('handleImageChange called')
    const file = e.target?.files?.[0]
    console.log('Selected file:', file)
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    try {
      setIsImageLoading(true)

      // Create preview URL
      const objectUrl = URL.createObjectURL(file)
      setImagePreview(objectUrl)

      // Set the file in the form
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

  const onSubmit = async (data: WineFormValues) => {
    setIsSubmitting(true)
    try {
      let imagePath: string | null = null

      if (data.image instanceof File) {
        imagePath = await uploadImage(data.image)
      } else if (typeof data.image === 'string') {
        imagePath = data.image
      }

      const wineData = {
        ...data,
        image: imagePath,
        stock: isEditOpen ? undefined : 0 // Set stock to 0 only for new wines
      }

      if (isEditOpen) {
        await updateWine(isEditOpen, wineData, Number(adminId))
        toast.success('Wine updated successfully')
      } else {
        await createWine(wineData, Number(adminId))
        toast.success('Wine created successfully')
      }
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error saving the wine')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderContent = () => {
    if (isEditOpen && isLoading) {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="winery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bodega</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variety"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Varietal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? '' : Number(value))
                      }}
                      min="1900"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="volume_ml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volumen (ml)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? '' : Number(value))
                      }}
                      min="0"
                    />
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
                    <Textarea
                      placeholder="Describe el vino..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost_usd_blue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo (USD Blue)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? '' : Number(value))
                      }}
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (ARS)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? '' : Number(value))
                      }}
                      min="0"
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
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
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
                  </FormControl>
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
                        onChange={(e) => {
                          console.log('onChange event triggered')
                          handleImageChange(e)
                        }}
                        disabled={isImageLoading}
                      />
                      <div
                        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors ${
                          isImageLoading ? 'opacity-50' : 'hover:bg-gray-100'
                        } ${imagePreview ? 'p-0' : 'p-6'}`}
                        onClick={(e) => {
                          e.preventDefault()
                          console.log('Dropzone clicked')
                          document.getElementById('image-input')?.click()
                        }}
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
                                target: {
                                  files: Object.assign([file], {
                                    item: (i: number) => [file][i]
                                  })
                                }
                              } as { target: { files: FileList } })
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
                              className="rounded-lg object-cover"
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
                    'Actualizar Vino'
                  ) : (
                    'Crear Vino'
                  )}
                </Button>
              </SheetFooter>
            </div>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <Sheet
      open={isCreateOpen || Boolean(isEditOpen)}
      onOpenChange={handleOpenChange}
    >
      <SheetContent className="h-full˝ flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditOpen ? 'Editar Vino' : 'Crear Vino'}</SheetTitle>
          <SheetDescription className="sr-only">
            {isEditOpen
              ? 'Edita los detalles del vino.'
              : 'Crea un nuevo vino.'}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  )
}
