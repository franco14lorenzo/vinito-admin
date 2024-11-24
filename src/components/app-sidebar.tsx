'use client'

import * as React from 'react'
import {
  AudioWaveform,
  Command,
  GrapeIcon,
  PackageOpen,
  Settings2,
  TruckIcon,
  Users,
  Wine
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
/* import { NavProjects } from '@/components/nav-projects' */
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import type { User } from '@/types/auth'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Vinito Admin',
      logo: GrapeIcon,
      plan: 'Production'
    },
    {
      name: 'Vinito Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
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
      title: 'Configuraciones',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'FAQs',
          url: '/faqs'
        },
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
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*      <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
