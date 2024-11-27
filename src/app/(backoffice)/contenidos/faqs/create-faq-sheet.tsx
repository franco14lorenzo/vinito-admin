'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

export function CreateFAQSheet() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.has('create')

  const onClose = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.delete('create')
    router.push(`?${current.toString()}`, { scroll: false })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col data-[state=closed]:duration-200 data-[state=open]:duration-100">
        <SheetHeader>
          <SheetTitle>Crear nueva FAQ</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Pregunta</Label>
              <Input id="question" placeholder="Ingresa la pregunta" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Respuesta</Label>
              <Textarea id="answer" placeholder="Ingresa la respuesta" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Orden</Label>
              <Input type="number" id="order" placeholder="Ingresa el orden" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select defaultValue="draft">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button>Crear FAQ</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
