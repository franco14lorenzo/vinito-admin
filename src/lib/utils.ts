import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
