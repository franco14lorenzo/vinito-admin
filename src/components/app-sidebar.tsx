'use client'

import * as React from 'react'
import {
  FileText,
  PackageOpen,
  Settings,
  TruckIcon,
  Users,
  Wine
} from 'lucide-react'

import { EnvironmentsSwitcher } from '@/components/environments-switcher'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import type { User } from '@/types/auth'

const data = {
  navMain: [
    {
      title: 'Ventas',
      url: '#',
      icon: PackageOpen,
      isActive: true,
      items: [
        {
          title: 'Ordenes',
          url: '/ordenes'
        },
        {
          title: 'Pagos',
          url: '/pagos'
        }
      ]
    },
    {
      title: 'Productos',
      url: '#',
      icon: Wine,
      items: [
        {
          title: 'Degustaciones',
          url: '/degustaciones'
        },
        {
          title: 'Vinos',
          url: '/vinos'
        }
      ]
    },
    {
      title: 'Clientes',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'Lista de Clientes',
          url: '/clientes'
        },
        {
          title: 'Mensajes de Contacto',
          url: '/mensajes'
        }
      ]
    },
    {
      title: 'Logística',
      url: '#',
      icon: TruckIcon,
      items: [
        {
          title: 'Alojamientos',
          url: '/alojamientos'
        },
        {
          title: 'Horarios de Entrega',
          url: '/horarios'
        }
      ]
    },
    {
      title: 'Contenidos',
      url: '#',
      icon: FileText,
      items: [
        {
          title: 'FAQs',
          url: '/contenidos/faqs'
        }
      ]
    },
    {
      title: 'Configuraciones',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'Métodos de Pago',
          url: '/metodos-de-pago'
        },
        {
          title: 'General',
          url: '/configuraciones'
        }
      ]
    }
  ]
}

export function AppSidebar({
  user,
  ...props
}: { user: User } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <EnvironmentsSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
