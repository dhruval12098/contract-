"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Plus, X, FileText, Edit, Sparkles, Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractStore } from "@/store/contract-store"
import { useAuthStore } from "@/store/auth-store" // Import useAuthStore
import { useState } from "react"
import { toast } from "sonner"

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
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Explicitly type as tuple
    },
  },
}

export function StepFive() {
  const { currentContract, updateContract, saveContract } = useContractStore()
  const { clauses: defaultClauses } = useAuthStore() // Fetch default clauses
  const [newClauseTitle, setNewClauseTitle] = useState("")
  const [newClauseDescription, setNewClauseDescription] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Ensure clauses are properly structured
  const customClauses = Array.isArray(currentContract.clauses)
    ? currentContract.clauses.filter((clause) => clause && typeof clause === "object")
    : []

  // Initialize contract with default clauses if empty
  React.useEffect(() => {
    if (customClauses.length === 0 && defaultClauses.length > 0) {
      const initialClauses = defaultClauses.map((clause) => ({
        title: clause,
        description: clause, // Use title as fallback description
      }))
      updateContract({ clauses: initialClauses })
    }
  }, [defaultClauses, customClauses.length, updateContract])

  const generateDescription = async () => {
    if (!newClauseTitle.trim()) {
      toast.error("Please enter a clause title first")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-clause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: newClauseTitle,
            contractType: currentContract.type || "client",
            projectTitle: currentContract.projectTitle || "Contract Header",
          }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate description")
      }

      const data = await response.json()
      setNewClauseDescription(data.description)
      toast.success("AI description generated successfully!")
    } catch (error) {
      console.error("Error generating description:", error)
      toast.error("Failed to generate description. Please write manually.")
    } finally {
      setIsGenerating(false)
    }
  }

  const addCustomClause = () => {
    if (newClauseTitle.trim() && newClauseDescription.trim()) {
      const newClause = {
        title: newClauseTitle.trim(),
        description: newClauseDescription.trim(),
      }
      const updatedClauses = [...customClauses, newClause]
      updateContract({ clauses: updatedClauses })
      setNewClauseTitle("")
      setNewClauseDescription("")
      toast.success("Clause added successfully!")
    }
  }

  const removeClause = (index: number) => {
    const updatedClauses = customClauses.filter((_, i) => i !== index)
    updateContract({ clauses: updatedClauses })
    toast.success("Clause removed")
  }

  const updateClause = (index: number, title: string, description: string) => {
    const updatedClauses = [...customClauses]
    updatedClauses[index] = { title: title.trim(), description: description.trim() }
    updateContract({ clauses: updatedClauses })
    setEditingIndex(null)
    toast.success("Clause updated")
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const result = await saveContract()
      if (result.success) {
        toast.success("Contract saved as draft!")
      } else {
        toast.error(result.error || "Failed to save contract")
      }
    } catch (error) {
      toast.error("Failed to save contract")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-2">Legal Clauses</h3>
        <p className="text-muted-foreground mb-6">
          Create custom clauses with titles and descriptions. Use AI to generate professional descriptions
          automatically. Default clauses have been added from your settings.
        </p>
      </motion.div>

      {/* Add New Clause */}
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="text-base">Add New Clause</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clause-title">Clause Title</Label>
              <Input
                id="clause-title"
                value={newClauseTitle}
                onChange={(e) => setNewClauseTitle(e.target.value)}
                placeholder="e.g., Payment Terms, Intellectual Property, etc."
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clause-description">Clause Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateDescription}
                  disabled={!newClauseTitle.trim() || isGenerating}
                  className="h-8 px-2 text-xs hover:bg-primary/10"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  {isGenerating ? "Generating..." : "AI Generate"}
                </Button>
              </div>
              <Textarea
                id="clause-description"
                value={newClauseDescription}
                onChange={(e) => setNewClauseDescription(e.target.value)}
                placeholder="Describe the terms and conditions for this clause or use AI to generate..."
                rows={3}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              onClick={addCustomClause}
              disabled={!newClauseTitle.trim() || !newClauseDescription.trim()}
              className="w-full hover:shadow-md transition-shadow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Clause
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Existing Clauses */}
      {customClauses.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <Label className="text-base font-medium">Contract Clauses ({customClauses.length})</Label>
          <div className="space-y-3">
            {customClauses.map((clause, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <Input
                          defaultValue={clause.title}
                          onBlur={(e) => updateClause(index, e.target.value, clause.description)}
                          className="font-medium"
                        />
                        <Textarea
                          defaultValue={clause.description}
                          onBlur={(e) => updateClause(index, clause.title, e.target.value)}
                          rows={2}
                        />
                        <Button size="sm" onClick={() => setEditingIndex(null)}>
                          Done
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{clause.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{clause.description}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingIndex(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeClause(index)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save Draft Button */}
      <motion.div variants={itemVariants} className="pt-4 border-t">
        <Button
          onClick={handleSaveDraft}
          disabled={isSaving}
          variant="outline"
          className="w-full bg-transparent"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Draft...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}