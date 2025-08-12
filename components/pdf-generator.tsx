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

// Export the utility function directly
export const generatePDF = async (contractId: string, projectTitle?: string, onGenerating?: (isGenerating: boolean) => void, agency?: any) => {
  if (onGenerating) onGenerating(true)
  
  toast.loading("Generating PDF...", { id: "download" })
  
  try {
    const input = document.querySelector('.contract-preview-container') as HTMLElement | null
    if (!input) {
      toast.error("Contract preview not found", { id: "download" })
      return
    }
    
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      height: Math.max(input.scrollHeight, input.offsetHeight),
      width: Math.max(input.scrollWidth, input.offsetWidth),
      removeContainer: false,
      imageTimeout: 10000,
      onclone: (clonedDoc) => {
        // Ensure all content is visible in the cloned document
        const clonedElement = clonedDoc.querySelector('.contract-preview-container') as HTMLElement
        if (clonedElement) {
          clonedElement.style.height = 'auto'
          clonedElement.style.minHeight = 'auto'
          clonedElement.style.overflow = 'visible'
          clonedElement.style.maxHeight = 'none'
        }
      }
    })
    
    const imgData = canvas.toDataURL('image/png', 1.0) // Use PNG for better quality
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    let pageCount = 0
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
    console.log('PDF image dimensions:', imgWidth, 'x', imgHeight)
    console.log('Pages needed:', Math.ceil(imgHeight / pageHeight))

    // Helper function to add logo to current page
    const addLogoToPage = async () => {
      if (agency?.logo) {
        try {
          // Create a temporary image element to get logo dimensions
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve
            logoImg.onerror = reject
            logoImg.src = agency.logo!
          })
          
          // Calculate logo size and position (centered, with opacity)
          const maxLogoWidth = 60 // mm
          const maxLogoHeight = 60 // mm
          const logoAspectRatio = logoImg.width / logoImg.height
          
          let logoWidth = maxLogoWidth
          let logoHeight = maxLogoWidth / logoAspectRatio
          
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight
            logoWidth = maxLogoHeight * logoAspectRatio
          }
          
          // Center the logo on the page
          const logoX = (imgWidth - logoWidth) / 2
          const logoY = (pageHeight - logoHeight) / 2
          
          // Add logo with low opacity as watermark
          pdf.saveGraphicsState()
          pdf.setGState({ opacity: 0.1 } as any)
          pdf.addImage(agency.logo, 'PNG', logoX, logoY, logoWidth, logoHeight)
          pdf.restoreGraphicsState()
        } catch (error) {
          console.warn('Failed to add logo to PDF:', error)
        }
      }
    }

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    await addLogoToPage()
    pageCount++
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      await addLogoToPage()
      pageCount++
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