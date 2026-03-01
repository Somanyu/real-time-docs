"use client"

import { ChevronsUpDown, Plus, Trash2Icon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { Workspace } from "@/app/generated/prisma/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createAvatar } from "@dicebear/core"
import { identicon } from '@dicebear/collection';
import { CreateWorkspaceDialog } from "./workspace/create-workspace-dialog"
import { AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialog } from "./ui/alert-dialog"

export function WorkspaceSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile } = useSidebar()

  const [workspace, setWorkspace] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [openCreateWorkspaceDialog, setOpenCreateWorkspaceDialog] = useState<boolean>(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)


  useEffect(() => {
    async function loadWorkspaces() {
      const res = await fetch("/api/me/get-workspaces")

      if (!res.ok) {
        toast.warning("Error in fetching workspaces.")
      }

      const data = await res.json()
      setWorkspace(data)

      const slugFromUrl = pathname.split("/")[2]

      const active = data.find((w: Workspace) => w.slug === slugFromUrl)
      setActiveWorkspace(active || data[0])
    }
    loadWorkspaces()
  }, [pathname])

  const handleSwitch = (workspace: Workspace) => {
    setActiveWorkspace(workspace)
    router.push(`/workspace/${workspace.slug}`)
  }

  async function handleDeleteWorkspace() {
    if (!workspaceToDelete) return

    try {
      setIsDeleting(true)

      const res = await fetch(`/api/workspace/${workspaceToDelete.id}`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Failed to delete workspace")
        return
      }

      toast.success("Workspace deleted")

      // 🔥 If user has another workspace → redirect
      if (data.redirectWorkspaceId) {
        router.push(`/workspace/${data.redirectWorkspaceId}`)
      } else {
        // No workspace left
        router.push("/create-workspace")
      }

      router.refresh()

    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
      setWorkspaceToDelete(null)
    }
  }

  return (
    <>
      <AlertDialog open={!!workspaceToDelete} onOpenChange={() => setWorkspaceToDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete {workspaceToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workspace along with its documents. This actions cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" onClick={() => setWorkspaceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDeleteWorkspace}>{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <DropdownMenuItem key={ws.id} onClick={() => handleSwitch(ws)} className="gap-2 p-2 group">
                    <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden" dangerouslySetInnerHTML={{ __html: svg }} />
                    {ws.name}
                    <DropdownMenuShortcut className="group-hover:flex hidden items-center"><button onClick={(e) => { e.stopPropagation(); setWorkspaceToDelete(ws) }}><Trash2Icon size={5} /></button></DropdownMenuShortcut>
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
