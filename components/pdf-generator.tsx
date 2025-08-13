"use client"

import { useCallback } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"

interface PDFGeneratorProps {
  contractId: string
  projectTitle?: string
  onGenerating?: (isGenerating: boolean) => void
}

// Import the enhanced PDF generator
import { generateEnhancedPDF } from "./enhanced-pdf-generator"
import { generateIOSCompatiblePDF } from "./ios-pdf-generator"
import { useContractStore } from "@/store/contract-store"

// Export the utility function directly - now uses enhanced generator
export const generatePDF = async (contractId: string, projectTitle?: string, onGenerating?: (isGenerating: boolean) => void, agency?: any) => {
  if (onGenerating) onGenerating(true)
  
  try {
    // Get contract data from store
    const { contracts, currentContract } = useContractStore.getState()
    let contract = currentContract
    
    // If no current contract, try to find it in contracts array
    if (!contract || contract.id !== contractId) {
      contract = contracts.find(c => c.id === contractId)
    }
    
    if (!contract) {
      toast.error("Contract data not found", { id: "download" })
      return
    }
    
    // Detect iOS and use appropriate PDF generator
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    if (isIOS) {
      console.log('iOS detected, using text-based PDF generator')
      await generateIOSCompatiblePDF(contractId, contract, agency, onGenerating)
    } else {
      console.log('Non-iOS device, using enhanced PDF generator')
      await generateEnhancedPDF(contractId, contract, agency, onGenerating)
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "download",
      description: "Please try again"
    })
    if (onGenerating) onGenerating(false)
  }
}

// Component version for dynamic import
export default function PDFGenerator({ contractId, projectTitle, onGenerating }: PDFGeneratorProps) {
  const { agency } = useAuthStore()
  
  const handleDownload = useCallback(async () => {
    await generatePDF(contractId, projectTitle, onGenerating, agency)
  }, [contractId, projectTitle, onGenerating, agency])

  return null // This component doesn't render anything
}

// Export the hook for easier usage
export const usePDFGenerator = (contractId: string, projectTitle?: string, onGenerating?: (isGenerating: boolean) => void) => {
  const { agency } = useAuthStore()
  
  const handleDownload = useCallback(async () => {
    await generatePDF(contractId, projectTitle, onGenerating, agency)
  }, [contractId, projectTitle, onGenerating, agency])

  return { handleDownload }
}