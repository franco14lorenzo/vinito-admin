'use client'

import * as React from 'react'
import { ChevronsUpDown, GrapeIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { capitalize, getBackgroundColorOfEnvironment } from '@/lib/utils'

const environments = [
  {
    name: 'Producción',
    logo: GrapeIcon,
    environment: 'prod',
    url: 'https://admin.vinito.store'
  },
  {
    name: 'Staging',
    logo: GrapeIcon,
    environment: 'staging',
    url: 'https://admin-staging.vinito.store'
  },
  {
    name: 'Local',
    logo: GrapeIcon,
    environment: 'local',
    url: 'http://localhost:3000'
  }
]

export function EnvironmentsSwitcher() {
  const { isMobile } = useSidebar()
  const activeEnvironment =
    environments.find(
      (environment) =>
        environment.environment === process.env.NEXT_PUBLIC_ENVIRONMENT
    ) || environments[0]

  const logoBackgroundColor = getBackgroundColorOfEnvironment(
    process.env.NEXT_PUBLIC_ENVIRONMENT || 'local'
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                className={`flex aspect-square size-8 items-center justify-center rounded-lg ${logoBackgroundColor} text-sidebar-primary-foreground`}
              >
                <activeEnvironment.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Vinito Admin</span>
                <span className="truncate text-xs">
                  {capitalize(activeEnvironment.environment)}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Entornos
            </DropdownMenuLabel>
            {environments.map((environment) => (
              <DropdownMenuItem key={environment.name} className="gap-2 p-2">
                <a
                  href={environment.url}
                  className={`flex flex-1 cursor-pointer items-center gap-2 ${
                    environment.environment ===
                      process.env.NEXT_PUBLIC_ENVIRONMENT &&
                    'pointer-events-none opacity-40'
                  }`}
                >
                  <div
                    className={`${getBackgroundColorOfEnvironment(
                      environment.environment
                    )} flex size-6 items-center justify-center rounded-sm text-sidebar-primary-foreground`}
                  >
                    <environment.logo className="size-4 shrink-0" />
                  </div>
                  {environment.name}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
