"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Define the breadcrumb structure based on routes
const breadcrumbConfig: Record<string, { label: string; parent?: string; parentLabel?: string }> = {
  "/requests": { label: "My Requests" },
  "/requests/pending": { label: "Pending", parent: "/requests", parentLabel: "My Requests" },
  "/requests/action-needed": { label: "Action Needed", parent: "/requests", parentLabel: "My Requests" },
  "/requests/testing": { label: "Testing", parent: "/requests", parentLabel: "My Requests" },
  "/requests/completed": { label: "Completed", parent: "/requests", parentLabel: "My Requests" },
  "/payments": { label: "Payments" },
  "/pricing": { label: "Pricing" },
  "/reports": { label: "Reports" },
  "/dashboard": { label: "Dashboard" },
  "/technicians": { label: "Technicians" },
}

export function SidebarBreadcrumb() {
  const pathname = usePathname()
  
  // Get breadcrumb data for current path
  const breadcrumbData = breadcrumbConfig[pathname]
  
  if (!breadcrumbData) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbData.parent && breadcrumbData.parentLabel && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={breadcrumbData.parent}>
                {breadcrumbData.parentLabel}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{breadcrumbData.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
