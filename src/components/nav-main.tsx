'use client'

import { Fragment, useState } from 'react'
import {
  Amphora,
  Building,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Mail,
  PackageOpen,
  Settings,
  TruckIcon,
  Users,
  Wine
} from 'lucide-react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'

const navMain = [
  {
    group: 'Ventas',
    items: [
      {
        icon: PackageOpen,
        title: 'Ordenes',
        url: '/ordenes'
      },
      {
        icon: CircleDollarSign,
        title: 'Pagos',
        url: '/pagos'
      }
    ]
  },
  {
    group: 'Productos',
    items: [
      {
        icon: Amphora,
        title: 'Degustaciones',
        url: '/degustaciones'
      },
      {
        icon: Wine,
        title: 'Vinos',
        url: '/vinos'
      },
      {
        icon: ClipboardList,
        title: 'Movimientos de Stock',
        url: '/movimientos-de-stock'
      }
    ]
  },
  {
    group: 'Clientes',
    items: [
      {
        icon: Users,
        title: 'Listado de Clientes',
        url: '/listado-de-clientes'
      },
      {
        icon: Mail,
        title: 'Mensajes de Contacto',
        url: '/mensajes-de-contacto'
      }
    ]
  },
  {
    group: 'Logística',
    items: [
      {
        icon: Building,
        title: 'Alojamientos',
        url: '/alojamientos'
      },
      {
        icon: TruckIcon,
        title: 'Horarios de Entrega',
        url: '/horarios-de-entrega'
      }
    ]
  },
  {
    group: 'Contenidos',
    items: [
      {
        icon: CircleHelp,
        title: 'FAQs',
        url: '/faqs'
      }
    ]
  },
  {
    group: 'Configuraciones',
    items: [
      {
        icon: CreditCard,
        title: 'Métodos de Pago',
        url: '/metodos-de-pago'
      },
      {
        icon: Settings,
        title: 'General',
        url: '/configuraciones'
      }
    ]
  }
]

export function NavMain() {
  const [searchTerm, setSearchTerm] = useState('')
  const { open, setOpenMobile } = useSidebar()

  const filteredNav = navMain
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter((group) => group.items.length > 0)

  const pathname = usePathname()

  return (
    <>
      {open && (
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-primary-white mx-4 my-2 rounded-md border border-input p-2 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
      <SidebarMenu>
        {filteredNav.map((item) => (
          <SidebarGroup key={item.group}>
            <SidebarGroupLabel>{item.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              {item.items?.map((subItem) => (
                <SidebarMenuItem key={subItem.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      onClick={() => {
                        setOpenMobile(false)
                      }}
                      href={subItem.url}
                      key={subItem.title}
                      className={`block w-full hover:cursor-pointer
                        ${
                          pathname === subItem.url
                            ? 'pointer-events-none bg-muted'
                            : ''
                        } rounded-md p-2 transition-colors duration-200
                        `}
                    >
                      {subItem.icon && (
                        <subItem.icon className="pointer-events-none" />
                      )}
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarMenu>
    </>
  )
}
