'use client'

import { useState } from 'react'
import {
  ExternalLink,
  Printer,
  RefrigeratorIcon,
  Sofa,
  Wine
} from 'lucide-react'

import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import BannerQr from './banner-qr'

interface QRCodeModalProps {
  qrCodeUrl: string
  businessName?: string
  trigger: React.ReactNode
}

export function QRCodeModal({ qrCodeUrl, trigger }: QRCodeModalProps) {
  const [showPrintable, setShowPrintable] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<
    'living' | 'fridge' | 'glasses'
  >('living')

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md print:max-h-none print:min-h-screen print:max-w-none print:overflow-visible print:border-0 print:bg-white print:p-20 print:shadow-none">
        <div className="print:hidden">
          <DialogHeader className="sticky top-0 z-10 bg-background py-2">
            <DialogTitle>Código QR</DialogTitle>
            <DialogDescription>
              {showPrintable
                ? 'Vista para impresión'
                : 'Escanea este código QR o compártelo'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {showPrintable ? (
          <>
            <div className="mb-6 print:hidden">
              <Tabs
                defaultValue="living"
                value={selectedVariant}
                onValueChange={(v) =>
                  setSelectedVariant(v as 'living' | 'fridge' | 'glasses')
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="living"
                    className="flex items-center gap-1"
                  >
                    <Sofa className="h-4 w-4" />
                    <span>Living</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="fridge"
                    className="flex items-center gap-1"
                  >
                    <RefrigeratorIcon className="h-4 w-4" />
                    <span>Heladera</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="glasses"
                    className="flex items-center gap-1"
                  >
                    <Wine className="h-4 w-4" />
                    <span>Copas</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="print:-m-6 print:scale-100 print:bg-white print:p-0">
              <BannerQr url={qrCodeUrl} variant={selectedVariant} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 print:hidden">
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={256}
              height={256}
              className="h-64 w-64 object-contain"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver en nueva pestaña
                </a>
              </Button>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 mt-4 flex justify-between border-t bg-background py-4 print:hidden">
          <Button
            variant="outline"
            onClick={() => setShowPrintable(!showPrintable)}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {showPrintable ? 'Ver QR simple' : 'Ver folleto para imprimir'}
          </Button>

          {showPrintable && (
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
