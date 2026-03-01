"use client"

import * as React from "react"
import { BookOpen, Bot, Clock4, Plus, Settings2, SquareTerminal, Star } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavQuickActions } from "@/components/nav-quick-actions"
import { NavUser } from "@/components/nav-user"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { useWorkspace } from "./workspace/workspace-provider"
import { toast } from "sonner"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
}

const sidebarQuickActions = [
  {
    name: "Favorites",
    url: "#",
    icon: Star,
  },
  {
    name: "Recent",
    url: "#",
    icon: Clock4,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { workspace } = useWorkspace()

  async function handleCreateDocument() {
    if (!workspace?.id) {
      toast.error("No workspace selected")
      return
    }

    try {
      const res = await fetch("/api/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id })
      })

      if (!res.ok) {
        toast.error("Failed to create document")
        return
      }

      const doc = await res.json()

      window.open(`/document/${doc.id}`, "_blank")
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <div className="w-full my-1 px-2.5">
          <Button className="w-full" onClick={handleCreateDocument}><Plus /> New Document</Button>
        </div>
        <NavQuickActions projects={sidebarQuickActions} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
