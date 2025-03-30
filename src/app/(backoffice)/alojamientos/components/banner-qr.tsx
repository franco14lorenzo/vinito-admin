'use client'

import { useEffect, useState } from 'react'
import {
  ArrowDown,
  CheckCircle,
  Clock,
  GrapeIcon,
  PartyPopper,
  Scan,
  Snowflake,
  Sparkles,
  Users,
  Wine
} from 'lucide-react'

import Image from 'next/image'

import { Card } from '@/components/ui/card'

interface WineQRCodeProps {
  url: string
  variant?: 'living' | 'fridge' | 'glasses'
}

const headlineText = {
  living: '¿QUIERES COMPARTIR UN VINO?',
  fridge: '¿FALTAN VINOS EN LA HELADERA?',
  glasses: '¿BUSCAS UN VINO ESPECIAL?'
}

const step2Text = {
  living: 'ELIGE',
  fridge: 'ORDENA',
  glasses: 'PIDE'
}

const step3Text = {
  living: 'COMPARTE',
  fridge: 'DISFRUTA',
  glasses: 'DEGUSTA'
}

const benefitTitle = {
  living: 'Vinos para Compartir',
  fridge: 'Vinos directos a tu Alojamiento',
  glasses: 'Vinos Premium de Mendoza'
}

const benefits = {
  living: [
    'Selección para compartir',
    'Vinos de Mendoza premium',
    'Delivery programado',
    'Recomendaciones del sommelier'
  ],
  fridge: [
    'Entrega en horario elegido',
    'Temperatura ideal servicio',
    'Espumantes y blancos fríos',
    'Tintos listos para servir'
  ],
  glasses: [
    'Vinos boutique exclusivos',
    'Varietales emblemáticos',
    'Experiencias sensoriales',
    'Ediciones limitadas'
  ]
}

const footerText = {
  living: '¡HAZ QUE TU ESTADÍA ESPECIAL!',
  fridge: '¡NO TE QUEDES SIN VINOS!',
  glasses: '¡ELEVA TU EXPERIENCIA AHORA!'
}

const badgeTitle = {
  living: '¡EXCLUSIVO!',
  fridge: '¡PLANIFICA!',
  glasses: '¡PREMIUM!'
}

const badgeSubtitle = {
  living: 'Experiencia',
  fridge: 'Tu Momento',
  glasses: 'Selección'
}

export default function BannerQr({
  variant = 'living',
  url = 'https://your-wine-ecommerce.com'
}: WineQRCodeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="mx-auto max-w-md print:h-[15cm] print:w-[10cm]">
      {/* Print-specific styles to force background colors */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Force black backgrounds to print */
          .print-bg-black {
            background-color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-text-white {
            color: white !important;
          }
        }
      `}</style>

      {/* Starburst effect behind card */}
      <div className="relative">
        {/* Main Card */}
        <Card className="relative z-10 overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Header with pattern */}
          <div className="print-bg-black print-text-white relative overflow-hidden bg-black p-4 text-white">
            {/* Zigzag pattern */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-12 w-full bg-white"
                  style={{ top: `${i * 20}px`, transform: 'skewY(25deg)' }}
                />
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-kalnia text-3xl font-bold tracking-tight">
                <GrapeIcon className="h-8 w-8" />
                Vinito
              </h2>
            </div>
          </div>

          {/* Attention-grabbing headline */}
          <div className="border-y-4 border-black bg-white p-3 text-center">
            <div className="">
              <h3 className="text-xl font-black uppercase tracking-tight">
                {headlineText[variant]}
              </h3>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="relative p-6">
            {/* Dashed border frame */}
            <div className="absolute inset-3 rounded-lg border-4 border-dashed border-black"></div>

            {/* QR Code with spotlight effect */}
            <div className="relative flex justify-center py-6">
              {/* Spotlight effect */}
              <div className="bg-radial-gradient absolute inset-0 z-0 from-white via-white to-gray-200"></div>

              {/* QR Code */}
              <div className="relative z-10 rounded-lg border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <Image
                  src={url}
                  alt="QR Code"
                  width={180}
                  height={180}
                  className="h-[180px] w-[180px] object-contain"
                />

                {/* Scan indicator */}
                <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 transform items-center gap-1 rounded-full bg-black px-3 py-1 text-sm font-bold text-white">
                  <Scan className="h-4 w-4" />
                  <span>ESCANÉAME</span>
                </div>
              </div>

              {/* Animated arrows pointing to QR */}
              <div className="absolute -left-6 -top-6">
                <ArrowDown
                  className="h-10 w-10 -rotate-45 text-black"
                  strokeWidth={3}
                />
              </div>
              <div className="absolute -right-6 -top-6">
                <ArrowDown
                  className="h-10 w-10 rotate-45 text-black"
                  strokeWidth={3}
                />
              </div>
            </div>

            {/* Icons based on variant */}
            <div className="mb-4 mt-2 flex justify-center gap-4">
              {variant === 'living' && (
                <>
                  <Users className="h-8 w-8 text-black" />
                  <PartyPopper className="h-8 w-8 text-black" />
                  <Users className="h-8 w-8 text-black" />
                </>
              )}
              {variant === 'fridge' && (
                <>
                  <Snowflake className="h-8 w-8 text-gray-400" />
                  <Snowflake className="h-8 w-8 text-black" />
                  <Snowflake className="h-8 w-8 text-gray-400" />
                </>
              )}
              {variant === 'glasses' && (
                <>
                  <Sparkles className="h-8 w-8 text-gray-400" />
                  <Wine className="h-8 w-8 text-black" />
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </>
              )}
            </div>

            {/* Steps */}
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  1
                </div>
                <span className="text-xs font-bold">ESCANEA</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  2
                </div>
                <span className="text-xs font-bold">{step2Text[variant]}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  3
                </div>
                <span className="text-xs font-bold">{step3Text[variant]}</span>
              </div>
            </div>
          </div>

          {/* Benefits section */}
          <div className="print-bg-black print-text-white bg-black p-4 text-white">
            <h4 className="mb-3 text-center font-bold uppercase">
              {benefitTitle[variant]}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {benefits[variant].map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-white" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with urgency */}
          <div className="border-t-4 border-black bg-white p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              {variant === 'living' && <PartyPopper className="h-5 w-5" />}
              {variant === 'fridge' && <Clock className="h-5 w-5" />}
              {variant === 'glasses' && <Sparkles className="h-5 w-5" />}
              <span className="text-sm font-bold">{footerText[variant]}</span>
              {variant === 'living' && <PartyPopper className="h-5 w-5" />}
              {variant === 'fridge' && <Clock className="h-5 w-5" />}
              {variant === 'glasses' && <Sparkles className="h-5 w-5" />}
            </div>
          </div>
        </Card>

        {/* Extra attention elements */}
        <div className="print-bg-black print-text-white absolute -right-4 -top-4 z-20 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-2 border-white bg-black text-white">
          <div className="text-center">
            <div className="text-xs font-bold">{badgeTitle[variant]}</div>
            <div className="text-[10px]">{badgeSubtitle[variant]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
