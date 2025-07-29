import { ThemeProvider } from "@/components/config/theme-provider"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { SiteHeader } from "@/components/shared/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import type React from "react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>

        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
