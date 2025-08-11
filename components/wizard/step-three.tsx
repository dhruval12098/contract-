"use client"

import React from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useContractStore } from "@/store/contract-store"

export function StepThree() {
  const { currentContract, updateContract } = useContractStore()
  const [newScope, setNewScope] = React.useState("")

  const addScope = React.useCallback(() => {
    if (newScope.trim()) {
      const updatedScope = [...(currentContract.scope || []), newScope.trim()]
      updateContract({ scope: updatedScope })
      setNewScope("")
    }
  }, [newScope, currentContract.scope, updateContract])

  const removeScope = React.useCallback((index: number) => {
    const updatedScope = currentContract.scope?.filter((_, i) => i !== index) || []
    updateContract({ scope: updatedScope })
  }, [currentContract.scope, updateContract])

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addScope()
    }
  }, [addScope])

  const handleNewScopeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewScope(e.target.value)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {currentContract.type === "client" ? "Project Scope" : "Role & Responsibilities"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {currentContract.type === "client"
            ? "Define what work will be delivered and the key responsibilities."
            : "Outline the role responsibilities and key duties."}
        </p>
      </div>

      <div className="space-y-4">
        <Label>{currentContract.type === "client" ? "Scope Items" : "Responsibilities"}</Label>
        <div className="flex gap-2">
          <Input
            value={newScope}
            onChange={handleNewScopeChange}
            placeholder={
              currentContract.type === "client"
                ? "Add a scope item (e.g., Website design and development)"
                : "Add a responsibility (e.g., Manage client relationships)"
            }
            onKeyPress={handleKeyPress}
          />
          <Button onClick={addScope}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {currentContract.scope && currentContract.scope.length > 0 && (
        <div className="space-y-3">
          <Label>Current Items:</Label>
          <div className="space-y-2">
            {currentContract.scope.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted/70 transition-colors duration-150"
              >
                <span className="text-sm">{item}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScope(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
