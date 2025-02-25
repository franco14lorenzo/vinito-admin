export const ORDER_ERRORS = {
  REFUND_REQUIRED: 'REFUND_REQUIRED'
} as const

export type OrderError = {
  code: typeof ORDER_ERRORS[keyof typeof ORDER_ERRORS]
  message: string
} 