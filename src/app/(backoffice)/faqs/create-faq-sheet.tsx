'use client'

import { useEffect, useState } from 'react'

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
import { createClient } from '@/lib/supabase/client'

import { useCreateFAQ } from './CreateFAQContext'
import { FAQ } from './page'

interface CreateFAQSheetProps {
  editId?: string
}

export function CreateFAQSheet({ editId }: CreateFAQSheetProps) {
  const { isCreateOpen, handleOpenChange } = useCreateFAQ()
  const [faq, setFaq] = useState<FAQ | null>(null)

  useEffect(() => {
    if (editId) {
      const fetchFAQ = async () => {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('id', editId)
          .single()
        if (error) {
          console.error('Error fetching FAQ:', error)
        } else {
          setFaq(data)
        }
      }
      fetchFAQ()
    } else {
      setFaq(null)
    }
  }, [editId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Handle form submission for create or edit
  }

  const onClose = () => {
    handleOpenChange(false)
  }

  return (
    <Sheet open={isCreateOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col data-[state=closed]:duration-200 data-[state=open]:duration-100">
        <SheetHeader>
          <SheetTitle>{editId ? 'Editar FAQ' : 'Crear nueva FAQ'}</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <form onSubmit={handleSubmit} className="contents">
            <div className="flex flex-1 flex-col justify-start gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Pregunta</Label>
                <Input
                  id="question"
                  name="question"
                  defaultValue={faq?.question || ''}
                  placeholder="Ingresa la pregunta"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answer">Respuesta</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  className="h-32"
                  defaultValue={faq?.answer || ''}
                  placeholder="Ingresa la respuesta"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  type="number"
                  id="order"
                  name="order"
                  defaultValue={faq?.order || ''}
                  placeholder="Ingresa el orden"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select defaultValue={faq?.status || 'draft'}>
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
            <Separator className="my-4" />
            <SheetFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">{editId ? 'Editar' : 'Crear'} FAQ</Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
