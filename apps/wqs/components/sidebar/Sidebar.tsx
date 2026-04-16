'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { NewRequestModal } from '../testrequests/NewRequestModal'
import AppSidebar from '@/components/sidebar/AppSidebar'
import { SidebarBreadcrumb } from '@/components/sidebar/SidebarBreadcrumb'
import NewTechnicianModal from '../technicians/NewTechnicianModal'
import { User } from 'next-auth'

export default function Sidebar({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)
  const [technicianModalOpen, setTechnicianModalOpen] = useState(false)

  return (
    <>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center px-4 justify-between w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <SidebarBreadcrumb />
              </div>
              {user.role === Role.user && pathname.startsWith('/requests') && (
                <Button onClick={() => setModalOpen(true)}>New Request</Button>
              )}
              {user.role === Role.admin && pathname.startsWith("/technicians") && (
                <Button onClick={() => setTechnicianModalOpen(true)}>New Technician</Button>
              )}
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>

      <NewRequestModal open={modalOpen} onOpenChange={setModalOpen} />
      <NewTechnicianModal open={technicianModalOpen} onOpenChange={setTechnicianModalOpen} />
    </>
  )
}
