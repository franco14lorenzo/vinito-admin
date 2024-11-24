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

export function getBackgroundColorOfEnvironment() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local'

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
