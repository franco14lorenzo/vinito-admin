'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useCreateSetting } from './edit-setting-context'

export function CreateSettingButton() {
  const { onCreateOpen } = useCreateSetting()

  return (
    <Button onClick={onCreateOpen} size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Add Setting
    </Button>
  )
}
