import { GrapeIcon } from 'lucide-react'

import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { providersMap, signIn } from '@/lib/auth'
import { capitalize, getBackgroundColorOfEnvironment } from '@/lib/utils'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SignInPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string

  const logoBackgroundColor = getBackgroundColorOfEnvironment(
    process.env.NEXT_PUBLIC_ENVIRONMENT || 'local'
  )

  return (
    <Card className="mx-auto max-w-sm">
      <div
        className={`mx-auto mt-6 grid w-fit place-content-center rounded-md p-2 ${logoBackgroundColor}`}
      >
        <GrapeIcon size={16} className="text-white" />
      </div>
      <CardHeader className="pt-2">
        <CardTitle className="text-center text-2xl">Vinito Admin</CardTitle>
        <CardDescription>
          <div className="-mt-1 flex flex-col items-center justify-center">
            <p className="mb-6  text-center text-xs text-gray-500">
              {capitalize(process.env.NEXT_PUBLIC_ENVIRONMENT || 'local')}
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
            {Object.values(providersMap).map((provider) => (
              <form
                className="contents"
                key={provider.id}
                action={async () => {
                  'use server'
                  const callbackUrl = Array.isArray(searchParams?.callbackUrl)
                    ? searchParams.callbackUrl[0]
                    : searchParams?.callbackUrl ?? ''

                  try {
                    await signIn(provider.id, {
                      redirectTo: !error ? callbackUrl : '/'
                    })
                  } catch (error) {
                    // Signin can fail for a number of reasons, such as the user
                    // not existing, or the user not having the correct role.
                    // In some cases, you may want to redirect to a custom error
                    if (error instanceof AuthError) {
                      return redirect(`/auth/error/?error=${error.type}`)
                    }

                    // Otherwise if a redirects happens Next.js can handle it
                    // so you can just re-thrown the error and let Next.js handle it.
                    // Docs:
                    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                    throw error
                  }
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="inline-flex w-full items-center justify-center gap-2"
                >
                  {provider.id === 'google' && <GoogleSvg size={24} />}
                  <span>Ingresar con {provider.name}</span>
                </Button>
                {error && (
                  <p className="text-center text-xs text-red-500">
                    {error === 'AccessDenied'
                      ? 'No tienes permiso para acceder. Inicia sesión con una cuenta de administrador'
                      : error === 'UnknownError'
                      ? 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo'
                      : 'Error de autenticación. Por favor, intenta de nuevo'}
                  </p>
                )}
              </form>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Vinito Store. Todos los derechos
          reservados.
        </div>
      </CardContent>
    </Card>
  )
}

const GoogleSvg = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    preserveAspectRatio="xMidYMid"
    viewBox="-3 0 262 262"
    {...props}
  >
    <path
      fill="#4285F4"
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
    />
    <path
      fill="#34A853"
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
    />
    <path
      fill="#FBBC05"
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
    />
    <path
      fill="#EB4335"
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
    />
  </svg>
)
