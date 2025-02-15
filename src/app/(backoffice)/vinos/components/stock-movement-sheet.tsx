import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

import { StockMovementForm } from './stock-movement-form'

interface StockMovementSheetProps {
  wineId: number
  adminId: number
}

export function StockMovementSheet({
  adminId,
  wineId
}: StockMovementSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Gestionar stock
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Gestionar stock</SheetTitle>
          <SheetDescription className="sr-only">
            Registra entradas o salidas de unidades del inventario
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />

        <StockMovementForm adminId={adminId} wineId={wineId} />
      </SheetContent>
    </Sheet>
  )
}
