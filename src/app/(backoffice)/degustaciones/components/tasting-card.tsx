import { useState } from 'react'
import {
  CircleDollarSign,
  Edit,
  ImageOff,
  InfoIcon,
  MoreVertical,
  Package2Icon,
  Trash2,
  UsersIcon,
  WineIcon
} from 'lucide-react'

import Image from 'next/image'

import { StatusBadge } from '@/components/status-badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Tasting } from '../types'

import { useCreateTasting } from './create-tasting-context'
import { EditStockSheet } from './edit-stock-sheet'

export function TastingCard({
  tasting,
  adminId
}: {
  tasting: Tasting
  adminId: number
}) {
  const { handleOpenChange } = useCreateTasting()
  const [stockSheetOpen, setStockSheetOpen] = useState(false)

  return (
    <Card className="flex flex-col shadow-none">
      <CardHeader className="pb-6">
        <div className="relative space-y-1">
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight">
            {tasting.name}
          </h3>

          <p className="line-clamp-2 min-h-10 pt-2 text-sm text-muted-foreground">
            {tasting?.short_description}
          </p>

          <StatusBadge
            className="absolute right-0 top-0"
            status={tasting.status as 'draft' | 'active' | 'inactive'}
          />
        </div>
      </CardHeader>

      <div className="relative px-6 pb-4">
        {tasting.image ? (
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={tasting.image}
              alt={tasting.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageOff
              className="absolute inset-0 m-auto text-gray-400"
              size={48}
            />
          </div>
        )}
      </div>

      <CardContent className="flex-1 pb-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background/50 p-2">
            <div>
              <div className="flex items-center gap-1 text-xs font-medium leading-none text-muted-foreground">
                <CircleDollarSign className="h-3 w-3" />
                <span>Precio</span>
              </div>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {tasting.price.toLocaleString('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  minimumFractionDigits: 0
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background/50 p-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 text-xs font-medium leading-none text-muted-foreground">
                <Package2Icon className="h-3 w-3" />
                <span>Stock</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-xl font-semibold tracking-tight">
                  {tasting.stock}
                </p>
                <span className="text-xs text-muted-foreground">un.</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStockSheetOpen(true)}>
                  Editar stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="wines">
            <AccordionTrigger
              className="text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                !tasting.tasting_wines || tasting.tasting_wines.length === 0
              }
            >
              <div className="flex items-center gap-2">
                <WineIcon className="h-4 w-4" />
                <span>Vinos incluidos</span>
                <Badge variant="secondary" className="ml-2 h-5">
                  {tasting.tasting_wines.length}
                </Badge>
              </div>
            </AccordionTrigger>
            {tasting.tasting_wines && tasting.tasting_wines.length > 0 && (
              <AccordionContent>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {tasting.tasting_wines.map(({ wine }) => (
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
                        <span className="truncate text-sm font-medium">
                          {wine.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">{wine.winery}</span>
                          <span>·</span>
                          <span className="truncate">{wine.variety}</span>
                          <span>·</span>
                          <span className="shrink-0">{wine.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>

        {(tasting.pairings || tasting.long_description) && (
          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="more-info">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4" />
                  <span>Más información</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {tasting.pairings && (
                  <div className="py-4 text-sm">
                    <h4 className="text-sm">Maridajes</h4>
                    <p className="font-light text-muted-foreground">
                      {tasting.pairings}
                    </p>
                  </div>
                )}

                {tasting.long_description && (
                  <div className="py-4 text-sm">
                    <h4 className="text-sm">Descripción</h4>
                    <p className="font-light text-muted-foreground">
                      {tasting.long_description}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <div className="flex items-center gap-1 pt-4 text-xs">
          <UsersIcon className="h-3 w-3" />
          <span>{tasting.sold || 0} un. vendidas</span>
        </div>

        <EditStockSheet
          adminId={adminId}
          open={stockSheetOpen}
          onOpenChange={setStockSheetOpen}
          tastingId={tasting.id}
          currentStock={tasting.stock}
        />
      </CardContent>

      <CardFooter className="mt-auto flex justify-between gap-2">
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOpenChange(true, String(tasting?.id))}
        >
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  )
}
