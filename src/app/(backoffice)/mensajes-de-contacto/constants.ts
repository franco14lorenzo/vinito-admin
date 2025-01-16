import { Mail, MailCheck, MailOpen } from 'lucide-react'

export const DEFAULT_COLUMNS = [
  'name',
  'email',
  'phone',
  'message',
  'status',
  'created_at'
]

export const DEFAULT_ORDER = {
  column: 'created_at',
  ascending: false
}

export const STATUS = [
  { label: 'Leído', value: 'read', icon: MailOpen },
  { label: 'No leído', value: 'unread', icon: Mail },
  { label: 'Respondido', value: 'answered', icon: MailCheck }
]
