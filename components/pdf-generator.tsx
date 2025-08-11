"use client"

import { useCallback } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"

interface PDFGeneratorProps {
  contractId: string
  projectTitle?: string
  onGenerating?: (isGenerating: boolean) => void
}

// Export the utility function directly
export const generatePDF = async (contractId: string, projectTitle?: string, onGenerating?: (isGenerating: boolean) => void) => {
  if (onGenerating) onGenerating(true)
  
  toast.loading("Generating PDF...", { id: "download" })
  
  try {
    const input = document.querySelector('.contract-preview-container') as HTMLElement | null
    if (!input) {
      toast.error("Contract preview not found", { id: "download" })
      return
    }
    
    const canvas = await html2canvas(input, {
      scale: 1.5, // Reduced from 2 for better performance
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      height: input.scrollHeight,
      width: input.scrollWidth,
      removeContainer: true,
      imageTimeout: 5000
    })
    
    const imgData = canvas.toDataURL('image/jpeg', 0.8) // Use JPEG with compression
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = canvas.height * imgWidth / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    const fileName = `contract-${projectTitle?.replace(/[^a-z0-9]/gi, '_') || contractId}.pdf`
    pdf.save(fileName)
    
    toast.success("PDF downloaded successfully!", { id: "download" })
  } catch (error) {
    console.error("Error generating PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "download",
      description: "Please try again"
    })
  } finally {
    if (onGenerating) onGenerating(false)
  }
}

// Component version for dynamic import
export default function PDFGenerator({ contractId, projectTitle, onGenerating }: PDFGeneratorProps) {
  const handleDownload = useCallback(async () => {
    await generatePDF(contractId, projectTitle, onGenerating)
  }, [contractId, projectTitle, onGenerating])

  return null // This component doesn't render anything
}

// Export the hook for easier usage
export const usePDFGenerator = (contractId: string, projectTitle?: string, onGenerating?: (isGenerating: boolean) => void) => {
  const handleDownload = useCallback(async () => {
    await generatePDF(contractId, projectTitle, onGenerating)
  }, [contractId, projectTitle, onGenerating])

  return { handleDownload }
}