import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { STORE_REVALIDATE_TAG_PATH } from '@/lib/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
}

export function getBackgroundColorOfEnvironment(environment: string) {
  switch (environment) {
    case 'prod':
      return 'bg-sidebar-primary'
    case 'staging':
      return 'bg-violet-700'
    case 'local':
      return 'bg-green-700'
    default:
      return 'bg-green-700'
  }
}

export function getStoreBaseUrl(environment: string) {
  switch (environment) {
    case 'prod':
      return 'https://www.vinito.store'
    case 'staging':
      return 'https://staging.vinito.store'
    case 'local':
      return 'http://localhost:3000'
    default:
      return 'http://localhost:3000'
  }
}

export async function revalidateStoreTag(tag: string) {
  const revalidateUrl = new URL(
    `${getStoreBaseUrl(
      process.env.NEXT_PUBLIC_ENVIRONMENT as string
    )}${STORE_REVALIDATE_TAG_PATH}`
  )
  revalidateUrl.searchParams.append('tag', tag)
  try {
    const res = await fetch(revalidateUrl.toString())
    if (!res.ok) {
      throw new Error('Response not ok')
    }
  } catch (error) {
    // TODO: Implement error handling
    console.error('Error revalidating path:', error)
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatDate(dateString: string): string {
  const date = dateString.includes('T')
    ? new Date(dateString)
    : new Date(dateString + 'T12:00:00Z')

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}
