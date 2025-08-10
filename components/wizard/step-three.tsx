"use client"

import { motion, Variants } from "framer-motion"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useContractStore } from "@/store/contract-store"
import { useState } from "react"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Explicitly type as a tuple
    },
  },
}

export function StepThree() {
  const { currentContract, updateContract } = useContractStore()
  const [newScope, setNewScope] = useState("")

  const addScope = () => {
    if (newScope.trim()) {
      const updatedScope = [...(currentContract.scope || []), newScope.trim()]
      updateContract({ scope: updatedScope })
      setNewScope("")
    }
  }

  const removeScope = (index: number) => {
    const updatedScope = currentContract.scope?.filter((_, i) => i !== index) || []
    updateContract({ scope: updatedScope })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-2">
          {currentContract.type === "client" ? "Project Scope" : "Role & Responsibilities"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {currentContract.type === "client"
            ? "Define what work will be delivered and the key responsibilities."
            : "Outline the role responsibilities and key duties."}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <Label>{currentContract.type === "client" ? "Scope Items" : "Responsibilities"}</Label>
        <div className="flex gap-2">
          <Input
            value={newScope}
            onChange={(e) => setNewScope(e.target.value)}
            placeholder={
              currentContract.type === "client"
                ? "Add a scope item (e.g., Website design and development)"
                : "Add a responsibility (e.g., Manage client relationships)"
            }
            onKeyPress={(e) => e.key === "Enter" && addScope()}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          <Button onClick={addScope} className="hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {currentContract.scope && currentContract.scope.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <Label>Current Items:</Label>
          <div className="space-y-2">
            {currentContract.scope.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted/70 transition-colors"
              >
                <span className="text-sm">{item}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScope(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
