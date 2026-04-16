"use client"

import {
  Droplet
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { NavUser } from "./NavUser"
import { fetchSidebarData } from "./SidebarData"
import { NavMain } from "./NavMain"
import { memo } from "react"
import { User } from "next-auth"




 export default memo(function AppSidebar({ user, ...props}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const navMain = fetchSidebarData(user.role)
  const data = {
    user: {
      name: user.name ?? '',
      email: user.email ?? '',
      avatar: "https://github.com/evilrabbit.png",
    },
    navMain
}
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/requests/pending">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Droplet className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">WQS Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
)