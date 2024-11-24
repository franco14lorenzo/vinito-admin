import { GrapeIcon, RefreshCcw } from 'lucide-react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AuthErrorPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string

  return (
    <Card className="mx-auto max-w-sm">
      <div className="mx-auto mt-6 grid  w-fit place-content-center rounded-md bg-black p-2">
        <GrapeIcon size={16} className="text-white" />
      </div>
      <CardHeader className="pt-2">
        <CardTitle className="text-center text-2xl">Vinito Admin</CardTitle>
        <CardDescription>
          <div className="-mt-1 flex flex-col items-center justify-center">
            <p className="mb-6  text-center text-xs text-gray-500">
              {process.env.ENVIRONMENT}
            </p>
            <p className="text-center text-sm">
              Inicia sesión con tu cuenta de administrador
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="outline"
              className="inline-flex w-full items-center justify-center gap-2"
            >
              <Link
                href={`/auth/signin/?callbackUrl=${searchParams?.callbackUrl}`}
              >
                <RefreshCcw size={24} />
                <span>Intente de nuevo</span>
              </Link>
            </Button>
          </div>
          {error && (
            <p className="text-center text-xs text-red-500">
              {error === 'AccessDenied'
                ? 'No tienes permiso para acceder. Inicia sesión con una cuenta de administrador'
                : error === 'UnknownError'
                ? 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo'
                : 'Error de autenticación. Por favor, intenta de nuevo'}
            </p>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Vinito Store. Todos los derechos
          reservados.
        </div>
      </CardContent>
    </Card>
  )
}
