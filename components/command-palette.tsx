"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, FileText, Users, Settings, Home, Plus } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/contracts/client"))}>
                <FileText className="mr-2 h-4 w-4" />
                Client Contracts
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/contracts/hiring"))}>
                <Users className="mr-2 h-4 w-4" />
                Hiring Contracts
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Actions">
              <Command.Item onSelect={() => runCommand(() => router.push("/wizard?type=client"))}>
                <Plus className="mr-2 h-4 w-4" />
                New Client Contract
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/wizard?type=hiring"))}>
                <Plus className="mr-2 h-4 w-4" />
                New Hiring Contract
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
