"use client"

import { toast } from "sonner"
import { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"

// Import the enhanced PDF generator
import { generateEnhancedPDF } from "./enhanced-pdf-generator"

export const generateDashboardPDF = async (
  contract: ContractData, 
  agency: Agency,
  onGenerating?: (isGenerating: boolean) => void
) => {
  try {
    // Use the enhanced PDF generator directly with contract data
    await generateEnhancedPDF(contract.id || 'unknown', contract, agency, onGenerating)
  } catch (error) {
    console.error("Error generating dashboard PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "dashboard-download",
      description: "Please try again"
    })
    if (onGenerating) onGenerating(false)
  }
}