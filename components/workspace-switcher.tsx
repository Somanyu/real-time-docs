"use client"

import { ChevronsUpDown, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { Workspace } from "@/app/generated/prisma/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createAvatar } from "@dicebear/core"
import { identicon } from '@dicebear/collection';
import { CreateWorkspaceDialog } from "./workspace/create-workspace-dialog"

export function WorkspaceSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile } = useSidebar()

  const [workspace, setWorkspace] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [openCreateWorkspaceDialog, setOpenCreateWorkspaceDialog] = useState<boolean>(false)


  useEffect(() => {
    async function loadWorkspaces() {
      const res = await fetch("/api/me/get-workspaces")

      if (!res.ok) {
        toast.warning("Error in fetching workspaces.")
      }

      const data = await res.json()
      setWorkspace(data)

      const slugFromUrl = pathname.split("/")[2]

      console.log("API response:", data)
      console.log("Is array?", Array.isArray(data))

      const active = data.find((w: Workspace) => w.slug === slugFromUrl)
      setActiveWorkspace(active || data[0])
    }
    loadWorkspaces()
  }, [pathname])

  const handleSwitch = (workspace: Workspace) => {
    setActiveWorkspace(workspace)
    router.push(`/workspace/${workspace.slug}`)
  }


  if (!activeWorkspace) {
    toast.warning("Something went wrong in workspace")
    return null
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {activeWorkspace && (
                    <div dangerouslySetInnerHTML={{ __html: createAvatar(identicon, { seed: activeWorkspace.name, size: 30, }).toString(), }} />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs">Workspace</span>
                  <span className="truncate font-medium">{activeWorkspace?.name ?? "Select workspace"}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="start" side={isMobile ? "bottom" : "right"} sideOffset={4}>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>
              {workspace.map((ws) => {
                const svg = createAvatar(identicon, { backgroundColor: [], seed: ws.name, size: 32 }).toString()

                return (
                  <DropdownMenuItem key={ws.id} onClick={() => handleSwitch(ws)} className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden" dangerouslySetInnerHTML={{ __html: svg }} />
                    {ws.name}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenCreateWorkspaceDialog(true)} className="gap-2 p-2 cursor-pointer">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Add workspace</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog open={openCreateWorkspaceDialog} onOpenChange={setOpenCreateWorkspaceDialog} />
    </>
  )
}
